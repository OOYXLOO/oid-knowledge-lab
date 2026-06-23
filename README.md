# OID Knowledge Lab

OID Knowledge Lab is a responsible crawler and analysis workspace for Object Identifier (OID) knowledge-base research.

The current source adapter targets public OID-base pages through the site's sitemap and Markdown OID pages. It is intentionally conservative by default: sample crawls are small, delayed, resumable, and avoid disallowed paths.

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

The command writes local JSONL under `data/iana/` and a committed aggregate report under `reports/iana-pen-summary.json`. The JSONL is ignored by Git because it includes public contact fields; the report keeps only aggregate statistics and sample organizations.

## Static Dashboard

```bash
npm run build:site
```

This generates a static dashboard in `public/` from the aggregate report. It is safe to publish because it contains only summary counts, source links, and sample organizations.

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
node src/cli.js crawl --limit 10 --delay-ms 1000 --out data/sample
node src/cli.js report --in data/sample/records.jsonl --out data/sample/report.json
node src/cli.js import-iana-pen --out data/iana --report reports/iana-pen-summary.json
node src/cli.js build-site --report reports/iana-pen-summary.json --out public
```
