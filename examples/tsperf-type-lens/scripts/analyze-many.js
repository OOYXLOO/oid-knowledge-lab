"use strict";

const fs = require("fs");
const path = require("path");
const { analyzeFile, driverSummary } = require("../src/analyzer");

const DEFAULT_EXTENSIONS = new Set([".ts", ".tsx", ".d.ts"]);
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", ".turbo"]);

function walk(root, files = []) {
  const stat = fs.statSync(root);
  if (stat.isFile()) {
    if (DEFAULT_EXTENSIONS.has(path.extname(root)) || root.endsWith(".d.ts")) {
      files.push(root);
    }
    return files;
  }
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    walk(path.join(root, entry.name), files);
  }
  return files;
}

function summarize(results, errors) {
  const metrics = results.flatMap((result) => result.metrics);
  const scores = metrics.map((metric) => metric.score);
  const checkerTimes = metrics.map((metric) => metric.checkerTotalMs);
  const sum = (items) => items.reduce((total, value) => total + value, 0);
  return {
    filesAnalyzed: results.length,
    declarationsAnalyzed: metrics.length,
    filesWithDiagnostics: results.filter((result) => result.metrics.some((metric) => metric.diagnosticCount > 0)).length,
    parseErrors: errors.length,
    highestScore: scores.length ? Math.max(...scores) : 0,
    averageScore: scores.length ? Number((sum(scores) / scores.length).toFixed(1)) : 0,
    highestCheckerMs: checkerTimes.length ? Number(Math.max(...checkerTimes).toFixed(3)) : 0,
    averageCheckerMs: checkerTimes.length ? Number((sum(checkerTimes) / checkerTimes.length).toFixed(3)) : 0
  };
}

function markdown(results, limit, options) {
  const all = results
    .flatMap((result) => result.metrics.map((metric) => ({ ...metric, file: result.file })))
    .sort((a, b) => b.score - a.score);
  const summary = summarize(results, options.errors);
  const lines = [
    "# TSPerf Type Lens Multi-File Validation",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Target: \`${options.target}\``,
    `Command: \`${options.command}\``,
    "",
    "## Summary",
    "",
    `- Files analyzed: ${summary.filesAnalyzed}`,
    `- Type/interface/class declarations analyzed: ${summary.declarationsAnalyzed}`,
    `- Files with diagnostics: ${summary.filesWithDiagnostics}`,
    `- Parse/analyze errors: ${summary.parseErrors}`,
    `- Highest score: ${summary.highestScore}`,
    `- Average score: ${summary.averageScore}`,
    `- Highest checker ms: ${summary.highestCheckerMs}`,
    `- Average checker ms: ${summary.averageCheckerMs}`,
    "",
    "## Top Type Hotspots",
    "",
    "| Rank | Score | File | Line | Name | Checker ms | Depth | Drivers | Primary action |",
    "|---:|---:|---|---:|---|---:|---:|---|---|"
  ];
  all.slice(0, limit).forEach((metric, index) => {
    const fileLabel = `${options.target}/${path.relative(options.targetPath, metric.file).replaceAll("\\", "/")}`;
    lines.push(`| ${index + 1} | ${metric.score} | \`${fileLabel}\` | ${metric.line} | \`${metric.name}\` | ${metric.checkerTotalMs} | ${metric.typeDepth} | ${driverSummary(metric)} | ${metric.recommendations[0]} |`);
  });
  const actionable = all
    .filter((metric) => metric.recommendations.length && !metric.recommendations[0].startsWith("No immediate"))
    .slice(0, Math.min(limit, 12));
  if (actionable.length) {
    lines.push("", "## Optimization Notes", "");
    actionable.forEach((metric, index) => {
      const file = `${options.target}/${path.relative(options.targetPath, metric.file).replaceAll("\\", "/")}`;
      lines.push(`${index + 1}. \`${metric.name}\` in \`${file}\` line ${metric.line}: ${metric.recommendations.join(" ")}`);
    });
  }
  lines.push("", "## Notes", "");
  lines.push("- Scores are heuristic and need correlation with editor/tsserver latency before public challenge submission.");
  lines.push("- This run intentionally avoids private repos, credentials, and telemetry.");
  if (options.errors.length) {
    lines.push("- Some files could not be analyzed; see stderr JSON from the run for details.");
  }
  return lines.join("\n");
}

function main() {
  const target = path.resolve(process.argv[2] || ".");
  const limit = Number(process.argv[3] || 25);
  const targetLabel = process.env.TSPERF_TARGET_LABEL || path.basename(path.dirname(target)) + "/" + path.basename(target);
  const files = walk(target)
    .filter((file) => !file.endsWith(".test-d.ts"))
    .slice(0, Number(process.env.TSPERF_FILE_LIMIT || 80));
  const results = [];
  const errors = [];
  for (const file of files) {
    try {
      results.push(analyzeFile(file));
    } catch (error) {
      errors.push({ file, error: error.message });
    }
  }
  const report = markdown(results, limit, {
    command: `node scripts/analyze-many.js <path-to-${targetLabel.replaceAll("\\", "/")}> ${limit}`,
    errors,
    target: targetLabel.replaceAll("\\", "/"),
    targetPath: target
  });
  console.log(report);
  if (errors.length) {
    console.error(JSON.stringify({ errors: errors.slice(0, 10), errorCount: errors.length }, null, 2));
  }
}

if (require.main === module) {
  main();
}
