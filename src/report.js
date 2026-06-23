"use strict";

const fs = require("fs");

function readJsonl(file) {
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
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

function buildReport(records) {
  const descriptions = countBy(records, (record) => record.description || "").filter((entry) => entry.key && entry.count > 1);
  return {
    record_count: records.length,
    root_arcs: countBy(records, (record) => String(record.oid || "").split(".")[0]).slice(0, 10),
    last_modified_years: countBy(records, (record) => String(record.last_modified || "").slice(0, 4)).slice(0, 20),
    with_child_oids: records.filter((record) => record.child_oids.length > 0).length,
    with_supplementary_information: records.filter((record) => record.sections_present.includes("Supplementary information")).length,
    duplicate_descriptions: descriptions.slice(0, 20),
    sample_sources: records.slice(0, 10).map((record) => record.source_url)
  };
}

module.exports = {
  buildReport,
  readJsonl
};
