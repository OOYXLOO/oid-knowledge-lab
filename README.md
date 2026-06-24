# OID Knowledge Lab

OID Knowledge Lab is a responsible crawler and analysis workspace for Object Identifier (OID) knowledge-base research.

The current source adapter targets public OID-base pages through the site's sitemap and Markdown OID pages. It is intentionally conservative by default: sample crawls are small, delayed, resumable, and avoid disallowed paths.

## Current Publishable Snapshot

Last refreshed on 2026-06-24:

- OID-base sitemap catalog: 7,492 public OID entries from `https://oid-base.com/sitemap.xml`
- IANA Private Enterprise Numbers import: 66,101 raw registry records
- Public IANA PEN search index: 65,959 records after excluding contact-level noise
- Coverage report: `reports/coverage-report.md` compares IANA PEN records with the OID-base sitemap directory
- Static dashboard: generated under `public/`
- Dataset manifest: `reports/dataset-manifest.json` with artifact hashes, sizes, source links, and publication boundaries
- Source policy snapshot: `reports/source-policy.md` records robots, terms, sitemap, and hash evidence for the collection boundary
- Authorized full crawl plan: `reports/authorized-crawl-plan.md` records the scale, gates, local output path, and estimated runtime for a future authorized page-body import
- Sample engagement brief: `reports/sample-engagement-brief.md` describes inputs, deliverables, and acceptance criteria for a scoped OID inventory assessment
- GitHub Pages workflow: `.github/workflows/pages.yml` publishes the generated static dashboard from `public/`

This repository stores the complete OID-base sitemap-level directory observed during the refresh. It does not store OID-base page bodies or raw Markdown/HTML mirrors.

Chinese operator notes:

- `README.zh.md`
- `docs/authorized-full-crawl.zh.md`
- `docs/source-authorization-request.zh.md`
- `docs/snapshot-20260624.zh.md`

## Compliance Boundary

OID-base publishes a robots file and terms of use. The terms say that downloading, printing, or copying from the site must be noncommercial, personal, and limited to a small part of the data unless specific authorization is granted by the site owner.

For that reason this repository does not include a full OID-base mirror. The default command collects only a small sample for parser validation and data-model design. Full collection mode is blocked unless an operator explicitly records that authorization has been granted.

Relevant public references:

- `https://oid-base.com/robots.txt`
- `https://oid-base.com/sitemap.xml`
- `https://oid-base.com/llms.txt`
- `https://oid-base.com/disclaimer.htm.md`

## Quick Start

```bash
npm run check
npm test
npm run refresh:publishable
npm run source-policy
npm run plan:authorized-full-crawl
npm run build:site
npm run audit:assets
npm run remediation:sample
npm run coverage:oid
npm run brief:sample
npm run guard:publishable
npm run crawl:sample
npm run crawl:sample:resume
npm run report
npm run import:iana-pen
```

The sample output is written under `data/sample/`:

- `sitemap-sample.json`
- `records.jsonl`
- `records-summary.json`
- `crawl-state.json`
- `report.json`

Generated sample JSON/JSONL files and crawl state files are ignored by Git. Commit only run receipts or synthetic fixtures unless the source authorization explicitly allows publishing collected data.
If `--save-raw-markdown` is used for local parser debugging, generated sample Markdown files are also ignored and blocked by the publish guard; only `RUN-*.md` receipt files may be committed from `data/sample/`.

## Rebuild the Publishable Data Package

```bash
npm run refresh:publishable
```

This command:

1. Fetches the current OID-base sitemap and rebuilds `reports/oid-base-sitemap-index.json`.
2. Imports the IANA PEN registry and rebuilds the aggregate/public reports.
3. Refreshes `reports/source-policy.json` and `reports/source-policy.md`.
4. Regenerates `reports/authorized-crawl-plan.json` and `reports/authorized-crawl-plan.md`.
5. Rebuilds the static dashboard in `public/`.
6. Writes `reports/dataset-manifest.json` with checksums for the publishable artifacts.

## Source Policy Snapshot

```bash
npm run source-policy
```

This command fetches the current OID-base robots file, sitemap metadata, LLM summary, and terms page, then writes:

- `reports/source-policy.json`
- `reports/source-policy.md`

The report stores source URLs, hashes, effective robots rules for the project user-agent, sitemap OID count, and a short boundary summary. It intentionally does not copy the full terms text or OID-base page bodies.

## OID-base Sitemap Index

The repository can publish a complete OID-base sitemap catalog without copying page bodies:

```bash
npm run export:sitemap-index
```

The command writes `reports/oid-base-sitemap-index.json` with OID paths, source URLs, Markdown URLs, sitemap `lastmod` dates, root arcs, and depth statistics. This is useful for coverage analysis and follow-up prioritization while keeping the content boundary clear.

Run the dataset audit after regeneration:

```bash
npm run audit:dataset
```

The audit writes `reports/dataset-manifest.json` and refuses to mark the package publishable if OID-base page bodies or contact fields are included.

Run the publish guard before pushing:

```bash
npm run guard:publishable
```

The guard inspects Git-tracked files and fails if local-only full crawl output, raw OID-base mirrors, sample parsed page bodies, or full IANA contact-level JSONL imports are about to be published.

## Authorized Full Crawl Plan

```bash
npm run plan:authorized-full-crawl
```

This command reads the live sitemap and writes:

- `reports/authorized-crawl-plan.json`
- `reports/authorized-crawl-plan.md`

The plan is safe to publish because it contains only task scale, estimated runtime, first planned sitemap entries, required authorization gates, and output boundaries. It does not fetch or store OID-base page bodies.

