"use strict";

const IANA_PEN_URL = "https://www.iana.org/assignments/enterprise-numbers/enterprise-numbers";
const IANA_LICENSE_URL = "https://www.iana.org/help/licensing-terms";
const PEN_PREFIX = "1.3.6.1.4.1";

function parseLastUpdated(text) {
  const match = String(text || "").match(/\(last updated\s+([^)]+)\)/i);
  return match ? match[1].trim() : null;
}

function parseEnterpriseNumbers(text) {
  const lines = String(text || "").split(/\r?\n/);
  const records = [];
  let current = null;

  function flush() {
    if (!current) return;
    const fields = current.lines.map((line) => line.trim()).filter(Boolean);
    records.push({
      source: "iana-pen",
      enterprise_number: current.number,
      oid: `${PEN_PREFIX}.${current.number}`,
      organization: fields[0] || "",
      contact: fields[1] || "",
      email_obfuscated: fields[2] || "",
      notes: fields.slice(3)
    });
  }

  for (const line of lines) {
    if (/^\d+$/.test(line.trim()) && !line.startsWith(" ")) {
      flush();
      current = { number: Number(line.trim()), lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  flush();

  return records;
}

function emailDomain(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text || text === "---none---") return "none";
  const marker = text.includes("&") ? "&" : "@";
  const index = text.lastIndexOf(marker);
  if (index === -1 || index + 1 >= text.length) return "unknown";
  return text.slice(index + 1).replace(/[^a-z0-9.-]/g, "") || "unknown";
}

function countBy(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item) || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .map(([key, count]) => ({ key, count }));
}

function hasPublicContactNoise(value) {
  const text = String(value || "");
  const emailLike = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const ianaObfuscatedEmailLike = /[A-Za-z0-9._%+-]+&[a-z0-9.-]+\.[a-z]{2,}/;
  const phoneLike = /(?:\+\d{1,3}|\(\d{2,4}\)|\b\d{3,}[-\s]\d{3,}\b)/;
  const mostlyNumeric = /^[\d\s()+.-]{6,}$/;
  return emailLike.test(text) || ianaObfuscatedEmailLike.test(text) || phoneLike.test(text) || mostlyNumeric.test(text.trim());
}

function buildIanaPenReport(records, meta = {}) {
  const assigned = records.filter((record) => record.organization && record.organization.toLowerCase() !== "reserved");
  const withNotes = assigned.filter((record) => record.notes.length > 0).length;
  return {
    source: "iana-pen",
    source_url: meta.sourceUrl || IANA_PEN_URL,
    license_url: meta.licenseUrl || IANA_LICENSE_URL,
    license_summary: "IANA protocol registries are covered by the CC0 1.0 dedication described in the IANA licensing terms.",
    last_updated: meta.lastUpdated || null,
    generated_at: meta.generatedAt || new Date().toISOString(),
    prefix: PEN_PREFIX,
    record_count: records.length,
    assigned_count: assigned.length,
    reserved_count: records.length - assigned.length,
    highest_enterprise_number: records.reduce((max, record) => Math.max(max, record.enterprise_number), 0),
    with_extra_notes: withNotes,
    top_email_domains: countBy(assigned, (record) => emailDomain(record.email_obfuscated)).slice(0, 20),
    organization_initials: countBy(assigned, (record) => String(record.organization || "").trim()[0]?.toUpperCase()).slice(0, 20),
    sample_organizations: assigned.slice(0, 20).map((record) => ({
      enterprise_number: record.enterprise_number,
      oid: record.oid,
      organization: record.organization
    }))
  };
}

function buildPublicPenIndex(records) {
  return records
    .filter((record) => record.organization && record.organization.toLowerCase() !== "reserved")
    .filter((record) => !hasPublicContactNoise(record.organization))
    .map((record) => ({
      number: record.enterprise_number,
      oid: record.oid,
      organization: record.organization
    }));
}

module.exports = {
  IANA_LICENSE_URL,
  IANA_PEN_URL,
  PEN_PREFIX,
  buildIanaPenReport,
  buildPublicPenIndex,
  emailDomain,
  hasPublicContactNoise,
  parseEnterpriseNumbers,
  parseLastUpdated
};
