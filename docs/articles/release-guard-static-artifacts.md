# Add a Release Guard Before Publishing Static Evidence Artifacts

Static sites are easy to publish and easy to get wrong. A build can pass while the generated files are stale, a reviewer link points to yesterday's artifact, or a public page accidentally omits the one file a teammate needs to verify the release. The risk is higher when the site is not a hand-written marketing page but a generated evidence packet: documentation previews, customer-safe reports, benchmark summaries, compliance checklists, or review dashboards.

This article shows a small release-guard pattern for a Node.js static site. The goal is not to replace a CI/CD system. The goal is to add a final contract check between "the build command exited successfully" and "the public artifact is safe to share."

The examples use plain Node.js so the idea can travel across GitHub Pages, Vercel, Netlify, object storage, and internal static hosting. The same pattern also works if your actual build is driven by a framework such as Astro, Next.js, Docusaurus, Vite, or a documentation generator.

## The Problem: A Build Is Not A Release Contract

Most static deployments start with a command like this:

```bash
npm run build
```

That command can prove that the generator did not crash. It does not necessarily prove that the right files were generated, that important links exist, that the output matches the current source, or that the release is reviewable by someone outside the build machine.

For generated evidence artifacts, the missing checks are often more important than the build itself. A reviewer usually needs to know:

- Which source inputs were used?
- Which generated outputs should exist?
- Which public URLs should be opened first?
- Are there private inputs, credentials, account exports, or raw customer files in the output?
- Can a second person reproduce the generated packet?
- Did the public deployment actually serve the new output?

Those questions are release-contract questions. They deserve a small script, not a checklist that only lives in someone's memory.

## Define The Release Contract

Start by writing down the smallest contract that must be true before publishing. For a generated static review packet, the contract might be:

- The repository working tree is clean.
- The generated manifest exists.
- Every required public file exists in `public/`.
- Every required source document exists in `docs/`.
- The manifest timestamp is present.
- No generated file contains banned strings such as private tokens, cookie exports, or payment details.
- The public deployment returns HTTP 200 for the key review URLs.

That contract is intentionally boring. Boring is useful here. A release guard should fail on obvious problems before the team spends time debugging a reviewer complaint or a stale public link.

Create a config file for the public artifacts:

```json
{
  "requiredFiles": [
    "public/index.html",
    "public/writing-samples.html",
    "public/reviewer-readiness-one-link.html",
    "reports/dataset-manifest.json",
    "docs/articles/README.md"
  ],
  "publicUrls": [
    "https://example.com/",
    "https://example.com/writing-samples.html",
    "https://example.com/reviewer-readiness-one-link.html"
  ],
  "bannedText": [
    "BEGIN PRIVATE KEY",
    "xoxb-",
    "ghp_",
    "cookie:",
    "set-cookie:",
    "card number"
  ]
}
```

Keep the contract small at first. You can add project-specific checks later, but the first version should be easy enough that developers are willing to run it locally.

## Check Required Files

The first guard is a file-existence check. It catches broken generators, renamed outputs, missing reports, and accidental deletes.

```js
import fs from "node:fs";

function requireFile(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Missing required release file: ${path}`);
  }

  const stat = fs.statSync(path);
  if (!stat.isFile()) {
    throw new Error(`Expected a file, found something else: ${path}`);
  }

  if (stat.size === 0) {
    throw new Error(`Required release file is empty: ${path}`);
  }
}

for (const file of config.requiredFiles) {
  requireFile(file);
}
```

This is a humble check, but it pays for itself quickly. A broken static site is often not broken everywhere. The home page may still exist while a reviewer page, JSON manifest, or source appendix is missing.

## Check The Working Tree

Generated artifacts should not be published from an unknown local state. If the build created or changed files, the release should either commit them, intentionally ignore them, or fail before deployment.

```js
import { execFileSync } from "node:child_process";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const status = git(["status", "--short"]);

if (status) {
  throw new Error(
    `Release guard failed: working tree is not clean.\n${status}`
  );
}
```

This guard is especially useful for generated documentation. If the source changed but the generated page did not, or the generated page changed but was never committed, a clean-tree check catches that ambiguity before the public release.

Some teams prefer to run the guard before committing generated files. In that case, invert the check: build first, then fail if the generator produced unexpected changes. The important part is to choose one rule and make CI enforce it consistently.

## Check A Manifest

A manifest gives reviewers and future maintainers one place to see what the release contains. It can be as simple as this:

```json
{
  "generatedAt": "2026-06-29T00:00:00.000Z",
  "source": {
    "report": "reports/iana-pen-summary.json",
    "index": "reports/iana-pen-public-index.json"
  },
  "outputs": [
    "public/index.html",
    "public/writing-samples.html",
    "public/search-index.js"
  ],
  "boundary": "No credentials, account exports, private customer data, or payment data."
}
```

The release guard can validate the shape without understanding the whole project:

```js
const manifest = JSON.parse(fs.readFileSync("reports/dataset-manifest.json", "utf8"));

if (!manifest.generatedAt) {
  throw new Error("Manifest is missing generatedAt");
}

if (!Array.isArray(manifest.outputs) || manifest.outputs.length === 0) {
  throw new Error("Manifest must list generated outputs");
}

