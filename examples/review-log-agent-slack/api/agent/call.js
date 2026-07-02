"use strict";

const { callTool } = require("../../src/mcpTool");

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error("request_too_large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("invalid_json"));
      }
    });
    request.on("error", reject);
  });
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("allow", "POST");
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const result = callTool(body.name, body.arguments || {});
    response.status(200).json({
      tool: body.name,
      result,
      boundary: "No Slack tokens, cookies, workspace exports, or private customer records are required."
    });
  } catch (error) {
    const status = error.message === "invalid_json" || error.message === "request_too_large" ? 400 : 422;
    response.status(status).json({ error: error.message });
  }
};
