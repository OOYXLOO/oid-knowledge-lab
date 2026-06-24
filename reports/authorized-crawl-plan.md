# Authorized Full Crawl Plan

Generated at: `2026-06-24T07:34:30.285Z`

## Scope

- Source: https://oid-base.com/
- Source kind: public sitemap plus authorized page-body collection
- Entries planned: `7,492`
- Delay between requests: `1500 ms`
- Estimated request time: `3h 7m 17s`

## Output Boundary

- Output directory: `data/full`
- Tracked in Git: `false`
- Publishable without source authorization: `false`
- Raw Markdown saved by default: `false`

The full crawl output is local operational evidence, not a publishable page-body mirror.

## Required Gates

- Written authorization or another clear license basis from the source owner.
- Set OID_BASE_FULL_CRAWL_AUTHORIZED=1 before running the crawler.
- Pass --authorized-full and a non-empty --authorization-note value.
- Respect robots.txt and avoid disallowed paths.
- Use a polite delay between page-body requests.

## Publishable Outputs

- crawler code
- sitemap metadata index
- aggregate reports
- hashes and dataset manifests
- small parser-validation receipts

## Resume Strategy

- Resume flag: `--resume`
- Behavior: Existing records.jsonl entries are treated as completed OIDs; the next run appends only pending sitemap entries.

Checkpoint files:

- `records.jsonl`
- `crawl-state.json`
- `records-summary.json`

## Operational Receipts

- records.jsonl contains one parsed JSON record per completed OID.
- crawl-state.json records running or complete status, selected count, completed count, and last OID.
- records-summary.json records final count, first/last OID, authorization mode, raw-save mode, and resume mode.

## Excluded Outputs

- unauthorized OID-base page bodies
- raw Markdown or HTML mirrors
- complete JSONL page-body exports without source authorization
- credentials, cookies, tokens, account data, or private correspondence

## First Planned Entries

- `0` -> https://oid-base.com/get-md/0
- `1` -> https://oid-base.com/get-md/1
- `1.3.6.1.4.1.65947` -> https://oid-base.com/get-md/1.3.6.1.4.1.65947
- `1.3.6.1.4.1.65948` -> https://oid-base.com/get-md/1.3.6.1.4.1.65948
- `1.3.6.1.4.1.65949` -> https://oid-base.com/get-md/1.3.6.1.4.1.65949
- `1.3.6.1.4.1.65950` -> https://oid-base.com/get-md/1.3.6.1.4.1.65950
- `1.3.6.1.4.1.65951` -> https://oid-base.com/get-md/1.3.6.1.4.1.65951
- `1.3.6.1.4.1.65952` -> https://oid-base.com/get-md/1.3.6.1.4.1.65952
- `1.3.6.1.4.1.65953` -> https://oid-base.com/get-md/1.3.6.1.4.1.65953
- `1.3.6.1.4.1.65954` -> https://oid-base.com/get-md/1.3.6.1.4.1.65954
