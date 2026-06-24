# OID Inventory Assessment Brief

Generated: `2026-06-24T05:00:48.094Z`

This brief describes a scoped OID inventory assessment using public registry indexes, a local client inventory, and a publishable evidence boundary. It is intended as a project starter before a full evidence delivery pack is produced.

## Assessment Snapshot

- Asset rows in sample audit: `4`
- Valid OIDs: `3`
- Invalid values: `1`
- Evidence-ready assets: `2`
- Unresolved assets: `2`
- Quality score: `78/100`
- Public PEN records available: `65959`
- OID-base sitemap exact matches: `127`
- OID-base sitemap subtree-only matches: `289`

## Client Inputs

- A CSV or tab-delimited OID inventory with an `oid` column.
- Optional asset label columns such as `asset`, `name`, `id`, or `label`.
- Any internal registry notes needed to classify unmatched but valid OIDs.
- A preferred output format for review handoff: Markdown, JSON, or both.

Client inventory files should stay local. The browser dashboard can audit a list without uploading it to a server.

## Deliverables

- Normalized OID inventory quality summary.
- Invalid OID correction queue.
- Private enterprise number owner mapping where public registry evidence exists.
- OID-base sitemap evidence mapping for exact and subtree matches.
- Unresolved OID queue for internal registry review.
- Final evidence pack with public source links and sanitized findings.

## Acceptance Criteria

- Every input row is classified as invalid, evidence-ready, or unresolved.
- Invalid values include enough detail for correction.
- Known private enterprise arcs include the enterprise root and organization name when public evidence exists.
- OID-base evidence includes source URLs only, not copied page bodies.
- The final handoff excludes credentials, account data, private client inventories, and contact-level registry fields.

## Initial Action Plan

| Priority | Action | Count | Note |
| --- | --- | ---: | --- |
| P0 | Correct invalid OID values | 1 | Fix malformed values before using the inventory as audit or integration evidence. |
| P1 | Review unmatched valid OIDs against internal registries | 1 | Confirm whether each unmatched OID is internal, deprecated, or covered by a registry not present in this package. |
| P2 | Preserve evidence-ready public registry mappings | 2 | Keep source URLs and enterprise mappings with the asset record for future review. |

## Source Boundary

- Sitemap source: https://oid-base.com/sitemap.xml
- Terms source: https://oid-base.com/disclaimer.htm.md
- Full crawl requires authorization: `yes`
- Page bodies publishable without authorization: `no`

Full OID-base page bodies are outside the default scope. The default package uses sitemap metadata, public IANA PEN data, source hashes, and local-only parser-validation samples.
