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

function failureRecordForEntry(entry, error, index) {
  const message = error && error.message ? String(error.message) : String(error || "unknown error");
  const httpMatch = message.match(/\bHTTP\s+\d{3}\b/);
  return {
    status: "failed",
    oid: entry && entry.oid ? String(entry.oid) : null,
    markdown_url: entry && entry.markdown_url ? String(entry.markdown_url) : null,
    index,
    error: httpMatch ? httpMatch[0] : message,
    failed_at: new Date().toISOString()
  };
}

function summarizeCrawlRun({
  completedBeforeRun = 0,
  records = [],
  failures = [],
  fullCollectionAuthorized = false,
  rawMarkdownSaved = false,
  resumeEnabled = false
} = {}) {
  const successfulRecords = Array.isArray(records) ? records : [];
  const failedRecords = Array.isArray(failures) ? failures : [];
  return {
    generated_at: new Date().toISOString(),
    record_count: successfulRecords.length,
    failed_count: failedRecords.length,
    completed_before_run: completedBeforeRun,
    completed_after_run: completedBeforeRun + successfulRecords.length,
    first_oid: successfulRecords[0] ? successfulRecords[0].oid : null,
    last_oid: successfulRecords[successfulRecords.length - 1] ? successfulRecords[successfulRecords.length - 1].oid : null,
    failed_oids: failedRecords.map((failure) => failure.oid).filter(Boolean),
    full_collection_authorized: fullCollectionAuthorized,
    raw_markdown_saved: rawMarkdownSaved,
    resume_enabled: resumeEnabled
  };
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
  failureRecordForEntry,
  selectPendingEntries,
  summarizeCrawlRun,
  writeCrawlState
};
