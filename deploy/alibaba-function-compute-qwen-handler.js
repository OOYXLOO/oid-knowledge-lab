"use strict";

const { buildQwenChatRequest, extractQwenMessage } = require("../src/qwenAgent");

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(payload)
  };
}

function safeEvidencePacket(input) {
  const findings = Array.isArray(input.findings) ? input.findings.slice(0, 12) : [];
  return {
    schema_version: "oid-qwen-fc-request/v1",
    request_id: String(input.request_id || "local-preview"),
    findings: findings.map((finding, index) => ({
      label: String(finding.label || `row-${index + 1}`).slice(0, 80),
      oid: String(finding.oid || "").slice(0, 120),
      status: String(finding.status || "needs_review").slice(0, 80),
      risk: String(finding.risk || "unknown").slice(0, 40)
    }))
  };
}

async function callDashScope(body, apiKey) {
  const response = await fetch(body.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body.body)
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`DashScope request failed with HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  return JSON.parse(text);
}

async function handler(event) {
  if (!process.env.DASHSCOPE_API_KEY) {
    return jsonResponse(503, {
      ok: false,
      error: "DASHSCOPE_API_KEY is required in the private Function Compute environment.",
      public_boundary: "Do not publish API keys, account screenshots, billing data, cookies, tokens, or private console details."
    });
  }

  const rawBody = Buffer.isBuffer(event) ? event.toString("utf8") : String(event || "{}");
  const input = rawBody.trim() ? JSON.parse(rawBody) : {};
  const packet = safeEvidencePacket(input);
  const request = buildQwenChatRequest({
    prompt: "Draft a concise OID remediation summary. Preserve uncertainty and human approval gates.",
    plan: {
      model: process.env.QWEN_MODEL || "qwen-plus",
      remediation_queue: packet.findings,
      deterministic_guards: [
        "OID parsing and status classification are produced outside the language model.",
        "The model drafts review notes only from the provided sanitized packet.",
        "Publication, vendor contact, and customer handoff require human approval."
      ],
      qwen_role: [
        "Summarize source-grounded evidence.",
        "Explain unresolved rows without inventing private facts.",
        "Draft reviewer-friendly next actions."
      ]
    },
    model: process.env.QWEN_MODEL || "qwen-plus"
  });

  const responseJson = await callDashScope(request, process.env.DASHSCOPE_API_KEY);
  return jsonResponse(200, {
    ok: true,
    provider: "Alibaba Cloud DashScope compatible mode",
    model: request.body.model,
    request_id: packet.request_id,
    finding_count: packet.findings.length,
    message: extractQwenMessage(responseJson) || "",
    receipt_boundary: "Store only non-sensitive run metadata and redacted samples in public artifacts."
  });
}

module.exports = { handler, safeEvidencePacket };

