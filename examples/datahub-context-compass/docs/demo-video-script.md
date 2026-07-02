# Demo Video Script

Target length: under 3 minutes.

## 0:00 - Problem

Open with the question: should an AI agent be allowed to edit a data pipeline if
it does not know who owns the dataset, what sensitive fields it touches, and what
downstream systems depend on it?

## 0:20 - Product

Show the DataHub Context Compass dashboard. Explain that the demo uses sanitized
DataHub-style metadata and generates a risk brief before an automated change
proceeds.

## 0:45 - First Change

Show `CHG-1001`, removing `coupon_code` from `analytics.customer_orders`.
Explain why it is not automatically approved: it is a schema removal and has a
high-criticality downstream revenue asset.

## 1:20 - Second Change

Show `CHG-1002`, generating summaries from support tickets. Explain why it is
blocked: no owner, sensitive fields, an open incident, and stale freshness.

## 1:55 - Evidence Output

Open `reports/sample-risk-brief.md`. Show that the same dashboard content is
available as Markdown for a pull request, ticket, or agent handoff.

## 2:20 - DataHub MCP Plan

Open `reports/datahub-mcp-read-plan.md`. Show the read-only DataHub MCP calls
the agent would make in a live catalog: search, get entities, list schema fields,
get lineage, and list pending proposals.

## 2:45 - Close

Close with the product claim: DataHub Context Compass helps agents do real work
by proving they understand metadata context before they act.
