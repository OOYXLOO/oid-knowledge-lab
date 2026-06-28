"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");

const DEFAULT_PUBLIC_BASE_URL = "https://oid-knowledge-lab.vercel.app";

function link(publicBaseUrl, pathname) {
  return `${String(publicBaseUrl || DEFAULT_PUBLIC_BASE_URL).replace(/\/+$/, "")}/${String(pathname).replace(/^\/+/, "")}`;
}

function buildQwenSubmissionPack(options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const publicBaseUrl = options.publicBaseUrl || DEFAULT_PUBLIC_BASE_URL;
  return {
    schema_version: "qwen-submission-pack/v1",
    generated_at: generatedAt,
    public_base_url: publicBaseUrl,
    project: {
      name: "OID Knowledge Lab: Qwen Remediation Autopilot",
      category: "business workflow agent",
      target_user: "PKI, SNMP/MIB, IAM, and internal registry owners who need a safe OID inventory review path",
      core_claim: "Turn a sanitized OID inventory into an evidence-backed remediation queue with deterministic checks, Qwen-assisted explanation, and human approval gates."
    },
    devpost_fields: {
      tagline: "Qwen-assisted OID remediation handoffs with deterministic registry checks and human approval gates.",
      project_pitch: "OID remediation teams often start with messy spreadsheets, unclear private enterprise arcs, and malformed values. This project turns a sanitized OID inventory into a reviewable remediation package: deterministic parsing and registry lookup identify evidence gaps, Qwen summarizes the findings in stakeholder-readable language, and the workflow stops before any external action until a human approves it.",
      built_with: "Node.js, static HTML/CSS/JavaScript, public IANA PEN data, OID-base sitemap metadata, DashScope OpenAI-compatible Qwen chat API adapter, Markdown/JSON/CSV artifact generation.",
      what_it_does: "It accepts safe OID inventory input, classifies known enterprise roots and malformed values, generates a remediation queue, drafts reviewer-friendly summaries, and exports public-safe proof artifacts.",
      how_qwen_is_used: "Qwen is used as the language reasoning layer after deterministic classification. It summarizes evidence, explains ambiguous rows, drafts next-action wording, and preserves human approval gates rather than changing production systems or contacting third parties.",
      challenges: "The main challenge is keeping the public demo useful without copying third-party page bodies, exposing customer inventories, or overstating live-cloud proof. The implementation separates deterministic evidence from the Qwen reasoning layer and labels the remaining live-run proof gap explicitly."
    },
    architecture: {
      nodes: [
        { id: "input", label: "Sanitized OID inventory" },
        { id: "parser", label: "Deterministic parser and validators" },
        { id: "registry", label: "Public registry lookup" },
        { id: "qwen", label: "Qwen Cloud reasoning step" },
        { id: "guard", label: "Policy guard" },
        { id: "human", label: "Human approval gate" },
        { id: "outputs", label: "Markdown / CSV / JSON handoff" }
      ],
      edges: [
        ["input", "parser"],
        ["parser", "registry"],
        ["registry", "qwen"],
        ["qwen", "guard"],
        ["guard", "human"],
        ["human", "outputs"]
      ]
    },
    demo_script: {
      target_duration_seconds: 180,
      scenes: [
        { time: "0:00-0:20", title: "Problem", narration: "Show a messy but sanitized OID inventory and explain why malformed values and unclear enterprise roots slow remediation." },
        { time: "0:20-0:45", title: "Deterministic checks", narration: "Run the local assessment to classify valid OIDs, invalid values, public PEN matches, and unresolved items." },
        { time: "0:45-1:20", title: "Qwen reasoning layer", narration: "Show the Qwen adapter request shape and explain that Qwen drafts stakeholder-readable summaries from deterministic evidence." },
        { time: "1:20-1:50", title: "Human gate", narration: "Highlight blocked actions: no vendor contact, ticket creation, registry edits, or customer-facing changes without approval." },
        { time: "1:50-2:35", title: "Generated handoff", narration: "Open the Markdown/CSV/JSON artifacts and show the remediation queue, proof links, and acceptance checks." },
        { time: "2:35-3:00", title: "Why it matters", narration: "Close with the buyer value: faster OID cleanup scoping for PKI, SNMP/MIB, IAM, and registry owners." }
      ]
    },
    proof_links: [
      { label: "Qwen one-link packet", url: link(publicBaseUrl, "qwen-autopilot-agent-one-link.html") },
      { label: "Sample assessment", url: link(publicBaseUrl, "sample-assessment.html") },
      { label: "Technical rigor proof", url: link(publicBaseUrl, "technical-rigor-proof.html") },
      { label: "Qwen agent demo report", url: "https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/qwen-agent-demo.md" },
      { label: "Qwen adapter source", url: "https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/src/qwenAgent.js" },
      { label: "Source repository", url: "https://github.com/OOYXLOO/oid-knowledge-lab" }
    ],
    proof_checklist: [
      { label: "Offline agent demo", status: "ready", evidence: "reports/qwen-agent-demo.md" },
      { label: "Deterministic dataset audit", status: "ready", evidence: "reports/dataset-manifest.json" },
      { label: "Public one-link page", status: "ready", evidence: link(publicBaseUrl, "qwen-autopilot-agent-one-link.html") },
      { label: "Architecture diagram", status: "ready", evidence: "reports/qwen-architecture.mmd" },
      { label: "Live Qwen run", status: "needs_live_key", evidence: "Requires DASHSCOPE_API_KEY and redacted response receipt" },
      { label: "Public demo video", status: "needs_recording", evidence: "Use the three-minute demo script in this pack" }
    ],
    public_boundaries: [
      "No secrets or API keys in generated artifacts.",
      "No raw customer inventories in public pages.",
      "No copied OID-base page bodies.",
      "No private account exports, payment data, identity documents, cookies, or OTPs.",
      "No external action is represented as complete unless a human-approved receipt exists."
    ]
  };
}

