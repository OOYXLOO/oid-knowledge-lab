# DataHub MCP Integration Plan

The first prototype runs on a sanitized local snapshot. The next version should
replace that snapshot with read-only DataHub MCP calls, then feed the collected
context into the same transparent risk model.

## Read-Only Tool Mapping

Use read-only DataHub MCP tools first:

- `search`: resolve dataset names into DataHub entities.
- `get_entities`: fetch ownership, tags, domains, docs, and metadata signals.
- `list_schema_fields`: inspect fields touched by a proposed change.
- `get_lineage`: inspect downstream impact before approving automation.
- `list_pending_proposals`: avoid conflicts with governance changes already in
  review.

## Mutation Boundary

The product should not call mutation tools during the risk scoring step. If a
future version writes notes back to DataHub, it should prefer proposal-style
governed workflows and require a reviewer decision first.

## Submission Story

The demo can show both modes:

1. Offline sanitized snapshot for public judging.
2. Generated MCP read plan showing exactly which DataHub context the agent would
   fetch in a live catalog.

This keeps the public repository safe while still proving the design is aligned
with DataHub's agent context tooling.
