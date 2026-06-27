# Runnable Airbyte proof pack

This proof pack is a compact reviewer path for an Airbyte-oriented article proposal. It shows that the proposed tutorial is backed by a runnable implementation, reproducible artifacts, and a publication boundary that keeps private data out of the public package.

## What the tutorial proves

The proposed article is about a safe data-integration pattern:

1. Model a public registry source.
2. Model a sanitized local inventory source.
3. Normalize both inputs into stable review rows.
4. Classify local rows against public evidence.
5. Export JSON, CSV, Markdown, and a static dashboard.
6. Verify that the public package excludes unsafe source material.

For Airbyte readers, the public registry source maps to Connector Builder or a Low-code CDK source design. The sanitized local inventory maps to a separate File source. The generated review rows map to a local JSON destination, a warehouse table, or a downstream dashboard.

## Reproducible commands

Run from the repository root:

```bash
npm run check
npm test
npm run audit:assets
npm run audit:certificate-policy
npm run remediation:sample
npm run coverage:oid
npm run delivery:sample
npm run brief:sample
npm run build:site
npm run audit:dataset
npm run guard:publishable
```

The single-command local audit is:

```bash
npm run audit:local
```

## Input boundary

The public sample uses approved fixtures and public metadata pointers:

- `examples/sample-assets.csv`
- `examples/certificate-policy-assets.csv`
- IANA PEN public records imported into derived reports
- OID-base sitemap metadata without copying page bodies into the public package

The public sample does not include credentials, account exports, private customer inventories, raw third-party page-body mirrors, payment data, or contact-level exports.

## Output artifacts

Key generated artifacts:

- `reports/asset-audit.json`
- `reports/asset-audit.md`
- `reports/asset-audit.csv`
- `reports/remediation-board.md`
- `reports/coverage-report.md`
- `reports/dataset-manifest.json`
- `reports/sample-delivery-pack.md`
- `public/index.html`
- `public/sample-assessment.html`
- `public/airbyte-reviewer-hub.html`

These artifacts demonstrate source boundaries, row normalization, classification results, remediation output, dashboard publication, and publish-safety checks.

## Airbyte adaptation map

| Tutorial layer | Airbyte reader framing | Local proof |
| --- | --- | --- |
| Public registry source | Connector Builder or Low-code CDK source | Sitemap and IANA PEN derived inputs |
| Sanitized local inventory | File source | `examples/sample-assets.csv` |
| Normalization | Transform step before destination | `src/assetAudit.js` and report generation |
| Destination rows | Local JSON destination or warehouse table | `reports/asset-audit.json` and CSV export |
| Review dashboard | Downstream dashboard or static review surface | `public/index.html` and `public/sample-assessment.html` |
| Safety checks | Publication boundary validation | `reports/dataset-manifest.json` and `npm run guard:publishable` |

## Reviewer shortcut

Open the public hub first:

```text
https://oid-knowledge-lab.vercel.app/airbyte-reviewer-hub.html
```

Then inspect the runnable source and generated artifacts:

```text
https://github.com/OOYXLOO/oid-knowledge-lab
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/dataset-manifest.json
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/sample-delivery-pack.md
```

## Publication boundary

This proof pack supports an article proposal. It is not a final publication draft. If an editor accepts the topic, the article should be freshly adapted to Airbyte's current editorial request, product terminology, source and destination examples, and content-board expectations.
