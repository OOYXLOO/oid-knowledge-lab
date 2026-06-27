# PKI / CLM Buyer Brief: Metadata-Only Certificate Lifecycle Discovery

Certificate lifecycle management work is easiest to approve when the first step is small, evidence-based, and does not require privileged access. This brief describes a scoped discovery milestone for teams that need a clearer certificate inventory before choosing a CLM platform, automating renewals, cleaning up ownership, or preparing for an audit.

## Best-Fit Buyer

This discovery fits a team that already has certificates in production and needs to answer questions like:

- Which certificates expire soon, and who owns the renewal?
- Which rows came from a trusted system versus an old spreadsheet?
- Which issuer paths, key usages, EKUs, and certificate policy OIDs need review?
- Which assets are ready for automation, and which need cleanup first?
- What should be fixed before a CLM rollout, CA migration, or audit response?

It is deliberately not a request for private keys, CA administrator access, payment data, account exports, or production secrets.

## First Milestone

A practical first milestone can be completed from sanitized metadata:

```text
asset_label,certificate_subject,issuer,not_after,certificate_policy_oid,key_usage,eku,source_note,owner_hint
```

The output is a review pack, not a platform migration. It gives the buyer a decision surface:

- renewal risk list,
- owner and source-system gaps,
- issuer/path review queue,
- key usage and EKU review notes,
- certificate policy OID findings,
- remediation board,
- excluded-data boundary,
- and acceptance checks for closing discovery.

## 48-Hour Delivery Shape

Day 1:

- confirm the input fields and exclusions,
- normalize the sanitized inventory,
- classify malformed, missing, and unresolved certificate records,
- separate near-term renewal risk from policy or ownership cleanup.

Day 2:

- deliver the risk summary,
- deliver a remediation board with owner actions,
- review the certificate policy OID findings,
- recommend the next milestone: cleanup, monitoring, automation design, CA/path review, or CLM platform integration.

## What I Would Ask For

Safe inputs:

- sanitized certificate inventory CSV,
- source-system labels,
- owner/team hints,
- known renewal process notes,
- high-level environment labels such as production, staging, or internal.

Excluded inputs:

- private keys,
- passwords, tokens, cookies, or API keys,
- CA administrator sessions,
- raw production logs,
- billing, payment, tax, or KYC material,
- private customer records not needed for certificate review.

## Public Proof

The sample repository shows the same workflow on public or synthetic data:

```text
Dashboard:
https://oid-knowledge-lab.vercel.app/

PKI lifecycle assessment:
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/pki-certificate-lifecycle-assessment.md

Certificate policy audit:
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/certificate-policy-oid-audit.md

Sample certificate inventory:
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/certificate-policy-assets.csv
```

## Acceptance Checks

The first milestone is complete when:

- every submitted certificate row has a classification,
- near-term renewal risks have owner actions,
- unknown owner or source rows have routing actions,
- malformed policy OIDs are separated from valid unresolved OIDs,
- no private keys or privileged account data were required,
- the review pack can be reproduced from the agreed input shape,
- and the next implementation decision is explicit.

## Why This Is the Right First Step

CLM projects often fail by jumping straight to tooling before the inventory is trusted. A metadata-only discovery milestone gives security, platform, and application teams a shared map first. It is small enough to approve, safe enough to start without privileged access, and concrete enough to turn into the next paid milestone if the buyer wants cleanup or automation support.
