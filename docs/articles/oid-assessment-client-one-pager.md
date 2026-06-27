# OID Inventory Assessment: Client One-Pager

This one-pager is for teams that have Object Identifier values in device metadata, SNMP/MIB files, certificate policy documents, internal registries, product integrations, or audit evidence and need a safe way to clean up what those values mean.

## The Problem

OID inventories often become difficult to trust because they mix several kinds of evidence:

- valid OIDs with clear public registry context,
- private enterprise arcs that need owner confirmation,
- valid but unmatched values that may depend on internal records,
- malformed values copied from tickets, spreadsheets, exports, or old docs,
- and source links that are useful as pointers but not enough to prove business meaning.

The risk is not only technical correctness. The handoff can also become unsafe if raw inventories, private customer exports, credentials, account data, or copied third-party page bodies are shared too broadly.

## What This Assessment Produces

The assessment turns a sanitized OID list into a reviewable evidence package:

- an asset audit that classifies each OID row,
- a remediation board with owner actions and acceptance checks,
- a public registry coverage context,
- a client-safe intake checklist,
- a delivery pack for review,
- a statement-of-work style boundary,
- and a kickoff note that can be used to start a scoped cleanup conversation.

The public sample implementation is in this repository. It uses public IANA PEN data and OID-base sitemap-level metadata as reference points, while keeping full page-body mirrors and private inventories out of the published package.

## Safe Client Inputs

A first-pass review only needs a small, sanitized inventory:

```text
asset_label,oid,source_note
vpn-gateway-snmp,1.3.6.1.4.1.9.9.46,device MIB export
certificate-policy,2.16.840.1.113733.1.7.23.6,policy document excerpt
unknown-vendor,1.3.6.1.4.1.55555.1,legacy spreadsheet
bad-value,abc.1.2,ticket copy
```

Do not include:

- production credentials,
- API keys or bearer tokens,
- cookies or session data,
- private customer records,
- raw production exports,
- payment, billing, tax, or KYC material,
- or copied third-party page bodies.

## Review Flow

1. Prepare a sanitized CSV with labels, OID values, and short source notes.
2. Run the local assessment against public reference indexes.
3. Review the classification output: invalid value, known private enterprise arc, public directory evidence, or unresolved valid OID.
4. Assign owner actions for each unresolved or risky row.
5. Re-run after corrections and preserve final evidence links with the asset record.

## Example Deliverables

Public sample artifacts:

```text
https://oid-knowledge-lab.vercel.app/
```

Client readiness pack:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/client-readiness-pack.md
```

Decision one-pager:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/decision-one-pager.md
```

Client kickoff pack:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/client-kickoff-pack.md
```

Statement of work sample:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/statement-of-work-pack.md
```

## Acceptance Checks

A scoped assessment is ready to close when:

- every submitted row has a classification,
- malformed values have correction guidance,
- known private enterprise arcs include public owner evidence when available,
- unresolved values have an owner action or documented exception,
- copied third-party page bodies are not included in public artifacts,
- raw client inventories stay local or in the agreed private delivery channel,
- and the final handoff includes repeatable verification commands.

## Why This Is Useful

This is a small, bounded assessment: it does not require broad account access, source-system credentials, or private exports. It gives data owners a clean first map of which OID values are evidence-ready, which need internal review, and which should be corrected before they appear in audit evidence or customer-facing documentation.
