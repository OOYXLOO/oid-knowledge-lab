"use strict";

const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const { performance } = require("perf_hooks");

const BUILTINS = new Set([
  "Array",
  "Boolean",
  "Date",
  "Error",
  "Exclude",
  "Extract",
  "Map",
  "NonNullable",
  "Number",
  "Omit",
  "Partial",
  "Pick",
  "Promise",
  "Readonly",
  "Record",
  "Required",
  "ReturnType",
  "Set",
  "String",
  "Symbol",
  "boolean",
  "false",
  "never",
  "null",
  "number",
  "object",
  "string",
  "true",
  "undefined",
  "unknown",
  "void"
]);

function createProgram(fileName) {
  const options = {
    allowJs: false,
    checkJs: false,
    declaration: false,
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2022
  };
  return ts.createProgram([fileName], options);
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function identifierText(node) {
  return node && ts.isIdentifier(node) ? node.text : "<anonymous>";
}

function collectIdentifierRefs(node, refs = new Map()) {
  if (ts.isIdentifier(node) && !BUILTINS.has(node.text)) {
    refs.set(node.text, (refs.get(node.text) || 0) + 1);
  }
  ts.forEachChild(node, (child) => collectIdentifierRefs(child, refs));
  return refs;
}

function collectTextRefs(sourceFile, node) {
  const refs = collectIdentifierRefs(node);
  const text = node.getText(sourceFile);
  for (const match of text.matchAll(/\b[A-Za-z_$][\w$]*\b/g)) {
    const name = match[0];
    if (!BUILTINS.has(name) && !ts.SyntaxKind[name]) {
      refs.set(name, (refs.get(name) || 0) + 1);
    }
  }
  return refs;
}

function countNodes(node) {
  let count = 1;
  ts.forEachChild(node, (child) => {
    count += countNodes(child);
  });
  return count;
}

function countSyntax(node) {
  const counts = {
    conditional: 0,
    mapped: 0,
    infer: 0,
    keyof: 0,
    indexedAccess: 0,
    templateLiteral: 0,
    union: 0,
    intersection: 0
  };
  function visit(child) {
    if (ts.isConditionalTypeNode(child)) counts.conditional += 1;
    if (ts.isMappedTypeNode(child)) counts.mapped += 1;
    if (ts.isInferTypeNode(child)) counts.infer += 1;
    if (ts.isTypeOperatorNode(child) && child.operator === ts.SyntaxKind.KeyOfKeyword) counts.keyof += 1;
    if (ts.isIndexedAccessTypeNode(child)) counts.indexedAccess += 1;
    if (ts.isTemplateLiteralTypeNode(child)) counts.templateLiteral += 1;
    if (ts.isUnionTypeNode(child)) counts.union += Math.max(0, child.types.length - 1);
    if (ts.isIntersectionTypeNode(child)) counts.intersection += Math.max(0, child.types.length - 1);
    ts.forEachChild(child, visit);
  }
  visit(node);
  return counts;
}

function maxTypeDepth(node) {
  let maxDepth = 0;
  function visit(child, depth) {
    const addsDepth =
      ts.isConditionalTypeNode(child)
      || ts.isMappedTypeNode(child)
      || ts.isIndexedAccessTypeNode(child)
      || ts.isTemplateLiteralTypeNode(child)
      || ts.isUnionTypeNode(child)
      || ts.isIntersectionTypeNode(child)
      || ts.isTypeLiteralNode(child)
      || ts.isTupleTypeNode(child)
      || ts.isArrayTypeNode(child)
      || ts.isTypeReferenceNode(child);
    const nextDepth = depth + (addsDepth ? 1 : 0);
    maxDepth = Math.max(maxDepth, nextDepth);
    ts.forEachChild(child, (grandchild) => visit(grandchild, nextDepth));
  }
  visit(node, 0);
  return maxDepth;
}

function typeParameterCount(node) {
  return node.typeParameters ? node.typeParameters.length : 0;
}

function declaredType(checker, node) {
  const symbol = node.name ? checker.getSymbolAtLocation(node.name) : undefined;
  if (symbol && (ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node))) {
    return checker.getDeclaredTypeOfSymbol(symbol);
  }
  if (symbol && ts.isTypeAliasDeclaration(node)) {
    return checker.getDeclaredTypeOfSymbol(symbol);
  }
  return checker.getTypeAtLocation(node);
}

