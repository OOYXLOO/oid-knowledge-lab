# Build a Static Evidence Dashboard with Node.js and GitHub Pages

Static dashboards are a good fit for review artifacts: they are easy to host, easy to audit, and do not require a live backend for every reader. They work especially well when the goal is to publish derived findings, source links, and release evidence without exposing private input data.

This article walks through a practical pattern for turning generated JSON reports into a static dashboard. The example uses Node.js, a small manifest, and GitHub Pages, but the same structure works for many review packages: asset inventories, migration checks, release readiness reports, compliance handoffs, and data-quality summaries.

## What the Dashboard Should Prove

Before writing code, define what the static page needs to prove. A useful evidence dashboard usually answers five questions:

- What sources were used?
- When were the reports generated?
- Which artifacts are public and safe to share?
- How can a reviewer reproduce or inspect the results?
- Which files are intentionally excluded?

This turns the dashboard from a decorative page into a review surface. The page does not have to be complex. It only needs stable links, readable summaries, and a repeatable build path.

## Repository Shape

A small project can use this structure:

```text
project/
  data/
    source/
  reports/
    dataset-manifest.json
    summary.json
    summary.md
  public/
    index.html
    app.js
    styles.css
  src/
    site.js
    manifest.js
  package.json
```

The important separation is between local input data, generated reports, and public assets. In a client-facing project, local input may include sanitized samples or private exports. Public assets should contain only derived outputs, source pointers, hashes, counts, and review notes.

## Step 1: Generate a Manifest

A manifest records the artifacts that make up the publishable package. A minimal manifest can include:

- artifact path,
- byte size,
- hash,
- source category,
- generated timestamp,
- and publication boundary.

For example:

```json
{
  "generated_at": "2026-06-26T00:00:00.000Z",
  "publishable": true,
  "artifacts": [
    {
      "path": "reports/summary.md",
      "bytes": 4218,
      "sha256": "example-hash",
      "boundary": "derived report"
    },
    {
      "path": "public/index.html",
      "bytes": 9234,
      "sha256": "example-hash",
      "boundary": "static dashboard"
    }
  ],
  "excluded": [
    "raw private exports",
    "tokens or credentials",
    "third-party page bodies"
  ]
}
```

The manifest should be generated, not hand-edited. That keeps the dashboard tied to the current files instead of stale documentation.

## Step 2: Build the Static Page

The static page can be generated from JSON files. The page should show the current summary, link to the most important reports, and explain what is excluded.

In Node.js, the build script can read reports and write `public/index.html`:

```js
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("reports/dataset-manifest.json", "utf8"));
const summary = JSON.parse(fs.readFileSync("reports/summary.json", "utf8"));

const rows = manifest.artifacts
  .map((artifact) => `
    <tr>
      <td>${artifact.path}</td>
      <td>${artifact.boundary}</td>
      <td>${artifact.bytes}</td>
    </tr>
  `)
  .join("");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Evidence Dashboard</title>
  </head>
  <body>
    <main>
      <h1>Evidence Dashboard</h1>
      <p>Generated at ${manifest.generated_at}</p>
      <p>${summary.description}</p>

      <h2>Publishable Artifacts</h2>
      <table>
        <thead>
          <tr><th>Path</th><th>Boundary</th><th>Bytes</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <h2>Excluded Inputs</h2>
      <ul>
        ${manifest.excluded.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </main>
  </body>
</html>`;

fs.writeFileSync("public/index.html", html);
```

In a production-quality script, escape HTML values before writing them into markup. The example is intentionally small to show the data flow.

## Step 3: Add a Publish Guard

A static dashboard is only useful if reviewers can trust that unsafe files were not accidentally published. Add a guard command before pushing:

```bash
npm run guard:publishable
```

The guard should scan tracked files and fail on patterns that do not belong in public release artifacts:

- raw private exports,
- local crawl outputs,
- credentials or tokens,
- full third-party mirrors,
- customer records,
- and generated debug files.

The guard does not replace human review, but it catches common mistakes before they become public.

## Step 4: Add Verification Commands

The dashboard needs a short verification path. A useful local sequence is:

```bash
npm run check
npm test
npm run build:site
npm run guard:publishable
git diff --check
```

Each command proves a different part of the release:

- `check` catches syntax errors,
- `test` verifies project behavior,
- `build:site` regenerates the static dashboard,
- `guard:publishable` checks publication boundaries,
- `git diff --check` catches whitespace issues before commit.

If the page is deployed with GitHub Actions, keep the workflow boring. Build the static site, upload the `public/` directory, and deploy that exact artifact. Avoid hidden runtime steps that make the public page differ from the checked local output.

## Step 5: Publish with GitHub Pages

For a Pages-backed dashboard, keep the public entry simple:

```text
https://OWNER.github.io/REPOSITORY/
```

If the page is a versioned review artifact, add a cache-busting query string when sharing a fresh deployment:

```text
https://OWNER.github.io/REPOSITORY/?v=COMMIT
```

The query string is not a security boundary. It just helps reviewers avoid stale browser caches after a recent deployment.

## What to Include on the Page

A good evidence dashboard usually includes:

- headline summary,
- report counts,
- source links,
- generated timestamp,
- artifact links,
- manifest link,
- acceptance checks,
- and excluded-data notes.

The excluded-data section matters. It tells a reviewer what the dashboard is not showing: private inputs, credentials, third-party page bodies, payment data, or anything that belongs in a secure local workflow.

## Example from OID Knowledge Lab

OID Knowledge Lab uses this pattern for a publishable OID analysis package. The public dashboard is generated from source-policy reports, sitemap-level entries, IANA PEN summaries, asset-audit outputs, and client handoff packs.

The repository keeps local crawl outputs and page-body samples out of Git unless publication is explicitly authorized. The public artifacts contain derived findings, source pointers, hashes, counts, and client-safe handoff notes.

The core commands are:

```bash
npm run refresh:publishable
npm run build:site
npm run guard:publishable
```

That pattern keeps the dashboard reproducible without turning it into a raw data dump.

## Common Mistakes

Avoid these shortcuts:

- publishing a pretty page without a manifest,
- linking to local-only paths,
- copying private source records into public JavaScript,
- using a dashboard as the only documentation,
- skipping the publish guard,
- and letting the public page drift away from generated reports.

The dashboard is the entry point, not the whole review package. A reviewer should be able to click from the page into the reports, inspect the manifest, and understand the data boundary.

## Conclusion

A static evidence dashboard is valuable when it makes a review package easier to trust. The pattern is simple:

1. Generate reports.
2. Generate a manifest.
3. Build a static page from those artifacts.
4. Run a publish guard.
5. Deploy the exact `public/` output.

This creates a small, repeatable release surface for technical reviews without requiring a live service or exposing private data.
