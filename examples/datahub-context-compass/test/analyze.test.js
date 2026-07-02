const assert = require("assert");
const { analyzeSnapshot, renderMarkdown } = require("../src/analyze");
const sample = require("../examples/metadata-snapshot.json");

const report = analyzeSnapshot(sample);

assert.strictEqual(report.summary.total, 2);
assert.strictEqual(report.summary.blocked, 1);
assert.strictEqual(report.summary.review, 1);
assert.strictEqual(report.summary.ready, 0);

const support = report.changes.find((change) => change.id === "CHG-1002");
assert.ok(support.score >= 70);
assert.strictEqual(support.status, "blocked");
assert.ok(support.blockers.some((blocker) => blocker.includes("No dataset owner")));
assert.ok(support.blockers.some((blocker) => blocker.includes("Sensitive fields")));

const orders = report.changes.find((change) => change.id === "CHG-1001");
assert.strictEqual(orders.status, "review");
assert.ok(orders.findings.some((finding) => finding.includes("High-criticality")));

const markdown = renderMarkdown(report);
assert.ok(markdown.includes("DataHub Context Compass Brief"));
assert.ok(markdown.includes("CHG-1002"));
assert.ok(markdown.includes("Open incidents"));

console.log("datahub context compass tests passed");