function renderQwenArchitectureMermaid(pack) {
  const labels = Object.fromEntries(pack.architecture.nodes.map((node) => [node.id, node.label]));
  const nodeLines = pack.architecture.nodes.map((node) => `  ${node.id}["${node.label}"]`);
  const edgeLines = pack.architecture.edges.map(([from, to]) => `  ${from} --> ${to}`);
  if (!labels.qwen || !labels.human) {
    throw new Error("Architecture must include Qwen and human-gate nodes.");
  }
  return ["flowchart LR", ...nodeLines, ...edgeLines, ""].join("\n");
}

function renderQwenSubmissionMarkdown(pack) {
  const fields = pack.devpost_fields;
  const scenes = pack.demo_script.scenes.map((scene) => `| ${scene.time} | ${scene.title} | ${scene.narration} |`).join("\n");
  const proofRows = pack.proof_checklist.map((item) => `| ${item.label} | ${item.status} | ${item.evidence} |`).join("\n");
  const links = pack.proof_links.map((item) => `- [${item.label}](${item.url})`).join("\n");
  return [
    "# Qwen Submission Pack",
    "",
    `Generated at: ${pack.generated_at}`,
    "",
    "## Project",
    "",
    `- Name: ${pack.project.name}`,
    `- Category: ${pack.project.category}`,
    `- Target user: ${pack.project.target_user}`,
    `- Core claim: ${pack.project.core_claim}`,
    "",
    "## Devpost Field Draft",
    "",
    `**Tagline:** ${fields.tagline}`,
    "",
    `**Project pitch:** ${fields.project_pitch}`,
    "",
    `**Built with:** ${fields.built_with}`,
    "",
    `**What it does:** ${fields.what_it_does}`,
    "",
    `**How Qwen is used:** ${fields.how_qwen_is_used}`,
    "",
    `**Challenges:** ${fields.challenges}`,
    "",
    "## Architecture Diagram",
    "",
    "```mermaid",
    renderQwenArchitectureMermaid(pack).trimEnd(),
    "```",
    "",
    "## Three-Minute Demo Script",
    "",
    "| Time | Scene | Narration |",
    "|---|---|---|",
    scenes,
    "",
    "## Proof Checklist",
    "",
    "| Item | Status | Evidence |",
    "|---|---|---|",
    proofRows,
    "",
    "## Proof Links",
    "",
    links,
    "",
    "## Public Boundaries",
    "",
    pack.public_boundaries.map((item) => `- ${item}`).join("\n"),
    ""
  ].join("\n");
}

function writeQwenSubmissionPack(options = {}) {
  const pack = buildQwenSubmissionPack(options);
  if (options.jsonOutFile) writeJson(options.jsonOutFile, pack);
  if (options.markdownOutFile) {
    ensureDir(path.dirname(options.markdownOutFile));
    fs.writeFileSync(options.markdownOutFile, renderQwenSubmissionMarkdown(pack), "utf8");
  }
  if (options.mermaidOutFile) {
    ensureDir(path.dirname(options.mermaidOutFile));
    fs.writeFileSync(options.mermaidOutFile, renderQwenArchitectureMermaid(pack), "utf8");
  }
  return {
    pack,
    jsonOutFile: options.jsonOutFile,
    markdownOutFile: options.markdownOutFile,
    mermaidOutFile: options.mermaidOutFile
  };
}

module.exports = {
  DEFAULT_PUBLIC_BASE_URL,
  buildQwenSubmissionPack,
  renderQwenArchitectureMermaid,
  renderQwenSubmissionMarkdown,
  writeQwenSubmissionPack
};
