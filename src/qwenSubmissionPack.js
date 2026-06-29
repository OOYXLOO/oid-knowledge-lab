"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");

const DEFAULT_PUBLIC_BASE_URL = "https://ooyxloo.github.io/oid-knowledge-lab";

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
      { label: "Qwen demo proof page", url: link(publicBaseUrl, "qwen-demo-proof.html") },
      { label: "Demo proof screenshot", url: link(publicBaseUrl, "assets/qwen/demo-proof.png") },
      { label: "One-link packet screenshot", url: link(publicBaseUrl, "assets/qwen/one-link.png") },
      { label: "Architecture screenshot", url: link(publicBaseUrl, "assets/qwen/architecture.png") },
      { label: "Sample assessment screenshot", url: link(publicBaseUrl, "assets/qwen/sample-assessment.png") },
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
      { label: "Screenshot proof gallery", status: "ready", evidence: link(publicBaseUrl, "qwen-demo-proof.html") },
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

function escapeXml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderQwenArchitectureSvg(pack) {
  const nodePositions = [
    { id: "input", x: 40, y: 96, width: 170, height: 72 },
    { id: "parser", x: 250, y: 96, width: 190, height: 72 },
    { id: "registry", x: 480, y: 96, width: 170, height: 72 },
    { id: "qwen", x: 690, y: 88, width: 190, height: 88 },
    { id: "guard", x: 920, y: 96, width: 150, height: 72 },
    { id: "human", x: 1110, y: 88, width: 170, height: 88 },
    { id: "outputs", x: 1320, y: 96, width: 190, height: 72 }
  ];
  const byId = Object.fromEntries(pack.architecture.nodes.map((node) => [node.id, node]));
  const posById = Object.fromEntries(nodePositions.map((node) => [node.id, node]));
  const arrows = pack.architecture.edges.map(([from, to]) => {
    const start = posById[from];
    const end = posById[to];
    return `<path d="M ${start.x + start.width} ${start.y + start.height / 2} L ${end.x - 18} ${end.y + end.height / 2}" class="edge"/><path d="M ${end.x - 18} ${end.y + end.height / 2 - 7} L ${end.x} ${end.y + end.height / 2} L ${end.x - 18} ${end.y + end.height / 2 + 7}" class="arrow"/>`;
  }).join("\n    ");
  const cards = nodePositions.map((node, index) => {
    const source = byId[node.id] || { label: node.id };
    const className = node.id === "qwen" ? "card qwen" : node.id === "human" ? "card gate" : "card";
    const lines = String(source.label).split(/ \/ | and /).slice(0, 2);
    const lineSpans = lines.map((line, lineIndex) => `<tspan x="${node.x + node.width / 2}" dy="${lineIndex === 0 ? 0 : 18}">${escapeXml(line)}</tspan>`).join("");
    return `<g>
      <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="10" class="${className}"/>
      <text x="${node.x + node.width / 2}" y="${node.y + node.height / 2 - (lines.length > 1 ? 8 : 0)}" class="label">${lineSpans}</text>
      <text x="${node.x + 14}" y="${node.y + 22}" class="step">${index + 1}</text>
    </g>`;
  }).join("\n    ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1560 320" role="img" aria-labelledby="title desc">
  <title id="title">Qwen Architecture Diagram</title>
  <desc id="desc">Sanitized OID inventory flows through deterministic checks, Qwen Cloud reasoning, a policy guard, a human approval gate, and generated handoff artifacts.</desc>
  <style>
    .bg{fill:#f8fafc}
    .title{font:700 24px Arial,sans-serif;fill:#111827}
    .subtitle{font:400 14px Arial,sans-serif;fill:#4b5563}
    .card{fill:#ffffff;stroke:#1f2937;stroke-width:1.5}
    .qwen{fill:#eef2ff;stroke:#4f46e5;stroke-width:2}
    .gate{fill:#ecfdf5;stroke:#047857;stroke-width:2}
    .label{font:600 14px Arial,sans-serif;fill:#111827;text-anchor:middle}
    .step{font:700 12px Arial,sans-serif;fill:#6b7280}
    .edge{stroke:#6b7280;stroke-width:2;fill:none}
    .arrow{fill:#6b7280}
    .note{font:400 13px Arial,sans-serif;fill:#374151}
  </style>
  <rect width="1560" height="320" class="bg"/>
  <text x="40" y="44" class="title">Qwen Cloud Autopilot Agent Architecture</text>
  <text x="40" y="68" class="subtitle">Deterministic OID evidence first; Qwen explains and drafts; humans approve before external action.</text>
  <g>
    ${arrows}
    ${cards}
  </g>
  <text x="40" y="268" class="note">Public boundary: no secrets, customer exports, copied OID-base page bodies, payment data, identity documents, cookies, or OTPs.</text>
</svg>
`;
}

function renderQwenArchitectureHtml(pack) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Qwen Architecture Diagram - OID Knowledge Lab</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">Qwen Architecture Diagram</p>
      <h1>Deterministic checks, Qwen reasoning, human approval</h1>
      <p class="summary">A submission-ready architecture image for the Qwen Autopilot Agent candidate. It shows the path from sanitized OID input to deterministic registry evidence, Qwen Cloud reasoning, policy guard, human approval gate, and generated handoff artifacts.</p>
      <div class="links">
        <a href="qwen-autopilot-agent-one-link.html">Qwen packet</a>
        <a href="qwen-architecture.svg">Open SVG</a>
        <a href="https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/qwen-submission-pack.md">Submission pack</a>
        <a href="https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/qwen-architecture.mmd">Mermaid source</a>
      </div>
    </section>
    <section class="panel">
      <img src="qwen-architecture.svg" alt="Qwen Cloud Autopilot Agent architecture diagram" style="width:100%;height:auto;border:1px solid #d1d5db;border-radius:8px;background:#f8fafc">
    </section>
    <section class="panel">
      <div>
        <p class="eyebrow">Flow summary</p>
        <h2>Architecture steps</h2>
      </div>
      <ol class="numbered-list">
        ${pack.architecture.nodes.map((node) => `<li>${escapeXml(node.label)}</li>`).join("\n        ")}
      </ol>
    </section>
    <section class="panel">
      <div>
        <p class="eyebrow">Boundary</p>
        <h2>Public-safe diagram</h2>
        <p class="panel-copy">The diagram contains only public workflow architecture. No secrets, private account exports, customer inventories, copied OID-base page bodies, payment data, identity documents, cookies, or OTPs are included.</p>
      </div>
    </section>
  </main>
</body>
</html>
`;
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
  if (options.svgOutFile) {
    ensureDir(path.dirname(options.svgOutFile));
    fs.writeFileSync(options.svgOutFile, renderQwenArchitectureSvg(pack), "utf8");
  }
  if (options.htmlOutFile) {
    ensureDir(path.dirname(options.htmlOutFile));
    fs.writeFileSync(options.htmlOutFile, renderQwenArchitectureHtml(pack), "utf8");
  }
  return {
    pack,
    jsonOutFile: options.jsonOutFile,
    markdownOutFile: options.markdownOutFile,
    mermaidOutFile: options.mermaidOutFile,
    svgOutFile: options.svgOutFile,
    htmlOutFile: options.htmlOutFile
  };
}

module.exports = {
  DEFAULT_PUBLIC_BASE_URL,
  buildQwenSubmissionPack,
  renderQwenArchitectureMermaid,
  renderQwenArchitectureSvg,
  renderQwenArchitectureHtml,
  renderQwenSubmissionMarkdown,
  writeQwenSubmissionPack
};
