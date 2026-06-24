"use strict";

const fs = require("fs");
const path = require("path");
const { auditAssetFile } = require("./assetAudit");
const { writeCoverageReport } = require("./coverage");
const { writeDeliveryPack } = require("./deliveryPack");
const { buildIanaPenReport, buildPublicPenIndex, IANA_LICENSE_URL, IANA_PEN_URL, parseEnterpriseNumbers, parseLastUpdated } = require("./ianaPen");
const { buildManifestFromFiles } = require("./manifest");
const { ensureDir, fetchText, sleep, writeJson } = require("./net");
const { parseOidMarkdown } = require("./parser");
const { auditPublishableTree } = require("./publishGuard");
const { buildReport, readJsonl } = require("./report");
const { completedOidsFromFile, selectPendingEntries, writeCrawlState } = require("./crawlState");
const { isAllowedByRobots, sitemapUrls } = require("./robots");
const { buildSite } = require("./site");
const { buildSitemapIndex, getOidEntries, parseSitemap } = require("./sitemap");
const { buildSourcePolicySnapshot, writeSourcePolicyFiles } = require("./sourcePolicy");

const ROOT = path.resolve(__dirname, "..");
const BASE = "https://oid-base.com";

function argValue(args, flag, fallback = null) {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) return fallback;
  return args[index + 1];
}

function hasFlag(args, flag) {
  return args.includes(flag);
}

function numberArg(args, flag, fallback) {
  const value = Number(argValue(args, flag, fallback));
  return Number.isFinite(value) ? value : fallback;
}

async function loadSourceInfo() {
  const robots = await fetchText(`${BASE}/robots.txt`);
  const sitemapUrl = sitemapUrls(robots.body)[0] || `${BASE}/sitemap.xml`;
  const sitemap = await fetchText(sitemapUrl);
  const urls = parseSitemap(sitemap.body);
  const oidEntries = getOidEntries(urls);
  return {
    robots: robots.body,
    sitemap_url: sitemapUrl,
    sitemap_url_count: urls.length,
    oid_url_count: oidEntries.length,
    oidEntries
  };
}

function assertCanCrawlFull(args) {
  if (!hasFlag(args, "--authorized-full")) return false;
  const note = argValue(args, "--authorization-note", "");
  if (process.env.OID_BASE_FULL_CRAWL_AUTHORIZED !== "1" || !note.trim()) {
    throw new Error("Full collection requires OID_BASE_FULL_CRAWL_AUTHORIZED=1 and --authorization-note.");
  }
  return true;
}

async function inspectSource() {
  const info = await loadSourceInfo();
  const checks = [
    `${BASE}/sitemap.xml`,
    `${BASE}/get/0`,
    `${BASE}/get-md/0`,
    `${BASE}/cgi-bin/display?tree=`
  ].map((url) => ({
    url,
    allowed: isAllowedByRobots(info.robots, url, "oid-knowledge-lab")
  }));

  console.log(JSON.stringify({
    sitemap_url: info.sitemap_url,
    sitemap_url_count: info.sitemap_url_count,
    oid_url_count: info.oid_url_count,
    robots_checks: checks
  }, null, 2));
}

async function exportSitemapIndex(args) {
  const outFile = path.resolve(ROOT, argValue(args, "--out", "reports/oid-base-sitemap-index.json"));
  const info = await loadSourceInfo();
  ensureDir(path.dirname(outFile));
  writeJson(outFile, buildSitemapIndex(info.oidEntries, {
    sourceUrl: info.sitemap_url
  }));
  console.log(`sitemap source: ${info.sitemap_url}`);
  console.log(`oid entries: ${info.oidEntries.length}`);
  console.log(`index written: ${path.relative(ROOT, outFile).replace(/\\/g, "/")}`);
}

