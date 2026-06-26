# Submission Landing: Developer Documentation and Technical Writing Samples

This page is a compact review path for editor applications, paid technical writing programs, DevRel teams, and documentation teams.

## Short Fit

I write implementation-aware developer documentation: practical tutorials, workflow guides, debugging handoffs, and release-readiness notes that are backed by working code and verifiable public artifacts.

Best-fit topics:

- Node.js data workflows,
- static dashboards and GitHub Pages publishing,
- dataset manifests and publish guards,
- observability-oriented production debugging handoffs,
- API, webhook, queue, and SaaS integration triage,
- public issue triage and acceptance checks,
- client-safe data intake and evidence boundaries.

## Best First Links

Start with the pitch pack when evaluating topic fit:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/editor-pitch-pack.md
```

Use the portfolio card for a short overview:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/portfolio-card.md
```

Use the public dashboard for proof that the samples are backed by a working repository:

```text
https://ooyxloo.github.io/oid-knowledge-lab/
```

Use the client one-pager when evaluating service-style documentation, data cleanup, or audit-readiness fit:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/oid-assessment-client-one-pager.md
```

## Strongest Assignment Angles

### 1. Static Evidence Dashboard Tutorial

Working title:

```text
Build a static evidence dashboard with Node.js, GitHub Pages, and a release guard
```

Why it fits:

This is a hands-on developer tutorial with a complete path from generated reports to a public dashboard, manifest-style proof links, source boundaries, and a publish guard.

Sample:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/static-evidence-dashboard-github-pages.md
```

### 2. Observability Handoff Article

Working title:

```text
What to capture before debugging a production integration failure
```

Why it fits:

This topic connects logs, metrics, traces, correlation IDs, recent changes, ownership, and acceptance checks into a safe handoff that helps developers investigate production issues without exposing secrets.

Sample:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/production-integration-debug-handoff.md
```

Reusable template:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/production-integration-handoff-template.md
```

### 3. Public Issue Triage Checklist

Working title:

```text
A practical triage checklist before implementing public GitHub bounty issues
```

Why it fits:

This is a decision guide for maintainers and contributors who need to evaluate reward signals, queue saturation, acceptance criteria, assignment risk, and account/privacy gates before investing engineering time.

Sample:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/public-github-bounty-triage-checklist.md
```

### 4. Client-Safe OID Inventory Assessment

Working title:

```text
Turn a messy OID inventory into a safe review package
```

Why it fits:

This angle explains how to scope a client-safe inventory review, separate public evidence from private inputs, produce remediation actions, and define acceptance checks before asking for sensitive access.

Sample:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/oid-assessment-client-one-pager.md
```

## Proof Surface

Repository:

```text
https://github.com/OOYXLOO/oid-knowledge-lab
```

Dashboard:

```text
https://ooyxloo.github.io/oid-knowledge-lab/
```

Article index:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/README.md
```

## Verification

The repository uses these checks before publishing:

```bash
npm run check
npm test
npm run build:site
npm run guard:publishable
git diff --check
```

The publish guard prevents local-only crawl output, raw page-body mirrors, contact-level exports, and other unsafe artifacts from being tracked.

## Boundaries

These samples describe original engineering workflows, public proof links, and derived reports. They do not publish private customer inventories, credentials, payment data, account exports, full third-party page-body mirrors, or unpublished client information.
