#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const SNAPSHOT_FILES = [
  "package.json",
  "README.md",
  "src/reviewLog.js",
  "src/slackHandler.js",
  "src/mcpTool.js",
  "src/renderSubmissionPage.js",
  "src/copyPublicDocs.js",
  "api/slack/commands/review-log.js",
  "api/slack/interactivity.js",
  "test/reviewLog.test.js",
  "test/slackHandler.test.js",
  "test/mcpTool.test.js",
  "docs/slack-app-manifest.json",
  "docs/slack-app-handler-contract.md",
  "docs/architecture.md"
];

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function publicName(relativePath) {
  return `${relativePath.replace(/[\\/]/g, "__")}.txt`;
}

function copySourceSnapshot(rootDir, outputDir, docsDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });

  const rows = SNAPSHOT_FILES.map((relativePath) => {
    const source = path.join(rootDir, relativePath);
    const bytes = fs.readFileSync(source);
    const targetName = publicName(relativePath);
    const target = path.join(outputDir, targetName);
    fs.writeFileSync(target, bytes);
    return {
      path: relativePath,
      publicPath: `source/${targetName}`,
      bytes: bytes.length,
      sha256: sha256(bytes)
    };
  });

  const markdown = [
    "# Public Source Snapshot",
    "",
    "This snapshot exposes the reviewable core source files for the public Vercel demo.",
    "It is not a replacement for the standalone GitHub repository, which is still needed for the final challenge submission.",
    "",
    "## Included Files",
    "",
    "| Path | Public copy | Bytes | SHA-256 |",
    "| --- | --- | ---: | --- |",
    ...rows.map((row) => `| \`${row.path}\` | [${row.publicPath}](../${row.publicPath}) | ${row.bytes} | \`${row.sha256}\` |`),
    "",
    "## Boundary",
    "",
    "The snapshot includes source, tests, docs, and the Slack app manifest template only. It does not include Slack credentials, OAuth secrets, workspace exports, tokens, cookies, private messages, payment data, customer data, or account screenshots.",
    ""
  ].join("\n");

  fs.writeFileSync(path.join(docsDir, "source-snapshot.md"), markdown, "utf8");
  return rows;
}

function main(argv) {
  const rootDir = path.resolve(argv[2] || ".");
  const outputDir = path.resolve(argv[3] || "public/source");
  const docsDir = path.resolve(argv[4] || "public/docs");
  const rows = copySourceSnapshot(rootDir, outputDir, docsDir);
  process.stdout.write(`source snapshot copied: ${rows.length} files\n`);
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv);
  } catch (error) {
    process.stderr.write(`copy source snapshot failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  SNAPSHOT_FILES,
  copySourceSnapshot
};
