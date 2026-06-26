# OID Asset Evidence Delivery Pack

Generated: `2026-06-26T02:20:41.017Z`

This sample delivery pack shows how OID Knowledge Lab turns a local OID inventory into a concise evidence and remediation handoff. It uses public registry indexes and does not require uploading client data.

## Executive Summary

- Asset rows reviewed: `4`
- Valid OIDs: `3`
- Evidence-ready assets: `2`
- Unresolved assets: `2`
- Quality score: `78/100`
- OID-base coverage score: `1/100`

## Registry Coverage Context

- Public PEN records: `65959`
- Exact OID-base matches: `127`
- Subtree-only matches: `289`
- Missing OID-base entries: `65543`

The current public OID-base sitemap has sparse exact coverage for IANA PEN enterprise roots. That makes source mapping and inventory reconciliation valuable: a clean report can distinguish invalid values, known enterprise arcs, exact public directory evidence, and items that need internal registry review.

## Action Plan

| Priority | Action | Count | Delivery note |
| --- | --- | ---: | --- |
| P0 | Correct invalid OID values | 1 | Fix malformed values before using the inventory as audit or integration evidence. |
| P1 | Review unmatched valid OIDs against internal registries | 1 | Confirm whether each unmatched OID is internal, deprecated, or covered by a registry not present in this package. |
| P2 | Preserve evidence-ready public registry mappings | 2 | Keep source URLs and enterprise mappings with the asset record for future review. |

## Sample Findings

| Asset | OID | Status | Risk |
| --- | --- | --- | --- |
| router-core | 1.3.6.1.4.1.9.9.41 | known_private_enterprise_oid | low |
| example-directory-hit | 2.16.840.1.101.3.7.1.219.0 | oidbase_directory_match | low |
| directory-root | 1.3.6.1.4.1 | valid_oid_unmatched | low |
| invalid-row | not-an-oid | invalid_value | high |

## Client data boundary

- Client inventories should be processed locally or in the browser.
- Raw client OID lists should not be committed to the repository.
- Published artifacts should contain only aggregated examples, public registry links, and sanitized findings.
- OID-base page bodies are not copied in this package.

## Suggested Follow-up

1. Normalize malformed OID values.
2. Map private enterprise arcs to an owner or vendor.
3. Preserve exact public evidence links where available.
4. Review unmatched valid OIDs against internal registries.
5. Re-run the audit after cleanup to produce a final evidence pack.
