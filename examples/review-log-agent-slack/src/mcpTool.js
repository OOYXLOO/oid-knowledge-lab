"use strict";

const { buildEvidenceLog, renderMarkdown } = require("./reviewLog");

const BUILD_REVIEW_LOG_TOOL = {
  name: "build_review_log",
  description: "Build a Markdown evidence log from a sanitized Slack-style review thread.",
  input_schema: {
    type: "object",
    properties: {
      thread: {
        type: "object",
        description: "Synthetic or sanitized Slack-style thread with title and messages."
      }
    },
    required: ["thread"]
  }
};

function listTools() {
  return [BUILD_REVIEW_LOG_TOOL];
}

function callTool(name, args) {
  if (name !== BUILD_REVIEW_LOG_TOOL.name) {
    throw new Error(`Unknown tool: ${name}`);
  }
  const log = buildEvidenceLog(args && args.thread);
  return {
    content: [
      {
        type: "text",
        text: renderMarkdown(log)
      }
    ]
  };
}

module.exports = {
  callTool,
  listTools
};
