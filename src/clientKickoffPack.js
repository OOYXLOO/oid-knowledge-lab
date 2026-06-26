"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");

function row(values) {
  return `| ${values.map((value) => String(value ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

function firstItems(items, fallback, count = 3) {
  const values = Array.isArray(items) ? items.filter(Boolean).slice(0, count) : [];
  return values.length ? values : fallback;
}

function asSentenceList(items) {
  return firstItems(items, [], 4).map((item) => String(item).replace(/\s+/g, " ").trim()).filter(Boolean);
}

function buildClientKickoffPack({
  decisionOnePager = {},
  statementOfWorkPack = {},
  clientReadinessPack = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const ownerAction = decisionOnePager.next_step?.owner_action ||
    "Provide a sanitized CSV or tab-delimited OID inventory with an `oid` column and safe labels.";
  const reviewerAction = decisionOnePager.next_step?.reviewer_action ||
    "Run the local/browser assessment, review unresolved rows, and confirm the handoff boundary.";
  const expectedOutput = decisionOnePager.next_step?.expected_output ||
    "Decision-ready summary, remediation queue, public-source evidence map, and re-run notes.";
  const readinessScore = Number(clientReadinessPack.readiness_score || 0);

  return {
    schema_version: "oid-client-kickoff-pack/v1",
    generated_at: generatedAt,
    title: "OID Inventory Assessment Client Kickoff Pack",
    audience: "client-side technical owner or reviewer preparing a first sanitized OID inventory review",
    initial_reply: [
      "Thanks for the OID inventory context.",
      "A good first step is a small sanitized OID inventory review before any live registry cleanup or private system access.",
      `Recommended next action: ${ownerAction}`,
      `Expected output: ${expectedOutput}`
    ].join(" "),
    safe_intake_request: [
      "Please share a CSV or tab-delimited sample with an `oid` column and safe asset labels.",
      "Good labels are device, service, certificate profile, MIB module, registry namespace, or internal owner group.",
      "Please remove secrets, credentials, private exports, customer records, billing data, and any production-only identifiers before review."
    ].join(" "),
    first_call_agenda: [
      "Confirm the sanitized inventory shape and row count.",
      "Pick the first review lane: SNMP/MIB, PKI policy OID, or internal registry cleanup.",
      `Confirm assessment action: ${reviewerAction}`,
      "Agree how unresolved rows should be handed back for owner review."
    ],
    readiness_note: readinessScore
      ? `Current readiness evidence score: ${readinessScore}/100.`
      : "Current readiness evidence is documented in the client readiness pack.",
    deliverables_preview: firstItems(statementOfWorkPack.deliverables, [
      "OID assessment summary with counts, quality score, and prioritized action groups.",
      "Remediation queue suitable for spreadsheet or issue-tracker import.",
      "Public-source evidence map using IANA PEN records and OID-base sitemap URLs."
    ], 4),
    acceptance_preview: firstItems(statementOfWorkPack.acceptance_checklist, [
      "Every input row is classified as invalid, evidence-ready, or unresolved.",
      "The final remediation queue lists owner actions and re-run checks."
    ], 4),
    safe_inputs: asSentenceList(decisionOnePager.safe_inputs).length
      ? asSentenceList(decisionOnePager.safe_inputs)
      : [
          "Sanitized CSV or tab-delimited inventory with an `oid` column.",
          "Safe asset labels such as device, service, certificate profile, or internal registry id."
        ],
    boundary_notes: firstItems(decisionOnePager.boundaries, [
      "credentials, OTPs, cookies, tokens, private account exports, and production secrets",
      "payment, tax, KYC, or billing material",
      "raw client inventories in public repositories",
      "OID-base raw Markdown, HTML, or page-body mirrors without source-owner authorization"
    ], 5),
    proof_links: firstItems(decisionOnePager.proof_links, [
      { path: "reports/decision-one-pager.md", purpose: "One-page decision summary and next action" },
      { path: "reports/statement-of-work-pack.md", purpose: "Work boundary, responsibilities, acceptance, and exclusions" },
      { path: "reports/client-readiness-pack.md", purpose: "Readiness checks and review flow" },
      { path: "public/sample-assessment.html", purpose: "Browser-readable sample handoff" }
    ], 6)
  };
}

function renderClientKickoffMarkdown(pack) {
  const proofRows = pack.proof_links.map((item) => row([item.path, item.purpose])).join("\n");

  return `# ${pack.title}

Generated: \`${pack.generated_at}\`

Audience: ${pack.audience}

## Initial Reply

${pack.initial_reply}

## Safe Intake Request

${pack.safe_intake_request}

## First Call Agenda

${pack.first_call_agenda.map((item) => `- ${item}`).join("\n")}

## Readiness Note

${pack.readiness_note}

## Deliverables Preview

${pack.deliverables_preview.map((item) => `- ${item}`).join("\n")}

## Acceptance Preview

${pack.acceptance_preview.map((item) => `- ${item}`).join("\n")}

## Safe Inputs

${pack.safe_inputs.map((item) => `- ${item}`).join("\n")}

## Boundary Notes

${pack.boundary_notes.map((item) => `- ${item}`).join("\n")}

## Proof Links

| Artifact | Purpose |
| --- | --- |
${proofRows}
`;
}

function writeClientKickoffPack({
  decisionOnePagerFile,
  statementOfWorkFile,
  clientReadinessFile,
  jsonOutFile,
  markdownOutFile
}) {
  const decisionOnePager = JSON.parse(fs.readFileSync(decisionOnePagerFile, "utf8"));
  const statementOfWorkPack = JSON.parse(fs.readFileSync(statementOfWorkFile, "utf8"));
  const clientReadinessPack = JSON.parse(fs.readFileSync(clientReadinessFile, "utf8"));
  const pack = buildClientKickoffPack({
    decisionOnePager,
    statementOfWorkPack,
    clientReadinessPack
  });
  ensureDir(path.dirname(jsonOutFile));
  writeJson(jsonOutFile, pack);
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderClientKickoffMarkdown(pack), "utf8");
  }
  return pack;
}

module.exports = {
  buildClientKickoffPack,
  renderClientKickoffMarkdown,
  writeClientKickoffPack
};
