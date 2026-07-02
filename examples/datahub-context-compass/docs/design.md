# Design: DataHub Context Compass

## Product Bet

Most hackathon agent demos look like chatbots. This project aims at a more useful
enterprise wedge: before an agent edits a pipeline, it should prove that it
understands metadata context. The product creates a risk brief from DataHub-style
metadata so a reviewer can see exactly why an automated change is safe, blocked,
or needs escalation.

## Components

- `src/analyze.js`: pure scoring and brief generation logic.
- `src/cli.js`: command-line wrapper that reads a snapshot and writes Markdown
  plus JSON.
- `src/renderSite.js`: static HTML renderer for a public demo page.
- `examples/metadata-snapshot.json`: sanitized sample context.
- `test/analyze.test.js`: regression checks for scoring, blockers, and Markdown.

## Data Flow

1. Load a metadata snapshot.
2. Normalize datasets, lineage, incidents, and proposed changes.
3. Score each proposed change.
4. Emit a Markdown review brief and JSON findings.
5. Render the JSON as a static demo page for judges.

## Risk Model

The first version intentionally uses transparent rules:

- missing owner increases risk
- PII tagged fields increase risk
- schema removals increase risk
- downstream critical assets increase risk
- open incidents increase risk
- stale freshness increases risk

Transparent scoring is easier for judges to inspect than a black-box model, and
it creates a clean path to a future DataHub MCP integration.
