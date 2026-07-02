"use strict";

const assert = require("assert");
const path = require("path");
const { analyzeFile, markdownReport } = require("../src/analyzer");

const sample = path.join(__dirname, "..", "samples", "heavy-types.ts");
const result = analyzeFile(sample);
const names = result.metrics.map((metric) => metric.name);

assert(names.includes("DeepReadonly"));
assert(names.includes("RouteRecord"));
assert(result.metrics.length >= 4);
assert(result.metrics[0].score >= result.metrics[result.metrics.length - 1].score);
assert(result.metrics.some((metric) => metric.syntax.conditional > 0));
assert(result.metrics.some((metric) => metric.name === "DeepReadonly" && metric.selfRecursive));
assert(result.metrics.every((metric) => typeof metric.typeResolutionMs === "number"));
assert(result.metrics.every((metric) => typeof metric.checkerTotalMs === "number"));
assert(result.metrics.some((metric) => metric.typeDepth >= 4));
assert(result.metrics.every((metric) => Array.isArray(metric.recommendations)));
assert(result.metrics.some((metric) => metric.recommendations.some((item) => item.includes("recursion-depth"))));
assert(markdownReport(result).includes("TSPerf Type Lens Report"));
assert(markdownReport(result).includes("Resolve ms"));
assert(markdownReport(result).includes("Optimization Notes"));

console.log(JSON.stringify({
  ok: true,
  metrics: result.metrics.length,
  top: result.metrics[0],
  diagnostics: result.diagnostics.length
}, null, 2));
