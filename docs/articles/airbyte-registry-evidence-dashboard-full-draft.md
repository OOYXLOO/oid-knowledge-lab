# Build a Safe Registry Evidence Dashboard from Public and Local Data

Data pipelines are often described as a path from source to destination. In real review work, the path is wider than that. A useful pipeline also needs to preserve source context, separate public evidence from private inventory, produce a reviewable handoff, and prove that unsafe inputs were not published by mistake.

This tutorial walks through a small registry evidence dashboard pattern. The example uses public object identifier registry data and a sanitized local inventory, but the same structure applies to many data-quality workflows: package registries, partner catalogs, asset inventories, release readiness reports, and compliance review queues.

The goal is not to mirror a third-party knowledge base or publish private client exports. The goal is to build a repeatable pipeline that turns safe sources into derived evidence, then publishes only the artifacts that a reviewer should see.

## What We Are Building

The dashboard answers four practical questions:

1. Which local records have public evidence?
2. Which local records are malformed or unresolved?
3. What should a reviewer do next?
4. Which files are safe to publish?

The workflow has two sources:

- a public registry index,
- and a sanitized local CSV.

It then produces four destination artifacts:

- a JSON assessment,
- a Markdown handoff,
- a CSV remediation queue,
- and a static dashboard.

The release is protected by a manifest and a publish guard. That last part matters. A dashboard that looks good but leaks private rows is not a successful data product.

## Source Boundary

Start by defining the source boundary before writing code.

The public source can include registry metadata, source URLs, last-modified dates, stable identifiers, and public organization names. The local source should be sanitized before it enters the project. In this example, the local CSV contains only a safe asset label and an OID:

```csv
asset,oid
router-core,1.3.6.1.4.1.9.9.41
sha256-policy,2.16.840.1.101.3.4.2.1
unknown-enterprise,1.3.6.1.4.1.999999.1
bad-row,not-an-oid
```

Do not include credentials, account exports, raw logs, contact-level records, private customer names, or copied third-party page bodies. Those inputs can exist in a secured client workflow, but they do not belong in the public dashboard.

## Pipeline Shape

An Airbyte-style mental model helps keep the workflow understandable:

| Stage | Responsibility |
| --- | --- |
| Source A | Load public registry metadata. |
| Source B | Load sanitized local inventory rows. |
| Normalize | Convert identifiers into stable comparison fields. |
| Transform | Classify each local row against public evidence. |
| Destination | Write JSON, Markdown, CSV, and static page artifacts. |
| Validate | Run tests, generate a manifest, and enforce publish boundaries. |

The implementation does not need a live warehouse to be useful. A local Node.js pipeline plus a static dashboard is enough for an editor, reviewer, or client stakeholder to inspect the pattern.

## Airbyte adaptation path

The local tutorial is intentionally runnable without cloud credentials, but the same workflow maps cleanly onto an Airbyte implementation:

| Local tutorial part | Airbyte adaptation |
| --- | --- |
| Public registry sitemap or API export | Build a small HTTP source with Connector Builder or the Low-code CDK. |
| Sanitized local inventory CSV | Load a safe file through a File source or an internal approved source. |
| Node.js normalization script | Move repeatable transforms into a destination-side model, dbt step, or post-sync job. |
| JSON and Markdown review outputs | Write machine-readable rows to a Local JSON destination or a warehouse destination, then render review artifacts. |
| Publish guard | Keep a CI guard before public dashboards, docs, or static review pages are released. |

This framing keeps the article useful for Airbyte readers without requiring the tutorial to handle private credentials. The public registry source can become a Connector Builder prototype first, while the sanitized inventory remains a separate source so private operational rows do not get mixed into public proof pages by accident.

Useful official reference points for the final article:

- Connector Builder for creating API-backed sources.
- Low-code CDK for declarative source connector development.
- File source for loading a local or hosted CSV input when the inventory has already been sanitized.
- Local JSON destination for a small reproducible destination during article review.

## Normalize Registry and Inventory Rows

Treat normalization as a contract. The public registry and the local inventory should both produce stable records:

```js
function normalizeOid(value) {
  return String(value || "").trim();
}

function isValidOid(value) {
  return /^(0|1|2)(\\.\\d+)+$/.test(normalizeOid(value));
}

function privateEnterpriseNumber(oid) {
  const prefix = "1.3.6.1.4.1.";
  if (!oid.startsWith(prefix)) return null;
  const next = oid.slice(prefix.length).split(".")[0];
  return /^\\d+$/.test(next) ? Number(next) : null;
}
```

The local CSV parser should keep a row index, a safe label, and the normalized OID. If the input has extra columns, the public handoff should not automatically publish them. Make the output schema explicit instead of forwarding everything.

## Classify Each Row

The classifier can be simple and still useful:

