"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");

function row(values) {
  return `| ${values.map((value) => String(value ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

function topUseCases(verticalUseCasePack = {}) {
  return (verticalUseCasePack.use_cases || [])
    .slice()
    .sort((a, b) => Number(b.fit_score || 0) - Number(a.fit_score || 0))
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      fit_score: item.fit_score || 0
    }));
}

function buildStatementOfWorkPack({
  scopeProposalPack = {},
  clientReadinessPack = {},
  verticalUseCasePack = {},
  generatedAt = new Date().toISOString()
} = {}) {
  return {
    schema_version: "oid-statement-of-work-pack/v1",
    generated_at: generatedAt,
    title: "OID Inventory Assessment Statement of Work Pack",
    objective: scopeProposalPack.recommended_scope ||
      "Review a sanitized OID inventory sample, classify every row, and produce a compact remediation queue with public-source evidence boundaries.",
    schedule: [
      { phase: "Kickoff", output: "Confirm safe inventory shape, review lane, and excluded data." },
      ...(scopeProposalPack.first_48_hours || []).map((item) => ({
        phase: item.step,
        output: item.output
      })),
      { phase: "Final handoff", output: "Deliver the assessment summary, remediation queue, source-boundary receipt, and re-run notes." }
    ],
    deliverables: [
      "OID assessment summary with counts, quality score, and prioritized action groups.",
      "Remediation queue suitable for spreadsheet or issue-tracker import.",
      "Public-source evidence map using IANA PEN records and OID-base sitemap URLs.",
      "Client-safe handoff notes covering exclusions, re-run checks, and unresolved owner questions."
    ],
    client_responsibilities: [
      "Provide a sanitized CSV or tab-delimited OID inventory with an `oid` column.",
      "Use safe asset labels and remove credentials, account exports, customer records, and private correspondence.",
      "Choose the primary review lane before kickoff: SNMP/MIB, PKI policy, or internal registry cleanup.",
      "Assign an internal reviewer for unresolved OIDs that need organization-specific ownership checks."
    ],
    acceptance_checklist: (scopeProposalPack.acceptance_criteria || []).concat([
      "The handoff includes a source boundary note that excludes raw inventories and copied page bodies.",
      "Each unresolved OID has a next action or internal owner-review question."
    ]),
    change_control: [
      "Inventory size, new data sources, live system access, account exports, or additional review lanes require separate approval.",
      "Full OID-base page-body collection requires explicit source-owner authorization before it enters any workflow.",
      "Private credentials, tokens, cookies, payment data, and KYC material are not accepted as project inputs."
    ],
    out_of_scope: scopeProposalPack.out_of_scope || [
      "credentials, OTPs, cookies, tokens, private account exports, and production secrets",
      "payment, tax, KYC, or billing material",
      "raw client inventories in public repositories",
      "OID-base raw Markdown, HTML, or page-body mirrors without source-owner authorization"
    ],
    readiness_score: clientReadinessPack.readiness_score || 0,
    review_lanes: topUseCases(verticalUseCasePack),
    public_artifacts: [
      { path: "reports/statement-of-work-pack.md", purpose: "Statement of work, responsibilities, acceptance, and change-control boundary" },
      { path: "reports/scope-proposal-pack.md", purpose: "First scope, client inputs, first-48-hour plan, and exclusions" },
      { path: "reports/client-readiness-pack.md", purpose: "Readiness checks and review flow" },
      { path: "reports/sample-delivery-pack.md", purpose: "Example assessment delivery shape" },
      { path: "reports/remediation-board.csv", purpose: "Importable cleanup queue sample" },
      { path: "reports/source-policy.md", purpose: "Source boundary receipt" }
    ]
  };
}

function renderStatementOfWorkMarkdown(pack) {
  const scheduleRows = pack.schedule.map((item) => row([item.phase, item.output])).join("\n");
  const laneRows = pack.review_lanes.length
    ? pack.review_lanes.map((item) => row([item.title, `${item.fit_score}/100`])).join("\n")
    : row(["Confirm review lane", "-"]);
  const artifactRows = pack.public_artifacts.map((item) => row([item.path, item.purpose])).join("\n");

  return `# ${pack.title}

Generated: \`${pack.generated_at}\`

This pack converts the scope proposal into a reviewable work boundary. It is designed for sanitized OID inventories and derived findings only.

## Objective

${pack.objective}

## Schedule

| Phase | Output |
| --- | --- |
${scheduleRows}

## Deliverables

${pack.deliverables.map((item) => `- ${item}`).join("\n")}

## Client Responsibilities

${pack.client_responsibilities.map((item) => `- ${item}`).join("\n")}

## Acceptance Checklist

${pack.acceptance_checklist.map((item) => `- ${item}`).join("\n")}

## Review Lanes

| Lane | Fit |
| --- | ---: |
${laneRows}

## Public Artifacts

| Artifact | Purpose |
| --- | --- |
${artifactRows}

## Change Control

${pack.change_control.map((item) => `- ${item}`).join("\n")}

## Out of Scope

${pack.out_of_scope.map((item) => `- ${item}`).join("\n")}
`;
}

function writeStatementOfWorkPack({
  scopeProposalFile,
  clientReadinessFile,
  verticalUseCaseFile,
  jsonOutFile,
  markdownOutFile
}) {
  const scopeProposalPack = JSON.parse(fs.readFileSync(scopeProposalFile, "utf8"));
  const clientReadinessPack = JSON.parse(fs.readFileSync(clientReadinessFile, "utf8"));
  const verticalUseCasePack = JSON.parse(fs.readFileSync(verticalUseCaseFile, "utf8"));
  const pack = buildStatementOfWorkPack({
    scopeProposalPack,
    clientReadinessPack,
    verticalUseCasePack
  });
  ensureDir(path.dirname(jsonOutFile));
  writeJson(jsonOutFile, pack);
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderStatementOfWorkMarkdown(pack), "utf8");
  }
  return pack;
}

module.exports = {
  buildStatementOfWorkPack,
  renderStatementOfWorkMarkdown,
  writeStatementOfWorkPack
};
