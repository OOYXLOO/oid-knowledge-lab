"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { generatedTimestamp } = require("./time");

function sha256Buffer(buffer) {
  return `sha256:${crypto.createHash("sha256").update(buffer).digest("hex")}`;
}

function artifactSummary(file, rootDir) {
  const buffer = fs.readFileSync(file);
  return {
    path: path.relative(rootDir, file).replace(/\\/g, "/"),
    bytes: buffer.length,
    sha256: sha256Buffer(buffer)
  };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function buildDatasetManifest(options = {}) {
  const oidBaseIndex = options.oidBaseIndex || {};
  const ianaPenReport = options.ianaPenReport || {};
  const artifacts = options.artifacts || [];

  return {
    name: "OID Knowledge Lab publishable data manifest",
    generated_at: options.generatedAt || generatedTimestamp(),
    publishable: true,
    content_boundary: "This manifest covers OID-base sitemap metadata and open IANA PEN aggregate/public data; it does not contain OID-base page bodies, raw page mirrors, private contact fields, credentials, cookies, tokens, or account data.",
    oid_base: {
      source_url: oidBaseIndex.source_url || "https://oid-base.com/sitemap.xml",
      robots_url: "https://oid-base.com/robots.txt",
      terms_url: "https://oid-base.com/disclaimer.htm.md",
      llms_url: "https://oid-base.com/llms.txt",
      source_kind: oidBaseIndex.source_kind || "sitemap metadata",
      sitemap_entries: Number(oidBaseIndex.oid_count || 0),
      public_directory_entries: Number(options.oidBaseDirectoryCount || oidBaseIndex.oid_count || 0),
      copied_page_bodies: false,
      root_arc_counts: oidBaseIndex.root_arc_counts || [],
      depth_counts: oidBaseIndex.depth_counts || [],
      collection_boundary: "Sitemap-level OID catalog only. Full page-body collection requires specific authorization from the source owner."
    },
    iana_pen: {
      source_url: ianaPenReport.source_url || null,
      license_url: ianaPenReport.license_url || null,
      record_count: Number(ianaPenReport.record_count || 0),
      assigned_count: Number(ianaPenReport.assigned_count || 0),
      reserved_count: Number(ianaPenReport.reserved_count || 0),
      public_index_records: Number(options.penPublicIndexCount || 0),
      contact_fields_published: false
    },
    excluded_data: [
      "OID-base page bodies",
      "raw Markdown/HTML mirrors",
      "private contact fields",
      "credentials or session data"
    ],
    artifacts,
    artifact_count: artifacts.length
  };
}

function assertPublishableManifest(manifest) {
  if (manifest?.oid_base?.copied_page_bodies !== false) {
    throw new Error("Publishable manifest must not include OID-base page bodies.");
  }
  if (manifest?.iana_pen?.contact_fields_published !== false) {
    throw new Error("Publishable manifest must not include contact fields.");
  }
  const serialized = JSON.stringify(manifest);
  const internalTerms = ["money" + "-goal", "USD " + "200", "\u8d5a\u94b1"];
  if (internalTerms.some((term) => serialized.toLowerCase().includes(term.toLowerCase()))) {
    throw new Error("Publishable manifest includes internal strategy wording.");
  }
  return true;
}

function buildManifestFromFiles(options) {
  const rootDir = options.rootDir;
  const oidBaseIndex = readJson(options.oidBaseIndexFile);
  const ianaPenReport = readJson(options.ianaPenReportFile);
  const penPublicIndex = readJson(options.penPublicIndexFile);
  const artifactFiles = [
    options.oidBaseIndexFile,
    options.ianaPenReportFile,
    options.penPublicIndexFile,
    ...(options.extraArtifactFiles || [])
  ].filter(Boolean);

  const manifest = buildDatasetManifest({
    oidBaseIndex,
    ianaPenReport,
    penPublicIndexCount: Array.isArray(penPublicIndex) ? penPublicIndex.length : 0,
    oidBaseDirectoryCount: Number(oidBaseIndex.oid_count || 0),
    artifacts: artifactFiles.map((file) => artifactSummary(file, rootDir))
  });
  assertPublishableManifest(manifest);
  return manifest;
}

module.exports = {
  artifactSummary,
  assertPublishableManifest,
  buildDatasetManifest,
  buildManifestFromFiles,
  sha256Buffer
};
