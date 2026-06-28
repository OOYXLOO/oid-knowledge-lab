# Qwen Autopilot Agent Demo

Generated at: 2026-06-28T21:31:17.545Z

## Summary

- Provider: qwen-compatible
- Model: qwen-plus
- Mode: offline
- Total findings: 3
- High-risk findings: 1
- Unresolved findings: 2
- Human approval gates: 3

## Remediation queue

| # | Asset | OID | Status | Risk | Next action | Human gate |
|---|---|---|---|---|---|---|
| 1 | router-core | `1.3.6.1.4.1.9.9.41` | known_private_enterprise_oid | low | Preserve the public enterprise-root evidence for ciscoSystems and confirm whether the asset label is current. | yes |
| 2 | sha256-policy | `2.16.840.1.101.3.4.2.1` | valid_oid_unmatched | medium | Confirm whether this valid OID is internal, deprecated, or covered by another registry. | yes |
| 3 | bad-row | `not-an-oid` | invalid_value | high | Correct the malformed OID value before using this row as evidence. | yes |

## Qwen role

- Summarize registry evidence in stakeholder-readable language.
- Draft remediation wording and client-safe next actions.
- Ask for missing safe context instead of inventing facts.
- Stop before vendor contact, production tickets, or registry changes.

## Deterministic guards

- OID parsing and malformed-value detection stay deterministic.
- Registry classifications are backed by generated JSON and public source links.
- Human approval gates are required before external action.

## Public boundary

- No secrets
- No private account exports
- No customer raw inventories in public artifacts
- No copied OID-base page bodies
- No payment, KYC, tax, OTP, cookie, or identity data
