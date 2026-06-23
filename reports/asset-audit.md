# OID Asset Audit

Generated at: 2026-06-23T23:46:32.311Z

## Summary

- Total assets: 4
- Valid OIDs: 3
- Invalid values: 1
- Private enterprise OIDs: 1
- Known enterprises: 1
- OID-base directory matches: 1
- Quality score: 71/100

## Recommendations

- Normalize or remove 1 invalid OID value(s) before publishing an asset inventory.
- Review OIDs without an OID-base sitemap match; they may be internal arcs, stale values, or require another registry source.

## Findings

| # | Asset | OID | Status | Enterprise | OID-base source | Risk |
|---|---|---|---|---|---|---|
| 1 | router-core | 1.3.6.1.4.1.9.9.41 | known_private_enterprise_oid | ciscoSystems |  | low |
| 2 | example-directory-hit | 2.16.840.1.101.3.7.1.219.0 | oidbase_directory_match |  | https://oid-base.com/get/2.16.840.1.101.3.7.1.219.0 | low |
| 3 | directory-root | 1.3.6.1.4.1 | valid_oid_unmatched |  |  | low |
| 4 | invalid-row | not-an-oid | invalid_value |  |  | high |
