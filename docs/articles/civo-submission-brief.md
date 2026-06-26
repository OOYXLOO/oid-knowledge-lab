# Civo submission brief: static evidence dashboard tutorial

This brief is a submission-ready note for a Civo tutorial pitch. It is not a final publication draft. It summarizes the tutorial promise, implementation path, reader outcome, and proof links so an editor can decide whether to request a full article.

## Working title

Build a static evidence dashboard with Node.js, GitHub Pages, and a release guard

## Reader

The tutorial is for cloud-native developers, DevOps engineers, platform teams, and documentation engineers who need a public review surface for generated technical evidence without operating a live backend.

Good-fit examples:

- migration readiness reports,
- data-quality audits,
- release check summaries,
- compliance handoff notes,
- static documentation packs,
- and client-safe technical review artifacts.

## Tutorial promise

Readers will learn how to:

1. Keep local inputs separate from publishable outputs.
2. Generate JSON and Markdown reports.
3. Create a dataset manifest with hashes and source boundaries.
4. Build a static dashboard with Node.js.
5. Publish the dashboard through GitHub Pages.
6. Add a release guard that blocks private inputs, raw mirrors, credentials, and unsafe artifacts.
7. Verify the workflow locally and in CI.

## Why this fits Civo readers

Civo readers often want practical cloud-native tutorials that can be followed without heavyweight infrastructure. This article keeps the implementation small and deployable:

- no database required,
- no long-running server required,
- static hosting is enough for the review surface,
- Node.js scripts generate the artifacts,
- GitHub Pages provides the public endpoint,
- and verification commands make the release repeatable.

The tutorial also fits teams that need a low-cost way to publish review artifacts before a migration, audit, or platform cleanup.

## Proposed outline

1. Why generated evidence needs a review surface.
2. Project structure: `reports/`, `public/`, `src/`, and excluded local inputs.
3. Generate a manifest with byte counts, hashes, and publication boundaries.
4. Build a static dashboard from JSON and Markdown reports.
5. Add links to source evidence and excluded-data notes.
6. Deploy the `public/` artifact with GitHub Pages.
7. Add a release guard before publishing.
8. Verify with syntax checks, tests, site build, guard, and diff checks.
9. Common mistakes: stale pages, hidden private files, copied raw data, and unclear boundaries.
10. Reusable checklist.

## Public proof links

Concise proposal:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/publication-proposal-static-evidence-dashboard.md
```

Full tutorial draft:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/civo-static-evidence-dashboard-full-draft.md
```

Long-form tutorial sample:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/static-evidence-dashboard-github-pages.md
```

Working public dashboard:

```text
https://ooyxloo.github.io/oid-knowledge-lab/
```

Writing sample page:

```text
https://ooyxloo.github.io/oid-knowledge-lab/writing-samples.html
```

Repository:

```text
https://github.com/OOYXLOO/oid-knowledge-lab
```

## Implementation depth

The full article can include:

- a minimal Node.js build script,
- a manifest JSON example,
- an HTML generation example,
- a GitHub Pages deployment shape,
- a publish guard checklist,
- and a verification command sequence.

Suggested commands:

```bash
npm run check
npm test
npm run build:site
npm run guard:publishable
git diff --check
```

## Boundary

The tutorial does not ask readers to publish private customer data, credentials, account exports, API tokens, payment data, raw third-party page-body mirrors, or local-only crawl outputs. It focuses on safe derived artifacts: counts, hashes, source links, generated summaries, and review notes.

## Editor decision note

This is strongest as a practical tutorial with a small working project. The final draft should be written for Civo's audience with clear commands, a deployable static artifact, and explicit safety checks before publication.
