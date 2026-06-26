"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");
const { generatedTimestamp } = require("./time");

function status(ok) {
  return ok ? "ready" : "missing";
}

function check(id, label, ok, evidence) {
  return {
    id,
    label,
    status: status(ok),
    evidence
  };
}

function readinessScore(checks) {
  if (!checks.length) return 0;
  return Math.round((checks.filter((item) => item.status === "ready").length / checks.length) * 100);
}

function buildClientReadinessPack({
  assetAudit = {},
  coverageReport = {},
  sourcePolicy = {},
  intakePack = {},
  generatedAt = generatedTimestamp()
} = {}) {
  const assetSummary = assetAudit.summary || {};
  const coverageSummary = coverageReport.summary || {};
  const boundary = sourcePolicy.collection_boundary || {};
  const checks = [
    check("client-intake", "Client-safe intake request is available", Boolean(intakePack.copy_text && intakePack.sample_csv), "intake request plus sample CSV"),
    check("browser-audit", "Browser-only local audit can produce derived findings", Number(assetSummary.total_assets || 0) > 0, `${assetSummary.total_assets || 0} sample rows reviewed`),
    check("evidence-pack", "Sample evidence delivery pack is represented", Number(assetSummary.evidence_ready_assets || 0) > 0, `${assetSummary.evidence_ready_assets || 0} evidence-ready sample assets`),
    check("remediation-queue", "Remediation queue has action items", Array.isArray(assetAudit.action_plan) && assetAudit.action_plan.length > 0, `${(assetAudit.action_plan || []).length} sample action-plan groups`),
    check("coverage-context", "Public coverage context is available", Number(coverageSummary.total_public_pen_records || 0) > 0, `${coverageSummary.total_public_pen_records || 0} public PEN records`),
    check("source-boundary", "Source boundary excludes OID-base page-body mirroring", boundary.full_crawl_requires_authorization !== false && boundary.page_bodies_publishable_without_authorization !== true, "full page-body crawl requires explicit authorization")
  ];

  return {
    schema_version: "oid-client-readiness-pack/v1",
    generated_at: generatedAt,
    title: "OID Inventory Assessment Client Readiness Pack",
    readiness_score: readinessScore(checks),
    readiness_checks: checks,
    public_artifacts: [
      { path: "public/index.html", purpose: "Browser dashboard and local OID list audit" },
      { path: "public/sample-assessment.html", purpose: "Browser-readable sample assessment handoff" },
      { path: "public/intake-pack.js", purpose: "Downloadable client intake request and sample CSV data" },
      { path: "reports/client-readiness-pack.md", purpose: "This compact review flow and acceptance pack" },
      { path: "reports/sample-engagement-brief.md", purpose: "Scope, inputs, deliverables, and acceptance criteria" },
      { path: "reports/sample-delivery-pack.md", purpose: "Sanitized evidence delivery example" },
      { path: "reports/remediation-board.csv", purpose: "Importable cleanup queue" },
      { path: "reports/source-policy.md", purpose: "Robots, terms, sitemap, and collection boundary receipt" },
      { path: "reports/dataset-manifest.json", purpose: "Artifact hashes, sizes, and publishable data boundary" }
    ],
    review_flow: [
      { step: "Prepare sanitized inventory", output: "Client uses the intake request and sample CSV shape before sharing any OID list." },
      { step: "Run local assessment", output: "Browser or CLI classifies invalid values, public registry evidence, unknown private enterprise arcs, and unresolved valid OIDs." },
      { step: "Review action queue", output: "Remediation CSV and Markdown board identify owner actions and acceptance checks." },
      { step: "Deliver evidence pack", output: "Derived findings and source links are shared without raw client inventories or copied OID-base page bodies." },
      { step: "Re-run after cleanup", output: "The same input format can be audited again to confirm the cleanup result." }
    ],
    acceptance_evidence: [
      "Every input row is classified as invalid, evidence-ready, or unresolved.",
      "Invalid OID values have correction guidance.",
      "Known private enterprise arcs include public PEN owner evidence when available.",
      "OID-base evidence uses sitemap/source URLs only; OID-base page bodies stay out of the published package.",
      "Unresolved valid OIDs are listed as an internal registry review queue.",
      "Final shared artifacts contain derived findings only."
    ],
    excluded_data: [
      "Raw client inventories",
      "credentials, OTPs, cookies, tokens, and private account exports",
      "Payment, tax, KYC, or billing material",
      "OID-base raw Markdown, HTML, or page-body mirrors without source-owner authorization",
      "IANA contact-level JSONL imports"
    ],
    sample_metrics: {
      asset_rows: assetSummary.total_assets || 0,
      quality_score: assetSummary.quality_score || 0,
      evidence_ready_assets: assetSummary.evidence_ready_assets || 0,
      unresolved_assets: assetSummary.unresolved_assets || 0,
      public_pen_records: coverageSummary.total_public_pen_records || 0,
      oidbase_exact_matches: coverageSummary.exact_oidbase_matches || 0,
      oidbase_subtree_only_matches: coverageSummary.subtree_only_matches || 0,
      oidbase_missing_entries: coverageSummary.missing_oidbase_entries || 0,
      oidbase_coverage_score: coverageSummary.coverage_score || 0
    }
  };
}

