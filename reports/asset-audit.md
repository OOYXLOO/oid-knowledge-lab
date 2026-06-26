# OID Asset Audit

Generated at: 2026-06-26T01:39:42.209Z

## Summary

- Total assets: 4
- Valid OIDs: 3
- Invalid values: 1
- Private enterprise OIDs: 1
- Known enterprises: 1
- OID-base directory matches: 1
- Evidence-ready assets: 2
- Unresolved assets: 2
- Quality score: 78/100

## Action Plan

| Priority | Action | Count | Operator note |
|---|---|---:|---|
| P0 | Correct invalid OID values | 1 | Fix malformed values before using the inventory as audit or integration evidence. |
| P1 | Review unmatched valid OIDs against internal registries | 1 | Confirm whether each unmatched OID is internal, deprecated, or covered by a registry not present in this package. |
| P2 | Preserve evidence-ready public registry mappings | 2 | Keep source URLs and enterprise mappings with the asset record for future review. |

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
