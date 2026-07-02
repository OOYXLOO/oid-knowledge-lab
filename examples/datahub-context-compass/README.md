# DataHub Context Compass

DataHub Context Compass turns a DataHub-style metadata snapshot into a concise
agent-ready risk brief. It focuses on the questions a data engineer asks before
touching a pipeline: who owns this dataset, what changed, what downstream assets
depend on it, and which governance signals should block an automated action.

The current version is intentionally offline and judge-friendly. It does not
require a DataHub account, workspace login, private catalog export, token, cookie,
or cloud credential. The input is a sanitized JSON snapshot shaped after common
metadata concepts: datasets, owners, schema fields, tags, lineage, incidents, and
proposed changes.

## Why It Fits DataHub

The DataHub Agent Hackathon asks for software that uses DataHub context so agents
can do real work instead of guessing. This prototype demonstrates the core loop:

1. Read metadata context.
2. Score action risk.
3. Explain the blockers with source-aware evidence.
4. Produce a handoff a human or agent could use before making a change.

## Quick Start

```bash
npm run check
npm test
npm run build
npm run verify:submission
npm run demo
```

Outputs:

```text
reports/sample-risk-brief.md
reports/sample-risk-brief.json
reports/datahub-mcp-read-plan.md
reports/datahub-mcp-read-plan.json
reports/submission-verification.json
public/index.html
public/media/datahub-context-compass-demo.mp4
```

## Input Shape

See `examples/metadata-snapshot.json`. The sample includes:

- dataset ownership and domain
- schema fields and field tags
- upstream and downstream lineage
- freshness and quality signals
- incidents and proposed changes

## Submission Boundary

This is a product prototype, not a production DataHub plugin yet. A future version
can replace the local JSON snapshot with DataHub MCP Server or Agent Context Kit
calls, then write the resulting decision notes back to DataHub.

The generated MCP read plan in `reports/datahub-mcp-read-plan.md` shows the
read-only DataHub context calls the agent would make before scoring a proposed
change.
