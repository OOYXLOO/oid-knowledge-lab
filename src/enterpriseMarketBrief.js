"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");
const { generatedTimestamp } = require("./time");

const HIGH_VALUE_TERMS = [
  "bank",
  "capital",
  "certificate",
  "cloud",
  "cyber",
  "defense",
  "finance",
  "health",
  "hospital",
  "identity",
  "insurance",
  "network",
  "security",
  "telecom",
  "trust"
];

function readJsonl(file) {
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function normalizeText(value) {
  return String(value || "").trim();
}

function classifyOrganization(record) {
  const haystack = [
    record.organization,
    record.contact,
    record.email_obfuscated,
    ...(record.notes || [])
  ].join(" ").toLowerCase();
  return HIGH_VALUE_TERMS.filter((term) => haystack.includes(term));
}

function contactDomain(value) {
  const text = normalizeText(value).toLowerCase();
  if (!text || text === "---none---") return "none";
  const marker = text.includes("&") ? "&" : "@";
  const index = text.lastIndexOf(marker);
  if (index === -1 || index + 1 >= text.length) return "unknown";
  return text.slice(index + 1).replace(/[^a-z0-9.-]/g, "") || "unknown";
}

function scoreRecord(record) {
  const tags = classifyOrganization(record);
  const hasContact = normalizeText(record.contact) && normalizeText(record.email_obfuscated) && record.email_obfuscated !== "---none---";
  const hasNotes = Array.isArray(record.notes) && record.notes.length > 0;
  const organization = normalizeText(record.organization);
  let score = tags.length * 18;
  if (hasContact) score += 22;
  if (hasNotes) score += 8;
  if (/\b(inc|corp|ltd|llc|gmbh|plc|university|hospital|bank)\b/i.test(organization)) score += 8;
  return Math.min(score, 100);
}

function topCounts(items, getKey, limit = 10) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function buildEnterpriseMarketBrief(records, {
  generatedAt = generatedTimestamp(),
  limit = 40
} = {}) {
  const assigned = records.filter((record) => normalizeText(record.organization).toLowerCase() !== "reserved");
  const scored = assigned
    .map((record) => ({
      enterprise_number: record.enterprise_number,
      oid: record.oid,
      organization: normalizeText(record.organization),
      contact_domain: contactDomain(record.email_obfuscated),
      signal_tags: classifyOrganization(record),
      score: scoreRecord(record)
    }))
    .filter((record) => record.score >= 20 && record.signal_tags.length > 0)
    .sort((a, b) => b.score - a.score || a.enterprise_number - b.enterprise_number);

  const tagRows = [];
  for (const record of scored) {
    for (const tag of record.signal_tags) tagRows.push({ tag, record });
  }

  return {
    schema_version: "oid-enterprise-market-brief/v1",
    generated_at: generatedAt,
    source: "IANA Private Enterprise Numbers public registry",
    summary: {
      assigned_enterprises: assigned.length,
      high_signal_enterprises: scored.length,
      exported_leads: Math.min(limit, scored.length),
      scoring_note: "Scores favor public enterprise entries with high-value OID/SNMP/PKI buyer terms and usable contact-domain hints."
    },
    high_value_terms: HIGH_VALUE_TERMS,
    top_signal_tags: topCounts(tagRows, (item) => item.tag, 12),
    top_contact_domains: topCounts(scored, (record) => record.contact_domain, 12),
    application_angles: [
      "Technical article: explain why PEN/OID ownership drift matters for SNMP, PKI policy OIDs, and vendor integrations.",
      "Consulting pilot: offer a sanitized OID inventory review against public PEN ownership signals.",
      "Data product: provide a ranked lead sheet for registry cleanup, certificate policy review, or monitoring namespace audits."
    ],
    lead_rows: scored.slice(0, limit)
  };
}

function row(values) {
  return `| ${values.map((value) => String(value ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

function renderEnterpriseMarketBriefMarkdown(brief) {
  const tagRows = brief.top_signal_tags.map((item) => row([item.key, item.count])).join("\n");
  const domainRows = brief.top_contact_domains.map((item) => row([item.key, item.count])).join("\n");
  const leadRows = brief.lead_rows.slice(0, 25).map((item) => row([
    item.score,
    item.oid,
    item.organization,
    item.signal_tags.join(", "),
    item.contact_domain
  ])).join("\n");

  return `# OID Enterprise Market Brief

Generated: \`${brief.generated_at}\`

Source: ${brief.source}

## Summary

- Assigned enterprises: ${brief.summary.assigned_enterprises}
- High-signal enterprises: ${brief.summary.high_signal_enterprises}
- Exported leads: ${brief.summary.exported_leads}
- Scoring note: ${brief.summary.scoring_note}

## Application Angles

${brief.application_angles.map((item) => `- ${item}`).join("\n")}

## Top Signal Tags

| Tag | Count |
| --- | --- |
${tagRows}

## Top Contact Domains

| Domain | Count |
| --- | --- |
${domainRows}

## Lead Rows

| Score | OID | Organization | Tags | Contact domain |
| --- | --- | --- | --- | --- |
${leadRows}
`;
}

function renderEnterpriseMarketBriefCsv(brief) {
  const header = ["score", "enterprise_number", "oid", "organization", "signal_tags", "contact_domain"];
  const lines = [header.join(",")];
  for (const item of brief.lead_rows) {
    lines.push([
      item.score,
      item.enterprise_number,
      item.oid,
      item.organization,
      item.signal_tags.join(";"),
      item.contact_domain
    ].map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function writeEnterpriseMarketBrief({
  recordsFile,
  jsonOutFile,
  markdownOutFile,
  csvOutFile,
  generatedAt,
  limit
}) {
  const records = readJsonl(recordsFile);
  const brief = buildEnterpriseMarketBrief(records, { generatedAt, limit });
  ensureDir(path.dirname(jsonOutFile));
  writeJson(jsonOutFile, brief);
  fs.writeFileSync(markdownOutFile, renderEnterpriseMarketBriefMarkdown(brief), "utf8");
  fs.writeFileSync(csvOutFile, renderEnterpriseMarketBriefCsv(brief), "utf8");
  return brief;
}

module.exports = {
  buildEnterpriseMarketBrief,
  renderEnterpriseMarketBriefCsv,
  renderEnterpriseMarketBriefMarkdown,
  writeEnterpriseMarketBrief
};