async function crawl(args) {
  const full = assertCanCrawlFull(args);
  const limitArg = numberArg(args, "--limit", full ? Number.POSITIVE_INFINITY : 25);
  const limit = full ? limitArg : Math.min(limitArg, 50);
  const delayMs = Math.max(500, numberArg(args, "--delay-ms", full ? 1500 : 1000));
  const outDir = path.resolve(ROOT, argValue(args, "--out", "data/sample"));
  const saveRaw = hasFlag(args, "--save-raw-markdown");
  const resume = hasFlag(args, "--resume");
  const info = await loadSourceInfo();

  ensureDir(outDir);
  const recordsFile = path.join(outDir, "records.jsonl");
  const completedOids = resume ? completedOidsFromFile(recordsFile) : new Set();
  const selected = selectPendingEntries(info.oidEntries, { completedOids, limit });
  writeJson(path.join(outDir, "sitemap-sample.json"), {
    source: info.sitemap_url,
    sitemap_url_count: info.sitemap_url_count,
    oid_url_count: info.oid_url_count,
    selected_count: selected.length,
    skipped_completed_count: completedOids.size,
    full_collection_authorized: full,
    resume_enabled: resume,
    generated_at: new Date().toISOString(),
    entries: selected
  });

  if (!resume || !fs.existsSync(recordsFile)) fs.writeFileSync(recordsFile, "", "utf8");
  const records = [];

  writeCrawlState(outDir, {
    status: "running",
    full_collection_authorized: full,
    resume_enabled: resume,
    selected_count: selected.length,
    completed_before_run: completedOids.size,
    completed_this_run: 0,
    records_file: path.relative(ROOT, recordsFile).replace(/\\/g, "/")
  });

  for (let index = 0; index < selected.length; index += 1) {
    const entry = selected[index];
    if (!isAllowedByRobots(info.robots, entry.markdown_url, "oid-knowledge-lab")) {
      throw new Error(`Robots policy does not allow ${entry.markdown_url}`);
    }
    const fetched = await fetchText(entry.markdown_url);
    const record = parseOidMarkdown(fetched.body, {
      ...entry,
      fetched_at: new Date().toISOString()
    });
    records.push(record);
    fs.appendFileSync(recordsFile, `${JSON.stringify(record)}\n`, "utf8");
    if (saveRaw) {
      const safeName = String(record.oid || `record-${index}`).replace(/[^A-Za-z0-9_.-]/g, "_");
      fs.writeFileSync(path.join(outDir, `${safeName}.md`), fetched.body, "utf8");
    }
    console.log(`[${index + 1}/${selected.length}] ${record.oid} ${record.description || ""}`);
    if (index + 1 < selected.length) await sleep(delayMs);
    writeCrawlState(outDir, {
      status: "running",
      full_collection_authorized: full,
      resume_enabled: resume,
      selected_count: selected.length,
      completed_before_run: completedOids.size,
      completed_this_run: records.length,
      last_oid: record.oid,
      records_file: path.relative(ROOT, recordsFile).replace(/\\/g, "/")
    });
  }

  writeJson(path.join(outDir, "records-summary.json"), {
    generated_at: new Date().toISOString(),
    record_count: records.length,
    completed_before_run: completedOids.size,
    completed_after_run: completedOids.size + records.length,
    first_oid: records[0] ? records[0].oid : null,
    last_oid: records[records.length - 1] ? records[records.length - 1].oid : null,
    full_collection_authorized: full,
    raw_markdown_saved: saveRaw,
    resume_enabled: resume
  });
  writeCrawlState(outDir, {
    status: "complete",
    full_collection_authorized: full,
    resume_enabled: resume,
    selected_count: selected.length,
    completed_before_run: completedOids.size,
    completed_this_run: records.length,
    completed_after_run: completedOids.size + records.length,
    last_oid: records[records.length - 1] ? records[records.length - 1].oid : null,
    records_file: path.relative(ROOT, recordsFile).replace(/\\/g, "/")
  });
}

function report(args) {
  const input = path.resolve(ROOT, argValue(args, "--in", "data/sample/records.jsonl"));
  const output = path.resolve(ROOT, argValue(args, "--out", "data/sample/report.json"));
  const records = readJsonl(input);
  writeJson(output, {
    generated_at: new Date().toISOString(),
    input: path.relative(ROOT, input).replace(/\\/g, "/"),
    ...buildReport(records)
  });
  console.log(`report written: ${path.relative(ROOT, output).replace(/\\/g, "/")}`);
}

