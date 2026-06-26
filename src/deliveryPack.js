"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir } = require("./net");
const { generatedTimestamp } = require("./time");

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
}

function actionPlanRows(items = []) {
  if (!items.length) return "| - | No immediate action | 0 | No remediation needed from the current sample. |";
  return items.map((item) => `| ${escapeTable(item.priority)} | ${escapeTable(item.title)} | ${escapeTable(item.count)} | ${escapeTable(item.action || item.rationale)} |`).join("\n");
}

function findingRows(findings = []) {
  const rows = findings.slice(0, 12).map((finding) => `| ${escapeTable(finding.label || finding.organization || finding.oid)} | ${escapeTable(finding.oid)} | ${escapeTable(finding.status)} | ${escapeTable(finding.risk || "")} |`);
  return rows.length ? rows.join("\n") : "| - | - | No findings | - |";
}

function renderDeliveryPack({ assetAudit, coverageReport, generatedAt = generatedTimestamp() }) {
  const assetSummary = assetAudit?.summary || {};
  const coverageSummary = coverageReport?.summary || {};
  const findings = assetAudit?.findings || [];

  return `# OID Asset Evidence Delivery Pack

Generated: \`${generatedAt}\`

This sample delivery pack shows how OID Knowledge Lab turns a local OID inventory into a concise evidence and remediation handoff. It uses public registry indexes and does not require uploading client data.

## Executive Summary

- Asset rows reviewed: \`${assetSummary.total_assets || 0}\`
- Valid OIDs: \`${assetSummary.valid_oids || 0}\`
- Evidence-ready assets: \`${assetSummary.evidence_ready_assets || 0}\`
- Unresolved assets: \`${assetSummary.unresolved_assets || 0}\`
- Quality score: \`${assetSummary.quality_score || 0}/100\`
- OID-base coverage score: \`${coverageSummary.coverage_score || 0}/100\`

## Registry Coverage Context

- Public PEN records: \`${coverageSummary.total_public_pen_records || 0}\`
- Exact OID-base matches: \`${coverageSummary.exact_oidbase_matches || 0}\`
- Subtree-only matches: \`${coverageSummary.subtree_only_matches || 0}\`
- Missing OID-base entries: \`${coverageSummary.missing_oidbase_entries || 0}\`

The current public OID-base sitemap has sparse exact coverage for IANA PEN enterprise roots. That makes source mapping and inventory reconciliation valuable: a clean report can distinguish invalid values, known enterprise arcs, exact public directory evidence, and items that need internal registry review.

## Action Plan

| Priority | Action | Count | Delivery note |
| --- | --- | ---: | --- |
${actionPlanRows(assetAudit?.action_plan || [])}

## Sample Findings

| Asset | OID | Status | Risk |
| --- | --- | --- | --- |
${findingRows(findings)}

## Client data boundary

- Client inventories should be processed locally or in the browser.
- Raw client OID lists should not be committed to the repository.
- Published artifacts should contain only aggregated examples, public registry links, and sanitized findings.
- OID-base page bodies are not copied in this package.

## Suggested Follow-up

1. Normalize malformed OID values.
2. Map private enterprise arcs to an owner or vendor.
3. Preserve exact public evidence links where available.
4. Review unmatched valid OIDs against internal registries.
5. Re-run the audit after cleanup to produce a final evidence pack.
`;
}

function writeDeliveryPack({ assetAuditFile, coverageReportFile, markdownOutFile }) {
  const assetAudit = JSON.parse(fs.readFileSync(assetAuditFile, "utf8"));
  const coverageReport = JSON.parse(fs.readFileSync(coverageReportFile, "utf8"));
  const markdown = renderDeliveryPack({ assetAudit, coverageReport });
  ensureDir(path.dirname(markdownOutFile));
  fs.writeFileSync(markdownOutFile, markdown, "utf8");
  return {
    markdown,
    output_file: markdownOutFile
  };
}

module.exports = {
  renderDeliveryPack,
  writeDeliveryPack
};
