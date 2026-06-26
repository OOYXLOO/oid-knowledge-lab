"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");
const { generatedTimestamp } = require("./time");

function row(values) {
  return `| ${values.map((value) => String(value ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

function topUseCases(verticalUseCasePack = {}) {
  return (verticalUseCasePack.use_cases || [])
    .slice()
    .sort((a, b) => Number(b.fit_score || 0) - Number(a.fit_score || 0))
    .slice(0, 2)
    .map((item) => ({
      title: item.title,
      fit_score: item.fit_score || 0
    }));
}

function firstItems(items, fallback, count = 3) {
  const values = Array.isArray(items) ? items.filter(Boolean).slice(0, count) : [];
  return values.length ? values : fallback;
}

function buildDecisionOnePager({
  statementOfWorkPack = {},
  clientReadinessPack = {},
  scopeProposalPack = {},
  verticalUseCasePack = {},
  generatedAt = generatedTimestamp()
} = {}) {
  const topLanes = topUseCases(verticalUseCasePack);
  const topLane = topLanes[0]?.title || "sanitized OID inventory review";
  const readinessScore = clientReadinessPack.readiness_score || 0;

  return {
    schema_version: "oid-decision-one-pager/v1",
    generated_at: generatedAt,
    title: "OID Inventory Assessment Decision One-Pager",
    audience: "technical owner or buyer deciding whether to approve a small sanitized OID assessment",
    decision_prompt: "Approve a small first review of a sanitized OID inventory sample before any broader registry cleanup.",
    fit_summary: `Best current lane: ${topLane}. Client-readiness evidence score: ${readinessScore}/100.`,
    why_now: firstItems(scopeProposalPack.decision_summary, [
      `Client-readiness evidence score: ${readinessScore}/100`,
      "A small sanitized sample can be reviewed before live systems, credentials, or raw private exports enter scope.",
      "The workflow already separates public-source evidence from client-specific owner review."
    ], 4),
    recommended_scope: statementOfWorkPack.objective ||
      "Review a sanitized OID inventory sample, classify every row, and produce a compact remediation queue.",
    next_step: {
      owner_action: "Provide a sanitized CSV or tab-delimited OID inventory with an `oid` column and safe labels.",
      reviewer_action: "Run the local/browser assessment, review unresolved rows, and confirm the handoff boundary.",
      expected_output: "Decision-ready summary, remediation queue, public-source evidence map, and re-run notes."
    },
    best_fit_lanes: topLanes,
    deliverables: firstItems(statementOfWorkPack.deliverables, [
      "OID assessment summary with counts, quality score, and prioritized action groups.",
      "Remediation queue suitable for spreadsheet or issue-tracker import.",
      "Public-source evidence map using IANA PEN records and OID-base sitemap URLs."
    ], 4),
    safe_inputs: firstItems(statementOfWorkPack.client_responsibilities, [
      "Sanitized CSV or tab-delimited inventory with an `oid` column.",
      "Safe asset labels such as device, service, certificate profile, or internal registry id.",
      "Internal owner notes only for unresolved OIDs that need organization-specific review."
    ], 4),
    acceptance_snapshot: firstItems(statementOfWorkPack.acceptance_checklist, [
      "Every input row is classified as invalid, evidence-ready, or unresolved.",
      "The final remediation queue lists owner actions and re-run checks."
    ], 4),
    first_48_hours: firstItems((scopeProposalPack.first_48_hours || []).map((item) => `${item.step}: ${item.output}`), [
      "Confirm sanitized inventory shape: CSV or tab-delimited input with an oid column.",
      "Run local assessment: classify rows and produce findings.",
      "Approve handoff boundary: share derived findings and public source links only."
    ], 4),
    boundaries: firstItems(statementOfWorkPack.out_of_scope, [
      "credentials, OTPs, cookies, tokens, private account exports, and production secrets",
      "payment, tax, KYC, or billing material",
      "raw client inventories in public repositories",
      "OID-base raw Markdown, HTML, or page-body mirrors without source-owner authorization"
    ], 5),
    proof_links: [
      { path: "reports/decision-one-pager.md", purpose: "One-page decision summary and next action" },
      { path: "reports/statement-of-work-pack.md", purpose: "Work boundary, responsibilities, acceptance, and exclusions" },
      { path: "reports/scope-proposal-pack.md", purpose: "First scope, first 48 hours, inputs, and acceptance criteria" },
      { path: "reports/client-readiness-pack.md", purpose: "Readiness checks and review flow" },
      { path: "reports/vertical-use-case-pack.md", purpose: "Use-case fit by review lane" },
      { path: "public/sample-assessment.html", purpose: "Browser-readable sample handoff" }
    ]
  };
}

function renderDecisionOnePagerMarkdown(pack) {
  const lanes = pack.best_fit_lanes.length
    ? pack.best_fit_lanes.map((item) => row([item.title, `${item.fit_score}/100`])).join("\n")
    : row(["Confirm review lane", "-"]);
  const proofs = pack.proof_links.map((item) => row([item.path, item.purpose])).join("\n");

  return `# ${pack.title}

Generated: \`${pack.generated_at}\`

Audience: ${pack.audience}

## Decision Prompt

${pack.decision_prompt}

${pack.fit_summary}

## Why Now

${pack.why_now.map((item) => `- ${item}`).join("\n")}

## Recommended Next Step

- Owner action: ${pack.next_step.owner_action}
- Reviewer action: ${pack.next_step.reviewer_action}
- Expected output: ${pack.next_step.expected_output}

## Recommended Scope

${pack.recommended_scope}

## Best Fit Lanes

| Lane | Fit |
| --- | ---: |
${lanes}

## Deliverables

${pack.deliverables.map((item) => `- ${item}`).join("\n")}

## Safe Inputs

${pack.safe_inputs.map((item) => `- ${item}`).join("\n")}

## First 48 Hours

${pack.first_48_hours.map((item) => `- ${item}`).join("\n")}

## Acceptance Snapshot

${pack.acceptance_snapshot.map((item) => `- ${item}`).join("\n")}

## Boundaries

${pack.boundaries.map((item) => `- ${item}`).join("\n")}

## Proof Links

| Artifact | Purpose |
| --- | --- |
${proofs}
`;
}

function writeDecisionOnePager({
  statementOfWorkFile,
  clientReadinessFile,
  scopeProposalFile,
  verticalUseCaseFile,
  jsonOutFile,
  markdownOutFile
}) {
  const statementOfWorkPack = JSON.parse(fs.readFileSync(statementOfWorkFile, "utf8"));
  const clientReadinessPack = JSON.parse(fs.readFileSync(clientReadinessFile, "utf8"));
  const scopeProposalPack = JSON.parse(fs.readFileSync(scopeProposalFile, "utf8"));
  const verticalUseCasePack = JSON.parse(fs.readFileSync(verticalUseCaseFile, "utf8"));
  const pack = buildDecisionOnePager({
    statementOfWorkPack,
    clientReadinessPack,
    scopeProposalPack,
    verticalUseCasePack
  });
  ensureDir(path.dirname(jsonOutFile));
  writeJson(jsonOutFile, pack);
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderDecisionOnePagerMarkdown(pack), "utf8");
  }
  return pack;
}

module.exports = {
  buildDecisionOnePager,
  renderDecisionOnePagerMarkdown,
  writeDecisionOnePager
};
