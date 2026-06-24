# Reports

This directory stores aggregate reports that are safe to publish.

- `oid-base-sitemap-index.json`: complete sitemap-level OID-base directory observed during the latest refresh. It contains OID values, source URLs, Markdown URLs, sitemap last-modified dates, root arcs, and depth metadata. It does not contain page bodies.
- `iana-pen-summary.json`: aggregate report for the IANA Private Enterprise Numbers registry.
- `iana-pen-public-index.json`: searchable public IANA PEN index with organization names and OIDs, excluding contact and email fields.
- `dataset-manifest.json`: publishable data package manifest with artifact sizes, hashes, counts, source links, and data-exclusion boundaries.
- `source-policy.json`: source policy snapshot with source URLs, hashes, effective robots rules, sitemap count, and collection boundary flags.
- `source-policy.md`: human-readable version of the source policy snapshot.
- `asset-audit.json`: example OID asset inventory audit generated from `examples/sample-assets.csv`.
- `asset-audit.md`: Markdown version of the example asset audit, suitable for a quick review handoff.
- `coverage-report.json`: comparison of the public IANA PEN index against the OID-base sitemap directory.
- `coverage-report.md`: Markdown handoff showing exact OID-base matches, subtree-only matches, and missing public directory evidence.
- `sample-engagement-brief.md`: scoped assessment starter with client inputs, deliverables, acceptance criteria, and source boundary notes.
- `sample-delivery-pack.md`: sanitized sample handoff that combines asset audit results and coverage context into a client-facing evidence pack.

Full JSONL imports and raw source files stay under ignored `data/` paths unless the source authorization explicitly allows publication.
