"use strict";

const crypto = require("crypto");
const { buildEvidenceLog, renderMarkdown } = require("./reviewLog");

const MAX_BODY_BYTES = 20000;

function parseUrlEncoded(body) {
  const params = new URLSearchParams(String(body || ""));
  return Object.fromEntries(params.entries());
}

function parseJsonSafely(value) {
  try {
    return JSON.parse(value);
  } catch (_) {
    return null;
  }
}

function sanitizeLine(text) {
  return String(text || "")
    .replace(/\b(xox[baprs]-[A-Za-z0-9-]+)\b/g, "[redacted-slack-token]")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[redacted-email]")
    .replace(/\s+/g, " ")
    .trim();
}

function threadFromText(text, title = "Slack Review Notes") {
  const lines = String(text || "")
    .split(/\r?\n|;/)
    .map(sanitizeLine)
    .filter(Boolean)
    .slice(0, 20);
  const messages = lines.length
    ? lines.map((line) => ({ author: "slack-user", text: line }))
    : [{ kind: "question", author: "slack-user", text: "What should be reviewed before publishing this update?" }];
  return { title, messages };
}

function slackResponse(markdown, extra = {}) {
  return Object.assign({
    response_type: "ephemeral",
    text: "Review log generated.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: markdown.length > 2900 ? `${markdown.slice(0, 2890)}\n...` : markdown
        }
      }
    ]
  }, extra);
}

function timestampIsFresh(timestamp, nowSeconds = Math.floor(Date.now() / 1000)) {
  const value = Number(timestamp);
  return Number.isFinite(value) && Math.abs(nowSeconds - value) <= 60 * 5;
}

function verifySlackSignature({ signingSecret, timestamp, signature, rawBody, nowSeconds }) {
  if (!signingSecret) return { ok: true, mode: "unsigned-demo" };
  if (!timestampIsFresh(timestamp, nowSeconds)) return { ok: false, reason: "stale_timestamp" };
  const base = `v0:${timestamp}:${rawBody || ""}`;
  const expected = `v0=${crypto.createHmac("sha256", signingSecret).update(base).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(String(signature || ""));
  if (expectedBuffer.length !== actualBuffer.length) return { ok: false, reason: "bad_signature" };
  if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer)) return { ok: false, reason: "bad_signature" };
  return { ok: true, mode: "signed" };
}

function buildSlashCommandResponse(rawBody, options = {}) {
  if (Buffer.byteLength(String(rawBody || ""), "utf8") > MAX_BODY_BYTES) {
    return { statusCode: 413, body: { response_type: "ephemeral", text: "Request body is too large for this demo handler." } };
  }
  const fields = parseUrlEncoded(rawBody);
  const verification = verifySlackSignature({
    signingSecret: options.signingSecret,
    timestamp: options.timestamp || options.headers && options.headers["x-slack-request-timestamp"],
    signature: options.signature || options.headers && options.headers["x-slack-signature"],
    rawBody,
    nowSeconds: options.nowSeconds
  });
  if (!verification.ok) {
    return { statusCode: 401, body: { response_type: "ephemeral", text: "Slack signature verification failed." } };
  }
  const thread = threadFromText(fields.text, "Slash Command Review Log");
  const markdown = renderMarkdown(buildEvidenceLog(thread));
  return { statusCode: 200, body: slackResponse(markdown, { metadata: { verification: verification.mode } }) };
}

function buildInteractivityResponse(rawBody, options = {}) {
  const fields = parseUrlEncoded(rawBody);
  const payload = parseJsonSafely(fields.payload) || {};
  const verification = verifySlackSignature({
    signingSecret: options.signingSecret,
    timestamp: options.timestamp || options.headers && options.headers["x-slack-request-timestamp"],
    signature: options.signature || options.headers && options.headers["x-slack-signature"],
    rawBody,
    nowSeconds: options.nowSeconds
  });
  if (!verification.ok) {
    return { statusCode: 401, body: { response_type: "ephemeral", text: "Slack signature verification failed." } };
  }
  const messageText = payload.message && payload.message.text ? payload.message.text : "";
  const thread = threadFromText(messageText, "Message Shortcut Review Log");
  const markdown = renderMarkdown(buildEvidenceLog(thread));
  return { statusCode: 200, body: slackResponse(markdown, { metadata: { verification: verification.mode } }) };
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function collectRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
        reject(new Error("request_too_large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

module.exports = {
  buildInteractivityResponse,
  buildSlashCommandResponse,
  collectRawBody,
  parseUrlEncoded,
  sendJson,
  threadFromText,
  verifySlackSignature
};
