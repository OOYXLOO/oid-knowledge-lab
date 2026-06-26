# Reports

This directory stores aggregate reports that are safe to publish.

- `oid-base-sitemap-index.json`: complete sitemap-level OID-base directory observed during the latest refresh. It contains OID values, source URLs, Markdown URLs, sitemap last-modified dates, root arcs, and depth metadata. It does not contain page bodies.
- `iana-pen-summary.json`: aggregate report for the IANA Private Enterprise Numbers registry.
- `iana-pen-public-index.json`: searchable public IANA PEN index with organization names and OIDs, excluding contact and email fields.
- `dataset-manifest.json`: publishable data package manifest with artifact sizes, hashes, counts, source links, and data-exclusion boundaries.
- `source-policy.json`: source policy snapshot with source URLs, hashes, effective robots rules, sitemap count, and collection boundary flags.
- `source-policy.md`: human-readable version of the source policy snapshot.
- `authorized-crawl-plan.json`: machine-readable plan for a future authorized page-body collection, including task size, delay, output path, and authorization gates.
- `authorized-crawl-plan.md`: human-readable version of the authorized full crawl plan. It is a plan, not a copied content mirror.
- `asset-audit.json`: example OID asset inventory audit generated from `examples/sample-assets.csv`.
- `asset-audit.md`: Markdown version of the example asset audit, suitable for a quick review handoff.
- `remediation-board.json`: machine-readable client action queue generated from the example asset audit.
- `remediation-board.md`: Markdown version of the remediation board, with owner actions and acceptance checks.
- `remediation-board.csv`: spreadsheet-ready remediation board for issue trackers or client review.
- `coverage-report.json`: comparison of the public IANA PEN index against the OID-base sitemap directory.
- `coverage-report.md`: Markdown handoff showing exact OID-base matches, subtree-only matches, and missing public directory evidence.
- `sample-engagement-brief.md`: scoped assessment starter with client inputs, deliverables, acceptance criteria, and source boundary notes.
- `sample-delivery-pack.md`: sanitized sample handoff that combines asset audit results and coverage context into a client-facing evidence pack.
- `client-readiness-pack.md`: client-ready review flow, acceptance evidence, and excluded-data boundary.
- `vertical-use-case-pack.md`: mapping from the assessment engine to SNMP/MIB, PKI policy OID, and internal registry cleanup lanes.
- `scope-proposal-pack.md`: first-scope proposal with first-48-hour work, client inputs, acceptance criteria, and exclusions.
- `statement-of-work-pack.md`: work boundary with deliverables, client responsibilities, acceptance checks, change control, and exclusions.
- `decision-one-pager.md`: first-page decision summary for approving a small sanitized OID inventory review.
- `client-kickoff-pack.md`: initial reply, safe intake request, first-call agenda, deliverables preview, acceptance preview, boundary notes, and proof links.

Full JSONL imports and raw source files stay under ignored `data/` paths unless the source authorization explicitly allows publication.
