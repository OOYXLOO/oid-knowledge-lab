# OID Inventory Assessment Statement of Work Pack

Generated: `2026-06-26T00:00:00.000Z`

This pack converts the scope proposal into a reviewable work boundary. It is designed for sanitized OID inventories and derived findings only.

## Objective

Start with a sanitized OID inventory sample, classify every row, and produce a compact remediation queue before any broader registry cleanup.

## Schedule

| Phase | Output |
| --- | --- |
| Kickoff | Confirm safe inventory shape, review lane, and excluded data. |
| Confirm sanitized inventory shape | CSV or tab-delimited input with an oid column and safe asset labels. |
| Run local assessment | Classify invalid values, known public PEN ownership, OID-base sitemap matches, and unresolved valid OIDs. |
| Review action queue | 3 action-plan groups become a scoped remediation board with owner actions. |
| Approve handoff boundary | Share derived findings and public source links only; raw inventories and copied page bodies remain outside the package. |
| Final handoff | Deliver the assessment summary, remediation queue, source-boundary receipt, and re-run notes. |

## Deliverables

- OID assessment summary with counts, quality score, and prioritized action groups.
- Remediation queue suitable for spreadsheet or issue-tracker import.
- Public-source evidence map using IANA PEN records and OID-base sitemap URLs.
- Client-safe handoff notes covering exclusions, re-run checks, and unresolved owner questions.

## Client Responsibilities

- Provide a sanitized CSV or tab-delimited OID inventory with an `oid` column.
- Use safe asset labels and remove credentials, account exports, customer records, and private correspondence.
- Choose the primary review lane before kickoff: SNMP/MIB, PKI policy, or internal registry cleanup.
- Assign an internal reviewer for unresolved OIDs that need organization-specific ownership checks.

## Acceptance Checklist

- Every input row is classified as invalid, evidence-ready, or unresolved.
- Invalid OID values include correction guidance.
- Known private enterprise arcs include public PEN owner evidence when available.
- OID-base evidence is represented as sitemap/source URLs; OID-base page bodies stay out of the published package.
- The final remediation queue lists owner actions and re-run checks.
- The handoff includes a source boundary note that excludes raw inventories and copied page bodies.
- Each unresolved OID has a next action or internal owner-review question.

## Review Lanes

| Lane | Fit |
| --- | ---: |
| Internal OID registry cleanup | 90/100 |
| PKI certificate policy OID review | 85/100 |
| SNMP / MIB vendor PEN inventory | 80/100 |

## Public Artifacts

| Artifact | Purpose |
| --- | --- |
| reports/statement-of-work-pack.md | Statement of work, responsibilities, acceptance, and change-control boundary |
| reports/scope-proposal-pack.md | First scope, client inputs, first-48-hour plan, and exclusions |
| reports/client-readiness-pack.md | Readiness checks and review flow |
| reports/sample-delivery-pack.md | Example assessment delivery shape |
| reports/remediation-board.csv | Importable cleanup queue sample |
| reports/source-policy.md | Source boundary receipt |

## Change Control

- Inventory size, new data sources, live system access, account exports, or additional review lanes require separate approval.
- Full OID-base page-body collection requires explicit source-owner authorization before it enters any workflow.
- Private credentials, tokens, cookies, payment data, and KYC material are not accepted as project inputs.

## Out of Scope

- credentials, OTPs, cookies, tokens, private account exports, and production secrets
- payment, tax, KYC, or billing material
- raw client inventories in public repositories
- OID-base raw Markdown, HTML, or page-body mirrors without source-owner authorization
- open-ended enterprise architecture review beyond the agreed OID inventory sample