function auditAssets(args) {
  const inputFile = path.resolve(ROOT, argValue(args, "--in", "examples/sample-assets.csv"));
  const penIndexFile = path.resolve(ROOT, argValue(args, "--pen-index", "reports/iana-pen-public-index.json"));
  const oidBaseIndexFile = path.resolve(ROOT, argValue(args, "--sitemap", "reports/oid-base-sitemap-index.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/asset-audit.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/asset-audit.md"));
  const audit = auditAssetFile({ inputFile, penIndexFile, oidBaseIndexFile, jsonOutFile, markdownOutFile });
  console.log(`asset audit records: ${audit.summary.total_assets}`);
  console.log(`valid OIDs: ${audit.summary.valid_oids}`);
  console.log(`quality score: ${audit.summary.quality_score}/100`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function coverageReport(args) {
  const penIndexFile = path.resolve(ROOT, argValue(args, "--pen-index", "reports/iana-pen-public-index.json"));
  const oidBaseIndexFile = path.resolve(ROOT, argValue(args, "--sitemap", "reports/oid-base-sitemap-index.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/coverage-report.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/coverage-report.md"));
  const report = writeCoverageReport({ penIndexFile, oidBaseIndexFile, jsonOutFile, markdownOutFile });
  console.log(`public PEN records: ${report.summary.total_public_pen_records}`);
  console.log(`exact OID-base matches: ${report.summary.exact_oidbase_matches}`);
  console.log(`subtree-only matches: ${report.summary.subtree_only_matches}`);
  console.log(`missing OID-base entries: ${report.summary.missing_oidbase_entries}`);
  console.log(`coverage score: ${report.summary.coverage_score}/100`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function deliveryPack(args) {
  const assetAuditFile = path.resolve(ROOT, argValue(args, "--asset-audit", "reports/asset-audit.json"));
  const coverageReportFile = path.resolve(ROOT, argValue(args, "--coverage", "reports/coverage-report.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/sample-delivery-pack.md"));
  writeDeliveryPack({ assetAuditFile, coverageReportFile, markdownOutFile });
  console.log(`delivery pack written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function buildStaticSite(args) {
  const reportFile = path.resolve(ROOT, argValue(args, "--report", "reports/iana-pen-summary.json"));
  const indexFile = path.resolve(ROOT, argValue(args, "--index", "reports/iana-pen-public-index.json"));
  const sitemapFile = path.resolve(ROOT, argValue(args, "--sitemap", "reports/oid-base-sitemap-index.json"));
  const outDir = path.resolve(ROOT, argValue(args, "--out", "public"));
  const result = buildSite({ indexFile, reportFile, sitemapFile, outDir });
  console.log(`site files: ${result.output_files.map((file) => path.relative(ROOT, file).replace(/\\/g, "/")).join(", ")}`);
  console.log(`site records: ${result.record_count}`);
  console.log(`search records: ${result.search_record_count}`);
  console.log(`oid-base directory records: ${result.oid_base_directory_count}`);
}

function auditDataset(args) {
  const oidBaseIndexFile = path.resolve(ROOT, argValue(args, "--sitemap", "reports/oid-base-sitemap-index.json"));
  const ianaPenReportFile = path.resolve(ROOT, argValue(args, "--report", "reports/iana-pen-summary.json"));
  const penPublicIndexFile = path.resolve(ROOT, argValue(args, "--index", "reports/iana-pen-public-index.json"));
  const outFile = path.resolve(ROOT, argValue(args, "--out", "reports/dataset-manifest.json"));
  const extraArtifactFiles = [
    path.resolve(ROOT, "reports/asset-audit.json"),
    path.resolve(ROOT, "reports/asset-audit.md"),
    path.resolve(ROOT, "reports/coverage-report.json"),
    path.resolve(ROOT, "reports/coverage-report.md"),
    path.resolve(ROOT, "reports/sample-delivery-pack.md"),
    path.resolve(ROOT, "reports/source-policy.json"),
    path.resolve(ROOT, "reports/source-policy.md"),
    path.resolve(ROOT, "public/index.html"),
    path.resolve(ROOT, "public/oid-base-directory.js"),
    path.resolve(ROOT, "public/search-index.js")
  ].filter((file) => fs.existsSync(file));

  const manifest = buildManifestFromFiles({
    rootDir: ROOT,
    oidBaseIndexFile,
    ianaPenReportFile,
    penPublicIndexFile,
    extraArtifactFiles
  });
  writeJson(outFile, manifest);
  console.log(`dataset manifest written: ${path.relative(ROOT, outFile).replace(/\\/g, "/")}`);
  console.log(`oid-base sitemap entries: ${manifest.oid_base.sitemap_entries}`);
  console.log(`iana public index records: ${manifest.iana_pen.public_index_records}`);
  console.log(`artifacts checked: ${manifest.artifact_count}`);
}

async function sourcePolicy(args) {
  const jsonFile = path.resolve(ROOT, argValue(args, "--out", "reports/source-policy.json"));
  const markdownFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/source-policy.md"));
  const info = await loadSourceInfo();
  const llms = await fetchText(`${BASE}/llms.txt`);
  const terms = await fetchText(`${BASE}/disclaimer.htm.md`);
  const snapshot = buildSourcePolicySnapshot({
    robotsText: info.robots,
    sitemapUrl: info.sitemap_url,
    sitemapOidCount: info.oid_url_count,
    llmsText: llms.body,
    termsText: terms.body
  });
  writeSourcePolicyFiles({ snapshot, jsonFile, markdownFile });
  console.log(`policy json written: ${path.relative(ROOT, jsonFile).replace(/\\/g, "/")}`);
  console.log(`policy markdown written: ${path.relative(ROOT, markdownFile).replace(/\\/g, "/")}`);
  console.log(`oid entries from sitemap: ${snapshot.sitemap.oid_entries}`);
  console.log(`full crawl requires authorization: ${snapshot.collection_boundary.full_crawl_requires_authorization}`);
}

function guardPublishable() {
  const audit = auditPublishableTree(ROOT);
  console.log(JSON.stringify(audit, null, 2));
  if (!audit.ok) {
    process.exitCode = 1;
  }
}

async function importIanaPen(args) {
  const outDir = path.resolve(ROOT, argValue(args, "--out", "data/iana"));
  const reportFile = path.resolve(ROOT, argValue(args, "--report", "reports/iana-pen-summary.json"));
  const publicIndexFile = path.resolve(ROOT, argValue(args, "--public-index", "reports/iana-pen-public-index.json"));
  const response = await fetchText(IANA_PEN_URL);
  const records = parseEnterpriseNumbers(response.body);
  const lastUpdated = parseLastUpdated(response.body);

  ensureDir(outDir);
  const jsonlFile = path.join(outDir, "enterprise-numbers.jsonl");
  fs.writeFileSync(jsonlFile, records.map((record) => JSON.stringify(record)).join("\n") + "\n", "utf8");
  writeJson(path.join(outDir, "enterprise-numbers-summary.json"), {
    source_url: IANA_PEN_URL,
    license_url: IANA_LICENSE_URL,
    last_updated: lastUpdated,
    generated_at: new Date().toISOString(),
    record_count: records.length,
    jsonl_file: path.relative(ROOT, jsonlFile).replace(/\\/g, "/")
  });
  writeJson(reportFile, buildIanaPenReport(records, {
    sourceUrl: IANA_PEN_URL,
    licenseUrl: IANA_LICENSE_URL,
    lastUpdated
  }));
  writeJson(publicIndexFile, buildPublicPenIndex(records));
  console.log(`iana records: ${records.length}`);
  console.log(`jsonl written: ${path.relative(ROOT, jsonlFile).replace(/\\/g, "/")}`);
  console.log(`report written: ${path.relative(ROOT, reportFile).replace(/\\/g, "/")}`);
  console.log(`public index written: ${path.relative(ROOT, publicIndexFile).replace(/\\/g, "/")}`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "inspect-source") return inspectSource();
  if (command === "export-sitemap-index") return exportSitemapIndex(args);
  if (command === "crawl") return crawl(args);
  if (command === "audit-assets") return auditAssets(args);
  if (command === "coverage-report") return coverageReport(args);
  if (command === "delivery-pack") return deliveryPack(args);
  if (command === "audit-dataset") return auditDataset(args);
  if (command === "source-policy") return sourcePolicy(args);
  if (command === "guard-publishable") return guardPublishable();
  if (command === "build-site") return buildStaticSite(args);
  if (command === "import-iana-pen") return importIanaPen(args);
  if (command === "report") return report(args);
  console.error("Usage: node src/cli.js <inspect-source|export-sitemap-index|audit-assets|coverage-report|delivery-pack|audit-dataset|source-policy|guard-publishable|build-site|crawl|import-iana-pen|report> [options]");
  process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
