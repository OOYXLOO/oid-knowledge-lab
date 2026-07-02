# Devpost Field Pack

## Project Name

DataHub Context Compass

## Tagline

Agent-ready metadata risk briefs before automated data changes.

## Short Description

DataHub Context Compass reads DataHub-style metadata context and produces a
transparent risk brief for proposed data changes. It helps an agent or reviewer
decide whether a schema change, summary job, or pipeline edit is ready, needs
review, or should be blocked.

## Challenge Track

Agents That Do Real Work

## What It Does

The prototype reads a sanitized metadata snapshot containing datasets, owners,
schema fields, field tags, lineage, freshness, incidents, and proposed changes.
It scores each change with explainable rules and outputs:

- a Markdown evidence brief
- a JSON report
- a static review dashboard
- a DataHub MCP read plan showing which context calls the agent would make in a
  live catalog

## Built With

- JavaScript
- Node.js
- Static HTML/CSS
- DataHub-style metadata model
- DataHub MCP read-plan mapping

## Public Links

- Demo: https://ooyxloo.github.io/oid-knowledge-lab/datahub-context-compass/
- Demo video: https://ooyxloo.github.io/oid-knowledge-lab/datahub-context-compass/media/datahub-context-compass-demo.mp4
- Source: https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/datahub-context-compass
- Sample report: https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/examples/datahub-context-compass/reports/sample-risk-brief.md
- MCP read plan: https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/examples/datahub-context-compass/reports/datahub-mcp-read-plan.md

## Current Boundary

This first version is an offline prototype using sanitized sample metadata. It
does not require a DataHub account, private catalog export, token, cookie, or
cloud credential. The next version can connect the same risk model to DataHub MCP
Server or Agent Context Kit.

## Verification

```bash
npm run check
npm test
npm run build
```

## Why It Matters

Many agents fail because they act without data context. This project makes the
metadata context explicit before automation proceeds: owner, lineage, sensitive
fields, stale freshness, open incidents, and governance conflicts.
