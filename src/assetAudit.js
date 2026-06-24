"use strict";

const fs = require("fs");
const path = require("path");

const PRIVATE_ENTERPRISE_PREFIX = "1.3.6.1.4.1";
const OID_PATTERN = /^(?:0|1|2)(?:\.\d+)*$/;

function splitRow(line) {
  if (line.includes("\t")) return line.split("\t").map((part) => part.trim());
  return line.split(",").map((part) => part.trim());
}

function looksLikeHeader(parts) {
  return parts.some((part) => ["oid", "object_identifier", "object identifier"].includes(part.toLowerCase()));
}

function parseAssetRows(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (lines.length === 0) return [];

  let headers = null;
  let startIndex = 0;
  const firstParts = splitRow(lines[0]);
  if (firstParts.length > 1 && looksLikeHeader(firstParts)) {
    headers = firstParts.map((part) => part.toLowerCase());
    startIndex = 1;
  }

  return lines.slice(startIndex).map((line, index) => {
    const parts = splitRow(line);
    const oidIndex = headers ? headers.findIndex((header) => header === "oid" || header === "object_identifier" || header === "object identifier") : (parts.length > 1 ? 1 : 0);
    const labelIndex = headers ? headers.findIndex((header) => ["asset", "name", "id", "label"].includes(header)) : (parts.length > 1 ? 0 : -1);
    const rawOid = parts[oidIndex] || line;
    const label = labelIndex >= 0 ? parts[labelIndex] : `asset-${index + 1}`;
    return {
      label: label || `asset-${index + 1}`,
      oid: rawOid,
      line: line
    };
  });
}

function buildPenMap(penIndex = []) {
  const map = new Map();
  for (const record of penIndex || []) {
    if (Number.isFinite(Number(record.number))) map.set(Number(record.number), record);
  }
  return map;
}

function buildOidBaseMap(oidBaseIndex = {}) {
  const entries = Array.isArray(oidBaseIndex) ? oidBaseIndex : (oidBaseIndex.entries || []);
  const map = new Map();
  for (const entry of entries) {
    if (entry && entry.oid) map.set(String(entry.oid), entry);
  }
  return map;
}

function privateEnterpriseNumber(oid) {
  const prefix = `${PRIVATE_ENTERPRISE_PREFIX}.`;
  if (!String(oid).startsWith(prefix)) return null;
  const number = String(oid).slice(prefix.length).split(".")[0];
  return /^\d+$/.test(number) ? Number(number) : null;
}

