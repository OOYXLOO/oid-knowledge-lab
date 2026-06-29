"use strict";

const assert = require("assert");
const { buildEvidenceLog, inferKind, renderMarkdown, toMessageRecords } = require("../src/reviewLog");

function testExplicitKinds() {
  assert.strictEqual(inferKind({ kind: "source_fact", text: "Verified fact" }), "sourceFact");
  assert.strictEqual(inferKind({ kind: "draft_claim", text: "Draft" }), "draftClaim");
  assert.strictEqual(inferKind({ kind: "reviewer_check", text: "Check" }), "reviewerCheck");
}

function testInferredKinds() {
  assert.strictEqual(inferKind({ text: "Question: can we publish this?" }), "question");
  assert.strictEqual(inferKind({ text: "Risk: this deletes the old token early" }), "blocker");
  assert.strictEqual(inferKind({ text: "Do we need owner review?" }), "question");
}

function testEvidenceLogSummary() {
  const log = buildEvidenceLog({
    title: "Sample",
    generated_at: "2026-06-28T00:00:00.000Z",
    messages: [
      { kind: "question", text: "What should the article say?" },
      { kind: "sourceFact", text: "The old token stays valid for 24 hours." },
      { kind: "reviewerCheck", text: "Check deletion timing." },
      { kind: "blocker", text: "Do not publish immediate deletion advice." },
      { kind: "boundary", text: "Do not include tokens." }
    ]
  });
  assert.strictEqual(log.summary.total_messages, 5);
  assert.strictEqual(log.summary.source_facts, 1);
  assert.strictEqual(log.summary.blockers, 1);
  assert.match(log.decision, /Revise before publication/);
}

function testMarkdownOutput() {
  const log = buildEvidenceLog({
    title: "Sample",
    generated_at: "2026-06-28T00:00:00.000Z",
    messages: [{ kind: "question", text: "What should the article say?", author: "writer" }]
  });
  const markdown = renderMarkdown(log);
  assert.match(markdown, /^# Evidence Log: Sample/);
  assert.match(markdown, /What should the article say\? \(writer\)/);
  assert.match(markdown, /Do not include passwords/);
}

function testEmptyAndInvalidRows() {
  const records = toMessageRecords({
    messages: [
      { text: "  " },
      { text: "Source: keep this", author: "docs" }
    ]
  });
  assert.strictEqual(records.length, 1);
  assert.strictEqual(records[0].kind, "sourceFact");
}

testExplicitKinds();
testInferredKinds();
testEvidenceLogSummary();
testMarkdownOutput();
testEmptyAndInvalidRows();

console.log("review log tests passed");

