# OID Inventory Assessment Vertical Fit Pack

Generated: `2026-06-26T03:14:55.802Z`

This pack maps the same OID inventory assessment engine to three practical review contexts. It is a public, source-safe planning artifact: it uses derived findings, public registry evidence, and source-boundary receipts, not raw client inventories or copied OID-base page bodies.

## SNMP / MIB vendor PEN inventory

Audience: Network, NOC, and observability teams that need to reconcile enterprise OIDs found in MIBs, traps, or device exports.

Fit score: `80/100`

### Fit Signals

- 1 private enterprise OIDs in the sample inventory
- 1 known public PEN owner matches
- 65959 public PEN records available for owner evidence

### Input Request

A sanitized CSV with device, MIB, trap, or asset labels and the OID values to reconcile.

### Delivery Slice

Classify known enterprise roots, unknown enterprise arcs, and owner evidence gaps; return a cleanup queue and evidence links.

### Acceptance Checks

- Known PEN roots include public owner evidence.
- Unknown enterprise arcs are isolated for internal owner review.
- Invalid values are separated before any owner mapping is trusted.

### Sample OID Rows

| Label | OID | Status | Evidence |
| --- | --- | --- | --- |
| router-core | 1.3.6.1.4.1.9.9.41 | known_private_enterprise_oid | ciscoSystems |

## PKI certificate policy OID review

Audience: Security, compliance, and platform teams that maintain certificate policy, algorithm, or assurance OIDs.

Fit score: `85/100`

### Fit Signals

- 3 syntactically valid OIDs in the sample inventory
- 1 OID-base sitemap directory evidence matches
- 127 public exact directory matches in the broader coverage report

### Input Request

A sanitized list of certificate policy, algorithm, or registry OIDs plus optional labels describing where they appear.

### Delivery Slice

Separate registry-backed OIDs from unmatched values and produce an acceptance checklist for policy documentation.

### Acceptance Checks

- Registry-backed OIDs include a public source URL or are marked for internal policy evidence.
- Unmatched policy OIDs are listed with a precise evidence gap.
- No certificate private keys, secrets, or account exports are requested.

### Sample OID Rows

| Label | OID | Status | Evidence |
| --- | --- | --- | --- |
| example-directory-hit | 2.16.840.1.101.3.7.1.219.0 | oidbase_directory_match | https://oid-base.com/get/2.16.840.1.101.3.7.1.219.0 |

## Internal OID registry cleanup

Audience: Architecture and identity teams that have inherited OID lists with unclear owners, malformed values, or mixed namespace conventions.

Fit score: `90/100`

### Fit Signals

- 2 unresolved or review-needed sample assets
- 1 invalid OID values requiring correction
- 78/100 sample inventory quality score

### Input Request

A sanitized export from the internal registry or spreadsheet with OID, asset label, and optional notes columns.

### Delivery Slice

Create a prioritized owner-review queue, invalid-value correction list, and re-run acceptance checklist.

### Acceptance Checks

- Every row is classified as invalid, evidence-ready, or owner-review required.
- The remediation CSV can be imported into a tracker.
- A re-run can confirm that cleanup reduced unresolved and invalid rows.

### Sample OID Rows

| Label | OID | Status | Evidence |
| --- | --- | --- | --- |
| directory-root | 1.3.6.1.4.1 | valid_oid_unmatched | review queue |
| invalid-row | not-an-oid | invalid_value | review queue |


## Discovery Questions

- Do the OIDs come from SNMP/MIB exports, traps, or device telemetry?
- Are any OIDs used in certificate policy, algorithm, assurance, or PKI documentation?
- Is there an internal registry or spreadsheet that should become the source of truth?
- Which rows can be shared as sanitized labels, and which must stay local-only?
- What evidence should be accepted for each row: public PEN owner, OID-base sitemap URL, internal owner, or correction ticket?

## Public Artifacts

| Artifact | Purpose |
| --- | --- |
| reports/vertical-use-case-pack.md | Vertical fit map for SNMP/MIB, PKI, and internal registry reviews |
| reports/client-readiness-pack.md | Client intake, review flow, acceptance evidence, and excluded-data boundary |
| reports/sample-delivery-pack.md | Sanitized evidence delivery example |
| reports/remediation-board.csv | Importable cleanup queue |
| public/index.html | Browser-only local OID list audit surface |
| public/sample-assessment.html | Browser-readable sample handoff |

## Excluded Data

- Raw client inventories
- credentials, OTPs, cookies, API keys, private keys, and tokens
- payment, tax, KYC, billing, or private account material
- OID-base raw page-body mirrors without explicit source-owner authorization

## Source Boundary

Full OID-base page-body collection requires explicit source-owner authorization. Published reports should keep using sitemap metadata, public IANA PEN aggregates, and derived client findings unless that authorization exists.
