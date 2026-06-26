# Build a Static Evidence Dashboard with Node.js, GitHub Pages, and a Release Guard

Static dashboards are a useful middle ground between a private report and a live application. They are easy to host, easy to review, and easy to reproduce. For generated technical evidence, that makes them a good fit for migration readiness reports, data-quality audits, release summaries, compliance handoffs, and client-safe review packages.

This tutorial shows how to build a static evidence dashboard with Node.js and GitHub Pages. The example uses generated JSON and Markdown reports, but the same pattern works for any workflow where you need to publish derived findings without exposing raw private inputs.

The result is a small project with:

- generated reports,
- a dataset manifest,
- a static dashboard,
- a GitHub Pages deployment surface,
- and a release guard that blocks unsafe files before publishing.

## What the Dashboard Should Prove

Before building the page, decide what the page needs to prove. A useful dashboard answers these questions:

1. What sources were used?
2. When were the artifacts generated?
3. Which outputs are safe to publish?
4. Which inputs are intentionally excluded?
5. How can a reviewer reproduce the package?

That definition keeps the dashboard from becoming only a decorative page. It becomes a review surface.

## Project Structure

Use a structure that separates local inputs, generated reports, and public assets:

```text
evidence-dashboard/
  data/
    local/
      .gitkeep
  reports/
    summary.json
    summary.md
    dataset-manifest.json
  public/
    index.html
    styles.css
    data.js
  src/
    build-site.js
    manifest.js
    publish-guard.js
  package.json
```

The important rule is simple: `public/` is the only directory intended for static hosting. Local inputs and private exports stay outside the published artifact.

## Step 1: Create a Summary Report

Start with a generated summary. In a real project, this could come from a migration checker, test run, inventory audit, or compliance script. For a minimal example, create `reports/summary.json`:

```json
{
  "generated_at": "2026-06-27T00:00:00.000Z",
  "project": "Evidence dashboard sample",
  "source_count": 3,
  "finding_count": 4,
  "high_priority_count": 1,
  "status": "review_ready",
  "notes": [
    "Derived findings only",
    "Raw private exports are excluded",
    "Public page is generated from reports"
  ]
}
```

For a production workflow, generate this file rather than editing it by hand. The dashboard should reflect current evidence, not stale prose.

## Step 2: Generate a Dataset Manifest

A manifest records what is in the release package. It should include artifact paths, byte sizes, hashes, and publication boundaries.

Here is a small `src/manifest.js`:

```js
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function artifact(root, relativePath, boundary) {
  const file = path.join(root, relativePath);
  const stat = fs.statSync(file);
  return {
    path: relativePath,
    bytes: stat.size,
    sha256: sha256(file),
    boundary
  };
}

function buildManifest(root) {
  return {
    generated_at: new Date().toISOString(),
    publishable: true,
    artifacts: [
      artifact(root, "reports/summary.json", "derived report"),
      artifact(root, "reports/summary.md", "derived report"),
      artifact(root, "public/index.html", "static dashboard")
    ],
    excluded: [
      "raw private exports",
      "credentials and tokens",
      "account-local storage",
      "payment or tax records",
      "copied third-party page bodies"
    ]
  };
}

module.exports = { buildManifest };
```

The manifest is useful because reviewers can inspect exactly what was published.

## Step 3: Build the Static Page

Now generate `public/index.html` from the summary and manifest. A simple `src/build-site.js` can do the job:

```js
const fs = require("node:fs");
const path = require("node:path");
const { buildManifest } = require("./manifest");

const root = path.join(__dirname, "..");
const summary = JSON.parse(fs.readFileSync(path.join(root, "reports/summary.json"), "utf8"));

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderPage(manifest) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(summary.project)}</title>
</head>
<body>
  <main>
    <h1>${escapeHtml(summary.project)}</h1>
    <p>Generated at ${escapeHtml(summary.generated_at)}</p>
    <dl>
      <dt>Sources</dt><dd>${summary.source_count}</dd>
      <dt>Findings</dt><dd>${summary.finding_count}</dd>
      <dt>High priority</dt><dd>${summary.high_priority_count}</dd>
      <dt>Status</dt><dd>${escapeHtml(summary.status)}</dd>
    </dl>
    <h2>Notes</h2>
    <ul>${renderList(summary.notes)}</ul>
    <h2>Publishable Artifacts</h2>
    <ul>${renderList(manifest.artifacts.map((item) => `${item.path} - ${item.boundary}`))}</ul>
    <h2>Excluded Inputs</h2>
    <ul>${renderList(manifest.excluded)}</ul>
  </main>
</body>
</html>`;
}

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(path.join(root, "reports/summary.md"), `# ${summary.project}\n\nStatus: ${summary.status}\n`, "utf8");
fs.writeFileSync(path.join(root, "public/index.html"), renderPage({ artifacts: [], excluded: [] }), "utf8");

