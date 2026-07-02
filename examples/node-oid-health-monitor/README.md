# Node OID Health Monitor Example

This example supports an AppSignal-style observability article pitch: build a small Node.js service that turns sanitized OID review findings into health signals, JSON status output, and Prometheus-style metrics.

It is sample material for an article pitch, not a production monitoring integration.

## What It Demonstrates

- A dependency-free Node.js HTTP service.
- A safe in-memory sample dataset with public OID values only.
- `/health` JSON output for open findings and severity counts.
- `/metrics` text output that can be adapted to monitoring tools.
- A no-secret boundary for observability tutorials.

## Files

- `monitor.js` - HTTP service and reusable snapshot functions.
- `test-monitor.js` - Node test script for health and metrics behavior.

## Run

```text
node examples/node-oid-health-monitor/monitor.js
```

Then open:

```text
http://localhost:4317/health
http://localhost:4317/metrics
```

## Test

```text
node examples/node-oid-health-monitor/test-monitor.js
```

## Safety Boundary

Use sanitized findings only. Do not emit private hostnames, private certificates, customer identifiers, raw scans, credentials, API tokens, billing data, account exports, or copied third-party registry page bodies.
