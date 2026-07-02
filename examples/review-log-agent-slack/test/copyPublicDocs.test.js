"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { copyPublicDocs } = require("../src/copyPublicDocs");

function makeTempDir() {
  const root = path.join(os.homedir(), ".codex", "tmp", "review-log-agent-slack");
  fs.mkdirSync(root, { recursive: true });
  return fs.mkdtempSync(path.join(root, "public-docs-"));
}

function testCopiesOnlyPublicSubmissionDocs() {
  const tempDir = makeTempDir();
  const sourceDir = path.resolve(__dirname, "..", "docs");
  const outputDir = path.join(tempDir, "docs");

  const copied = copyPublicDocs(sourceDir, outputDir);

  assert.deepStrictEqual(copied.sort(), [
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
    "slack-sandbox-setup-card.md",
    "submission-pack.md"
  ]);
  assert.ok(fs.existsSync(path.join(outputDir, "architecture.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "slack-app-manifest.json")));
  assert.ok(fs.existsSync(path.join(outputDir, "slack-app-handler-contract.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "submission-pack.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "public-verification.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "judge-verification.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "official-submission-requirements.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "github-source-fallback.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "reviewer-quickstart.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "slack-sandbox-setup-card.md")));
}

testCopiesOnlyPublicSubmissionDocs();

console.log("public docs copy tests passed");
