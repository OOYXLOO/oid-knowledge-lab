# OID Buyer Signal Pack

Generated: `2026-06-26T00:00:00.000Z`

Audience: technical buyer, DevRel editor, PKI owner, SNMP/MIB owner, or internal registry maintainer

## Buyer Summary

A sanitized review of 4 sanitized OID assets found 2 evidence-ready rows, 2 unresolved rows, 1 invalid values, and a 78/100 inventory quality score.

## Buyer Signals

| Signal | Why it matters |
| --- | --- |
| 2 unresolved OID rows need owner review or registry reconciliation. | Unresolved identifiers make certificate policy, MIB, monitoring, or internal registry evidence harder to trust during incidents and audits. |
| 0 unknown private enterprise OIDs need PEN owner mapping. | Unknown enterprise arcs can hide vendor ownership gaps, stale documentation, or namespace drift. |
| 1 malformed OID values need correction before they can become evidence. | Bad syntax is a fast, bounded cleanup item that can be accepted through a re-run check. |
| Public directory coverage score is 1/100 for the current PEN-to-OID-base comparison. | Low public coverage creates a concrete reconciliation queue while keeping copied page bodies out of the published package. |

## First Scope Offer

Run a small sanitized OID inventory assessment: classify each row, preserve public registry evidence, identify unresolved owners, and return a remediation board plus re-run checks.

## Qualifying Questions

- Is the OID list primarily from SNMP/MIB files, certificate policy metadata, monitoring integrations, or an internal registry export?
- Can the first sample be shared as CSV or TSV with an `oid` column and sanitized asset labels?
- Which unresolved rows should go back to a vendor owner, PKI owner, platform owner, or internal registry maintainer?
- Would a remediation CSV, one-page decision summary, or first-call kickoff note be the easiest review format?

## Subject Lines

- Sanitized OID inventory review with public registry evidence
- Small OID cleanup assessment for PKI, MIB, or internal registry teams
- Turn unresolved OID rows into an owner-ready remediation board
- OID evidence pack: malformed values, owner gaps, and re-run checks

## Proof Points

- P0: Correct invalid OID values (1)
- P1: Review unmatched valid OIDs against internal registries (1)
- P2: Preserve evidence-ready public registry mappings (2)

## Boundary Note

The public package uses sitemap metadata and open registry summaries; full OID-base page-body collection remains gated on explicit source-owner authorization.

## Proof Links

| Artifact | Purpose |
| --- | --- |
| reports/asset-audit.md | Sanitized assessment summary and action plan |
| reports/remediation-board.md | Owner-ready remediation queue |
| reports/decision-one-pager.md | Buyer-readable approval summary |
| reports/client-kickoff-pack.md | Initial reply, intake request, and first-call agenda |
| public/sample-assessment.html | Browser-readable sample handoff |
| public/consulting-brief.html | Public assessment brief |
