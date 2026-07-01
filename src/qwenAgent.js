"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");

const DEFAULT_QWEN_CHAT_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const DEFAULT_QWEN_MODEL = "qwen-plus";

const SAMPLE_FINDINGS = [
  {
    label: "router-core",
    oid: "1.3.6.1.4.1.9.9.41",
    status: "known_private_enterprise_oid",
    risk: "low",
    enterprise: { organization: "ciscoSystems" }
  },
  {
    label: "sha256-policy",
    oid: "2.16.840.1.101.3.4.2.1",
    status: "valid_oid_unmatched",
    risk: "medium"
  },
  {
    label: "bad-row",
    oid: "not-an-oid",
    status: "invalid_value",
    risk: "high"
  }
];

function actionForFinding(finding) {
  if (finding.status === "invalid_value") {
    return "Correct the malformed OID value before using this row as evidence.";
  }
  if (finding.status === "known_private_enterprise_oid") {
    const org = finding.enterprise && finding.enterprise.organization ? finding.enterprise.organization : "the public PEN owner";
    return `Preserve the public enterprise-root evidence for ${org} and confirm whether the asset label is current.`;
  }
  if (finding.status === "unknown_private_enterprise_oid") {
    return "Ask the owner for vendor or internal registration evidence before remediation.";
  }
  if (finding.status === "valid_oid_unmatched") {
    return "Confirm whether this valid OID is internal, deprecated, or covered by another registry.";
  }
  return "Keep the evidence link with the asset record and request human review before external action.";
}

function buildQwenAgentPlan(options = {}) {
  const findings = options.findings || SAMPLE_FINDINGS;
  const generatedAt = options.generatedAt || new Date().toISOString();
  const mode = options.mode || "offline";
  const remediationQueue = findings.map((finding, index) => ({
    index: index + 1,
    label: finding.label || `row-${index + 1}`,
    oid: finding.oid || "",
    status: finding.status || "needs_review",
    risk: finding.risk || "unknown",
    action: actionForFinding(finding),
    human_gate: true
  }));

  return {
    schema_version: "qwen-autopilot-agent-demo/v1",
    generated_at: generatedAt,
    provider: "qwen-compatible",
    model: options.model || DEFAULT_QWEN_MODEL,
    mode,
    summary: {
      total_findings: findings.length,
      high_risk_findings: findings.filter((finding) => finding.risk === "high").length,
      unresolved_findings: findings.filter((finding) => ["invalid_value", "unknown_private_enterprise_oid", "valid_oid_unmatched", "needs_review"].includes(finding.status)).length,
      human_gated_actions: remediationQueue.filter((item) => item.human_gate).length
    },
    remediation_queue: remediationQueue,
    qwen_role: [
      "Summarize registry evidence in stakeholder-readable language.",
      "Draft remediation wording and client-safe next actions.",
      "Ask for missing safe context instead of inventing facts.",
      "Stop before vendor contact, production tickets, or registry changes."
    ],
    deterministic_guards: [
      "OID parsing and malformed-value detection stay deterministic.",
      "Registry classifications are backed by generated JSON and public source links.",
      "Human approval gates are required before external action."
    ],
    boundaries: [
      "No secrets",
      "No private account exports",
      "No customer raw inventories in public artifacts",
      "No copied OID-base page bodies",
      "No payment, KYC, tax, OTP, cookie, or identity data"
    ]
  };
}

function buildQwenChatRequest(options = {}) {
  const plan = options.plan || buildQwenAgentPlan({ mode: "offline" });
  const prompt = options.prompt || "Summarize this OID remediation plan for a reviewer.";
  return {
    url: options.url || DEFAULT_QWEN_CHAT_URL,
    body: {
      model: options.model || plan.model || DEFAULT_QWEN_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an OID remediation review assistant. Summarize evidence, preserve human approval gates, and do not invent private facts."
        },
        {
          role: "user",
          content: `${prompt}\n\nPlan JSON:\n${JSON.stringify(plan, null, 2)}`
        }
      ],
      temperature: 0.2
    }
  };
}

function extractQwenMessage(responseJson) {
  return responseJson &&
    responseJson.choices &&
    responseJson.choices[0] &&
    responseJson.choices[0].message &&
    responseJson.choices[0].message.content;
}

async function callQwenChat(options = {}) {
  const apiKey = options.apiKey || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY is required for live Qwen calls. Use offline mode for public demos.");
  }
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is required for live Qwen calls.");
  }

  const request = buildQwenChatRequest(options);
  const response = await fetch(request.url, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(request.body)
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Qwen request failed with HTTP ${response.status}: ${text.slice(0, 200)}`);
  }
  const json = JSON.parse(text);
  return {
    request: {
      url: request.url,
      model: request.body.model
    },
    response: json,
    message: extractQwenMessage(json) || ""
  };
}

function renderQwenAgentMarkdown(plan) {
  const rows = plan.remediation_queue.map((item) => (
    `| ${item.index} | ${item.label} | \`${item.oid}\` | ${item.status} | ${item.risk} | ${item.action} | ${item.human_gate ? "yes" : "no"} |`
  ));
  return [
    "# Qwen Autopilot Agent Demo",
    "",
    `Generated at: ${plan.generated_at}`,
    "",
    "## Summary",
    "",
    `- Provider: ${plan.provider}`,
    `- Model: ${plan.model}`,
    `- Mode: ${plan.mode}`,
    `- Total findings: ${plan.summary.total_findings}`,
    `- High-risk findings: ${plan.summary.high_risk_findings}`,
    `- Unresolved findings: ${plan.summary.unresolved_findings}`,
    `- Human approval gates: ${plan.summary.human_gated_actions}`,
    "",
    "## Remediation queue",
    "",
    "| # | Asset | OID | Status | Risk | Next action | Human gate |",
    "|---|---|---|---|---|---|---|",
    rows.join("\n"),
    "",
    "## Qwen role",
    "",
    plan.qwen_role.map((item) => `- ${item}`).join("\n"),
    "",
    "## Deterministic guards",
    "",
    plan.deterministic_guards.map((item) => `- ${item}`).join("\n"),
    "",
    "## Public boundary",
    "",
    plan.boundaries.map((item) => `- ${item}`).join("\n"),
    ""
  ].join("\n");
}

function writeQwenAgentDemo(options = {}) {
  const plan = buildQwenAgentPlan({
    generatedAt: options.generatedAt,
    findings: options.findings,
    model: options.model,
    mode: options.mode || "offline"
  });
  const jsonOutFile = options.jsonOutFile;
  const markdownOutFile = options.markdownOutFile;
  if (jsonOutFile) writeJson(jsonOutFile, plan);
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderQwenAgentMarkdown(plan), "utf8");
  }
  return {
    plan,
    jsonOutFile,
    markdownOutFile
  };
}

module.exports = {
  DEFAULT_QWEN_CHAT_URL,
  DEFAULT_QWEN_MODEL,
  SAMPLE_FINDINGS,
  buildQwenAgentPlan,
  buildQwenChatRequest,
  callQwenChat,
  renderQwenAgentMarkdown,
  extractQwenMessage,
  writeQwenAgentDemo
};
