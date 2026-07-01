"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, sha256, writeJson } = require("./net");

function stableJson(value) {
  return JSON.stringify(value == null ? null : value);
}

function buildQwenRunReceipt(options = {}) {
  const request = options.request || {};
  const message = options.message || "";
  return {
    schema_version: "qwen-run-receipt/v1",
    generated_at: options.generatedAt || new Date().toISOString(),
    provider: options.provider || "Alibaba Cloud DashScope compatible mode",
    model: options.model || "qwen-plus",
    status: options.status || "unknown",
    input_hash: sha256(stableJson(request)),
    output_hash: sha256(String(message)),
    redaction_boundary: [
      "No API keys",
      "No prompt body",
      "No complete response body",
      "No account screenshots",
      "No billing data",
      "No cookies or tokens"
    ],
    public_notes: options.publicNotes || []
  };
}

function renderQwenRunReceiptMarkdown(receipt) {
  return [
    "# Qwen Run Receipt",
    "",
    `Generated at: ${receipt.generated_at}`,
    "",
    "## Summary",
    "",
    `- Provider: ${receipt.provider}`,
    `- Model: ${receipt.model}`,
    `- Status: ${receipt.status}`,
    `- Input hash: \`${receipt.input_hash}\``,
    `- Output hash: \`${receipt.output_hash}\``,
    "",
    "## Redaction Boundary",
    "",
    receipt.redaction_boundary.map((item) => `- ${item}`).join("\n"),
    "",
    "## Public Notes",
    "",
    (receipt.public_notes || []).map((item) => `- ${item}`).join("\n") || "- None",
    ""
  ].join("\n");
}

function writeQwenRunReceipt(options = {}) {
  const receipt = buildQwenRunReceipt(options);
  if (options.jsonOutFile) writeJson(options.jsonOutFile, receipt);
  if (options.markdownOutFile) {
    ensureDir(path.dirname(options.markdownOutFile));
    fs.writeFileSync(options.markdownOutFile, renderQwenRunReceiptMarkdown(receipt), "utf8");
  }
  return { receipt, jsonOutFile: options.jsonOutFile, markdownOutFile: options.markdownOutFile };
}

module.exports = {
  buildQwenRunReceipt,
  renderQwenRunReceiptMarkdown,
  writeQwenRunReceipt
};
