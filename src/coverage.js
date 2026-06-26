"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");
const { generatedTimestamp } = require("./time");

const PEN_PREFIX = "1.3.6.1.4.1";

function enterpriseNumberFromOid(oid) {
  const text = String(oid || "");
  const prefix = `${PEN_PREFIX}.`;
  if (!text.startsWith(prefix)) return null;
  const segment = text.slice(prefix.length).split(".")[0];
  if (!/^\d+$/.test(segment)) return null;
  return Number(segment);
}

function buildOidBaseEnterpriseMap(entries) {
  const exact = new Map();
  const childCounts = new Map();
  const childSamples = new Map();

  for (const entry of entries || []) {
    const number = enterpriseNumberFromOid(entry.oid);
    if (number == null) continue;
    const baseOid = `${PEN_PREFIX}.${number}`;
    if (entry.oid === baseOid) {
      exact.set(number, entry);
      continue;
    }
    childCounts.set(number, (childCounts.get(number) || 0) + 1);
    if (!childSamples.has(number)) childSamples.set(number, []);
    if (childSamples.get(number).length < 3) childSamples.get(number).push(entry);
  }

  return { exact, childCounts, childSamples };
}

function statusForRecord(record, enterpriseMap) {
  const number = Number(record.number ?? record.enterprise_number);
  const exactEntry = enterpriseMap.exact.get(number) || null;
  const matchingChildCount = enterpriseMap.childCounts.get(number) || 0;
  if (exactEntry) return { status: "exact_oidbase_match", exactEntry, matchingChildCount };
  if (matchingChildCount > 0) return { status: "subtree_only_match", exactEntry: null, matchingChildCount };
  return { status: "missing_oidbase_entry", exactEntry: null, matchingChildCount: 0 };
}

function statusPriority(status) {
  return {
    missing_oidbase_entry: 0,
    exact_oidbase_match: 1,
    subtree_only_match: 2
  }[status] ?? 9;
}

function analyzeCoverage({ penIndex, oidBaseIndex, generatedAt = generatedTimestamp() }) {
  const records = Array.isArray(penIndex) ? penIndex : [];
  const entries = Array.isArray(oidBaseIndex?.entries) ? oidBaseIndex.entries : [];
  const enterpriseMap = buildOidBaseEnterpriseMap(entries);
  const findings = records.map((record) => {
    const number = Number(record.number ?? record.enterprise_number);
    const status = statusForRecord(record, enterpriseMap);
    const childSamples = enterpriseMap.childSamples.get(number) || [];
    return {
      number,
      oid: record.oid,
      organization: record.organization,
      status: status.status,
      oidbase_source_url: status.exactEntry ? status.exactEntry.source_url : null,
      oidbase_sitemap_lastmod: status.exactEntry ? status.exactEntry.sitemap_lastmod : null,
      matching_child_count: status.matchingChildCount,
      child_samples: childSamples.map((entry) => ({
        oid: entry.oid,
        source_url: entry.source_url,
        sitemap_lastmod: entry.sitemap_lastmod
      }))
    };
  }).sort((a, b) => statusPriority(a.status) - statusPriority(b.status) || a.number - b.number);

  const exactMatches = findings.filter((item) => item.status === "exact_oidbase_match").length;
  const subtreeOnly = findings.filter((item) => item.status === "subtree_only_match").length;
  const missing = findings.filter((item) => item.status === "missing_oidbase_entry").length;
  const covered = exactMatches + subtreeOnly;
  const coverageScore = records.length ? Math.round((covered / records.length) * 100) : 0;

  return {
    generated_at: generatedAt,
    source_boundary: "Compares public IANA PEN index records with OID-base sitemap metadata only; no OID-base page bodies are copied.",
    summary: {
      total_public_pen_records: records.length,
      oidbase_enterprise_arcs_seen: enterpriseMap.exact.size + [...enterpriseMap.childCounts.keys()].filter((number) => !enterpriseMap.exact.has(number)).length,
      exact_oidbase_matches: exactMatches,
      subtree_only_matches: subtreeOnly,
      missing_oidbase_entries: missing,
      coverage_score: coverageScore
    },
    action_plan: [
      {
        priority: "P1",
        title: "Review public PEN records missing from OID-base directory",
        count: missing,
        rationale: "Missing public directory evidence can produce weak OID asset inventories and should be reconciled against source registries before customer-facing reports."
      },
      {
        priority: "P2",
        title: "Check subtree-only enterprise arcs for missing parent registration evidence",
        count: subtreeOnly,
        rationale: "A child OID without an exact enterprise parent page may still be useful, but it needs clearer evidence in audit reports."
      },
      {
        priority: "P3",
        title: "Preserve exact OID-base evidence mappings",
        count: exactMatches,
        rationale: "Exact public source mappings are the cleanest evidence to retain in customer OID inventories."
      }
    ],
    findings
  };
}

function renderCoverageMarkdown(report) {
  const rows = (report.findings || []).slice(0, 50).map((finding) => [
    finding.status,
    finding.number,
    finding.oid,
    finding.organization,
    finding.matching_child_count,
    finding.oidbase_source_url || ""
  ]);

  return `# OID Coverage Report

Generated: \`${report.generated_at}\`

${report.source_boundary}

## Summary

- Public PEN records: \`${report.summary.total_public_pen_records}\`
- Exact OID-base matches: \`${report.summary.exact_oidbase_matches}\`
- Subtree-only matches: \`${report.summary.subtree_only_matches}\`
- Missing OID-base entries: \`${report.summary.missing_oidbase_entries}\`
- Coverage score: \`${report.summary.coverage_score}/100\`

## Action Plan

${report.action_plan.map((item) => `- ${item.priority}: ${item.title} (${item.count}) - ${item.rationale}`).join("\n")}

## First Findings

| Status | PEN | OID | Organization | Child matches | Source |
| --- | ---: | --- | --- | ---: | --- |
${rows.map((row) => `| ${row.map((value) => String(value).replace(/\|/g, "\\|")).join(" | ")} |`).join("\n")}
`;
}

function writeCoverageReport({ penIndexFile, oidBaseIndexFile, jsonOutFile, markdownOutFile }) {
  const penIndex = JSON.parse(fs.readFileSync(penIndexFile, "utf8"));
  const oidBaseIndex = JSON.parse(fs.readFileSync(oidBaseIndexFile, "utf8"));
  const report = analyzeCoverage({ penIndex, oidBaseIndex });
  ensureDir(path.dirname(jsonOutFile));
  writeJson(jsonOutFile, report);
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderCoverageMarkdown(report), "utf8");
  }
  return report;
}

module.exports = {
  analyzeCoverage,
  enterpriseNumberFromOid,
  renderCoverageMarkdown,
  writeCoverageReport
};