```js
function classifyRow(row, publicIndexByEnterprise, directoryByOid) {
  const oid = normalizeOid(row.oid);

  if (!isValidOid(oid)) {
    return {
      ...row,
      oid,
      status: "invalid_value",
      risk: "high",
      next_action: "Correct the malformed OID value before using this row as evidence."
    };
  }

  const enterpriseNumber = privateEnterpriseNumber(oid);
  const enterprise = enterpriseNumber == null
    ? null
    : publicIndexByEnterprise.get(enterpriseNumber) || null;
  const directoryMatch = directoryByOid.get(oid) || null;

  if (directoryMatch) {
    return {
      ...row,
      oid,
      status: "directory_match",
      risk: "low",
      source_url: directoryMatch.source_url,
      next_action: "Preserve the public directory evidence with the asset record."
    };
  }

  if (enterprise) {
    return {
      ...row,
      oid,
      status: "known_private_enterprise_oid",
      risk: "low",
      enterprise: enterprise.organization,
      next_action: "Preserve the public enterprise assignment with the asset record."
    };
  }

  return {
    ...row,
    oid,
    status: enterpriseNumber == null ? "valid_oid_unmatched" : "unknown_private_enterprise_oid",
    risk: "medium",
    next_action: "Confirm whether this value is internal, deprecated, or covered by another registry."
  };
}
```

The statuses are designed for review. They tell a human what to do next, not only whether a lookup succeeded.

## Generate Review Artifacts

A useful destination package includes both machine-readable and human-readable artifacts.

The JSON output is best for repeatability:

```json
{
  "summary": {
    "total_assets": 4,
    "evidence_ready_assets": 2,
    "unresolved_assets": 2,
    "invalid_values": 1
  },
  "findings": []
}
```

The Markdown handoff is best for review:

```md
# OID Inventory Assessment Handoff

- Assets reviewed: 4
- Evidence-ready assets: 2
- Unresolved assets: 2
- Invalid values: 1

## Client Data Boundary

This handoff contains derived findings only. Raw inventories, credentials,
private account exports, contact-level registry records, and copied
third-party page bodies should not be published.
```

The CSV remediation queue is best for follow-up work:

```csv
asset,oid,status,risk,next_action
bad-row,not-an-oid,invalid_value,high,Correct the malformed OID value before using this row as evidence.
```

The static page is best for sharing. It should link to the JSON, Markdown, CSV, source policy, and manifest.

## Add a Dataset Manifest

The manifest is the release receipt. It should explain what was generated, where it came from, and what is excluded:

```json
{
  "publishable": true,
  "artifacts": [
    {
      "path": "reports/asset-audit.md",
      "boundary": "derived report"
    },
    {
      "path": "public/index.html",
      "boundary": "static dashboard"
    }
  ],
  "excluded": [
    "raw private exports",
    "credentials or tokens",
    "copied third-party page bodies",
    "contact-level registry records"
  ]
}
```

A reviewer should be able to open the manifest and understand the publication boundary without reading every script.

## Add a Publish Guard

The publish guard is a small command that fails the release if unsafe material appears in tracked files. The exact checks depend on the project, but common guardrails include:

- local crawl output is not tracked,
- credentials and tokens are not tracked,
- copied page-body mirrors are not tracked,
- private inventories are not tracked,
- local machine paths are not present in public documents,
- and generated debug files are not present.

The guard should run before every public release:

```bash
npm run check
npm test
npm run build:site
npm run guard:publishable
git diff --check
```

Each command proves a different part of the workflow. Syntax checks and tests prove the code still runs. The site build proves the static destination can be regenerated. The publish guard proves the public boundary was checked. The Git diff check catches formatting issues before review.

## Publish the Dashboard

GitHub Pages is enough for a review surface. The page should include:

- a short summary,
- source counts,
- artifact links,
- a search or lookup panel when useful,
- an explanation of excluded data,
- and verification commands.

For OID Knowledge Lab, the public dashboard is:

```text
https://ooyxloo.github.io/oid-knowledge-lab/
```

The sample assessment handoff is:

```text
https://ooyxloo.github.io/oid-knowledge-lab/sample-assessment.html
```

These pages are not a raw mirror. They are derived review artifacts built from public indexes, safe examples, manifests, and generated reports.

## How This Maps to a Real Data Integration Project

In a production environment, the same pattern can be expanded:

- Airbyte can move the public registry index into a destination table.
- A separate internal source can provide sanitized inventory rows.
- A transformation job can produce classification statuses.
- A dashboard destination can expose review-ready outputs.
- A release guard can prevent sensitive source fields from reaching public channels.

The important design choice is to keep source boundaries visible. Public registry evidence and private operational inventory are not the same kind of data. The pipeline should preserve that distinction all the way to the destination.

## Common Mistakes

Avoid these shortcuts:

- publishing a dashboard without a manifest,
- forwarding every input field into the public output,
- treating malformed identifiers as harmless,
- copying page bodies from third-party sites into the repository,
- mixing private client records with public proof links,
- and skipping a release guard because the page "looks fine".

Evidence dashboards fail quietly when the boundary is unclear. Make the boundary explicit in the schema, the generated artifacts, and the release checks.

## Conclusion

A safe registry evidence dashboard is a small but valuable data product. It joins public evidence with sanitized local inventory, classifies rows into reviewable statuses, generates handoff artifacts, and publishes only the parts that are safe to share.

The pattern is intentionally modest:

1. define the source boundary,
2. normalize identifiers,
3. classify rows,
4. generate JSON, Markdown, CSV, and static HTML,
5. write a manifest,
6. run a publish guard,
7. and deploy the exact public output.

That gives data engineers and reviewers something better than a spreadsheet screenshot: a reproducible evidence package with a clear publication boundary.
