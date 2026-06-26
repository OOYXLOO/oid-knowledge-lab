# Article Samples

This directory contains long-form technical writing samples based on the OID Knowledge Lab project.

The samples are written for readers who want practical engineering patterns: safe data boundaries, repeatable Node.js scripts, static review dashboards, manifest-driven releases, and handoff artifacts that can be verified without sharing private inputs.

## Samples

### Portfolio card

Path: `docs/articles/portfolio-card.md`

Best for readers interested in:

- a short entry point to the writing sample set,
- the author's strongest technical documentation fit,
- the best first sample to review,
- domain-specific sample selection,
- and public proof links.

Direct raw link:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/portfolio-card.md
```

### Editor brief

Path: `docs/articles/editor-brief.md`

Best for readers interested in:

- a quick overview of the article sample set,
- topic fit,
- audience fit,
- reader outcomes,
- public proof links,
- and verification boundaries.

Direct raw link:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/editor-brief.md
```

### Build a Static Evidence Dashboard with Node.js and GitHub Pages

Path: `docs/articles/static-evidence-dashboard-github-pages.md`

Best for readers interested in:

- Node.js reporting scripts,
- generated JSON and Markdown artifacts,
- static dashboard publishing,
- GitHub Pages review links,
- dataset manifests,
- and publish guards that prevent unsafe release artifacts.

Direct raw link:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/static-evidence-dashboard-github-pages.md
```

### Designing a Client-Safe OID Inventory Assessment

Path: `docs/articles/client-safe-oid-inventory-assessment.md`

Best for readers interested in:

- object identifier inventory cleanup,
- sanitized client input design,
- IANA PEN and sitemap-level public evidence,
- remediation boards,
- safe handoff notes,
- and source-boundary decisions for third-party knowledge bases.

Direct raw link:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/client-safe-oid-inventory-assessment.md
```

## Verification

The article samples are part of the same repository release surface as the analysis workspace. Before publishing repository changes, run:

```bash
npm run check
npm test
npm run guard:publishable
git diff --check
```

The publish guard checks that local-only crawl output, raw page-body mirrors, contact-level exports, and other unsafe artifacts are not tracked in Git.

## Boundaries

These samples describe derived reports, public pointers, and review workflows. They do not publish private customer inventories, production secrets, payment data, full third-party page-body mirrors, or local-only crawl outputs.
