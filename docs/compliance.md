# Compliance Notes

## Source Rules Observed

The crawler checks:

- `https://oid-base.com/robots.txt`
- `https://oid-base.com/sitemap.xml`
- `https://oid-base.com/disclaimer.htm.md`

Observed rules during project creation:

- `/sitemap.xml` is published and lists public OID pages.
- `/get/<OID>` pages are not disallowed for the generic user agent.
- The site advertises Markdown OID pages such as `/get-md/0` through `llms.txt`.
- Some CGI, management, helper, and tree display paths are disallowed and are not used by this crawler.
- The terms restrict copying/downloading to noncommercial personal use and a small part of the data unless specific authorization is granted.

## Repository Policy

This repository is built as tooling plus a small verification sample. It is not a full mirror.

IANA Private Enterprise Numbers are handled separately from OID-base content. IANA licensing terms state that protocol registries may be freely used and are subject to the CC0 1.0 dedication. The project can therefore generate aggregate reports from IANA PEN data without relying on an OID-base full mirror.

Full collection requires:

1. Written authorization or another clear license basis.
2. A local `OID_BASE_FULL_CRAWL_AUTHORIZED=1` environment variable.
3. An `--authorization-note` argument.
4. A polite delay between requests.
5. No crawling of disallowed paths.

## Data Handling

The default crawler stores parsed JSONL records and a content hash. It does not store raw Markdown copies by default. That makes samples useful for parser tests and analysis design without creating an unnecessary content mirror.

Full JSONL imports and raw source files stay under ignored `data/` paths unless the source authorization explicitly allows publication.

`npm run audit:dataset` writes `reports/dataset-manifest.json` and checks that the publishable package excludes OID-base page bodies and IANA contact fields.
