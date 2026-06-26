# OID Remediation Board

Generated: `2026-06-26T03:52:26.375Z`

This board turns an OID asset audit into a client-action queue. It is safe to publish as a sanitized sample because it contains derived findings and public source pointers, not raw client inventories or copied OID-base page bodies.

## Summary

- Total items: `4`
- P0 correction items: `1`
- P1 review items: `1`
- P2 evidence-preservation items: `2`
- Evidence-ready items: `2`
- Client action items: `2`

## Board

| ID | Priority | Asset | OID | Issue | Owner action | Acceptance check |
| --- | --- | --- | --- | --- | --- | --- |
| OID-004 | P0 | invalid-row | not-an-oid | Invalid OID syntax | Correct or remove the value before using it in audit evidence, device metadata, or policy documentation. | The replacement value matches numeric OID syntax and re-runs without an invalid_value finding. |
| OID-003 | P1 | directory-root | 1.3.6.1.4.1 | Valid OID without public directory evidence | Check internal registry notes or another authoritative source before relying on this OID externally. | A source link, internal registry reference, or explicit unresolved disposition is attached. |
| OID-001 | P2 | router-core | 1.3.6.1.4.1.9.9.41 | Known private enterprise arc | Attach the public enterprise owner mapping and confirm the sub-arc meaning with vendor or internal docs. | The asset record includes enterprise owner, enterprise root, and local sub-arc purpose. |
| OID-002 | P2 | example-directory-hit | 2.16.840.1.101.3.7.1.219.0 | Public directory evidence ready | Preserve the source URL with the asset record and verify the business meaning with the owning team. | The asset record includes the OID-base source URL and an internal owner. |

## Handling Boundary

- Keep raw client inventories local.
- Keep credentials, tokens, cookies, account data, and private correspondence out of the repository.
- Sanitized finding boundary: treat every row as derived review output, not as the raw client inventory.
- Use OID-base sitemap links as pointers only; do not copy OID-base page bodies into public artifacts.
- Re-run the asset audit after corrections to close the board.
