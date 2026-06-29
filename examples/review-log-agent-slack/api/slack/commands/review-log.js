"use strict";

const { buildSlashCommandResponse, collectRawBody, sendJson } = require("../../../src/slackHandler");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { response_type: "ephemeral", text: "Use POST for the Slack slash command endpoint." });
  }
  try {
    const rawBody = await collectRawBody(req);
    const result = buildSlashCommandResponse(rawBody, {
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      headers: req.headers
    });
    return sendJson(res, result.statusCode, result.body);
  } catch (error) {
    const statusCode = error.message === "request_too_large" ? 413 : 500;
    return sendJson(res, statusCode, { response_type: "ephemeral", text: "Review log handler could not process this request." });
  }
};