function declarationNodes(sourceFile) {
  const nodes = [];
  function visit(node) {
    if (
      ts.isTypeAliasDeclaration(node)
      || ts.isInterfaceDeclaration(node)
      || ts.isClassDeclaration(node)
    ) {
      nodes.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return nodes;
}

function scoreMetric(metric) {
  const syntax =
    metric.syntax.conditional * 8
    + metric.syntax.mapped * 7
    + metric.syntax.infer * 5
    + metric.syntax.indexedAccess * 4
    + metric.syntax.keyof * 3
    + metric.syntax.templateLiteral * 4
    + metric.syntax.union
    + metric.syntax.intersection * 2;
  const size = Math.log2(Math.max(2, metric.expandedLength)) * 4;
  const refs = Math.log2(Math.max(1, metric.referenceCount)) * 5;
  const recursion = metric.selfRecursive ? 14 : 0;
  const checkerCost = Math.min(55, metric.checkerTotalMs * 10);
  const nesting = Math.min(30, metric.typeDepth * 3);
  const generics = Math.min(16, metric.typeParameterCount * 4);
  const diagnostics = Math.min(12, metric.diagnosticCount * 3);
  return Math.round(size + refs + syntax + recursion + checkerCost + nesting + generics + diagnostics);
}

function driverSummary(metric, limit = 4) {
  const drivers = [];
  if (metric.typeResolutionMs >= 1) drivers.push(`resolve:${metric.typeResolutionMs}ms`);
  if (metric.typeToStringMs >= 1) drivers.push(`print:${metric.typeToStringMs}ms`);
  if (metric.typeDepth >= 6) drivers.push(`depth:${metric.typeDepth}`);
  if (metric.typeParameterCount) drivers.push(`generics:${metric.typeParameterCount}`);
  if (metric.selfRecursive) drivers.push("recursive");
  for (const [key, value] of Object.entries(metric.syntax)) {
    if (value) drivers.push(`${key}:${value}`);
  }
  if (metric.diagnosticCount) drivers.push(`diagnostics:${metric.diagnosticCount}`);
  return drivers.slice(0, limit).join(", ") || "size/refs";
}

function recommendations(metric) {
  const items = [];
  if (metric.checkerTotalMs >= 20) {
    items.push("Capture a tsc/tsserver trace and split or cache this declaration first.");
  } else if (metric.typeResolutionMs >= 2) {
    items.push("Inspect symbol resolution cost; split imports or simplify referenced helper types.");
  } else if (metric.typeToStringMs >= 2) {
    items.push("Inspect expanded output; expose a smaller alias or simplify template-literal expansion.");
  }
  if (metric.typeDepth >= 10) {
    items.push("Reduce nested conditional/mapped depth or introduce capped helper aliases.");
  } else if (metric.typeDepth >= 7) {
    items.push("Review nested helper depth before this type becomes an editor hotspot.");
  }
  if (metric.selfRecursive) {
    items.push("Add an explicit recursion-depth guard or a narrower accumulator shape.");
  }
  if (metric.syntax.conditional >= 5) {
    items.push("Split conditional branches; avoid accidental distributive conditionals on broad unions.");
  }
  if (metric.syntax.mapped >= 3 || metric.syntax.indexedAccess >= 4) {
    items.push("Precompute key unions or simplify mapped/indexed lookups.");
  }
  if (metric.typeParameterCount >= 4) {
    items.push("Reduce generic parameter surface or split helper types.");
  }
  if (metric.syntax.union >= 6) {
    items.push("Narrow broad unions before applying recursive transforms.");
  }
  if (metric.expandedLength >= 1000) {
    items.push("Hide the expanded implementation behind a smaller public alias.");
  }
  return items.length ? items : ["No immediate rewrite; keep as a baseline comparison."];
}

function analyzeDeclaration(sourceFile, checker, node, diagnosticCount = 0) {
  const name = identifierText(node.name);
  const refs = collectTextRefs(sourceFile, node);
  const resolveStarted = performance.now();
  const type = declaredType(checker, node);
  const typeResolutionMs = performance.now() - resolveStarted;
  const started = performance.now();
  let expanded = "";
  try {
    expanded = checker.typeToString(
      type,
      node,
      ts.TypeFormatFlags.NoTruncation
        | ts.TypeFormatFlags.WriteArrayAsGenericType
        | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
    );
  } catch (error) {
    expanded = `<typeToString failed: ${error.message}>`;
  }
  const elapsed = performance.now() - started;
  const syntax = countSyntax(node);
  const metric = {
    kind: ts.SyntaxKind[node.kind],
    name,
    file: sourceFile.fileName,
    line: lineOf(sourceFile, node),
    nodeCount: countNodes(node),
    referenceCount: Array.from(refs.values()).reduce((a, b) => a + b, 0),
    uniqueReferenceCount: refs.size,
    expandedLength: expanded.length,
    typeResolutionMs: Number(typeResolutionMs.toFixed(3)),
    typeToStringMs: Number(elapsed.toFixed(3)),
    checkerTotalMs: Number((typeResolutionMs + elapsed).toFixed(3)),
    typeDepth: maxTypeDepth(node),
    typeParameterCount: typeParameterCount(node),
    diagnosticCount,
    syntax,
    selfRecursive: refs.has(name) && (refs.get(name) || 0) > 1,
    expandedPreview: expanded.slice(0, 220)
  };
  metric.score = scoreMetric(metric);
  metric.recommendations = recommendations(metric);
  return metric;
}

function analyzeFile(fileName) {
  const absolute = path.resolve(fileName);
  if (!fs.existsSync(absolute)) {
    throw new Error(`File not found: ${absolute}`);
  }
  const program = createProgram(absolute);
  const sourceFile = program.getSourceFile(absolute);
  if (!sourceFile) {
    throw new Error(`TypeScript did not load source file: ${absolute}`);
  }
  const checker = program.getTypeChecker();
  const diagnostics = ts
    .getPreEmitDiagnostics(program, sourceFile)
    .map((diag) => {
      const message = ts.flattenDiagnosticMessageText(diag.messageText, " ");
      const pos = diag.file && typeof diag.start === "number"
        ? diag.file.getLineAndCharacterOfPosition(diag.start)
        : undefined;
      return {
        code: diag.code,
        message,
        line: pos ? pos.line + 1 : undefined,
        category: ts.DiagnosticCategory[diag.category]
      };
    });
  const metrics = declarationNodes(sourceFile)
    .map((node) => analyzeDeclaration(sourceFile, checker, node, diagnostics.length))
    .sort((a, b) => b.score - a.score);
  return {
    file: absolute,
    generatedAt: new Date().toISOString(),
    diagnostics,
    metrics
  };
}

function markdownReport(result, limit = 20) {
  const lines = [
    `# TSPerf Type Lens Report`,
    "",
    `File: \`${result.file}\``,
    `Generated: ${result.generatedAt}`,
    "",
    "## Top Type Hotspots",
    "",
    "| Score | Line | Name | Resolve ms | Print ms | Depth | Expanded chars | Drivers | Primary action |",
    "|---:|---:|---|---:|---:|---:|---:|---|---|"
  ];
  for (const metric of result.metrics.slice(0, limit)) {
    lines.push(`| ${metric.score} | ${metric.line} | \`${metric.name}\` | ${metric.typeResolutionMs} | ${metric.typeToStringMs} | ${metric.typeDepth} | ${metric.expandedLength} | ${driverSummary(metric)} | ${metric.recommendations[0]} |`);
  }
  const actionable = result.metrics
    .filter((metric) => metric.recommendations.length && !metric.recommendations[0].startsWith("No immediate"))
    .slice(0, limit);
  if (actionable.length) {
    lines.push("", "## Optimization Notes", "");
    for (const metric of actionable) {
      lines.push(`- \`${metric.name}\` line ${metric.line}: ${metric.recommendations.join(" ")}`);
    }
  }
  if (result.diagnostics.length) {
    lines.push("", "## Diagnostics", "");
    for (const diagnostic of result.diagnostics.slice(0, 10)) {
      lines.push(`- TS${diagnostic.code}${diagnostic.line ? ` line ${diagnostic.line}` : ""}: ${diagnostic.message}`);
    }
  }
  return lines.join("\n");
}

module.exports = {
  analyzeFile,
  driverSummary,
  markdownReport,
  recommendations,
  scoreMetric
};
