"use strict";

const { listTools } = require("../../src/mcpTool");

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  response.status(200).json({
    tools: listTools(),
    boundary: "Use synthetic or sanitized Slack-style review threads only."
  });
};
