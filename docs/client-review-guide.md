# OID Inventory Review Guide

This guide gives reviewers a fast path through the public OID Knowledge Lab evidence package without requiring local setup.

## Review Path

1. Open the static dashboard.
2. Open the sample assessment page.
3. Review the dataset manifest.
4. Review the source policy boundary.
5. Review the remediation board sample.

## Public Artifacts

- Static dashboard: `public/index.html`
- Sample assessment: `public/sample-assessment.html`
- Dataset manifest: `reports/dataset-manifest.json`
- Source policy: `reports/source-policy.md`
- Sample delivery pack: `reports/sample-delivery-pack.md`
- Remediation board: `reports/remediation-board.md`

## What The Sample Demonstrates

- A sanitized OID inventory can be checked without production access.
- Invalid values are separated from valid but unresolved entries.
- Private enterprise arcs can be mapped to public IANA PEN records when evidence exists.
- OID-base is used at the sitemap/source-link level, without copying page bodies.
- The final handoff can include Markdown, JSON, CSV, and browser-readable evidence.

## Data Boundary

The public sample is synthetic and sanitized. Real client inventories should stay local unless the client explicitly chooses to publish a redacted example. Do not commit passwords, tokens, cookies, private repositories, production exports, payment data, personal data, or copied OID-base page bodies.
