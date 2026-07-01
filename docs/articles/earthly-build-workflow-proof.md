# Earthly Build Workflow Proof

This packet supports a proposed developer tutorial:

**Build a Reproducible Documentation QA Pipeline for a Static Developer Site**

## Article Fit

The proposed article is an engineering workflow tutorial, not a generic documentation advice post. It shows developers how to validate source data, generate static pages, check public proof links, and record a small release-evidence report before publishing.

The workflow can be adapted to documentation sites, internal knowledge bases, developer portals, changelog dashboards, and other static review surfaces.

## Reader Promise

By the end of the article, the reader should be able to:

1. Define publishable checks for source data, generated pages, links, and smoke tests.
2. Add Node.js validation scripts for source data and generated artifacts.
3. Build a static site from checked inputs.
4. Run public-page smoke checks after deployment.
5. Produce a short evidence report for reviewers.
6. Keep secrets, tokens, private customer data, and production logs out of the public pipeline.

## Why This Fits Earthly

- It is centered on reproducible builds, CI discipline, and practical automation.
- It gives readers a concrete workflow rather than a list of documentation opinions.
- It connects build reliability with developer-facing technical communication.
- It can be extended into a container-friendly or CI-friendly build step.

## Proposed Outline

1. Why static docs still need a reproducible QA pipeline.
2. Define publishable checks: data shape, generated pages, links, and smoke tests.
3. Add Node.js validation scripts for source data and generated artifacts.
4. Build a static site from checked inputs.
5. Add public-page smoke checks after deploy.
6. Produce a short evidence report for reviewers.
7. Keep secrets, private customer data, tokens, and production logs out of the pipeline.
8. Extend the workflow into a container-friendly or CI-friendly build step.

## Public Samples

- Earthly proof page: <https://ooyxloo.github.io/oid-knowledge-lab/earthly-build-workflow-proof.html>
- Editor response kit: <https://ooyxloo.github.io/oid-knowledge-lab/editor-response-kit.html>
- Writing samples: <https://ooyxloo.github.io/oid-knowledge-lab/writing-samples.html>
- CI storage check case study: <https://ooyxloo.github.io/oid-knowledge-lab/ci-storage-check-case-study.html>
- Premade plugin config case study: <https://ooyxloo.github.io/oid-knowledge-lab/premade-plugin-config-case-study.html>

## Publication Boundary

The public proof materials are review aids. A final Earthly article should be freshly written for Earthly's audience and should not include private customer data, credentials, cookies, tokens, payment details, account screenshots, raw production logs, or copied third-party article bodies.