function row(values) {
  return `| ${values.map((value) => String(value ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

function renderClientReadinessMarkdown(pack) {
  const checkRows = pack.readiness_checks.map((item) => row([
    item.status.toUpperCase(),
    item.label,
    item.evidence
  ])).join("\n");
  const artifactRows = pack.public_artifacts.map((item) => row([
    item.path,
    item.purpose
  ])).join("\n");
  const flowRows = pack.review_flow.map((item) => row([
    item.step,
    item.output
  ])).join("\n");

  return `# ${pack.title}

Generated: \`${pack.generated_at}\`

Readiness score: \`${pack.readiness_score}/100\`

This pack gives reviewers and data owners a compact path through the public OID assessment artifacts. It is designed for sanitized local inventories and derived findings only.

## Readiness Checks

| Status | Check | Evidence |
| --- | --- | --- |
${checkRows}

## Review Flow

| Step | Output |
| --- | --- |
${flowRows}

## Public Artifacts

| Artifact | Purpose |
| --- | --- |
${artifactRows}

## Sample Metrics

- Asset rows: \`${pack.sample_metrics.asset_rows}\`
- Quality score: \`${pack.sample_metrics.quality_score}/100\`
- Evidence-ready assets: \`${pack.sample_metrics.evidence_ready_assets}\`
- Unresolved assets: \`${pack.sample_metrics.unresolved_assets}\`
- Public PEN records: \`${pack.sample_metrics.public_pen_records}\`
- OID-base coverage score: \`${pack.sample_metrics.oidbase_coverage_score}/100\`

## Acceptance Evidence

${pack.acceptance_evidence.map((item) => `- ${item}`).join("\n")}

## Excluded Data

${pack.excluded_data.map((item) => `- ${item}`).join("\n")}

## Operator Note

Use this as the public review map for an OID inventory assessment. OID-base page bodies stay out of the published package unless explicit source-owner authorization exists.
`;
}

function writeClientReadinessPack({
  assetAuditFile,
  coverageReportFile,
  sourcePolicyFile,
  intakePack,
  jsonOutFile,
  markdownOutFile
}) {
  const assetAudit = JSON.parse(fs.readFileSync(assetAuditFile, "utf8"));
  const coverageReport = JSON.parse(fs.readFileSync(coverageReportFile, "utf8"));
  const sourcePolicy = JSON.parse(fs.readFileSync(sourcePolicyFile, "utf8"));
  const pack = buildClientReadinessPack({
    assetAudit,
    coverageReport,
    sourcePolicy,
    intakePack
  });
  ensureDir(path.dirname(jsonOutFile));
  writeJson(jsonOutFile, pack);
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderClientReadinessMarkdown(pack), "utf8");
  }
  return pack;
}

module.exports = {
  buildClientReadinessPack,
  renderClientReadinessMarkdown,
  writeClientReadinessPack
};
