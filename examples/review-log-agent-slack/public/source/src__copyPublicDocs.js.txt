#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const PUBLIC_DOCS = [
  "architecture.md",
  "architecture.mmd",
  "challenge-fit.md",
  "demo-video-script.md",
  "devpost-field-pack.md",
  "github-source-fallback.md",
  "judge-verification.md",
  "official-submission-requirements.md",
  "public-verification.md",
  "reviewer-quickstart.md",
  "slack-app-handler-contract.md",
  "slack-app-manifest.json",
  "submission-pack.md"
];

function copyPublicDocs(sourceDir, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  return PUBLIC_DOCS.map((name) => {
    const source = path.join(sourceDir, name);
    const target = path.join(outputDir, name);
    fs.copyFileSync(source, target);
    return name;
  });
}

function main(argv) {
  const sourceDir = path.resolve(argv[2] || "docs");
  const outputDir = path.resolve(argv[3] || "public/docs");
  const copied = copyPublicDocs(sourceDir, outputDir);
  process.stdout.write(`public docs copied: ${copied.join(", ")}\n`);
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv);
  } catch (error) {
    process.stderr.write(`copy public docs failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  copyPublicDocs
};
