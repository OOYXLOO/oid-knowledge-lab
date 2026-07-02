"use strict";

const assert = require("node:assert/strict");
const {
  createSnapshot,
  renderPrometheus,
  sampleFindings
} = require("./monitor");

const snapshot = createSnapshot(sampleFindings);

assert.equal(snapshot.service, "oid-health-monitor");
assert.equal(snapshot.ok, false);
assert.equal(snapshot.counts.total, 3);
assert.equal(snapshot.counts.open, 2);
assert.equal(snapshot.counts.triaged, 1);
assert.equal(snapshot.counts.severity.high, 1);
assert.equal(snapshot.openFindings.length, 2);

const metrics = renderPrometheus(snapshot);
assert.match(metrics, /oid_findings_total\{status="open"\} 2/);
assert.match(metrics, /oid_findings_by_severity\{severity="high"\} 1/);
assert.doesNotMatch(metrics, /password|api[_-]?key|token/i);

process.stdout.write("node oid health monitor tests passed\n");