## Data Model

Each parsed record contains:

- `oid`
- `source_url`
- `markdown_url`
- `last_modified`
- `asn1_notation`
- `description`
- `tags`
- `child_oids`
- `sections_present`
- `body_hash`
- `fetched_at`

The crawler stores parsed records by default, not raw page copies. Raw export should only be used when the source license or authorization allows it.

Interrupted crawls can be resumed with `--resume`. The command reads existing `records.jsonl`, skips completed OIDs, appends only pending entries, and writes `crawl-state.json` so a long authorized run can be audited after a laptop move, network drop, or manual stop.

## OID Asset Audit

Use the asset-audit command when you have a local inventory of OIDs and want to classify it against the public PEN index and OID-base sitemap catalog:

```bash
npm run audit:assets
```

The default command reads `examples/sample-assets.csv` and writes:

- `reports/asset-audit.json`
- `reports/asset-audit.md`

For a real inventory, keep the source file local and pass it explicitly:

```bash
node src/cli.js audit-assets --in path/to/assets.csv --out reports/asset-audit.json --markdown reports/asset-audit.md
```

Accepted input is a simple CSV or tab-delimited file with an `oid` column and an optional `asset`, `name`, `id`, or `label` column.

The generated static dashboard also includes an in-browser local OID list audit panel. It accepts the same simple CSV shape and runs entirely in the browser against the published search indexes, so a reviewer can test an inventory without uploading it to a server.

## OID Remediation Board

Turn the asset audit into a client-action queue:

```bash
npm run remediation:sample
```

The command writes:

- `reports/remediation-board.json`
- `reports/remediation-board.md`
- `reports/remediation-board.csv`

The board sorts findings into correction, review, and evidence-preservation work items with owner actions and acceptance checks. It is designed for sanitized client handoff: do not commit raw client inventories, credentials, private correspondence, or copied OID-base page bodies.

## OID Coverage Report

Use the coverage command to compare the public IANA PEN search index against the OID-base sitemap directory:

```bash
npm run coverage:oid
```

The command writes:

- `reports/coverage-report.json`
- `reports/coverage-report.md`

The report highlights exact OID-base matches, subtree-only matches, and public PEN records that do not have sitemap-level OID-base evidence. This is useful for OID asset inventory review because missing public directory evidence can become a concrete reconciliation queue.

## Sample Delivery Pack

Generate a sanitized client-facing handoff from the sample asset audit and coverage report:

```bash
npm run delivery:sample
```

The output is `reports/sample-delivery-pack.md`. It combines an executive summary, registry coverage context, action plan, first findings, and client data boundary notes. Use it as a reusable example of the kind of evidence pack this project can produce from a local OID inventory.

## Sample Engagement Brief

```bash
npm run brief:sample
```

The output is `reports/sample-engagement-brief.md`. It describes the client inputs, assessment scope, deliverables, acceptance criteria, and source boundary for a scoped OID inventory assessment before the final evidence pack is generated.

## Open Data Import: IANA PEN

The project also supports the IANA Private Enterprise Numbers registry. IANA licensing terms dedicate protocol registries to CC0 1.0, making this a better source for reusable analysis than copying OID-base content.

```bash
npm run import:iana-pen
```

The command writes local JSONL under `data/iana/`, a committed aggregate report under `reports/iana-pen-summary.json`, and a committed public search index under `reports/iana-pen-public-index.json`. The JSONL is ignored by Git because it includes public contact fields; the report and search index keep only aggregate statistics, enterprise numbers, OIDs, and organization names.

## Static Dashboard

```bash
node src/cli.js build-site --report reports/iana-pen-summary.json --index reports/iana-pen-public-index.json --sitemap reports/oid-base-sitemap-index.json --out public
```

This generates a static dashboard in `public/` from the aggregate report, public PEN search index, and OID-base sitemap catalog. It is safe to publish because it excludes contact names, email values, and OID-base page bodies.

## Authorized Full Import

Only use this after obtaining specific authorization from the site owner:

```bash
set OID_BASE_FULL_CRAWL_AUTHORIZED=1
node src/cli.js crawl --authorized-full --authorization-note "authorization reference" --delay-ms 1500 --out data/full --resume
```

The command refuses to run full collection without both the environment flag and an authorization note.

See `docs/authorized-full-crawl.zh.md` for a Chinese operator note covering the authorization gate, local-only output boundary, and publishable artifact rules.

## Useful Commands

```bash
node src/cli.js inspect-source
node src/cli.js export-sitemap-index --out reports/oid-base-sitemap-index.json
node src/cli.js plan-full-crawl --out reports/authorized-crawl-plan.json --markdown reports/authorized-crawl-plan.md
node src/cli.js audit-assets --in examples/sample-assets.csv --out reports/asset-audit.json --markdown reports/asset-audit.md
node src/cli.js remediation-board --asset-audit reports/asset-audit.json --out reports/remediation-board.json --markdown reports/remediation-board.md --csv reports/remediation-board.csv
node src/cli.js coverage-report --pen-index reports/iana-pen-public-index.json --sitemap reports/oid-base-sitemap-index.json --out reports/coverage-report.json --markdown reports/coverage-report.md
node src/cli.js guard-publishable
node src/cli.js crawl --limit 10 --delay-ms 1000 --out data/sample --resume
node src/cli.js report --in data/sample/records.jsonl --out data/sample/report.json
node src/cli.js import-iana-pen --out data/iana --report reports/iana-pen-summary.json --public-index reports/iana-pen-public-index.json
node src/cli.js build-site --report reports/iana-pen-summary.json --index reports/iana-pen-public-index.json --out public
```
