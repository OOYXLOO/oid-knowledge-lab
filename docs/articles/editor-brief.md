# Editor Brief: OID Knowledge Lab Article Samples

This brief summarizes the article samples in this repository for editors, maintainers, and technical reviewers who want to evaluate writing fit quickly.

## Writing Focus

The samples focus on practical engineering workflows:

- Node.js reporting scripts and generated artifacts,
- static dashboard publishing with GitHub Pages,
- dataset manifests and release evidence,
- publish guards that prevent unsafe public artifacts,
- client-safe data intake and handoff boundaries,
- and OID inventory assessment patterns using public source pointers.

The goal is to show implementation-aware writing: explain the workflow, name the tradeoffs, provide commands, and define acceptance checks.

## Sample 1: Build a Static Evidence Dashboard with Node.js and GitHub Pages

Raw article:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/static-evidence-dashboard-github-pages.md
```

Best-fit audiences:

- developer tooling teams,
- cloud platform readers,
- DevOps and CI/CD readers,
- maintainers publishing review artifacts,
- and teams that need a small static public proof surface.

Reader outcome:

The reader learns how to turn generated reports into a static dashboard, include a manifest, define excluded inputs, run a publish guard, and deploy a reviewable `public/` directory.

Why this sample is useful:

- It is not tied to a niche OID domain.
- It demonstrates a complete technical article shape: problem, repository layout, code sketch, release checks, mistakes to avoid, and conclusion.
- It is backed by a working repository and public Pages dashboard.

## Sample 2: Designing a Client-Safe OID Inventory Assessment

Raw article:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/client-safe-oid-inventory-assessment.md
```

Best-fit audiences:

- data-quality readers,
- security and compliance teams,
- infrastructure maintainers,
- networking and PKI practitioners,
- and teams cleaning up legacy technical registries.

Reader outcome:

The reader learns how to request sanitized OID inventory input, separate public evidence from private context, use IANA PEN and sitemap-level pointers, generate a remediation board, and define safe handoff boundaries.

Why this sample is useful:

- It demonstrates domain-specific explanation without requiring private data.
- It explains source boundaries and evidence strength instead of treating public pointers as full authority.
- It shows how a technical review can be scoped before asking for production access.

## Public Proof Links

Portfolio card:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/portfolio-card.md
```

Dashboard:

```text
https://ooyxloo.github.io/oid-knowledge-lab/
```

Article index:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/README.md
```

Repository:

```text
https://github.com/OOYXLOO/oid-knowledge-lab
```

## Verification Path

The repository exposes the same verification path used before publishing:

```bash
npm run check
npm test
npm run guard:publishable
git diff --check
```

The publish guard checks for unsafe public artifacts such as local-only crawl output, raw page-body mirrors, and contact-level exports.

## Boundaries

The samples do not publish private customer inventories, production secrets, payment data, full third-party page-body mirrors, or local-only crawl outputs. They describe derived reports, public pointers, and reproducible review workflows.
