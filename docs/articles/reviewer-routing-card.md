# Reviewer Routing Card

This card gives editors, DevRel reviewers, and documentation teams a short path through the OID Knowledge Lab writing samples.

## Fastest Review Path

1. Start with the portfolio card:
   `docs/articles/portfolio-card.md`
2. Check implementation proof:
   `docs/articles/implementation-authenticity-proof.md`
3. Pick the sample lane that matches your publication:
   - Data engineering: `docs/articles/airbyte-editor-one-pager.md`
   - Kubernetes or cloud-native tutorials: `docs/articles/civo-editor-one-pager.md`
   - Writer-network review: `docs/articles/draftdev-writer-profile-one-pager.md`
   - Structured content or internal tools: `docs/articles/directus-editor-one-pager.md`
   - Observability and debugging: `docs/articles/production-integration-debug-handoff.md`

## What This Proves

- The sample topics are backed by a working Node.js project, generated reports, static dashboard output, and reproducible checks.
- The public repository separates publishable derived artifacts from private inventories, credentials, account exports, and third-party page-body mirrors.
- The writing samples focus on implementation-backed developer education rather than generic commentary.
- The same project can support article pitches, documentation samples, and small scoped technical handoffs without requiring private customer data.

## Suggested First Assignment Shape

The safest first assignment is a narrowly scoped tutorial or field guide:

- one concrete workflow,
- one working code path,
- one public proof page,
- one explicit data boundary,
- and one reproducible verification command.

Good first-assignment topics include:

- Build a safe registry evidence dashboard from public and sanitized local data.
- Build a static evidence dashboard with Node.js, GitHub Pages, and a release guard.
- Capture the right logs, metrics, traces, and correlation handles before debugging an integration failure.
- Turn generated JSON reports into a structured review workflow.

## Verification Commands

Run these before treating the repository as the current public sample surface:

```bash
npm run check
npm test
npm run guard:publishable
git diff --check
```

For a full local release audit, run:

```bash
npm run audit:local:stable
```

## Publication Boundary

These samples are public review artifacts. They do not include private customer inventories, passwords, OTPs, API keys, payment information, tax or KYC data, private account exports, cookies, local storage, or copied OID-base page bodies.
