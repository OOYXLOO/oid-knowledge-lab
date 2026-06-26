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
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      fit_score: item.fit_score || 0
    }));
}

function buildScopeProposalPack({
  assetAudit = {},
  coverageReport = {},
  sourcePolicy = {},
  clientReadinessPack = {},
  verticalUseCasePack = {},
  generatedAt = generatedTimestamp()
} = {}) {
  const assetSummary = assetAudit.summary || {};
  const coverageSummary = coverageReport.summary || {};
  const boundary = sourcePolicy.collection_boundary || {};
  const actionPlan = assetAudit.action_plan || [];
  const evidenceReady = Number(assetSummary.evidence_ready_assets || 0);
  const unresolved = Number(assetSummary.unresolved_assets || 0);
  const invalidValues = Number(assetSummary.invalid_values || 0);

  return {
    schema_version: "oid-scope-proposal-pack/v1",
    generated_at: generatedAt,
    title: "OID Inventory Assessment Scope Proposal Pack",
    recommended_scope: "Start with a sanitized OID inventory sample, classify every row, and produce a compact remediation queue before any broader registry cleanup.",
    decision_summary: [
      `Sample rows reviewed: ${assetSummary.total_assets || 0}`,
      `Evidence-ready rows: ${evidenceReady}`,
      `Unresolved rows: ${unresolved}`,
      `Invalid values: ${invalidValues}`,
      `Client readiness score: ${clientReadinessPack.readiness_score || 0}/100`,
      `Public PEN records available: ${coverageSummary.total_public_pen_records || 0}`
    ],
    first_48_hours: [
      {
        step: "Confirm sanitized inventory shape",
        output: "CSV or tab-delimited input with an oid column and safe asset labels."
      },
      {
        step: "Run local assessment",
        output: "Classify invalid values, known public PEN ownership, OID-base sitemap matches, and unresolved valid OIDs."
      },
      {
        step: "Review action queue",
        output: `${actionPlan.length || 0} action-plan groups become a scoped remediation board with owner actions.`
      },
      {
        step: "Approve handoff boundary",
        output: "Share derived findings and public source links only; raw inventories and copied page bodies remain outside the package."
      }
    ],
    client_inputs: [
      "A CSV or tab-delimited OID inventory with an `oid` column.",
      "Safe asset labels such as device, certificate profile, service, spreadsheet row, or internal registry id.",
      "Internal owner notes only for unresolved OIDs that need organization-specific review.",
      "Confirmation of the preferred review lane: SNMP/MIB, PKI policy, or internal registry cleanup."
    ],
    acceptance_criteria: [
      "Every input row is classified as invalid, evidence-ready, or unresolved.",
      "Invalid OID values include correction guidance.",
      "Known private enterprise arcs include public PEN owner evidence when available.",
      "OID-base evidence is represented as sitemap/source URLs; OID-base page bodies stay out of the published package.",
      "The final remediation queue lists owner actions and re-run checks."
    ],
    out_of_scope: [
      "credentials, OTPs, cookies, tokens, private account exports, and production secrets",
      "payment, tax, KYC, or billing material",
      "raw client inventories in public repositories",
      "OID-base raw Markdown, HTML, or page-body mirrors without source-owner authorization",
      "open-ended enterprise architecture review beyond the agreed OID inventory sample"
    ],
    best_fit_lanes: topUseCases(verticalUseCasePack),
    public_artifacts: [
      { path: "reports/scope-proposal-pack.md", purpose: "Client-facing scope, first-48-hour plan, inputs, acceptance, and exclusions" },
      { path: "reports/client-readiness-pack.md", purpose: "Readiness checks and review flow" },
      { path: "reports/vertical-use-case-pack.md", purpose: "Use-case fit by review lane" },
      { path: "reports/sample-engagement-brief.md", purpose: "Detailed brief for the assessment" },
      { path: "reports/remediation-board.csv", purpose: "Importable cleanup queue sample" },
      { path: "reports/source-policy.md", purpose: "Source boundary receipt" }
    ],
    source_boundary: {
      full_crawl_requires_authorization: boundary.full_crawl_requires_authorization !== false,
      page_bodies_publishable_without_authorization: boundary.page_bodies_publishable_without_authorization === true
    }
  };
}

function renderScopeProposalMarkdown(pack) {
  const lanes = pack.best_fit_lanes.length
    ? pack.best_fit_lanes.map((item) => row([item.title, `${item.fit_score}/100`])).join("\n")
    : row(["Confirm review lane", "-"]);
  const artifacts = pack.public_artifacts.map((item) => row([item.path, item.purpose])).join("\n");
  const first48 = pack.first_48_hours.map((item) => row([item.step, item.output])).join("\n");

  return `# ${pack.title}

Generated: \`${pack.generated_at}\`

This pack turns the public OID assessment artifacts into a small, reviewable first scope. It is designed for client-safe inventory samples and derived findings only.

## Recommended Scope

${pack.recommended_scope}

## Decision Summary

${pack.decision_summary.map((item) => `- ${item}`).join("\n")}

## First 48 Hours

| Step | Output |
| --- | --- |
${first48}

## Best Fit Lanes

| Lane | Fit |
| --- | ---: |
${lanes}

## Client Inputs

${pack.client_inputs.map((item) => `- ${item}`).join("\n")}

## Acceptance Criteria

${pack.acceptance_criteria.map((item) => `- ${item}`).join("\n")}

## Public Artifacts

| Artifact | Purpose |
| --- | --- |
${artifacts}

## Out of Scope

${pack.out_of_scope.map((item) => `- ${item}`).join("\n")}

## Source Boundary

- Full crawl requires authorization: \`${pack.source_boundary.full_crawl_requires_authorization ? "yes" : "no"}\`
- Page bodies publishable without authorization: \`${pack.source_boundary.page_bodies_publishable_without_authorization ? "yes" : "no"}\`

OID-base page bodies stay out of the default package unless explicit source-owner authorization exists.
`;
}

function writeScopeProposalPack({
  assetAuditFile,
  coverageReportFile,
  sourcePolicyFile,
  clientReadinessFile,
  verticalUseCaseFile,
  jsonOutFile,
  markdownOutFile
}) {
  const assetAudit = JSON.parse(fs.readFileSync(assetAuditFile, "utf8"));
  const coverageReport = JSON.parse(fs.readFileSync(coverageReportFile, "utf8"));
  const sourcePolicy = JSON.parse(fs.readFileSync(sourcePolicyFile, "utf8"));
  const clientReadinessPack = JSON.parse(fs.readFileSync(clientReadinessFile, "utf8"));
  const verticalUseCasePack = JSON.parse(fs.readFileSync(verticalUseCaseFile, "utf8"));
  const pack = buildScopeProposalPack({
    assetAudit,
    coverageReport,
    sourcePolicy,
    clientReadinessPack,
    verticalUseCasePack
  });
  ensureDir(path.dirname(jsonOutFile));
  writeJson(jsonOutFile, pack);
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderScopeProposalMarkdown(pack), "utf8");
  }
  return pack;
}

module.exports = {
  buildScopeProposalPack,
  renderScopeProposalMarkdown,
  writeScopeProposalPack
};
