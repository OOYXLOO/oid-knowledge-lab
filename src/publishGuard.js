"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const BLOCKED_PATH_RULES = [
  {
    name: "authorized-full-crawl-output",
    pattern: /^data\/full\//,
    reason: "Authorized full OID-base crawl output must stay local unless the source owner explicitly permits publication."
  },
  {
    name: "raw-source-mirror",
    pattern: /^data\/raw\//,
    reason: "Raw OID-base HTML/Markdown mirrors must not be committed to the publishable repository."
  },
  {
    name: "sample-record-body-json",
    pattern: /^data\/sample\/(?:records|sitemap-sample|report|records-summary)\.(?:json|jsonl)$/,
    reason: "Sample parsed records are local parser evidence, not part of the publishable data package."
  },
  {
    name: "iana-contact-jsonl",
    pattern: /^data\/iana\/.*\.jsonl$/,
    reason: "Full IANA JSONL imports can include contact-level fields and are excluded from the published package."
  }
];

function normalizeRepoPath(filePath) {
  return String(filePath || "").replace(/\\/g, "/").replace(/^\.\//, "");
}

function auditPublishableFileList(files) {
  const normalizedFiles = (files || []).map(normalizeRepoPath).filter(Boolean);
  const blockers = [];

  for (const file of normalizedFiles) {
    for (const rule of BLOCKED_PATH_RULES) {
      if (!rule.pattern.test(file)) continue;
      blockers.push({
        path: file,
        rule: rule.name,
        reason: rule.reason
      });
    }
  }

  return {
    ok: blockers.length === 0,
    checked_files: normalizedFiles.length,
    blockers
  };
}

function trackedFiles(rootDir) {
  const output = childProcess.execFileSync("git", ["ls-files", "-z"], {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return output.split("\0").filter(Boolean);
}

function auditManifestFile(rootDir, manifestPath = "reports/dataset-manifest.json") {
  const fullPath = path.join(rootDir, manifestPath);
  if (!fs.existsSync(fullPath)) {
    return [{
      path: normalizeRepoPath(manifestPath),
      rule: "missing-dataset-manifest",
      reason: "Publishable repositories must include a dataset manifest that records the data boundary."
    }];
  }

  const manifest = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const blockers = [];
  if (manifest?.oid_base?.copied_page_bodies !== false) {
    blockers.push({
      path: normalizeRepoPath(manifestPath),
      rule: "oidbase-page-bodies",
      reason: "Dataset manifest must state that OID-base page bodies are not copied."
    });
  }
  if (manifest?.iana_pen?.contact_fields_published !== false) {
    blockers.push({
      path: normalizeRepoPath(manifestPath),
      rule: "iana-contact-fields",
      reason: "Dataset manifest must state that IANA contact fields are not published."
    });
  }
  return blockers;
}

function auditPublishableTree(rootDir) {
  const fileAudit = auditPublishableFileList(trackedFiles(rootDir));
  const manifestBlockers = auditManifestFile(rootDir);
  const blockers = [...fileAudit.blockers, ...manifestBlockers];
  return {
    ok: blockers.length === 0,
    checked_files: fileAudit.checked_files,
    blockers
  };
}

module.exports = {
  auditPublishableFileList,
  auditPublishableTree,
  normalizeRepoPath
};
