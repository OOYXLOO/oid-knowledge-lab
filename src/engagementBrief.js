"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir } = require("./net");
const { generatedTimestamp } = require("./time");

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
}

function actionPlanRows(items = []) {
  if (!items.length) return "| - | Confirm inventory scope | 0 | No findings were provided in the sample input. |";
  return items.map((item) => `| ${escapeTable(item.priority)} | ${escapeTable(item.title)} | ${escapeTable(item.count)} | ${escapeTable(item.action || item.rationale || "")} |`).join("\n");
}

function yesNo(value) {
  return value ? "yes" : "no";
}

function renderEngagementBrief({ assetAudit = {}, coverageReport = {}, sourcePolicy = {}, generatedAt = generatedTimestamp() }) {
  const assetSummary = assetAudit.summary || {};
  const coverageSummary = coverageReport.summary || {};
  const boundary = sourcePolicy.collection_boundary || {};
  const sourceUrls = sourcePolicy.source_urls || {};

  return `# OID Inventory Assessment Brief

Generated: \`${generatedAt}\`

This brief describes a scoped OID inventory assessment using public registry indexes, a local client inventory, and a publishable evidence boundary. It is intended as a project starter before a full evidence delivery pack is produced.

## Executive Summary

- Start with a sanitized inventory sample and classify every row as invalid, evidence-ready, or unresolved.
- Use public IANA PEN records, OID-base sitemap URLs, and local-only client notes to separate trusted evidence from owner-review gaps.
- Deliver a correction queue, evidence links, and acceptance checks without publishing raw client inventory or copied OID-base page bodies.

## Best Fit

- SNMP/MIB owner review where enterprise OIDs appear in device telemetry, traps, or vendor exports.
- PKI certificate policy review where policy, algorithm, or assurance OIDs need source evidence.
- Internal OID registry cleanup where inherited spreadsheets contain malformed values, unclear owners, or mixed namespace conventions.

## First Review Call Agenda

1. Confirm the sanitized inventory columns and expected row count.
2. Pick the primary review lane: SNMP/MIB owner review, PKI certificate policy review, or internal OID registry cleanup.
3. Agree on the evidence boundary: public PEN owner, OID-base sitemap URL, internal owner, or correction ticket.
4. Run the sample audit and decide which findings become the first remediation queue.

## Assessment Snapshot

- Asset rows in sample audit: \`${assetSummary.total_assets || 0}\`
- Valid OIDs: \`${assetSummary.valid_oids || 0}\`
- Invalid values: \`${assetSummary.invalid_values || 0}\`
- Evidence-ready assets: \`${assetSummary.evidence_ready_assets || 0}\`
- Unresolved assets: \`${assetSummary.unresolved_assets || 0}\`
- Quality score: \`${assetSummary.quality_score || 0}/100\`
- Public PEN records available: \`${coverageSummary.total_public_pen_records || 0}\`
- OID-base sitemap exact matches: \`${coverageSummary.exact_oidbase_matches || 0}\`
- OID-base sitemap subtree-only matches: \`${coverageSummary.subtree_only_matches || 0}\`

## Client Inputs

- A CSV or tab-delimited OID inventory with an \`oid\` column.
- Optional asset label columns such as \`asset\`, \`name\`, \`id\`, or \`label\`.
- Any internal registry notes needed to classify unmatched but valid OIDs.
- A preferred output format for review handoff: Markdown, JSON, or both.

Client inventory files should stay local. The browser dashboard can audit a list without uploading it to a server.

## Deliverables

- Normalized OID inventory quality summary.
- Invalid OID correction queue.
- Private enterprise number owner mapping where public registry evidence exists.
- OID-base sitemap evidence mapping for exact and subtree matches.
- Unresolved OID queue for internal registry review.
- Final evidence pack with public source links and sanitized findings.

## Acceptance Criteria

- Every input row is classified as invalid, evidence-ready, or unresolved.
- Invalid values include enough detail for correction.
- Known private enterprise arcs include the enterprise root and organization name when public evidence exists.
- OID-base evidence includes source URLs only, not copied page bodies.
- The final handoff excludes credentials, account data, private client inventories, and contact-level registry fields.

## Initial Action Plan

| Priority | Action | Count | Note |
| --- | --- | ---: | --- |
${actionPlanRows(assetAudit.action_plan || [])}

## Source Boundary

- Sitemap source: ${sourceUrls.sitemap || "https://oid-base.com/sitemap.xml"}
- Terms source: ${sourceUrls.terms || "https://oid-base.com/disclaimer.htm.md"}
- Full crawl requires authorization: \`${yesNo(boundary.full_crawl_requires_authorization !== false)}\`
- Page bodies publishable without authorization: \`${yesNo(boundary.page_bodies_publishable_without_authorization === true)}\`

Full OID-base page bodies are outside the default scope. The default package uses sitemap metadata, public IANA PEN data, source hashes, and local-only parser-validation samples.
`;
}

function writeEngagementBrief({ assetAuditFile, coverageReportFile, sourcePolicyFile, markdownOutFile }) {
  const assetAudit = JSON.parse(fs.readFileSync(assetAuditFile, "utf8"));
  const coverageReport = JSON.parse(fs.readFileSync(coverageReportFile, "utf8"));
  const sourcePolicy = JSON.parse(fs.readFileSync(sourcePolicyFile, "utf8"));
  const markdown = renderEngagementBrief({ assetAudit, coverageReport, sourcePolicy });
  ensureDir(path.dirname(markdownOutFile));
  fs.writeFileSync(markdownOutFile, markdown, "utf8");
  return {
    markdown,
    output_file: markdownOutFile
  };
}

module.exports = {
  renderEngagementBrief,
  writeEngagementBrief
};