function qualityScore(summary) {
  let score = 100;
  score -= summary.invalid_values * 15;
  score -= summary.unknown_private_enterprise_oids * 10;
  score -= summary.valid_oid_unmatched * 7;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildRecommendations(summary) {
  const recommendations = [];
  if (summary.invalid_values > 0) {
    recommendations.push(`Normalize or remove ${summary.invalid_values} invalid OID value(s) before publishing an asset inventory.`);
  }
  if (summary.private_enterprise_oids > summary.known_enterprises) {
    recommendations.push("Map unknown private enterprise OIDs to an enterprise owner before relying on them in compliance evidence.");
  }
  if (summary.valid_oids > summary.oidbase_directory_matches) {
    recommendations.push("Review OIDs without an OID-base sitemap match; they may be internal arcs, stale values, or require another registry source.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Asset OID inventory is consistent with the available public indexes.");
  }
  return recommendations;
}

function buildActionPlan(summary) {
  const plan = [];
  if (summary.invalid_values > 0) {
    plan.push({
      priority: "P0",
      title: "Correct invalid OID values",
      count: summary.invalid_values,
      action: "Fix malformed values before using the inventory as audit or integration evidence."
    });
  }
  if (summary.unknown_private_enterprise_oids > 0) {
    plan.push({
      priority: "P1",
      title: "Identify owners for unknown private enterprise arcs",
      count: summary.unknown_private_enterprise_oids,
      action: "Map the enterprise number to a vendor, customer, or internal registration record."
    });
  }
  if (summary.valid_oid_unmatched > 0) {
    plan.push({
      priority: "P1",
      title: "Review unmatched valid OIDs against internal registries",
      count: summary.valid_oid_unmatched,
      action: "Confirm whether each unmatched OID is internal, deprecated, or covered by a registry not present in this package."
    });
  }
  if (summary.evidence_ready_assets > 0) {
    plan.push({
      priority: "P2",
      title: "Preserve evidence-ready public registry mappings",
      count: summary.evidence_ready_assets,
      action: "Keep source URLs and enterprise mappings with the asset record for future review."
    });
  }
  return plan;
}

function analyzeAssetText(text, options = {}) {
  const rows = parseAssetRows(text);
  const penMap = buildPenMap(options.penIndex);
  const oidBaseMap = buildOidBaseMap(options.oidBaseIndex);

  const findings = rows.map((row, index) => {
    const oid = String(row.oid || "").trim();
    const valid = OID_PATTERN.test(oid);
    if (!valid) {
      return {
        index: index + 1,
        label: row.label,
        oid,
        status: "invalid_value",
        risk: "high",
        issue: "Value is not a syntactically valid numeric OID."
      };
    }

    const enterpriseNumber = privateEnterpriseNumber(oid);
    const enterprise = enterpriseNumber == null ? null : penMap.get(enterpriseNumber) || null;
    const oidbaseMatch = oidBaseMap.get(oid) || null;
    const status = oidbaseMatch
      ? "oidbase_directory_match"
      : enterprise
        ? "known_private_enterprise_oid"
        : enterpriseNumber == null
          ? "valid_oid_unmatched"
          : "unknown_private_enterprise_oid";

    return {
      index: index + 1,
      label: row.label,
      oid,
      status,
      risk: status === "unknown_private_enterprise_oid" ? "medium" : "low",
      enterprise: enterprise ? {
        number: enterprise.number,
        oid: enterprise.oid,
        organization: enterprise.organization
      } : null,
      oidbase_match: oidbaseMatch ? {
        oid: oidbaseMatch.oid,
        source_url: oidbaseMatch.source_url,
        sitemap_lastmod: oidbaseMatch.sitemap_lastmod || null,
        root_arc: oidbaseMatch.root_arc || null,
        depth: oidbaseMatch.depth || null
      } : null
    };
  });

  const summary = {
    generated_at: options.generatedAt || new Date().toISOString(),
    total_assets: findings.length,
    valid_oids: findings.filter((finding) => finding.status !== "invalid_value").length,
    invalid_values: findings.filter((finding) => finding.status === "invalid_value").length,
    private_enterprise_oids: findings.filter((finding) => privateEnterpriseNumber(finding.oid) != null).length,
    known_enterprises: findings.filter((finding) => finding.enterprise).length,
    oidbase_directory_matches: findings.filter((finding) => finding.oidbase_match).length,
    unknown_private_enterprise_oids: findings.filter((finding) => finding.status === "unknown_private_enterprise_oid").length,
    valid_oid_unmatched: findings.filter((finding) => finding.status === "valid_oid_unmatched").length,
    evidence_ready_assets: findings.filter((finding) => finding.enterprise || finding.oidbase_match).length,
    unresolved_assets: findings.filter((finding) => ["invalid_value", "unknown_private_enterprise_oid", "valid_oid_unmatched"].includes(finding.status)).length,
    high_risk_findings: findings.filter((finding) => finding.risk === "high").length,
    medium_risk_findings: findings.filter((finding) => finding.risk === "medium").length
  };
  summary.quality_score = qualityScore(summary);

  return {
    generated_at: summary.generated_at,
    source_kind: "user supplied OID asset list",
    summary,
    findings,
    recommendations: buildRecommendations(summary),
    action_plan: buildActionPlan(summary)
  };
}

function renderAssetAuditMarkdown(audit) {
  const rows = (audit.findings || []).map((finding) => [
    finding.index,
    finding.label,
    finding.oid,
    finding.status,
    finding.enterprise ? finding.enterprise.organization : "",
    finding.oidbase_match ? finding.oidbase_match.source_url : "",
    finding.risk
  ].map((value) => String(value ?? "").replace(/\|/g, "\\|")));
  const actionRows = (audit.action_plan || []).map((item) => [
    item.priority,
    item.title,
    item.count,
    item.action
  ].map((value) => String(value ?? "").replace(/\|/g, "\\|")));

  return `# OID Asset Audit

Generated at: ${audit.generated_at}

## Summary

- Total assets: ${audit.summary.total_assets}
- Valid OIDs: ${audit.summary.valid_oids}
- Invalid values: ${audit.summary.invalid_values}
- Private enterprise OIDs: ${audit.summary.private_enterprise_oids}
- Known enterprises: ${audit.summary.known_enterprises}
- OID-base directory matches: ${audit.summary.oidbase_directory_matches}
- Evidence-ready assets: ${audit.summary.evidence_ready_assets}
- Unresolved assets: ${audit.summary.unresolved_assets}
- Quality score: ${audit.summary.quality_score}/100

## Action Plan

| Priority | Action | Count | Operator note |
|---|---|---:|---|
${actionRows.map((row) => `| ${row.join(" | ")} |`).join("\n")}

## Recommendations

${audit.recommendations.map((item) => `- ${item}`).join("\n")}

## Findings

| # | Asset | OID | Status | Enterprise | OID-base source | Risk |
|---|---|---|---|---|---|---|
${rows.map((row) => `| ${row.join(" | ")} |`).join("\n")}
`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function auditAssetFile({ inputFile, penIndexFile, oidBaseIndexFile, jsonOutFile, markdownOutFile }) {
  const input = fs.readFileSync(inputFile, "utf8");
  const audit = analyzeAssetText(input, {
    penIndex: readJson(penIndexFile),
    oidBaseIndex: readJson(oidBaseIndexFile)
  });
  if (jsonOutFile) {
    fs.mkdirSync(path.dirname(jsonOutFile), { recursive: true });
    fs.writeFileSync(jsonOutFile, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
  }
  if (markdownOutFile) {
    fs.mkdirSync(path.dirname(markdownOutFile), { recursive: true });
    fs.writeFileSync(markdownOutFile, renderAssetAuditMarkdown(audit), "utf8");
  }
  return audit;
}

module.exports = {
  analyzeAssetText,
  auditAssetFile,
  parseAssetRows,
  privateEnterpriseNumber,
  renderAssetAuditMarkdown
};
