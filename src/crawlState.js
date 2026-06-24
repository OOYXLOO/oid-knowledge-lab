"use strict";

const fs = require("fs");
const path = require("path");

function completedOidsFromJsonl(text) {
  const completed = new Set();
  for (const line of String(text || "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const record = JSON.parse(trimmed);
      if (record && record.oid) completed.add(String(record.oid));
    } catch (_error) {
      // Ignore partial or corrupt lines so an interrupted crawl can still resume.
    }
  }
  return completed;
}

function completedOidsFromFile(recordsFile) {
  if (!recordsFile || !fs.existsSync(recordsFile)) return new Set();
  return completedOidsFromJsonl(fs.readFileSync(recordsFile, "utf8"));
}

function selectPendingEntries(entries, { completedOids = new Set(), limit = Number.POSITIVE_INFINITY } = {}) {
  const max = Number.isFinite(Number(limit)) ? Math.max(0, Number(limit)) : Number.POSITIVE_INFINITY;
  const pending = [];
  for (const entry of entries || []) {
    if (!entry || completedOids.has(String(entry.oid))) continue;
    pending.push(entry);
    if (pending.length >= max) break;
  }
  return pending;
}

function writeCrawlState(outDir, state) {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, "crawl-state.json");
  fs.writeFileSync(file, `${JSON.stringify({
    generated_at: new Date().toISOString(),
    ...state
  }, null, 2)}\n`, "utf8");
  return file;
}

module.exports = {
  completedOidsFromFile,
  completedOidsFromJsonl,
  selectPendingEntries,
  writeCrawlState
};