const manifest = buildManifest(root);
fs.writeFileSync(path.join(root, "reports/dataset-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(root, "public/index.html"), renderPage(manifest), "utf8");
```

The script writes the page twice so the manifest can include the final dashboard file. For a larger project, you can split this into a report generation step and a site generation step.

## Step 4: Add a Release Guard

A release guard checks that unsafe files are not being published. This does not replace human review, but it catches common mistakes.

Create `src/publish-guard.js`:

```js
const fs = require("node:fs");
const path = require("node:path");

const blockedPatterns = [
  /password/i,
  /api[_-]?key/i,
  /secret/i,
  /private export/i,
  /account-local storage/i,
  /payment/i,
  /tax record/i
];

const publicFiles = [
  "public/index.html",
  "reports/summary.json",
  "reports/summary.md",
  "reports/dataset-manifest.json"
];

const root = path.join(__dirname, "..");
const blockers = [];

for (const relativePath of publicFiles) {
  const text = fs.readFileSync(path.join(root, relativePath), "utf8");
  for (const pattern of blockedPatterns) {
    if (pattern.test(text)) {
      blockers.push(`${relativePath} matched ${pattern}`);
    }
  }
}

if (blockers.length) {
  console.error(JSON.stringify({ ok: false, blockers }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checked_files: publicFiles.length }, null, 2));
```

In a real project, the guard should inspect tracked files, generated assets, and project-specific local-only directories. Keep the checks boring and explicit.

## Step 5: Add Package Scripts

The `package.json` scripts should make the workflow repeatable:

```json
{
  "scripts": {
    "build:site": "node src/build-site.js",
    "guard:publishable": "node src/publish-guard.js",
    "check": "node --check src/build-site.js && node --check src/manifest.js && node --check src/publish-guard.js",
    "verify": "npm run check && npm run build:site && npm run guard:publishable"
  }
}
```

Now a reviewer can run:

```bash
npm run verify
```

That one command proves the scripts parse, the site builds, and the publish boundary was checked.

## Step 6: Deploy with GitHub Pages

For a minimal GitHub Pages deployment:

1. Commit the generated `public/` directory or upload it from CI.
2. Enable GitHub Pages for the repository.
3. Set the Pages source to the branch or deployment workflow that publishes `public/`.
4. Share the final URL with reviewers.

A useful review link looks like this:

```text
https://OWNER.github.io/REPOSITORY/
```

If the page changes frequently, include a commit hash in the review note so the reviewer knows which version they saw.

## Step 7: Add CI Verification

GitHub Actions can run the same checks before deployment:

```yaml
name: Verify evidence dashboard

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run verify
```

Do not hide important generation steps inside the hosting platform. If the public page depends on generated reports, make those commands visible in CI.

## Example Proof Surface

OID Knowledge Lab uses this pattern for a public evidence dashboard:

```text
https://ooyxloo.github.io/oid-knowledge-lab/
```

The sample assessment page shows a generated review handoff:

```text
https://ooyxloo.github.io/oid-knowledge-lab/sample-assessment.html
```

The repository keeps local crawl outputs and private inputs out of the published package. Public artifacts contain derived reports, source pointers, counts, hashes, and review notes.

## Common Mistakes

Avoid these shortcuts:

- publishing a static page without a manifest,
- linking to local machine paths,
- placing private exports under `public/`,
- copying raw third-party page bodies into the repository,
- skipping the release guard,
- and letting the public page drift away from generated reports.

The dashboard is not the source of truth. It is the review surface generated from the source of truth.

## Final Checklist

Before publishing, run:

```bash
npm run check
npm run build:site
npm run guard:publishable
git diff --check
```

Then inspect the public page and confirm:

- the generated timestamp is visible,
- artifact links work,
- excluded-data notes are clear,
- no local paths or secrets are present,
- and the manifest matches the files being shared.

## Conclusion

A static evidence dashboard is valuable because it makes generated technical findings easier to review. Node.js can generate the reports, GitHub Pages can host the page, and a release guard can keep unsafe material out of the public package.

The pattern is small enough for a tutorial and practical enough for real teams: generate the evidence, publish only derived artifacts, and make the publication boundary visible.
