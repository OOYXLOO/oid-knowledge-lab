# OID Knowledge Lab

OID Knowledge Lab is a responsible crawler and analysis workspace for Object Identifier (OID) knowledge-base research.

The current source adapter targets public OID-base pages through the site's sitemap and Markdown OID pages. It is intentionally conservative by default: sample crawls are small, delayed, resumable, and avoid disallowed paths.

## Current Publishable Snapshot

Last refreshed on 2026-06-24:

- OID-base sitemap catalog: 7,492 public OID entries from `https://oid-base.com/sitemap.xml`
- IANA Private Enterprise Numbers import: 66,101 raw registry records
- Public IANA PEN search index: 65,959 records after excluding contact-level noise
- Static dashboard: generated under `public/`
- Dataset manifest: `reports/dataset-manifest.json` with artifact hashes, sizes, source links, and publication boundaries

This repository stores the complete OID-base sitemap-level directory observed during the refresh. It does not store OID-base page bodies or raw Markdown/HTML mirrors.

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
npm run build:site
npm run crawl:sample
npm run report
npm run import:iana-pen
```

The sample output is written under `data/sample/`:

- `sitemap-sample.json`
- `records.jsonl`
- `records-summary.json`
- `report.json`

Generated sample JSON/JSONL files are ignored by Git. Commit only run receipts or synthetic fixtures unless the source authorization explicitly allows publishing collected data.

## Rebuild the Publishable Data Package

```bash
npm run refresh:publishable
```

This command:

1. Fetches the current OID-base sitemap and rebuilds `reports/oid-base-sitemap-index.json`.
2. Imports the IANA PEN registry and rebuilds the aggregate/public reports.
3. Rebuilds the static dashboard in `public/`.
4. Writes `reports/dataset-manifest.json` with checksums for the publishable artifacts.

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
node src/cli.js crawl --authorized-full --authorization-note "authorization reference" --delay-ms 1500 --out data/full
```

The command refuses to run full collection without both the environment flag and an authorization note.

## Useful Commands

```bash
node src/cli.js inspect-source
node src/cli.js export-sitemap-index --out reports/oid-base-sitemap-index.json
node src/cli.js crawl --limit 10 --delay-ms 1000 --out data/sample
node src/cli.js report --in data/sample/records.jsonl --out data/sample/report.json
node src/cli.js import-iana-pen --out data/iana --report reports/iana-pen-summary.json --public-index reports/iana-pen-public-index.json
node src/cli.js build-site --report reports/iana-pen-summary.json --index reports/iana-pen-public-index.json --out public
```
