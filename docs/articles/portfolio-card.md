# Portfolio Card: Developer Documentation Samples

This card is a short entry point for editors, maintainers, and teams who want to evaluate the writing samples in this repository without reading every artifact first.

## Writing Positioning

I write implementation-aware developer documentation: practical tutorials, data workflow guides, release-readiness notes, and review handoffs that are backed by working code and verifiable commands.

The strongest fit is content that helps technical readers:

- build small Node.js data tools,
- publish static review dashboards,
- separate public evidence from private inputs,
- create dataset manifests and release guards,
- turn messy engineering work into clear acceptance checks,
- and explain tradeoffs without requiring access to private production systems.

## Best Starting Sample

For a general developer audience, start with:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/static-evidence-dashboard-github-pages.md
```

Why it is a good first sample:

- it is not limited to the OID domain,
- it shows a complete tutorial arc from problem to release checks,
- it includes repository structure, command examples, common mistakes, and verification,
- and it is backed by the public GitHub Pages dashboard in this repository.

## Domain-Specific Sample

For data quality, security review, registry cleanup, or infrastructure readers, use:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/client-safe-oid-inventory-assessment.md
```

Why it is useful:

- it shows how to scope a technical review before asking for sensitive access,
- it names source-boundary decisions instead of treating every public pointer as equally strong,
- and it turns a niche OID cleanup workflow into a reusable client-safe intake pattern.

For a shorter buyer-readable version of the same assessment flow, use:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/oid-assessment-client-one-pager.md
```

## Observability-Focused Sample

For backend, DevOps, observability, or support escalation readers, use:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/production-integration-debug-handoff.md
```

Why it is useful:

- it focuses on logs, metrics, traces, correlation IDs, and production integration debugging,
- it shows how to prepare a safe handoff before sharing sensitive context,
- and it includes a copyable incident-note template with acceptance checks.

For a shorter reusable template, use:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/production-integration-handoff-template.md
```

Why it is useful:

- it gives a ready-to-copy structure for API, webhook, queue, SaaS sync, and automation failures,
- it separates safe evidence from excluded production data,
- and it gives reviewers an immediate checklist for expected behavior, observed behavior, correlation handles, recent changes, ownership, and acceptance checks.

## Short Editor Brief

For a one-page overview of topic fit, reader outcomes, proof links, and boundaries:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/editor-brief.md
```

## Editor Pitch Pack

For publication-ready topic angles that map each sample to a concrete article proposal:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/editor-pitch-pack.md
```

## Submission Landing

For a single review link suitable for editor applications or paid writing forms:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/submission-landing.md
```

## Public Proof

Dashboard:

```text
https://ooyxloo.github.io/oid-knowledge-lab/
```

Repository:

```text
https://github.com/OOYXLOO/oid-knowledge-lab
```

Article index:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/README.md
```

## Verification

Before publishing repository changes, this project uses:

```bash
npm run check
npm test
npm run guard:publishable
git diff --check
```

The publish guard helps keep local-only crawl output, raw page-body mirrors, contact-level exports, and private inputs out of the public repository.

## Boundaries

The samples describe derived reports, public pointers, and review workflows. They do not publish private customer inventories, production secrets, payment data, full third-party page-body mirrors, or local-only crawl outputs.
