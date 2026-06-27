# PKI Certificate Lifecycle Assessment: A Safe Discovery Pattern

Certificate lifecycle projects often start with tooling questions: which platform to buy, which CA to integrate, which scanner to run, or which renewal workflow to automate. Those decisions are hard to make safely until the team has a trusted inventory of certificate metadata, ownership, renewal windows, issuer paths, and policy evidence.

This note describes a small first assessment that can be completed before any private keys, account credentials, or production configuration changes are needed.

## When This Pattern Fits

Use this assessment when a team needs to answer questions like:

- Which certificates are close to renewal risk?
- Which certificates have unclear owners or source systems?
- Which issuer chains, key usages, or extended key usages need review?
- Which certificate policy OIDs appear in the environment?
- Which certificate records are evidence-ready for audit or customer review?
- Which rows need remediation before automation is trusted?

The assessment is intentionally narrow. It does not replace a full PKI architecture review, CA migration, HSM design, incident response engagement, or managed certificate platform rollout. It creates the first evidence map those larger efforts need.

## Safe Input Shape

A first pass only needs sanitized metadata. A CSV can be enough:

```text
asset_label,certificate_subject,issuer,not_after,san_count,key_usage,eku,policy_oid,source_system,owner_hint
api-gateway,api.example.internal,Example Issuing CA,2026-08-14,8,digitalSignature,serverAuth,2.16.840.1.113733.1.7.23.6,load-balancer,platform
vpn-edge,vpn.example.internal,Internal Device CA,2026-07-03,2,digitalSignature keyEncipherment,serverAuth,1.3.6.1.4.1.55555.10.2,device-inventory,network
legacy-service,legacy.example.internal,Unknown,2026-06-29,1,unknown,unknown,,spreadsheet,
```

Keep these out of the assessment input:

- private keys,
- passwords or API tokens,
- CA administrator sessions,
- account exports with private customer data,
- payment, billing, tax, or KYC material,
- copied third-party page bodies,
- and raw production logs unless specifically scoped and sanitized.

## Review Lanes

The first assessment classifies each row into practical work lanes:

- renewal risk: certificates with near-term expiration or missing renewal owner,
- ownership gap: records without a clear team or source system,
- issuer/path review: unknown, unexpected, or legacy issuer evidence,
- usage review: missing or unusual key usage / EKU values,
- policy OID review: certificate policy OIDs that need registry context or internal owner confirmation,
- evidence-ready: records that already have enough metadata for audit handoff,
- correction needed: malformed dates, invalid OIDs, duplicate rows, or incomplete subject data.

## Example Deliverables

A scoped engagement can produce:

- certificate inventory field checklist,
- risk summary by renewal window and owner,
- policy OID inventory review,
- remediation board with owner actions,
- repeatable local audit command,
- evidence handoff that explains what was included and excluded,
- and acceptance checks for closing the first milestone.

The public OID Knowledge Lab sample shows the same structure on a certificate policy OID subset:

```text
https://oid-knowledge-lab.vercel.app/
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/certificate-policy-assets.csv
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/certificate-policy-oid-audit.md
```

## Acceptance Checks

The first assessment is complete when:

- every submitted row has a classification,
- near-term renewal risks have an owner action,
- unknown owner rows have a routing action,
- policy OIDs are marked as known, unresolved, malformed, or needing internal confirmation,
- unsafe material was not required or published,
- generated reports can be reproduced from the agreed input shape,
- and the next implementation step is clear: cleanup, monitoring, automation, CA/path review, or platform integration.

## Why Start Small

Certificate lifecycle work can become broad quickly. A small discovery assessment creates a shared map before the team changes CA configuration, introduces automation, or commits to a platform rollout. It gives security, platform, and application owners a concrete remediation board instead of another general certificate-management discussion.
