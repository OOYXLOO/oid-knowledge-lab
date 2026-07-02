"use strict";

const fs = require("fs");
const path = require("path");
const { writeAgentSubmissionPack } = require("./agentSubmissionPack");
const { auditAssetFile } = require("./assetAudit");
const { writeBuyerSignalPack } = require("./buyerSignalPack");
const { writeClientReadinessPack } = require("./clientReadinessPack");
const { writeClientKickoffPack } = require("./clientKickoffPack");
const { writeCoverageReport } = require("./coverage");
const { buildAuthorizedCrawlPlan, renderAuthorizedCrawlPlanMarkdown } = require("./crawlPlan");
const { writeDecisionOnePager } = require("./decisionOnePager");
const { writeDeliveryPack } = require("./deliveryPack");
const { writeEngagementBrief } = require("./engagementBrief");
const { writeEnterpriseMarketBrief } = require("./enterpriseMarketBrief");
const { buildIanaPenReport, buildPublicPenIndex, IANA_LICENSE_URL, IANA_PEN_URL, parseEnterpriseNumbers, parseLastUpdated } = require("./ianaPen");
const { buildClientIntakePack } = require("./intakePack");
const { buildManifestFromFiles } = require("./manifest");
const { buildMediaProvenancePack, writeBackblazeReadinessPack, writeMediaProvenancePack } = require("./mediaProvenancePack");
const { ensureDir, fetchText, sleep, writeJson } = require("./net");
const { parseOidMarkdown } = require("./parser");
const { writeProofDeskPack } = require("./proofDeskPack");
const { auditPublishableTree } = require("./publishGuard");
const { writeScopeProposalPack } = require("./proposalPack");
const { writeQwenAgentDemo } = require("./qwenAgent");
const { writeQwenRunReceipt } = require("./qwenReceipt");
const { writeQwenSubmissionPack } = require("./qwenSubmissionPack");
const { writeRemediationBoard } = require("./remediationBoard");
const { buildReport, readJsonl } = require("./report");
const { writeStatementOfWorkPack } = require("./statementOfWorkPack");
const { completedOidsFromFile, failureRecordForEntry, selectPendingEntries, summarizeCrawlRun, writeCrawlState } = require("./crawlState");
const { isAllowedByRobots, sitemapUrls } = require("./robots");
const { buildSite } = require("./site");
const { buildSitemapIndex, getOidEntries, parseSitemap } = require("./sitemap");
const { buildSourcePolicySnapshot, writeSourcePolicyFiles } = require("./sourcePolicy");
const { writeVerticalUseCasePack } = require("./verticalUseCasePack");

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

