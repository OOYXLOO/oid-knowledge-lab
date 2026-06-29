#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { buildEvidenceLog, renderMarkdown } = require("./reviewLog");

function usage() {
  return [
    "Usage:",
    "  node src/cli.js <thread.json>",
    "",
    "The input should be a Slack-like JSON object with a title and messages array.",
    "No credentials, cookies, tokens, or private workspace exports are required."
  ].join("\n");
}

function main(argv) {
  const inputPath = argv[2];
  if (!inputPath || inputPath === "-h" || inputPath === "--help") {
    process.stdout.write(usage() + "\n");
    return 0;
  }
  const absolute = path.resolve(inputPath);
  const parsed = JSON.parse(fs.readFileSync(absolute, "utf8"));
  const log = buildEvidenceLog(parsed);
  process.stdout.write(renderMarkdown(log));
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv);
  } catch (error) {
    process.stderr.write(`review-log-agent failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { main };

