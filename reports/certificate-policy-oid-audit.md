# OID Asset Audit

Generated at: 2026-06-26T00:00:00.000Z

## Summary

- Total assets: 4
- Valid OIDs: 3
- Invalid values: 1
- Private enterprise OIDs: 2
- Known enterprises: 2
- OID-base directory matches: 0
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
| 1 | api-edge-cert | 2.16.840.1.113733.1.7.23.6 | valid_oid_unmatched |  |  | low |
| 2 | vpn-client-cert | 1.3.6.1.4.1.55555.7.1 | known_private_enterprise_oid | Rendeer Systems LLC |  | low |
| 3 | legacy-mtls-cert | abc.1.2 | invalid_value |  |  | high |
| 4 | partner-saml-cert | 1.3.6.1.4.1.9.9.46 | known_private_enterprise_oid | ciscoSystems |  | low |
