"use strict";

const assert = require("assert");
const { callTool, listTools } = require("../src/mcpTool");

function testListsReviewLogTool() {
  const tools = listTools();
  assert.strictEqual(tools.length, 1);
  assert.strictEqual(tools[0].name, "build_review_log");
  assert.match(tools[0].description, /Slack-style review thread/);
}

function testBuildReviewLogTool() {
  const result = callTool("build_review_log", {
    thread: {
      title: "Release note review",
      generated_at: "2026-06-28T00:00:00.000Z",
      messages: [
        { kind: "question", text: "Can we publish the release note?", author: "writer" },
        { kind: "sourceFact", text: "The rollback flag remains available for 24 hours.", author: "docs" },
        { kind: "reviewerCheck", text: "Verify the rollback path.", author: "reviewer" }
      ]
    }
  });

  assert.strictEqual(result.content[0].type, "text");
  assert.match(result.content[0].text, /# Evidence Log: Release note review/);
  assert.match(result.content[0].text, /Ready for owner review/);
}

function testRejectsUnknownTool() {
  assert.throws(
    () => callTool("unknown_tool", {}),
    /Unknown tool/
  );
}

testListsReviewLogTool();
testBuildReviewLogTool();
testRejectsUnknownTool();

console.log("mcp tool tests passed");