for (const output of manifest.outputs) {
  requireFile(output);
}
```

This turns "I think the site was generated" into "the release names its generated outputs, and they exist."

## Scan For Banned Text

A release guard should not pretend to be a full secret scanner, but it can block obvious unsafe strings. That is useful for public static sites because the output is often easy to crawl, cache, and copy after deployment.

```js
function scanFile(path, bannedText) {
  const text = fs.readFileSync(path, "utf8");

  for (const needle of bannedText) {
    if (text.toLowerCase().includes(needle.toLowerCase())) {
      throw new Error(`Banned text pattern found in ${path}: ${needle}`);
    }
  }
}

for (const file of config.requiredFiles) {
  scanFile(file, config.bannedText);
}
```

Use this as a final tripwire, not as the only privacy boundary. The better control is still upstream: never copy private exports, credentials, private support tickets, payment details, or customer-only source data into the generated content.

## Add A Public Smoke Check

The local release guard proves the artifact exists before deployment. A public smoke check proves the deployed site serves the expected review path.

```js
async function requirePublicUrl(url) {
  const response = await fetch(url, { method: "GET", redirect: "follow" });

  if (!response.ok) {
    throw new Error(`Public URL failed: ${response.status} ${url}`);
  }

  const text = await response.text();

  if (!text.includes("<html") && !text.includes("# ")) {
    throw new Error(`Public URL returned unexpected content: ${url}`);
  }
}

for (const url of config.publicUrls) {
  await requirePublicUrl(url);
}
```

Run this after the hosting provider reports a successful deployment. It catches bad routing, stale aliases, missing static assets, and pages that only work locally.

If the public site has API endpoints, check those separately. A static page returning HTTP 200 and an API endpoint returning the expected JSON are different release claims.

## Wire It Into CI

The guard should run in the same place developers already look for deployment confidence. In CircleCI, keep the release guard in its own job after the build. That makes the failure easy to scan: if `build-static-site` fails, the generator is broken; if `guard-generated-artifacts` fails, the generated release contract is incomplete.

```yaml
version: 2.1

executors:
  node-executor:
    docker:
      - image: cimg/node:22.11

jobs:
  build-static-site:
    executor: node-executor
    steps:
      - checkout
      - restore_cache:
          keys:
            - npm-v1-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          key: npm-v1-{{ checksum "package-lock.json" }}
          paths:
            - ~/.npm
      - run: npm run build
      - persist_to_workspace:
          root: .
          paths:
            - public
            - reports

  guard-generated-artifacts:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - restore_cache:
          keys:
            - npm-v1-{{ checksum "package-lock.json" }}
      - run: npm ci
      - run:
          name: Verify publishable generated artifacts
          command: npm run guard:publishable

workflows:
  release-guard:
    jobs:
      - build-static-site
      - guard-generated-artifacts:
          requires:
            - build-static-site
```

The workspace handoff is the key detail. The build job creates `public/` and `reports/`, then the guard job checks those exact generated artifacts. If the guard script expects the generated files but the build never produced them, CircleCI fails before deployment.

For a public smoke check, use a separate workflow after deployment or trigger it manually with the production URL:

```yaml
version: 2.1

executors:
  node-executor:
    docker:
      - image: cimg/node:22.11

jobs:
  public-smoke:
    executor: node-executor
    steps:
      - checkout
      - run: npm ci
      - run:
          name: Check production review URLs
          command: npm run smoke:public -- --base-url "$PUBLIC_BASE_URL"

workflows:
  public-smoke:
    jobs:
      - public-smoke
```

Separating local publishability from public smoke checks keeps failures readable. If the local guard fails, the artifact is not ready. If public smoke fails, the artifact may be fine but the deployment, alias, route, or hosting cache needs attention.

The same contract also works in other CI systems. For example, a GitHub Actions job would run `npm run build` followed by `npm run guard:publishable`; the important part is not the CI vendor, but that generated artifacts are checked before publication and public URLs are checked after publication.

## Keep The Guard Small

The most common mistake is turning a release guard into a second application. Resist that. A useful guard should answer a narrow set of release questions:

- Are the expected files present?
- Do they have enough structure to be reviewed?
- Does the manifest point to real outputs?
- Is the working tree in a known state?
- Are obvious unsafe strings absent?
- Do the public review URLs respond?

Complex domain validation belongs in tests closer to the application code. The release guard sits at the boundary between generated output and publication.

## A Practical Folder Shape

One maintainable shape is:

```text
src/
  site.js
  publishGuard.js
scripts/
  smoke-public.mjs
reports/
  dataset-manifest.json
docs/
  articles/
public/
  index.html
  writing-samples.html
```

The names do not matter as much as the boundary:

- `src/site.js` builds the static pages.
- `src/publishGuard.js` checks the local release contract.
- `scripts/smoke-public.mjs` checks the deployed URLs.
- `reports/dataset-manifest.json` records generated artifact facts.
- `public/` contains only publishable output.

That separation keeps the release review simple. If something fails, the failure tells you whether to inspect generation, local publishability, or public hosting.

## Final Checklist

Before publishing generated static artifacts, ask:

- Did the build run from the current source?
- Are all required generated files present and non-empty?
- Does the manifest describe the release?
- Are reviewer links included and current?
- Did the guard scan the output for obvious private-data patterns?
- Is the working tree clean at the release point?
- Do the public URLs return the expected content after deployment?

The goal is not ceremony. The goal is to prevent a common failure mode: a static site that looks deployed but does not actually give reviewers the current, safe, complete artifact they need.

Once the guard exists, every future release becomes calmer. The deployment can still fail, but it fails with a reason. The reviewer can still ask questions, but they start from a current public artifact. And the team can improve the contract one small check at a time instead of relying on memory at the most error-prone moment of the release.
