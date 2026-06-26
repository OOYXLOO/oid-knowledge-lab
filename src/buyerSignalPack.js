"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");
const { generatedTimestamp } = require("./time");

function row(values) {
  return `| ${values.map((value) => String(value ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

function firstItems(items, fallback, count = 4) {
  const values = Array.isArray(items) ? items.filter(Boolean).slice(0, count) : [];
  return values.length ? values : fallback;
}

function actionTitle(item) {
  if (!item) return "";
  const count = Number(item.count || 0);
  return `${item.priority || "P1"}: ${item.title || "Review OID inventory"}${count ? ` (${count})` : ""}`;
}

function buildBuyerSignalPack({
  assetAudit = {},
  coverageReport = {},
  sourcePolicy = {},
  generatedAt = generatedTimestamp()
} = {}) {
  const summary = assetAudit.summary || {};
  const coverage = coverageReport.summary || {};
  const totalAssets = Number(summary.total_assets || 0);
  const evidenceReady = Number(summary.evidence_ready_assets || 0);
  const unresolved = Number(summary.unresolved_assets || 0);
  const invalid = Number(summary.invalid_values || 0);
  const unknownPrivate = Number(summary.unknown_private_enterprise_oids || 0);
  const qualityScore = Number(summary.quality_score || 0);
  const coverageScore = Number(coverage.coverage_score || 0);
  const fullCrawlRequiresAuth = sourcePolicy.collection_boundary?.full_crawl_requires_authorization !== false;

  return {
    schema_version: "oid-buyer-signal-pack/v1",
    generated_at: generatedAt,
    title: "OID Buyer Signal Pack",
    audience: "technical buyer, DevRel editor, PKI owner, SNMP/MIB owner, or internal registry maintainer",
    buyer_summary: `A sanitized review of ${totalAssets} sanitized OID assets found ${evidenceReady} evidence-ready rows, ${unresolved} unresolved rows, ${invalid} invalid values, and a ${qualityScore}/100 inventory quality score.`,
    buyer_signals: [
      {
        signal: `${unresolved} unresolved OID rows need owner review or registry reconciliation.`,
        why_it_matters: "Unresolved identifiers make certificate policy, MIB, monitoring, or internal registry evidence harder to trust during incidents and audits."
      },
      {
        signal: `${unknownPrivate} unknown private enterprise OIDs need PEN owner mapping.`,
        why_it_matters: "Unknown enterprise arcs can hide vendor ownership gaps, stale documentation, or namespace drift."
      },
      {
        signal: `${invalid} malformed OID values need correction before they can become evidence.`,
        why_it_matters: "Bad syntax is a fast, bounded cleanup item that can be accepted through a re-run check."
      },
      {
        signal: `Public directory coverage score is ${coverageScore}/100 for the current PEN-to-OID-base comparison.`,
        why_it_matters: "Low public coverage creates a concrete reconciliation queue while keeping copied page bodies out of the published package."
      }
    ],
    first_scope_offer: "Run a small sanitized OID inventory assessment: classify each row, preserve public registry evidence, identify unresolved owners, and return a remediation board plus re-run checks.",
    qualifying_questions: [
      "Is the OID list primarily from SNMP/MIB files, certificate policy metadata, monitoring integrations, or an internal registry export?",
      "Can the first sample be shared as CSV or TSV with an `oid` column and sanitized asset labels?",
      "Which unresolved rows should go back to a vendor owner, PKI owner, platform owner, or internal registry maintainer?",
      "Would a remediation CSV, one-page decision summary, or first-call kickoff note be the easiest review format?"
    ],
    subject_lines: [
      "Sanitized OID inventory review with public registry evidence",
      "Small OID cleanup assessment for PKI, MIB, or internal registry teams",
      "Turn unresolved OID rows into an owner-ready remediation board",
      "OID evidence pack: malformed values, owner gaps, and re-run checks"
    ],
    proof_points: firstItems((assetAudit.action_plan || []).map(actionTitle), [
      "P0: Correct invalid OID values",
      "P1: Identify owners for unknown private enterprise arcs",
      "P1: Review unmatched valid OIDs against internal registries",
      "P2: Preserve evidence-ready public registry mappings"
    ], 5),
    boundary_note: fullCrawlRequiresAuth
      ? "The public package uses sitemap metadata and open registry summaries; full OID-base page-body collection remains gated on explicit source-owner authorization."
      : "The public package keeps client inventories, secrets, account exports, and raw private data outside the repository.",
    proof_links: [
      { path: "reports/asset-audit.md", purpose: "Sanitized assessment summary and action plan" },
      { path: "reports/remediation-board.md", purpose: "Owner-ready remediation queue" },
      { path: "reports/decision-one-pager.md", purpose: "Buyer-readable approval summary" },
      { path: "reports/client-kickoff-pack.md", purpose: "Initial reply, intake request, and first-call agenda" },
      { path: "public/sample-assessment.html", purpose: "Browser-readable sample handoff" },
      { path: "public/consulting-brief.html", purpose: "Public assessment brief" }
    ]
  };
}

function renderBuyerSignalMarkdown(pack) {
  const signalRows = pack.buyer_signals.map((item) => row([item.signal, item.why_it_matters])).join("\n");
  const proofRows = pack.proof_links.map((item) => row([item.path, item.purpose])).join("\n");

  return `# ${pack.title}

Generated: \`${pack.generated_at}\`

Audience: ${pack.audience}

## Buyer Summary

${pack.buyer_summary}

## Buyer Signals

| Signal | Why it matters |
| --- | --- |
${signalRows}

## First Scope Offer

${pack.first_scope_offer}

## Qualifying Questions

${pack.qualifying_questions.map((item) => `- ${item}`).join("\n")}

## Subject Lines

${pack.subject_lines.map((item) => `- ${item}`).join("\n")}

## Proof Points

${pack.proof_points.map((item) => `- ${item}`).join("\n")}

## Boundary Note

${pack.boundary_note}

## Proof Links

| Artifact | Purpose |
| --- | --- |
${proofRows}
`;
}

function writeBuyerSignalPack({
  assetAuditFile,
  coverageReportFile,
  sourcePolicyFile,
  jsonOutFile,
  markdownOutFile
}) {
  const assetAudit = JSON.parse(fs.readFileSync(assetAuditFile, "utf8"));
  const coverageReport = JSON.parse(fs.readFileSync(coverageReportFile, "utf8"));
  const sourcePolicy = JSON.parse(fs.readFileSync(sourcePolicyFile, "utf8"));
  const pack = buildBuyerSignalPack({
    assetAudit,
    coverageReport,
    sourcePolicy
  });
  ensureDir(path.dirname(jsonOutFile));
  writeJson(jsonOutFile, pack);
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderBuyerSignalMarkdown(pack), "utf8");
  }
  return pack;
}

module.exports = {
  buildBuyerSignalPack,
  renderBuyerSignalMarkdown,
  writeBuyerSignalPack
};
