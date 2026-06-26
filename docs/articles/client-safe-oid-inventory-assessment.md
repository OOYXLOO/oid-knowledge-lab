# Designing a Client-Safe OID Inventory Assessment

Object identifiers are easy to collect and surprisingly hard to trust. A team may have OIDs in MIB files, LDAP schemas, certificate policy documents, device exports, spreadsheets, or legacy registry notes. The values look simple, but a useful review has to answer harder questions:

- Is the OID syntactically valid?
- Does the enterprise root map to a public IANA Private Enterprise Number?
- Is there a public sitemap-level pointer for the OID without copying a third-party knowledge base?
- Which values are malformed, internal-only, unknown, or waiting for owner review?
- What should the team fix first?

This article describes a practical pattern for running a client-safe OID inventory assessment. The core idea is to keep third-party source boundaries, customer data boundaries, and derived analysis outputs separate from the start.

## The Assessment Boundary

An OID assessment should not begin by asking for production credentials or a full export of a private registry. A safer first pass can start with a sanitized CSV or TSV file:

```csv
oid,asset,context
1.3.6.1.4.1.9.9.276,network-monitoring,Cisco SNMP reference
1.3.6.1.4.1.32473.1,certificate-policy,Internal policy note
2.16.840.1.113883.3.72,healthcare-mapping,HL7-related legacy row
```

For the first review, avoid collecting passwords, API keys, tokens, cookies, customer records, raw production logs, or private repository access. The useful input is usually the OID value plus enough sanitized context to understand why the value exists.

The output should be derived and reviewable:

- a normalized OID table,
- an invalid-value queue,
- public IANA PEN mapping where available,
- sitemap-level public evidence links where available,
- an unresolved or internal-review queue,
- and a remediation board with owner actions and acceptance checks.

## Architecture

A safe OID review pipeline can be split into six layers.

### 1. Source Policy Snapshot

Before collecting anything from a public source, record the source URLs, robots rules, terms URL, sitemap hash, and a short human-readable boundary summary.

In OID Knowledge Lab, this is generated with:

```bash
npm run source-policy
```

The report is designed to answer a narrow question: what can be used as public evidence without copying page bodies or publishing a mirror?

### 2. Sitemap-Level Directory

A sitemap catalog is useful because it gives you public pointers without needing to republish third-party page content. For OID-base, a sitemap-level entry can provide:

- the OID path,
- the source URL,
- the Markdown URL,
- the sitemap `lastmod` date,
- root arc and depth metadata.

That is enough to build coverage and evidence-gap reports while keeping the repository free of copied page bodies.

### 3. Public Registry Import

For enterprise OIDs, the IANA Private Enterprise Numbers registry is the safest public anchor. Import the registry into a local index, then remove contact-level noise from the publishable search data.

The review should distinguish between:

- raw registry records used locally,
- publishable owner/root summaries,
- and customer-specific findings.

Those are different audiences and should not be mixed.

### 4. Client Inventory Audit

The client inventory audit should be deterministic and easy to rerun. A useful first pass checks:

- dotted-decimal syntax,
- root arc validity,
- enterprise root candidates,
- duplicate rows,
- context fields,
- and whether public evidence exists.

The first pass should not claim that an OID is officially correct just because it appears in a sitemap or registry. It should classify evidence strength and route uncertain values to owner review.

### 5. Remediation Board

An assessment becomes useful when it tells the team what to do next. A remediation board can group rows into practical actions:

- fix malformed values,
- confirm internal-only arcs,
- update owner documentation,
- replace stale vendor references,
- add evidence links to migration notes,
- or split a larger migration into a second phase.

Each item should have an acceptance check. For example: "OID value is syntactically valid and has an owner-approved internal note" is more actionable than "review this later."

### 6. Client Handoff

The final handoff should make the next conversation easier. A compact handoff can include:

- what was reviewed,
- what was intentionally excluded,
- the evidence sources used,
- the unresolved queue,
- the top remediation actions,
- and the next safe input request.

This keeps the assessment from turning into an open-ended consulting thread.

## Example Review Flow

Using this repository as an example, a local review can be rebuilt with:

```bash
npm run refresh:publishable
npm run audit:assets
npm run remediation:sample
npm run coverage:oid
npm run readiness:client
npm run fit:vertical
npm run proposal:scope
npm run sow:oid
npm run decision:one-pager
npm run kickoff:client
npm run guard:publishable
```

The resulting public artifacts include:

- `reports/source-policy.md`
- `reports/oid-base-sitemap-index.json`
- `reports/iana-pen-public-index.json`
- `reports/asset-audit.md`
- `reports/remediation-board.md`
- `reports/coverage-report.md`
- `reports/client-readiness-pack.md`
- `reports/vertical-use-case-pack.md`
- `reports/scope-proposal-pack.md`
- `reports/statement-of-work-pack.md`
- `reports/decision-one-pager.md`
- `reports/client-kickoff-pack.md`

The important design choice is that publishable artifacts contain derived findings, hashes, counts, commands, and public pointers, not private customer exports or copied third-party page bodies.

## Acceptance Checks

Before sharing the package, run checks that prove the boundary still holds:

```bash
npm run audit:local
npm run guard:publishable
git diff --check
```

A publishable package should be able to answer these questions:

- Are generated reports fresh?
- Are source policy and sitemap evidence present?
- Are page bodies excluded?
- Are contact-level fields excluded?
- Are local sample crawls ignored unless explicitly authorized for publication?
- Are customer inputs sanitized?
- Are remediation actions tied to acceptance checks?

## What Not To Do

Do not turn a first-pass OID inventory review into an unauthorized mirror of a third-party knowledge base. Do not publish customer inventories. Do not ask for production credentials when a sanitized sample is enough. Do not imply that a public pointer is the same as official ownership.

The safer and more useful pattern is narrower: collect permitted public pointers, import open registry data, analyze sanitized client rows locally, and hand back a reviewable evidence table with clear next actions.

## Conclusion

A client-safe OID assessment is mostly a boundary design problem. The technical parser matters, but the assessment becomes credible when each source, output, and handoff artifact has a clear purpose.

For small teams with legacy OID lists, this pattern creates a useful first review without requiring production access. For reviewers, it leaves a transparent trail: what was collected, what was derived, what was excluded, and what the team should fix next.