function mediaProvenancePack(args) {
  const assetsFile = path.resolve(ROOT, argValue(args, "--assets", "examples/media-provenance-assets.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/media-provenance-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/media-provenance-pack.md"));
  const generatedAt = argValue(args, "--generated-at") || undefined;
  const assets = JSON.parse(fs.readFileSync(assetsFile, "utf8"));
  const result = writeMediaProvenancePack({
    jsonOutFile,
    markdownOutFile,
    generatedAt,
    assets
  });

  console.log(`assets: ${result.pack.summary.total_assets}`);
  console.log(`approved: ${result.pack.summary.approved_assets}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function backblazeReadinessPack(args) {
  const assetsFile = path.resolve(ROOT, argValue(args, "--assets", "examples/media-provenance-assets.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/backblaze-readiness-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/backblaze-readiness-pack.md"));
  const generatedAt = argValue(args, "--generated-at", undefined);
  const publicBaseUrl = argValue(args, "--public-base-url", "https://ooyxloo.github.io/oid-knowledge-lab");
  const assets = JSON.parse(fs.readFileSync(assetsFile, "utf8"));
  const mediaPack = buildMediaProvenancePack({ generatedAt, assets });
  const result = writeBackblazeReadinessPack({
    jsonOutFile,
    markdownOutFile,
    generatedAt,
    mediaPack,
    publicBaseUrl
  });

  console.log(`project: ${result.readiness.project.title}`);
  console.log(`cloud status: ${result.readiness.cloud_integration.status}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function proofDeskPack(args) {
  const claimsFile = path.resolve(ROOT, argValue(args, "--claims", "examples/proofdesk-claims.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/proofdesk-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/proofdesk-pack.md"));
  const generatedAt = argValue(args, "--generated-at", undefined);
  const result = writeProofDeskPack({
    claimsFile,
    jsonOutFile,
    markdownOutFile,
    generatedAt
  });

  console.log(`proofdesk claims: ${result.pack.summary.total_claims}`);
  console.log(`ready claims: ${result.pack.summary.ready_claims}`);
  console.log(`needs human review: ${result.pack.summary.needs_human_review}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function agentSubmissionPack(args) {
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/proofdesk-agent-submission-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/proofdesk-agent-submission-pack.md"));
  const generatedAt = argValue(args, "--generated-at", undefined);
  const publicBaseUrl = argValue(args, "--public-base-url", "https://ooyxloo.github.io/oid-knowledge-lab");
  const result = writeAgentSubmissionPack({
    jsonOutFile,
    markdownOutFile,
    generatedAt,
    publicBaseUrl
  });

  console.log(`agent submission project: ${result.pack.project.name}`);
  console.log(`proof links: ${result.pack.shared_fields.proof_links.length}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function enterpriseMarketBrief(args) {
  const recordsFile = path.resolve(ROOT, argValue(args, "--records", "data/iana/enterprise-numbers.jsonl"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/enterprise-market-brief.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/enterprise-market-brief.md"));
  const csvOutFile = path.resolve(ROOT, argValue(args, "--csv", "reports/enterprise-market-leads.csv"));
  const generatedAt = argValue(args, "--generated-at") || undefined;
  const limit = numberArg(args, "--limit", 40);
  const brief = writeEnterpriseMarketBrief({
    recordsFile,
    jsonOutFile,
    markdownOutFile,
    csvOutFile,
    generatedAt,
    limit
  });

  console.log(`high-signal enterprises: ${brief.summary.high_signal_enterprises}`);
  console.log(`exported leads: ${brief.summary.exported_leads}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
  console.log(`csv written: ${path.relative(ROOT, csvOutFile).replace(/\\/g, "/")}`);
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

async function planFullCrawl(args) {
  const jsonFile = path.resolve(ROOT, argValue(args, "--out", "reports/authorized-crawl-plan.json"));
  const markdownFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/authorized-crawl-plan.md"));
  const delayMs = numberArg(args, "--delay-ms", 1500);
  const outDir = argValue(args, "--crawl-out", "data/full");
  const info = await loadSourceInfo();
  const plan = buildAuthorizedCrawlPlan({
    oidEntries: info.oidEntries,
    delayMs,
    outDir
  });

  writeJson(jsonFile, plan);
  ensureDir(path.dirname(markdownFile));
  fs.writeFileSync(markdownFile, renderAuthorizedCrawlPlanMarkdown(plan), "utf8");
  console.log(`planned entries: ${plan.entry_count}`);
  console.log(`estimated request time: ${plan.estimated_request_duration_human}`);
  console.log(`plan json written: ${path.relative(ROOT, jsonFile).replace(/\\/g, "/")}`);
  console.log(`plan markdown written: ${path.relative(ROOT, markdownFile).replace(/\\/g, "/")}`);
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
  const failuresFile = path.join(outDir, "failures.jsonl");
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
  if (!resume || !fs.existsSync(failuresFile)) fs.writeFileSync(failuresFile, "", "utf8");
  const records = [];
  const failures = [];

  writeCrawlState(outDir, {
    status: "running",
    full_collection_authorized: full,
    resume_enabled: resume,
      selected_count: selected.length,
      completed_before_run: completedOids.size,
      completed_this_run: 0,
      failed_this_run: 0,
      records_file: path.relative(ROOT, recordsFile).replace(/\\/g, "/")
    });

  for (let index = 0; index < selected.length; index += 1) {
    const entry = selected[index];
    if (!isAllowedByRobots(info.robots, entry.markdown_url, "oid-knowledge-lab")) {
      throw new Error(`Robots policy does not allow ${entry.markdown_url}`);
    }
    try {
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
    } catch (error) {
      const failure = failureRecordForEntry(entry, error, index + 1);
      failures.push(failure);
      fs.appendFileSync(failuresFile, `${JSON.stringify(failure)}\n`, "utf8");
      console.warn(`[${index + 1}/${selected.length}] ${failure.oid || "unknown"} failed: ${failure.error}`);
    }
    if (index + 1 < selected.length) await sleep(delayMs);
    writeCrawlState(outDir, {
      status: "running",
      full_collection_authorized: full,
      resume_enabled: resume,
      selected_count: selected.length,
      completed_before_run: completedOids.size,
      completed_this_run: records.length,
      failed_this_run: failures.length,
      last_oid: records[records.length - 1] ? records[records.length - 1].oid : null,
      last_failed_oid: failures[failures.length - 1] ? failures[failures.length - 1].oid : null,
      records_file: path.relative(ROOT, recordsFile).replace(/\\/g, "/"),
      failures_file: path.relative(ROOT, failuresFile).replace(/\\/g, "/")
    });
  }

  writeJson(path.join(outDir, "records-summary.json"), summarizeCrawlRun({
    completedBeforeRun: completedOids.size,
    records,
    failures,
    fullCollectionAuthorized: full,
    rawMarkdownSaved: saveRaw,
    resumeEnabled: resume
  }));
  writeCrawlState(outDir, {
    status: failures.length ? "completed_with_failures" : "complete",
    full_collection_authorized: full,
    resume_enabled: resume,
    selected_count: selected.length,
    completed_before_run: completedOids.size,
    completed_this_run: records.length,
    failed_this_run: failures.length,
    completed_after_run: completedOids.size + records.length,
    last_oid: records[records.length - 1] ? records[records.length - 1].oid : null,
    last_failed_oid: failures[failures.length - 1] ? failures[failures.length - 1].oid : null,
    records_file: path.relative(ROOT, recordsFile).replace(/\\/g, "/"),
    failures_file: path.relative(ROOT, failuresFile).replace(/\\/g, "/")
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

function remediationBoard(args) {
  const assetAuditFile = path.resolve(ROOT, argValue(args, "--asset-audit", "reports/asset-audit.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/remediation-board.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/remediation-board.md"));
  const csvOutFile = path.resolve(ROOT, argValue(args, "--csv", "reports/remediation-board.csv"));
  const board = writeRemediationBoard({ assetAuditFile, jsonOutFile, markdownOutFile, csvOutFile });
  console.log(`remediation items: ${board.summary.total_items}`);
  console.log(`client action items: ${board.summary.client_action_items}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
  console.log(`csv written: ${path.relative(ROOT, csvOutFile).replace(/\\/g, "/")}`);
}

function engagementBrief(args) {
  const assetAuditFile = path.resolve(ROOT, argValue(args, "--asset-audit", "reports/asset-audit.json"));
  const coverageReportFile = path.resolve(ROOT, argValue(args, "--coverage", "reports/coverage-report.json"));
  const sourcePolicyFile = path.resolve(ROOT, argValue(args, "--source-policy", "reports/source-policy.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/sample-engagement-brief.md"));
  writeEngagementBrief({ assetAuditFile, coverageReportFile, sourcePolicyFile, markdownOutFile });
  console.log(`engagement brief written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function clientReadinessPack(args) {
  const assetAuditFile = path.resolve(ROOT, argValue(args, "--asset-audit", "reports/asset-audit.json"));
  const coverageReportFile = path.resolve(ROOT, argValue(args, "--coverage", "reports/coverage-report.json"));
  const sourcePolicyFile = path.resolve(ROOT, argValue(args, "--source-policy", "reports/source-policy.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/client-readiness-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/client-readiness-pack.md"));
  const pack = writeClientReadinessPack({
    assetAuditFile,
    coverageReportFile,
    sourcePolicyFile,
    intakePack: buildClientIntakePack(),
    jsonOutFile,
    markdownOutFile
  });
  console.log(`client readiness score: ${pack.readiness_score}/100`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function verticalUseCasePack(args) {
  const assetAuditFile = path.resolve(ROOT, argValue(args, "--asset-audit", "reports/asset-audit.json"));
  const coverageReportFile = path.resolve(ROOT, argValue(args, "--coverage", "reports/coverage-report.json"));
  const sourcePolicyFile = path.resolve(ROOT, argValue(args, "--source-policy", "reports/source-policy.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/vertical-use-case-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/vertical-use-case-pack.md"));
  const pack = writeVerticalUseCasePack({
    assetAuditFile,
    coverageReportFile,
    sourcePolicyFile,
    jsonOutFile,
    markdownOutFile
  });
  console.log(`vertical use cases: ${pack.use_cases.length}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function scopeProposalPack(args) {
  const assetAuditFile = path.resolve(ROOT, argValue(args, "--asset-audit", "reports/asset-audit.json"));
  const coverageReportFile = path.resolve(ROOT, argValue(args, "--coverage", "reports/coverage-report.json"));
  const sourcePolicyFile = path.resolve(ROOT, argValue(args, "--source-policy", "reports/source-policy.json"));
  const clientReadinessFile = path.resolve(ROOT, argValue(args, "--client-readiness", "reports/client-readiness-pack.json"));
  const verticalUseCaseFile = path.resolve(ROOT, argValue(args, "--vertical-fit", "reports/vertical-use-case-pack.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/scope-proposal-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/scope-proposal-pack.md"));
  const pack = writeScopeProposalPack({
    assetAuditFile,
    coverageReportFile,
    sourcePolicyFile,
    clientReadinessFile,
    verticalUseCaseFile,
    jsonOutFile,
    markdownOutFile
  });
  console.log(`scope proposal first-48-hour steps: ${pack.first_48_hours.length}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function statementOfWorkPack(args) {
  const scopeProposalFile = path.resolve(ROOT, argValue(args, "--scope-proposal", "reports/scope-proposal-pack.json"));
  const clientReadinessFile = path.resolve(ROOT, argValue(args, "--client-readiness", "reports/client-readiness-pack.json"));
  const verticalUseCaseFile = path.resolve(ROOT, argValue(args, "--vertical-fit", "reports/vertical-use-case-pack.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/statement-of-work-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/statement-of-work-pack.md"));
  const pack = writeStatementOfWorkPack({
    scopeProposalFile,
    clientReadinessFile,
    verticalUseCaseFile,
    jsonOutFile,
    markdownOutFile
  });
  console.log(`statement of work schedule phases: ${pack.schedule.length}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function decisionOnePager(args) {
  const statementOfWorkFile = path.resolve(ROOT, argValue(args, "--statement-of-work", "reports/statement-of-work-pack.json"));
  const clientReadinessFile = path.resolve(ROOT, argValue(args, "--client-readiness", "reports/client-readiness-pack.json"));
  const scopeProposalFile = path.resolve(ROOT, argValue(args, "--scope-proposal", "reports/scope-proposal-pack.json"));
  const verticalUseCaseFile = path.resolve(ROOT, argValue(args, "--vertical-fit", "reports/vertical-use-case-pack.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/decision-one-pager.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/decision-one-pager.md"));
  const pack = writeDecisionOnePager({
    statementOfWorkFile,
    clientReadinessFile,
    scopeProposalFile,
    verticalUseCaseFile,
    jsonOutFile,
    markdownOutFile
  });
  console.log(`decision one-pager proof links: ${pack.proof_links.length}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function clientKickoffPack(args) {
  const decisionOnePagerFile = path.resolve(ROOT, argValue(args, "--decision-one-pager", "reports/decision-one-pager.json"));
  const statementOfWorkFile = path.resolve(ROOT, argValue(args, "--statement-of-work", "reports/statement-of-work-pack.json"));
  const clientReadinessFile = path.resolve(ROOT, argValue(args, "--client-readiness", "reports/client-readiness-pack.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/client-kickoff-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/client-kickoff-pack.md"));
  const pack = writeClientKickoffPack({
    decisionOnePagerFile,
    statementOfWorkFile,
    clientReadinessFile,
    jsonOutFile,
    markdownOutFile
  });
  console.log(`client kickoff proof links: ${pack.proof_links.length}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function buyerSignalPack(args) {
  const assetAuditFile = path.resolve(ROOT, argValue(args, "--asset-audit", "reports/asset-audit.json"));
  const coverageReportFile = path.resolve(ROOT, argValue(args, "--coverage", "reports/coverage-report.json"));
  const sourcePolicyFile = path.resolve(ROOT, argValue(args, "--source-policy", "reports/source-policy.json"));
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/buyer-signal-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/buyer-signal-pack.md"));
  const pack = writeBuyerSignalPack({
    assetAuditFile,
    coverageReportFile,
    sourcePolicyFile,
    jsonOutFile,
    markdownOutFile
  });
  console.log(`buyer signals: ${pack.buyer_signals.length}`);
  console.log(`subject lines: ${pack.subject_lines.length}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function buildStaticSite(args) {
  const reportFile = path.resolve(ROOT, argValue(args, "--report", "reports/iana-pen-summary.json"));
  const indexFile = path.resolve(ROOT, argValue(args, "--index", "reports/iana-pen-public-index.json"));
  const sitemapFile = path.resolve(ROOT, argValue(args, "--sitemap", "reports/oid-base-sitemap-index.json"));
  const assetAuditFile = path.resolve(ROOT, argValue(args, "--asset-audit", "reports/asset-audit.json"));
  const coverageReportFile = path.resolve(ROOT, argValue(args, "--coverage", "reports/coverage-report.json"));
  const outDir = path.resolve(ROOT, argValue(args, "--out", "public"));
  const result = buildSite({ indexFile, reportFile, sitemapFile, assetAuditFile, coverageReportFile, outDir });
  console.log(`site files: ${result.output_files.map((file) => path.relative(ROOT, file).replace(/\\/g, "/")).join(", ")}`);
  console.log(`site records: ${result.record_count}`);
  console.log(`search records: ${result.search_record_count}`);
  console.log(`oid-base directory records: ${result.oid_base_directory_count}`);
}

function qwenAgentDemo(args) {
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/qwen-agent-demo.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/qwen-agent-demo.md"));
  const result = writeQwenAgentDemo({
    jsonOutFile,
    markdownOutFile,
    model: argValue(args, "--model", "qwen-plus"),
    mode: hasFlag(args, "--live") ? "live-ready" : "offline"
  });
  console.log(`qwen agent findings: ${result.plan.summary.total_findings}`);
  console.log(`human gates: ${result.plan.summary.human_gated_actions}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}

function qwenSubmissionPack(args) {
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/qwen-submission-pack.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/qwen-submission-pack.md"));
  const mermaidOutFile = path.resolve(ROOT, argValue(args, "--mermaid", "reports/qwen-architecture.mmd"));
  const svgOutFile = path.resolve(ROOT, argValue(args, "--svg", "public/qwen-architecture.svg"));
  const htmlOutFile = path.resolve(ROOT, argValue(args, "--html", "public/qwen-architecture.html"));
  const result = writeQwenSubmissionPack({
    jsonOutFile,
    markdownOutFile,
    mermaidOutFile,
    svgOutFile,
    htmlOutFile,
    publicBaseUrl: argValue(args, "--public-base-url", "https://ooyxloo.github.io/oid-knowledge-lab")
  });
  console.log(`qwen submission proof items: ${result.pack.proof_checklist.length}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
  console.log(`mermaid written: ${path.relative(ROOT, mermaidOutFile).replace(/\\/g, "/")}`);
  console.log(`svg written: ${path.relative(ROOT, svgOutFile).replace(/\\/g, "/")}`);
  console.log(`html written: ${path.relative(ROOT, htmlOutFile).replace(/\\/g, "/")}`);
}

function qwenRunReceipt(args) {
  const jsonOutFile = path.resolve(ROOT, argValue(args, "--out", "reports/qwen-run-receipt.json"));
  const markdownOutFile = path.resolve(ROOT, argValue(args, "--markdown", "reports/qwen-run-receipt.md"));
  const generatedAt = argValue(args, "--generated-at", undefined);
  const model = argValue(args, "--model", "qwen-plus");
  const status = argValue(args, "--status", "prepared");
  const request = {
    source: "redacted-live-run-placeholder",
    note: "Replace with the sanitized request metadata from a private run before claiming live proof."
  };
  const result = writeQwenRunReceipt({
    jsonOutFile,
    markdownOutFile,
    generatedAt,
    model,
    status,
    request,
    message: "redacted-output-placeholder",
    publicNotes: [
      "This receipt is a template until a private live run is completed.",
      "Do not publish secrets, account screenshots, billing data, cookies, tokens, prompt bodies, or complete response bodies."
    ]
  });

  console.log(`qwen receipt status: ${result.receipt.status}`);
  console.log(`json written: ${path.relative(ROOT, jsonOutFile).replace(/\\/g, "/")}`);
  console.log(`markdown written: ${path.relative(ROOT, markdownOutFile).replace(/\\/g, "/")}`);
}


function auditDataset(args) {
  const oidBaseIndexFile = path.resolve(ROOT, argValue(args, "--sitemap", "reports/oid-base-sitemap-index.json"));
  const ianaPenReportFile = path.resolve(ROOT, argValue(args, "--report", "reports/iana-pen-summary.json"));
  const penPublicIndexFile = path.resolve(ROOT, argValue(args, "--index", "reports/iana-pen-public-index.json"));
  const outFile = path.resolve(ROOT, argValue(args, "--out", "reports/dataset-manifest.json"));
  const extraArtifactFiles = [
    path.resolve(ROOT, "reports/authorized-crawl-plan.json"),
    path.resolve(ROOT, "reports/authorized-crawl-plan.md"),
    path.resolve(ROOT, "reports/asset-audit.json"),
    path.resolve(ROOT, "reports/asset-audit.md"),
    path.resolve(ROOT, "reports/certificate-policy-oid-audit.json"),
    path.resolve(ROOT, "reports/certificate-policy-oid-audit.md"),
    path.resolve(ROOT, "reports/coverage-report.json"),
    path.resolve(ROOT, "reports/coverage-report.md"),
    path.resolve(ROOT, "reports/remediation-board.csv"),
    path.resolve(ROOT, "reports/remediation-board.json"),
    path.resolve(ROOT, "reports/remediation-board.md"),
    path.resolve(ROOT, "reports/sample-delivery-pack.md"),
    path.resolve(ROOT, "reports/sample-engagement-brief.md"),
    path.resolve(ROOT, "reports/client-readiness-pack.json"),
    path.resolve(ROOT, "reports/client-readiness-pack.md"),
    path.resolve(ROOT, "reports/vertical-use-case-pack.json"),
    path.resolve(ROOT, "reports/vertical-use-case-pack.md"),
    path.resolve(ROOT, "reports/scope-proposal-pack.json"),
    path.resolve(ROOT, "reports/scope-proposal-pack.md"),
    path.resolve(ROOT, "reports/statement-of-work-pack.json"),
    path.resolve(ROOT, "reports/statement-of-work-pack.md"),
    path.resolve(ROOT, "reports/decision-one-pager.json"),
    path.resolve(ROOT, "reports/decision-one-pager.md"),
    path.resolve(ROOT, "reports/client-kickoff-pack.json"),
    path.resolve(ROOT, "reports/client-kickoff-pack.md"),
    path.resolve(ROOT, "reports/buyer-signal-pack.json"),
    path.resolve(ROOT, "reports/buyer-signal-pack.md"),
    path.resolve(ROOT, "reports/qwen-agent-demo.json"),
    path.resolve(ROOT, "reports/qwen-agent-demo.md"),
    path.resolve(ROOT, "reports/qwen-submission-pack.json"),
    path.resolve(ROOT, "reports/qwen-submission-pack.md"),
    path.resolve(ROOT, "reports/qwen-architecture.mmd"),
    path.resolve(ROOT, "reports/source-policy.json"),
    path.resolve(ROOT, "reports/source-policy.md"),
    path.resolve(ROOT, "public/index.html"),
    path.resolve(ROOT, "public/sample-assessment.html"),
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
  if (command === "plan-full-crawl") return planFullCrawl(args);
  if (command === "crawl") return crawl(args);
  if (command === "audit-assets") return auditAssets(args);
  if (command === "coverage-report") return coverageReport(args);
  if (command === "delivery-pack") return deliveryPack(args);
  if (command === "remediation-board") return remediationBoard(args);
  if (command === "engagement-brief") return engagementBrief(args);
  if (command === "client-readiness-pack") return clientReadinessPack(args);
  if (command === "vertical-use-case-pack") return verticalUseCasePack(args);
  if (command === "scope-proposal-pack") return scopeProposalPack(args);
  if (command === "statement-of-work-pack") return statementOfWorkPack(args);
  if (command === "decision-one-pager") return decisionOnePager(args);
  if (command === "client-kickoff-pack") return clientKickoffPack(args);
  if (command === "buyer-signal-pack") return buyerSignalPack(args);
  if (command === "audit-dataset") return auditDataset(args);
  if (command === "source-policy") return sourcePolicy(args);
  if (command === "guard-publishable") return guardPublishable();
  if (command === "media-provenance-pack") return mediaProvenancePack(args);
  if (command === "backblaze-readiness-pack") return backblazeReadinessPack(args);
  if (command === "proofdesk-pack") return proofDeskPack(args);
  if (command === "agent-submission-pack") return agentSubmissionPack(args);
  if (command === "enterprise-market-brief") return enterpriseMarketBrief(args);
  if (command === "qwen-agent-demo") return qwenAgentDemo(args);
  if (command === "qwen-run-receipt") return qwenRunReceipt(args);
  if (command === "qwen-submission-pack") return qwenSubmissionPack(args);
  if (command === "build-site") return buildStaticSite(args);
  if (command === "import-iana-pen") return importIanaPen(args);
  if (command === "report") return report(args);
  console.error("Usage: node src/cli.js <inspect-source|export-sitemap-index|plan-full-crawl|audit-assets|coverage-report|delivery-pack|remediation-board|engagement-brief|client-readiness-pack|vertical-use-case-pack|scope-proposal-pack|statement-of-work-pack|decision-one-pager|client-kickoff-pack|buyer-signal-pack|audit-dataset|source-policy|guard-publishable|media-provenance-pack|backblaze-readiness-pack|proofdesk-pack|agent-submission-pack|enterprise-market-brief|qwen-agent-demo|qwen-run-receipt|qwen-submission-pack|build-site|crawl|import-iana-pen|report> [options]");
  process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
