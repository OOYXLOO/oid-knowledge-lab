"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { analyzeAssetText, buildAssessmentHandoff, renderAssetAuditCsv, renderAssetAuditMarkdown } = require("../src/assetAudit");
const { analyzeCoverage, renderCoverageMarkdown } = require("../src/coverage");
const { buildClientReadinessPack, renderClientReadinessMarkdown } = require("../src/clientReadinessPack");
const { buildVerticalUseCasePack, renderVerticalUseCaseMarkdown } = require("../src/verticalUseCasePack");
const { buildScopeProposalPack, renderScopeProposalMarkdown } = require("../src/proposalPack");
let statementOfWorkModule;
try {
  statementOfWorkModule = require("../src/statementOfWorkPack");
} catch (error) {
  statementOfWorkModule = { __loadError: error.message };
}
let decisionOnePagerModule;
try {
  decisionOnePagerModule = require("../src/decisionOnePager");
} catch (error) {
  decisionOnePagerModule = { __loadError: error.message };
}
let clientKickoffPackModule;
try {
  clientKickoffPackModule = require("../src/clientKickoffPack");
} catch (error) {
  clientKickoffPackModule = { __loadError: error.message };
}
let buyerSignalPackModule;
try {
  buyerSignalPackModule = require("../src/buyerSignalPack");
} catch (error) {
  buyerSignalPackModule = { __loadError: error.message };
}
const { renderDeliveryPack } = require("../src/deliveryPack");
const { buildIanaPenReport, buildPublicPenIndex, emailDomain, hasPublicContactNoise, parseEnterpriseNumbers, parseLastUpdated } = require("../src/ianaPen");
const { renderEngagementBrief } = require("../src/engagementBrief");
const { buildClientIntakePack, renderClientIntakeMarkdown } = require("../src/intakePack");
const { assertPublishableManifest, buildDatasetManifest } = require("../src/manifest");
const { parseOidMarkdown } = require("../src/parser");
const { auditPublishableFileList } = require("../src/publishGuard");
const { buildRemediationBoard, renderRemediationBoardCsv, renderRemediationBoardMarkdown } = require("../src/remediationBoard");
const { buildReport } = require("../src/report");
const { isAllowedByRobots } = require("../src/robots");
const { completedOidsFromJsonl, failureRecordForEntry, summarizeCrawlRun, selectPendingEntries } = require("../src/crawlState");
const { buildAuthorizedCrawlPlan, renderAuthorizedCrawlPlanMarkdown } = require("../src/crawlPlan");
const { escapeHtml, percent, renderAppJs, renderDashboard, renderSampleAssessmentPage } = require("../src/site");
const { buildSitemapIndex, getOidEntries, parseSitemap } = require("../src/sitemap");
const { buildSourcePolicySnapshot, renderSourcePolicyMarkdown } = require("../src/sourcePolicy");

const ROOT = path.resolve(__dirname, "..");

function testSitemapParser() {
  const urls = parseSitemap(`<?xml version="1.0"?><urlset>
    <url><loc>https://oid-base.com/index.htm</loc><lastmod>2026-03-09</lastmod></url>
    <url><loc>https://oid-base.com/get/1.2.3</loc><lastmod>2026-01-01</lastmod></url>
  </urlset>`);
  assert.equal(urls.length, 2);
  const entries = getOidEntries(urls);
  assert.deepEqual(entries, [{
      oid: "1.2.3",
      source_url: "https://oid-base.com/get/1.2.3",
      markdown_url: "https://oid-base.com/get-md/1.2.3",
      sitemap_lastmod: "2026-01-01",
      root_arc: "1",
      depth: 3
    }]);
}

function testSitemapIndex() {
  const index = buildSitemapIndex([
    {
      oid: "1.2.3",
      source_url: "https://oid-base.com/get/1.2.3",
      markdown_url: "https://oid-base.com/get-md/1.2.3",
      sitemap_lastmod: "2026-01-01",
      root_arc: "1",
      depth: 3
    },
    {
      oid: "2.16.840",
      source_url: "https://oid-base.com/get/2.16.840",
      markdown_url: "https://oid-base.com/get-md/2.16.840",
      sitemap_lastmod: "2025-01-01",
      root_arc: "2",
      depth: 3
    }
  ], {
    sourceUrl: "https://oid-base.com/sitemap.xml",
    generatedAt: "2026-06-24T00:00:00.000Z"
  });

  assert.equal(index.oid_count, 2);
  assert.equal(index.source_kind, "sitemap metadata");
  assert.equal(index.entries[0].oid, "1.2.3");
  assert.equal(index.root_arc_counts[0].key, "1");
  assert.ok(index.content_boundary.includes("does not copy"));
  assert.equal(Object.hasOwn(index.entries[0], "description"), false);
}

function testSourcePolicySnapshotDocumentsCollectionBoundary() {
  const snapshot = buildSourcePolicySnapshot({
    generatedAt: "2026-06-24T00:00:00.000Z",
    robotsText: `User-agent: *
Disallow: /cgi-bin/$
Disallow: /cgi-bin/display?tree=
User-agent: otherbot
Disallow: /get/
Sitemap: https://oid-base.com/sitemap.xml`,
    sitemapUrl: "https://oid-base.com/sitemap.xml",
    sitemapOidCount: 7492,
    llmsText: "# oid-base.com\n\nLast updated: 2026-04-30\n",
    termsText: "Synthetic terms fixture: noncommercial use, small part limit, and specific authorization for broader collection."
  });

  assert.equal(snapshot.source, "OID-base");
  assert.equal(snapshot.sitemap.oid_entries, 7492);
  assert.equal(snapshot.collection_boundary.page_bodies_publishable_without_authorization, false);
  assert.equal(snapshot.collection_boundary.full_crawl_requires_authorization, true);
  assert.ok(snapshot.terms.summary.includes("limited"));
  assert.ok(snapshot.terms.summary.includes("authorization"));
  assert.equal(snapshot.terms.full_terms_copied, false);
  assert.ok(snapshot.hashes.robots.startsWith("sha256:"));
  assert.ok(snapshot.robots.disallowed_paths.includes("/cgi-bin/display?tree="));
  assert.equal(snapshot.robots.user_agent, "oid-knowledge-lab");
  assert.equal(snapshot.robots.disallowed_paths.includes("/get/"), false);
  assert.equal(JSON.stringify(snapshot).includes("money" + "-goal"), false);
}

function testSourcePolicyMarkdownAvoidsFullTermsMirror() {
  const markdown = renderSourcePolicyMarkdown({
    source: "OID-base",
    generated_at: "2026-06-24T00:00:00.000Z",
    source_urls: {
      robots: "https://oid-base.com/robots.txt",
      sitemap: "https://oid-base.com/sitemap.xml",
      llms: "https://oid-base.com/llms.txt",
      terms: "https://oid-base.com/disclaimer.htm.md"
    },
    sitemap: { oid_entries: 7492 },
    collection_boundary: {
      page_bodies_publishable_without_authorization: false,
      full_crawl_requires_authorization: true
    },
    terms: {
      summary: "Copying is limited to noncommercial personal use and a small part unless specific authorization is granted.",
      full_terms_copied: false
    },
    hashes: {
      robots: "sha256:robots",
      llms: "sha256:llms",
      terms: "sha256:terms"
    },
    robots: {
      user_agent: "oid-knowledge-lab",
      disallowed_paths: ["/cgi-bin/$", "/cgi-bin/display?tree="]
    }
  });

  assert.ok(markdown.includes("# Source Policy Snapshot"));
  assert.ok(markdown.includes("OID entries from sitemap: `7,492`"));
  assert.ok(markdown.includes("Full page-body crawl requires explicit authorization"));
  assert.ok(markdown.includes("Effective user-agent: `oid-knowledge-lab`"));
  assert.ok(markdown.includes("sha256:terms"));
  assert.equal(markdown.includes("All rights reserved."), false);
}

function testRobots() {
  const robots = `User-agent: *
Disallow: /cgi-bin/display?tree=
Disallow: /helper
Sitemap: https://oid-base.com/sitemap.xml`;
  assert.equal(isAllowedByRobots(robots, "https://oid-base.com/get-md/0", "oid-knowledge-lab"), true);
  assert.equal(isAllowedByRobots(robots, "https://oid-base.com/cgi-bin/display?tree=", "oid-knowledge-lab"), false);
  assert.equal(isAllowedByRobots(robots, "https://oid-base.com/helper", "oid-knowledge-lab"), false);
}

function testMarkdownParser() {
  const record = parseOidMarkdown(`---
oid: "2.16.840.1"
asn1-notation: "{joint-iso-itu-t(2) country(16) us(840) 1}"
description: "Example OID"
last-modified: "2026-06-24"
tags: [oid-repository]
---

## OID: \`2.16.840.1\`

### Description

Example OID

### Supplementary information

Example details.

### Child OIDs

- \`2.16.840.1.1\`: \`child(1)\`
- \`2.16.840.1.2\`: \`another-child(2)\`
`, {
    source_url: "https://oid-base.com/get/2.16.840.1",
    markdown_url: "https://oid-base.com/get-md/2.16.840.1"
  });

  assert.equal(record.oid, "2.16.840.1");
  assert.equal(record.description, "Example OID");
  assert.equal(record.child_oids.length, 2);
  assert.ok(record.sections_present.includes("Supplementary information"));
  assert.ok(record.body_hash.startsWith("sha256:"));
}

function testReport() {
  const report = buildReport([
    { oid: "1", last_modified: "2026-01-01", child_oids: [{}], sections_present: ["Description"] },
    { oid: "2.16", last_modified: "2025-01-01", child_oids: [], sections_present: ["Supplementary information"] },
    { oid: "2.17", last_modified: "2025-02-01", child_oids: [], sections_present: ["Description"] }
  ]);
  assert.equal(report.record_count, 3);
  assert.equal(report.root_arcs[0].key, "2");
  assert.equal(report.with_child_oids, 1);
  assert.equal(report.with_supplementary_information, 1);
}

function testCrawlResumeSelectionSkipsExistingRecords() {
  const completed = completedOidsFromJsonl([
    JSON.stringify({ oid: "1.2.3" }),
    "",
    "not json",
    JSON.stringify({ oid: "2.16.840" })
  ].join("\n"));
  const pending = selectPendingEntries([
    { oid: "1.2.3" },
    { oid: "1.2.4" },
    { oid: "2.16.840" },
    { oid: "2.16.841" }
  ], {
    completedOids: completed,
    limit: 2
  });

  assert.deepEqual([...completed].sort(), ["1.2.3", "2.16.840"]);
  assert.deepEqual(pending.map((entry) => entry.oid), ["1.2.4", "2.16.841"]);
}

function testCrawlResumeSelectionSupportsUnlimitedLimit() {
  const pending = selectPendingEntries([
    { oid: "1" },
    { oid: "2" },
    { oid: "3" }
  ], {
    completedOids: new Set(["2"]),
    limit: Number.POSITIVE_INFINITY
  });

  assert.deepEqual(pending.map((entry) => entry.oid), ["1", "3"]);
}

function testCrawlFailureSummaryKeepsResumeStateUseful() {
  const failure = failureRecordForEntry(
    {
      oid: "1.3.6.1.4.1.66020",
      markdown_url: "https://oid-base.com/get-md/1.3.6.1.4.1.66020"
    },
    new Error("HTTP 503 for https://oid-base.com/get-md/1.3.6.1.4.1.66020"),
    4
  );
  const summary = summarizeCrawlRun({
    completedBeforeRun: 25,
    records: [{ oid: "1.3.6.1.4.1.66019" }],
    failures: [failure],
    fullCollectionAuthorized: false,
    rawMarkdownSaved: false,
    resumeEnabled: true
  });

  assert.equal(failure.oid, "1.3.6.1.4.1.66020");
  assert.equal(failure.status, "failed");
  assert.equal(failure.error, "HTTP 503");
  assert.equal(failure.index, 4);
  assert.equal(Object.hasOwn(failure, "body"), false);
  assert.equal(summary.record_count, 1);
  assert.equal(summary.failed_count, 1);
  assert.equal(summary.completed_before_run, 25);
  assert.equal(summary.completed_after_run, 26);
  assert.equal(summary.failed_oids[0], "1.3.6.1.4.1.66020");
  assert.equal(summary.resume_enabled, true);
}

function testAuthorizedCrawlPlanDocumentsBoundaryAndScale() {
  const plan = buildAuthorizedCrawlPlan({
    generatedAt: "2026-06-24T00:00:00.000Z",
    oidEntries: [
      { oid: "0", markdown_url: "https://oid-base.com/get-md/0" },
      { oid: "1.2.3", markdown_url: "https://oid-base.com/get-md/1.2.3" },
      { oid: "2.16.840", markdown_url: "https://oid-base.com/get-md/2.16.840" }
    ],
    delayMs: 1500,
    outDir: "data/full"
  });

  assert.equal(plan.entry_count, 3);
  assert.equal(plan.delay_ms, 1500);
  assert.equal(plan.estimated_request_duration_ms, 3000);
  assert.equal(plan.output_policy.output_dir, "data/full");
  assert.equal(plan.output_policy.tracked_in_git, false);
  assert.equal(plan.output_policy.publishable_without_source_authorization, false);
  assert.ok(plan.required_gates.some((gate) => gate.includes("OID_BASE_FULL_CRAWL_AUTHORIZED=1")));
  assert.ok(plan.sample_entries.some((entry) => entry.oid === "1.2.3"));
  assert.deepEqual(plan.resume_strategy.checkpoint_files, [
    "records.jsonl",
    "crawl-state.json",
    "records-summary.json"
  ]);
  assert.ok(plan.operational_receipts.some((receipt) => receipt.includes("records-summary.json")));

  const markdown = renderAuthorizedCrawlPlanMarkdown(plan);
  assert.ok(markdown.includes("# Authorized Full Crawl Plan"));
  assert.ok(markdown.includes("Entries planned: `3`"));
  assert.ok(markdown.includes("Estimated request time: `3s`"));
  assert.ok(markdown.includes("data/full"));
  assert.ok(markdown.includes("Checkpoint files"));
  assert.ok(markdown.includes("records-summary.json"));
  assert.ok(markdown.includes("not a publishable page-body mirror"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testDatasetManifest() {
  const manifest = buildDatasetManifest({
    generatedAt: "2026-06-24T00:00:00.000Z",
    oidBaseIndex: {
      source_url: "https://oid-base.com/sitemap.xml",
      oid_count: 2,
      root_arc_counts: [{ key: "1", count: 1 }, { key: "2", count: 1 }],
      depth_counts: [{ key: "3", count: 2 }]
    },
    ianaPenReport: {
      source_url: "https://www.iana.org/assignments/enterprise-numbers.txt",
      license_url: "https://www.iana.org/help/licensing-terms",
      record_count: 10,
      assigned_count: 9,
      reserved_count: 1
    },
    penPublicIndexCount: 8,
    oidBaseDirectoryCount: 2,
    artifacts: [
      { path: "reports/oid-base-sitemap-index.json", bytes: 1200, sha256: "sha256:abc" }
    ]
  });

  assert.equal(manifest.generated_at, "2026-06-24T00:00:00.000Z");
  assert.equal(manifest.oid_base.sitemap_entries, 2);
  assert.equal(manifest.oid_base.copied_page_bodies, false);
  assert.equal(manifest.iana_pen.public_index_records, 8);
  assert.ok(manifest.content_boundary.includes("does not contain OID-base page bodies"));
  assert.ok(manifest.excluded_data.includes("OID-base page bodies"));
  assert.ok(manifest.artifacts[0].sha256.startsWith("sha256:"));
  const internalTerms = ["money" + "-goal", "USD " + "200", "\u8d5a\u94b1"];
  assert.equal(internalTerms.some((term) => JSON.stringify(manifest).toLowerCase().includes(term.toLowerCase())), false);
  assert.doesNotThrow(() => assertPublishableManifest(manifest));
  assert.throws(() => assertPublishableManifest({
    ...manifest,
    oid_base: { ...manifest.oid_base, copied_page_bodies: true }
  }), /page bodies/);
}

function testIanaPenParser() {
  const text = `PRIVATE ENTERPRISE NUMBERS

(last updated 2026-06-23)

Decimal
| Organization
| | Contact
| | | Email
0
  Reserved
    Internet Assigned Numbers Authority
      iana&iana.org
9
  ciscoSystems
    Dave Jones
      davej&cisco.com
10
  Example Org
    Example Contact
      ---none---
      extra note
11
  Broken Namedave&example.com
    Contact
      other&example.com
12
  MainSkill Technologies GmbH&Co.KG
    Contact
      iana_assignments&mainskill.com
13
  Broken InitialK&example.com
    Contact
      other&example.com
14
  Volamp LtdW.G. Saich+44(0) 1252 724055
    Contact
      other&example.com
15
  556075-2825
    Contact
      other&example.com
`;
  const records = parseEnterpriseNumbers(text);
  assert.equal(parseLastUpdated(text), "2026-06-23");
  assert.equal(records.length, 8);
  assert.equal(records[1].oid, "1.3.6.1.4.1.9");
  assert.equal(records[1].organization, "ciscoSystems");
  assert.equal(records[2].notes[0], "extra note");
  assert.equal(emailDomain("davej&cisco.com"), "cisco.com");
  assert.equal(emailDomain("---none---"), "none");

  const report = buildIanaPenReport(records, { lastUpdated: "2026-06-23" });
  assert.equal(report.record_count, 8);
  assert.equal(report.assigned_count, 7);
  assert.equal(report.reserved_count, 1);
  assert.equal(report.highest_enterprise_number, 15);
  assert.ok(report.top_email_domains.some((entry) => entry.key === "cisco.com"));
  assert.equal(hasPublicContactNoise("Volamp LtdW.G. Saich+44(0) 1252 724055"), true);
  assert.equal(hasPublicContactNoise("556075-2825"), true);
  assert.equal(hasPublicContactNoise("MainSkill Technologies GmbH&Co.KG"), false);

  const publicIndex = buildPublicPenIndex(records);
  assert.deepEqual(publicIndex[0], {
    number: 9,
    oid: "1.3.6.1.4.1.9",
    organization: "ciscoSystems"
  });
  assert.equal(Object.hasOwn(publicIndex[0], "contact"), false);
  assert.equal(Object.hasOwn(publicIndex[0], "email_obfuscated"), false);
  assert.equal(publicIndex.some((record) => record.number === 11), false);
  assert.equal(publicIndex.some((record) => record.number === 12), true);
  assert.equal(publicIndex.some((record) => record.number === 13), false);
  assert.equal(publicIndex.some((record) => record.number === 14), false);
  assert.equal(publicIndex.some((record) => record.number === 15), false);
}

function testSiteRenderer() {
  assert.equal(escapeHtml("<tag>\"x\"</tag>"), "&lt;tag&gt;&quot;x&quot;&lt;/tag&gt;");
  assert.equal(percent(25, 100), "25.0%");
  const sampleAssessment = {
    assetAudit: {
      summary: {
        total_assets: 4,
        valid_oids: 3,
        invalid_values: 1,
        known_enterprises: 1,
        oidbase_directory_matches: 1,
        evidence_ready_assets: 2,
        unresolved_assets: 2,
        quality_score: 78
      },
      action_plan: [
        { priority: "P0", title: "Correct invalid OID values", count: 1, action: "Fix malformed values." }
      ],
      findings: [
        { label: "router-core", oid: "1.3.6.1.4.1.9.9.41", status: "known_private_enterprise_oid", risk: "low", enterprise: { organization: "ciscoSystems" } }
      ]
    },
    coverageReport: {
      summary: {
        coverage_score: 1
      }
    }
  };
  const html = renderDashboard({
    source_url: "https://example.com/source",
    license_url: "https://example.com/license",
    license_summary: "Open registry summary.",
    generated_at: "2026-06-24T00:00:00.000Z",
    prefix: "1.3.6.1.4.1",
    record_count: 100,
    assigned_count: 95,
    reserved_count: 5,
    highest_enterprise_number: 99,
    top_email_domains: [{ key: "example.com", count: 3 }],
    organization_initials: [{ key: "A", count: 10 }],
    search_index_count: 99,
    sample_organizations: [{ enterprise_number: 9, oid: "1.3.6.1.4.1.9", organization: "Example <Org>" }]
  }, 42, sampleAssessment);
  assert.ok(html.includes("OID and enterprise registry dashboard"));
  assert.ok(html.includes("consulting-brief.html"));
  assert.ok(html.includes("Assessment brief"));
  assert.ok(html.includes("Editor review path"));
  assert.ok(html.includes("Observability debugging handoffs"));
  assert.ok(html.includes("Search enterprise OIDs"));
  assert.ok(html.includes("Search sitemap catalog"));
  assert.ok(html.includes("Audit local OID list"));
  assert.ok(html.includes("data-audit-copy-summary"));
  assert.ok(html.includes("data-audit-download-markdown"));
  assert.ok(html.includes("data-audit-download-csv"));
  assert.ok(html.includes("data-audit-download-json"));
  assert.ok(html.includes("data-audit-handoff"));
  assert.ok(html.includes("OID inventory assessment sample"));
  assert.ok(html.includes("OID inventory assessment handoff"));
  assert.ok(html.includes("Acceptance check"));
  assert.ok(html.includes("sample-assessment.html"));
  assert.ok(html.includes("data-audit-input"));
  assert.ok(html.includes("data-audit-results"));
  assert.ok(html.includes("Client-safe intake pack"));
  assert.ok(html.includes("data-intake-copy"));
  assert.ok(html.includes("data-intake-download-markdown"));
  assert.ok(html.includes("data-intake-download-csv"));
  assert.ok(html.includes("intake-pack.js"));
  assert.ok(html.includes("Client readiness pack"));
  assert.ok(html.includes("reports/client-readiness-pack.md"));
  assert.ok(html.includes("Vertical use-case fit pack"));
  assert.ok(html.includes("reports/vertical-use-case-pack.md"));
  assert.ok(html.includes("Scope proposal pack"));
  assert.ok(html.includes("reports/scope-proposal-pack.md"));
  assert.ok(html.includes("Statement of work pack"));
  assert.ok(html.includes("reports/statement-of-work-pack.md"));
  assert.ok(html.includes("Decision one-pager"));
  assert.ok(html.includes("reports/decision-one-pager.md"));
  assert.ok(html.includes("Buyer signal pack"));
  assert.ok(html.includes("reports/buyer-signal-pack.md"));
  assert.ok(html.includes("Public proof index"));
  assert.ok(html.includes("Signal Garden"));
  assert.ok(html.includes("https://ooyxloo.github.io/signal-garden/"));
  assert.ok(html.includes("Incident Zero Stack"));
  assert.ok(html.includes("https://ooyxloo.github.io/incident-zero-stack/"));
  assert.ok(html.includes("Hanzi Scout"));
  assert.ok(html.includes("https://ooyxloo.github.io/hanzi-scout/"));
  assert.ok(html.includes("Helioigma"));
  assert.ok(html.includes("https://ooyxloo.github.io/helioigma/"));
  assert.ok(html.includes("SNMP / MIB"));
  assert.ok(html.includes("PKI policy"));
  assert.ok(html.includes("99 public IANA PEN assignments"));
  assert.ok(html.includes("42 OID-base sitemap entries"));
  assert.ok(html.includes("66,101") === false);
  assert.ok(html.includes("Example &lt;Org&gt;"));

  const samplePage = renderSampleAssessmentPage(sampleAssessment);
  assert.ok(samplePage.includes("OID inventory assessment sample"));
  assert.ok(samplePage.includes("Markdown delivery pack"));
  assert.ok(samplePage.includes("Remediation CSV"));
  assert.ok(samplePage.includes("How to use this sample with a real inventory"));
  assert.ok(samplePage.includes("Markdown pack, remediation CSV"));
  assert.ok(samplePage.includes("Client data boundary"));
  assert.ok(samplePage.includes("ciscoSystems"));
  assert.equal(samplePage.includes("money" + "-goal"), false);
  assert.equal(samplePage.includes("USD " + "200"), false);
  assert.equal(samplePage.includes("\u8d5a\u94b1"), false);

  const appJs = renderAppJs();
  assert.ok(appJs.includes("Intake Markdown download started."));
  assert.ok(appJs.includes("Intake CSV download started."));
}

function testClientIntakePack() {
  const pack = buildClientIntakePack({ generatedAt: "2026-06-24T00:00:00.000Z" });
  assert.equal(pack.generated_at, "2026-06-24T00:00:00.000Z");
  assert.equal(pack.title, "OID Assessment Client Intake Pack");
  assert.ok(pack.copy_text.includes("asset,oid,notes"));
  assert.ok(pack.copy_text.includes("Do not include credentials"));
  assert.ok(pack.sample_csv.startsWith("asset,oid,notes"));
  assert.ok(pack.sample_csv.includes("router-core,1.3.6.1.4.1.9.9.41"));
  assert.ok(pack.checklist.some((item) => item.includes("sanitized")));
  assert.ok(pack.acceptance_criteria.some((item) => item.includes("CSV")));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("\u8d5a\u94b1"), false);

  const markdown = renderClientIntakeMarkdown(pack);
  assert.ok(markdown.includes("# OID Assessment Client Intake Pack"));
  assert.ok(markdown.includes("## Accepted input"));
  assert.ok(markdown.includes("## Data boundary"));
  assert.ok(markdown.includes("```csv"));
  assert.ok(markdown.includes("asset,oid,notes"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testClientReadinessPackRenderer() {
  const pack = buildClientReadinessPack({
    generatedAt: "2026-06-26T02:20:00.000Z",
    assetAudit: {
      summary: {
        total_assets: 4,
        valid_oids: 3,
        invalid_values: 1,
        evidence_ready_assets: 2,
        unresolved_assets: 2,
        quality_score: 78
      },
      action_plan: [
        { priority: "P0", title: "Correct invalid OID values", count: 1, action: "Fix malformed values." },
        { priority: "P1", title: "Review unmatched valid OIDs", count: 1, action: "Check internal registry." }
      ]
    },
    coverageReport: {
      summary: {
        total_public_pen_records: 65959,
        exact_oidbase_matches: 127,
        subtree_only_matches: 289,
        missing_oidbase_entries: 65543,
        coverage_score: 1
      }
    },
    sourcePolicy: {
      collection_boundary: {
        full_crawl_requires_authorization: true,
        page_bodies_publishable_without_authorization: false
      }
    },
    intakePack: buildClientIntakePack({ generatedAt: "2026-06-26T02:20:00.000Z" })
  });

  assert.equal(pack.generated_at, "2026-06-26T02:20:00.000Z");
  assert.equal(pack.title, "OID Inventory Assessment Client Readiness Pack");
  assert.equal(pack.readiness_score, 100);
  assert.ok(pack.readiness_checks.every((item) => item.status === "ready"));
  assert.ok(pack.readiness_checks.some((item) => item.id === "client-intake"));
  assert.ok(pack.public_artifacts.some((item) => item.path === "reports/sample-delivery-pack.md"));
  assert.ok(pack.public_artifacts.some((item) => item.path === "public/sample-assessment.html"));
  assert.ok(pack.review_flow.some((item) => item.step === "Prepare sanitized inventory"));
  assert.ok(pack.acceptance_evidence.some((item) => item.includes("Every input row")));
  assert.ok(pack.excluded_data.some((item) => item.includes("credentials")));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("\u8d5a\u94b1"), false);

  const markdown = renderClientReadinessMarkdown(pack);
  assert.ok(markdown.includes("# OID Inventory Assessment Client Readiness Pack"));
  assert.ok(markdown.includes("Readiness score: `100/100`"));
  assert.ok(markdown.includes("## Review Flow"));
  assert.ok(markdown.includes("## Acceptance Evidence"));
  assert.ok(markdown.includes("reports/client-readiness-pack.md"));
  assert.ok(markdown.includes("OID-base page bodies stay out"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testVerticalUseCasePackRenderer() {
  const pack = buildVerticalUseCasePack({
    generatedAt: "2026-06-26T02:35:00.000Z",
    assetAudit: {
      summary: {
        total_assets: 5,
        valid_oids: 4,
        invalid_values: 1,
        private_enterprise_oids: 2,
        known_enterprises: 1,
        oidbase_directory_matches: 1,
        evidence_ready_assets: 2,
        unresolved_assets: 3,
        quality_score: 68
      },
      findings: [
        { label: "router-core", oid: "1.3.6.1.4.1.9.9.41", status: "known_private_enterprise_oid", risk: "low", enterprise: { organization: "ciscoSystems" } },
        { label: "sha256-policy", oid: "2.16.840.1.101.3.4.2.1", status: "oidbase_directory_match", risk: "low", oidbase_match: { source_url: "https://oid-base.com/get/2.16.840.1.101.3.4.2.1" } },
        { label: "unknown-enterprise", oid: "1.3.6.1.4.1.999999.1", status: "unknown_private_enterprise_oid", risk: "medium" },
        { label: "internal-policy", oid: "1.2.840.113549", status: "valid_oid_unmatched", risk: "medium" },
        { label: "bad-row", oid: "not-an-oid", status: "invalid_value", risk: "high" }
      ]
    },
    coverageReport: {
      summary: {
        total_public_pen_records: 65959,
        exact_oidbase_matches: 127,
        subtree_only_matches: 289,
        missing_oidbase_entries: 65543,
        coverage_score: 1
      }
    },
    sourcePolicy: {
      collection_boundary: {
        full_crawl_requires_authorization: true,
        page_bodies_publishable_without_authorization: false
      }
    }
  });

  assert.equal(pack.schema_version, "oid-vertical-use-case-pack/v1");
  assert.equal(pack.title, "OID Inventory Assessment Vertical Fit Pack");
  assert.equal(pack.generated_at, "2026-06-26T02:35:00.000Z");
  assert.equal(pack.use_cases.length, 3);
  assert.deepEqual(pack.use_cases.map((item) => item.id), [
    "snmp-mib-pen-inventory",
    "pki-certificate-policy-oid-review",
    "internal-oid-registry-cleanup"
  ]);
  assert.ok(pack.use_cases[0].fit_signals.some((item) => item.includes("2 private enterprise")));
  assert.ok(pack.use_cases[1].sample_oids.some((item) => item.oid === "2.16.840.1.101.3.4.2.1"));
  assert.ok(pack.use_cases[2].fit_signals.some((item) => item.includes("3 unresolved")));
  assert.ok(pack.discovery_questions.some((item) => item.includes("SNMP")));
  assert.ok(pack.discovery_questions.some((item) => item.includes("certificate")));
  assert.ok(pack.discovery_questions.some((item) => item.includes("internal registry")));
  assert.ok(pack.public_artifacts.some((item) => item.path === "reports/vertical-use-case-pack.md"));
  assert.ok(pack.excluded_data.some((item) => item.includes("credentials")));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("\u8d5a\u94b1"), false);

  const markdown = renderVerticalUseCaseMarkdown(pack);
  assert.ok(markdown.includes("# OID Inventory Assessment Vertical Fit Pack"));
  assert.ok(markdown.includes("SNMP / MIB vendor PEN inventory"));
  assert.ok(markdown.includes("PKI certificate policy OID review"));
  assert.ok(markdown.includes("Internal OID registry cleanup"));
  assert.ok(markdown.includes("## Discovery Questions"));
  assert.ok(markdown.includes("reports/client-readiness-pack.md"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testScopeProposalPackRenderer() {
  const pack = buildScopeProposalPack({
    generatedAt: "2026-06-26T04:00:00.000Z",
    assetAudit: {
      summary: {
        total_assets: 6,
        valid_oids: 5,
        invalid_values: 1,
        evidence_ready_assets: 2,
        unresolved_assets: 3,
        quality_score: 72
      },
      action_plan: [
        { priority: "P0", title: "Correct invalid OID values", count: 1, action: "Fix malformed values." },
        { priority: "P1", title: "Review unmatched valid OIDs", count: 3, action: "Check internal registry owners." }
      ]
    },
    coverageReport: {
      summary: {
        total_public_pen_records: 65959,
        exact_oidbase_matches: 127,
        subtree_only_matches: 289,
        coverage_score: 1
      }
    },
    sourcePolicy: {
      collection_boundary: {
        full_crawl_requires_authorization: true,
        page_bodies_publishable_without_authorization: false
      }
    },
    clientReadinessPack: {
      readiness_score: 100,
      readiness_checks: [
        { id: "client-intake", status: "ready" },
        { id: "source-boundary", status: "ready" }
      ]
    },
    verticalUseCasePack: {
      use_cases: [
        { title: "SNMP / MIB vendor PEN inventory", fit_score: 92 },
        { title: "PKI certificate policy OID review", fit_score: 78 },
        { title: "Internal OID registry cleanup", fit_score: 86 }
      ]
    }
  });

  assert.equal(pack.schema_version, "oid-scope-proposal-pack/v1");
  assert.equal(pack.title, "OID Inventory Assessment Scope Proposal Pack");
  assert.equal(pack.generated_at, "2026-06-26T04:00:00.000Z");
  assert.equal(pack.first_48_hours.length, 4);
  assert.ok(pack.recommended_scope.includes("sanitized OID inventory sample"));
  assert.ok(pack.client_inputs.some((item) => item.includes("CSV")));
  assert.ok(pack.acceptance_criteria.some((item) => item.includes("classified")));
  assert.ok(pack.out_of_scope.some((item) => item.includes("credentials")));
  assert.ok(pack.public_artifacts.some((item) => item.path === "reports/scope-proposal-pack.md"));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("\u8d5a\u94b1"), false);

  const markdown = renderScopeProposalMarkdown(pack);
  assert.ok(markdown.includes("# OID Inventory Assessment Scope Proposal Pack"));
  assert.ok(markdown.includes("## Recommended Scope"));
  assert.ok(markdown.includes("## First 48 Hours"));
  assert.ok(markdown.includes("## Client Inputs"));
  assert.ok(markdown.includes("## Acceptance Criteria"));
  assert.ok(markdown.includes("## Out of Scope"));
  assert.ok(markdown.includes("SNMP / MIB vendor PEN inventory"));
  assert.ok(markdown.includes("OID-base page bodies stay out"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testStatementOfWorkPackRenderer() {
  assert.equal(statementOfWorkModule.__loadError, undefined, statementOfWorkModule.__loadError);
  const { buildStatementOfWorkPack, renderStatementOfWorkMarkdown } = statementOfWorkModule;
  const pack = buildStatementOfWorkPack({
    generatedAt: "2026-06-26T04:30:00.000Z",
    scopeProposalPack: {
      recommended_scope: "Start with a sanitized OID inventory sample, classify every row, and produce a compact remediation queue.",
      first_48_hours: [
        { step: "Confirm sanitized inventory shape", output: "CSV with oid column." },
        { step: "Run local assessment", output: "Classified findings." }
      ],
      acceptance_criteria: [
        "Every input row is classified as invalid, evidence-ready, or unresolved.",
        "The final remediation queue lists owner actions and re-run checks."
      ],
      out_of_scope: [
        "credentials, OTPs, cookies, tokens, private account exports, and production secrets",
        "OID-base raw Markdown, HTML, or page-body mirrors without source-owner authorization"
      ]
    },
    clientReadinessPack: {
      readiness_score: 100,
      readiness_checks: [
        { id: "client-intake", status: "ready" },
        { id: "source-boundary", status: "ready" }
      ]
    },
    verticalUseCasePack: {
      use_cases: [
        { title: "SNMP / MIB vendor PEN inventory", fit_score: 92 },
        { title: "Internal OID registry cleanup", fit_score: 86 }
      ]
    }
  });

  assert.equal(pack.schema_version, "oid-statement-of-work-pack/v1");
  assert.equal(pack.title, "OID Inventory Assessment Statement of Work Pack");
  assert.equal(pack.generated_at, "2026-06-26T04:30:00.000Z");
  assert.ok(pack.objective.includes("sanitized OID inventory"));
  assert.ok(pack.deliverables.some((item) => item.includes("assessment summary")));
  assert.ok(pack.client_responsibilities.some((item) => item.includes("sanitized CSV")));
  assert.ok(pack.acceptance_checklist.some((item) => item.includes("classified")));
  assert.ok(pack.change_control.some((item) => item.includes("separate approval")));
  assert.ok(pack.out_of_scope.some((item) => item.includes("credentials")));
  assert.ok(pack.public_artifacts.some((item) => item.path === "reports/statement-of-work-pack.md"));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("\u8d5a\u94b1"), false);

  const markdown = renderStatementOfWorkMarkdown(pack);
  assert.ok(markdown.includes("# OID Inventory Assessment Statement of Work Pack"));
  assert.ok(markdown.includes("## Objective"));
  assert.ok(markdown.includes("## Deliverables"));
  assert.ok(markdown.includes("## Client Responsibilities"));
  assert.ok(markdown.includes("## Acceptance Checklist"));
  assert.ok(markdown.includes("## Change Control"));
  assert.ok(markdown.includes("reports/scope-proposal-pack.md"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testDecisionOnePagerRenderer() {
  assert.equal(decisionOnePagerModule.__loadError, undefined, decisionOnePagerModule.__loadError);
  const { buildDecisionOnePager, renderDecisionOnePagerMarkdown } = decisionOnePagerModule;
  const pack = buildDecisionOnePager({
    statementOfWorkPack: {
      objective: "Review a sanitized OID inventory sample and produce a compact remediation queue.",
      deliverables: [
        "OID assessment summary with counts and action groups.",
        "Remediation queue suitable for spreadsheet or issue-tracker import."
      ],
      client_responsibilities: [
        "Provide a sanitized CSV or tab-delimited OID inventory with an `oid` column."
      ],
      acceptance_checklist: [
        "Every input row is classified as invalid, evidence-ready, or unresolved."
      ],
      out_of_scope: [
        "credentials, OTPs, cookies, tokens, private account exports, and production secrets"
      ]
    },
    clientReadinessPack: {
      readiness_score: 96,
      readiness_checks: [
        { id: "client-intake", status: "ready" },
        { id: "source-boundary", status: "ready" }
      ]
    },
    scopeProposalPack: {
      decision_summary: [
        "Sample rows reviewed: 4",
        "Evidence-ready rows: 2",
        "Unresolved rows: 1"
      ],
      first_48_hours: [
        { step: "Confirm sanitized inventory shape", output: "CSV with oid column." },
        { step: "Run local assessment", output: "Classify rows and produce findings." }
      ]
    },
    verticalUseCasePack: {
      use_cases: [
        { title: "PKI certificate policy OID review", fit_score: 93 },
        { title: "SNMP / MIB vendor PEN inventory", fit_score: 89 }
      ]
    },
    generatedAt: "2026-06-26T06:30:00.000Z"
  });

  assert.equal(pack.schema_version, "oid-decision-one-pager/v1");
  assert.equal(pack.title, "OID Inventory Assessment Decision One-Pager");
  assert.equal(pack.generated_at, "2026-06-26T06:30:00.000Z");
  assert.equal(pack.audience, "technical owner or buyer deciding whether to approve a small sanitized OID assessment");
  assert.ok(pack.decision_prompt.includes("Approve a small first review"));
  assert.ok(pack.why_now.some((item) => item.includes("Sample rows reviewed")));
  assert.ok(pack.next_step.owner_action.includes("sanitized"));
  assert.ok(pack.proof_links.some((item) => item.path === "reports/statement-of-work-pack.md"));
  assert.ok(pack.safe_inputs.some((item) => item.includes("oid")));
  assert.ok(pack.boundaries.some((item) => item.includes("credentials")));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("\u8d5a\u94b1"), false);

  const markdown = renderDecisionOnePagerMarkdown(pack);
  assert.ok(markdown.includes("# OID Inventory Assessment Decision One-Pager"));
  assert.ok(markdown.includes("## Decision Prompt"));
  assert.ok(markdown.includes("## Recommended Next Step"));
  assert.ok(markdown.includes("reports/statement-of-work-pack.md"));
  assert.ok(markdown.includes("PKI certificate policy OID review"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testClientKickoffPackRenderer() {
  assert.equal(clientKickoffPackModule.__loadError, undefined, clientKickoffPackModule.__loadError);
  const { buildClientKickoffPack, renderClientKickoffMarkdown } = clientKickoffPackModule;
  const pack = buildClientKickoffPack({
    decisionOnePager: {
      decision_prompt: "Approve a small first review of a sanitized OID inventory sample before any broader registry cleanup.",
      next_step: {
        owner_action: "Provide a sanitized CSV or tab-delimited OID inventory with an `oid` column and safe labels.",
        reviewer_action: "Run the local/browser assessment, review unresolved rows, and confirm the handoff boundary.",
        expected_output: "Decision-ready summary, remediation queue, public-source evidence map, and re-run notes."
      },
      safe_inputs: [
        "Sanitized CSV or tab-delimited inventory with an `oid` column.",
        "Safe asset labels such as device, service, certificate profile, or internal registry id."
      ],
      boundaries: [
        "credentials, OTPs, cookies, tokens, private account exports, and production secrets",
        "raw client inventories in public repositories"
      ],
      proof_links: [
        { path: "reports/decision-one-pager.md", purpose: "One-page decision summary and next action" },
        { path: "reports/statement-of-work-pack.md", purpose: "Work boundary and acceptance" }
      ]
    },
    statementOfWorkPack: {
      deliverables: [
        "OID assessment summary with counts, quality score, and prioritized action groups.",
        "Remediation queue suitable for spreadsheet or issue-tracker import."
      ],
      acceptance_checklist: [
        "Every input row is classified as invalid, evidence-ready, or unresolved.",
        "The final remediation queue lists owner actions and re-run checks."
      ]
    },
    clientReadinessPack: {
      readiness_score: 98,
      review_flow: [
        "Start from the sanitized inventory shape.",
        "Run the browser-only assessment before sharing derived findings."
      ]
    },
    generatedAt: "2026-06-26T06:50:00.000Z"
  });

  assert.equal(pack.schema_version, "oid-client-kickoff-pack/v1");
  assert.equal(pack.title, "OID Inventory Assessment Client Kickoff Pack");
  assert.equal(pack.generated_at, "2026-06-26T06:50:00.000Z");
  assert.ok(pack.initial_reply.includes("sanitized OID inventory"));
  assert.ok(pack.safe_intake_request.includes("oid"));
  assert.ok(pack.first_call_agenda.some((item) => item.includes("inventory shape")));
  assert.ok(pack.deliverables_preview.some((item) => item.includes("Remediation queue")));
  assert.ok(pack.acceptance_preview.some((item) => item.includes("classified")));
  assert.ok(pack.boundary_notes.some((item) => item.includes("credentials")));
  assert.ok(pack.proof_links.some((item) => item.path === "reports/decision-one-pager.md"));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("\u8d5a\u94b1"), false);

  const markdown = renderClientKickoffMarkdown(pack);
  assert.ok(markdown.includes("# OID Inventory Assessment Client Kickoff Pack"));
  assert.ok(markdown.includes("## Initial Reply"));
  assert.ok(markdown.includes("## Safe Intake Request"));
  assert.ok(markdown.includes("## First Call Agenda"));
  assert.ok(markdown.includes("reports/decision-one-pager.md"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testAssetAudit() {
  const penIndex = [
    { number: 9, oid: "1.3.6.1.4.1.9", organization: "ciscoSystems" }
  ];
  const oidBaseIndex = {
    entries: [
      {
        oid: "2.16.840.1.101.3.4.2.1",
        source_url: "https://oid-base.com/get/2.16.840.1.101.3.4.2.1",
        sitemap_lastmod: "2021-07-27",
        root_arc: "2",
        depth: 10
      }
    ]
  };

  const audit = analyzeAssetText(`asset,oid
router-core,1.3.6.1.4.1.9.9.41
sha256-policy,2.16.840.1.101.3.4.2.1
unknown-enterprise,1.3.6.1.4.1.999999.1
internal-policy,1.2.840.113549
bad-row,not-an-oid
`, { penIndex, oidBaseIndex, generatedAt: "2026-06-24T00:00:00.000Z" });

  assert.equal(audit.summary.total_assets, 5);
  assert.equal(audit.summary.valid_oids, 4);
  assert.equal(audit.summary.invalid_values, 1);
  assert.equal(audit.summary.private_enterprise_oids, 2);
  assert.equal(audit.summary.known_enterprises, 1);
  assert.equal(audit.summary.oidbase_directory_matches, 1);
  assert.equal(audit.summary.evidence_ready_assets, 2);
  assert.equal(audit.summary.unresolved_assets, 3);
  assert.equal(audit.summary.quality_score, 68);
  assert.equal(audit.findings[0].enterprise.organization, "ciscoSystems");
  assert.equal(audit.findings[1].oidbase_match.source_url, "https://oid-base.com/get/2.16.840.1.101.3.4.2.1");
  assert.equal(audit.findings[2].status, "unknown_private_enterprise_oid");
  assert.equal(audit.findings[3].status, "valid_oid_unmatched");
  assert.equal(audit.findings[4].status, "invalid_value");
  assert.ok(audit.recommendations.some((item) => item.includes("invalid")));
  assert.deepEqual(audit.action_plan.map((item) => [item.priority, item.title, item.count]), [
    ["P0", "Correct invalid OID values", 1],
    ["P1", "Identify owners for unknown private enterprise arcs", 1],
    ["P1", "Review unmatched valid OIDs against internal registries", 1],
    ["P2", "Preserve evidence-ready public registry mappings", 2]
  ]);

  const markdown = renderAssetAuditMarkdown(audit);
  assert.ok(markdown.includes("# OID Asset Audit"));
  assert.ok(markdown.includes("## Action Plan"));
  assert.ok(markdown.includes("Correct invalid OID values"));
  assert.ok(markdown.includes("ciscoSystems"));
  assert.ok(markdown.includes("not-an-oid"));

  const csv = renderAssetAuditCsv(audit);
  assert.ok(csv.startsWith("index,label,oid,status,risk,enterprise,oidbase_source,next_action"));
  assert.ok(csv.includes("router-core,1.3.6.1.4.1.9.9.41,known_private_enterprise_oid,low,ciscoSystems"));
  assert.ok(csv.includes("bad-row,not-an-oid,invalid_value,high"));
  assert.equal(csv.includes("money" + "-goal"), false);
  assert.equal(csv.includes("USD " + "200"), false);

  const handoff = buildAssessmentHandoff(audit, { generatedAt: "2026-06-24T00:00:00.000Z" });
  assert.equal(handoff.generated_at, "2026-06-24T00:00:00.000Z");
  assert.equal(handoff.summary_text.includes("Quality score: 68/100"), true);
  assert.equal(handoff.summary_text.includes("Client data boundary"), true);
  assert.ok(handoff.markdown.includes("# OID Inventory Assessment Handoff"));
  assert.ok(handoff.markdown.includes("## Client data boundary"));
  assert.ok(handoff.csv.startsWith("index,label,oid,status,risk,enterprise,oidbase_source,next_action"));
  assert.equal(Object.hasOwn(handoff, "source_text"), false);
  assert.equal(JSON.stringify(handoff).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(handoff).includes("USD " + "200"), false);
}

function testAssetAuditRecognizesCertificatePolicyOidHeader() {
  const audit = analyzeAssetText(`asset_label,certificate_subject,certificate_policy_oid
api-edge-cert,CN=api.example.test,2.16.840.1.113733.1.7.23.6
legacy-mtls-cert,CN=legacy-mtls,abc.1.2`, {
    generatedAt: "2026-06-26T00:00:00.000Z"
  });

  assert.equal(audit.summary.total_assets, 2);
  assert.equal(audit.findings[0].label, "api-edge-cert");
  assert.equal(audit.findings[0].oid, "2.16.840.1.113733.1.7.23.6");
  assert.equal(audit.findings[0].status, "valid_oid_unmatched");
  assert.equal(audit.findings[1].label, "legacy-mtls-cert");
  assert.equal(audit.findings[1].oid, "abc.1.2");
  assert.equal(audit.findings[1].status, "invalid_value");
}

function testCoverageReport() {
  const penIndex = [
    { number: 9, oid: "1.3.6.1.4.1.9", organization: "ciscoSystems" },
    { number: 10, oid: "1.3.6.1.4.1.10", organization: "Exact Org" },
    { number: 11, oid: "1.3.6.1.4.1.11", organization: "Missing Org" },
    { number: 12, oid: "1.3.6.1.4.1.12", organization: "Subtree Org" }
  ];
  const oidBaseIndex = {
    entries: [
      {
        oid: "1.3.6.1.4.1.10",
        source_url: "https://oid-base.com/get/1.3.6.1.4.1.10",
        sitemap_lastmod: "2026-06-01",
        root_arc: "1",
        depth: 7
      },
      {
        oid: "1.3.6.1.4.1.12.1",
        source_url: "https://oid-base.com/get/1.3.6.1.4.1.12.1",
        sitemap_lastmod: "2026-06-02",
        root_arc: "1",
        depth: 8
      },
      {
        oid: "2.16.840.1.101.3.4.2.1",
        source_url: "https://oid-base.com/get/2.16.840.1.101.3.4.2.1",
        sitemap_lastmod: "2021-07-27",
        root_arc: "2",
        depth: 10
      }
    ]
  };

  const report = analyzeCoverage({ penIndex, oidBaseIndex, generatedAt: "2026-06-24T00:00:00.000Z" });
  assert.equal(report.summary.total_public_pen_records, 4);
  assert.equal(report.summary.exact_oidbase_matches, 1);
  assert.equal(report.summary.subtree_only_matches, 1);
  assert.equal(report.summary.missing_oidbase_entries, 2);
  assert.equal(report.summary.coverage_score, 50);
  assert.equal(report.findings[0].status, "missing_oidbase_entry");
  assert.equal(report.findings[2].status, "exact_oidbase_match");
  assert.equal(report.findings[3].matching_child_count, 1);
  assert.deepEqual(report.action_plan.map((item) => [item.priority, item.title, item.count]), [
    ["P1", "Review public PEN records missing from OID-base directory", 2],
    ["P2", "Check subtree-only enterprise arcs for missing parent registration evidence", 1],
    ["P3", "Preserve exact OID-base evidence mappings", 1]
  ]);

  const markdown = renderCoverageMarkdown(report);
  assert.ok(markdown.includes("# OID Coverage Report"));
  assert.ok(markdown.includes("Missing Org"));
  assert.ok(markdown.includes("Subtree Org"));
  assert.ok(markdown.includes("50/100"));
}

function testDeliveryPackRenderer() {
  const pack = renderDeliveryPack({
    generatedAt: "2026-06-24T00:00:00.000Z",
    assetAudit: {
      summary: {
        total_assets: 4,
        valid_oids: 3,
        invalid_values: 1,
        evidence_ready_assets: 2,
        unresolved_assets: 2,
        quality_score: 78
      },
      action_plan: [
        { priority: "P0", title: "Correct invalid OID values", count: 1, action: "Fix malformed values." },
        { priority: "P1", title: "Review unmatched valid OIDs", count: 1, action: "Check internal registry." }
      ],
      findings: [
        { label: "router-core", oid: "1.3.6.1.4.1.9.9.41", status: "known_private_enterprise_oid", risk: "low" },
        { label: "invalid-row", oid: "not-an-oid", status: "invalid_value", risk: "high" }
      ]
    },
    coverageReport: {
      summary: {
        total_public_pen_records: 65959,
        exact_oidbase_matches: 127,
        subtree_only_matches: 289,
        missing_oidbase_entries: 65543,
        coverage_score: 1
      }
    }
  });

  assert.ok(pack.includes("# OID Asset Evidence Delivery Pack"));
  assert.ok(pack.includes("Client data boundary"));
  assert.ok(pack.includes("Quality score: `78/100`"));
  assert.ok(pack.includes("OID-base coverage score: `1/100`"));
  assert.ok(pack.includes("Correct invalid OID values"));
  assert.ok(pack.includes("router-core"));
  assert.equal(pack.includes("money" + "-goal"), false);
  assert.equal(pack.includes("USD " + "200"), false);
}

function testRemediationBoardRenderer() {
  const board = buildRemediationBoard({
    generatedAt: "2026-06-24T00:00:00.000Z",
    assetAudit: {
      findings: [
        { index: 1, label: "router-core", oid: "1.3.6.1.4.1.9.9.41", status: "known_private_enterprise_oid", risk: "low", enterprise: { organization: "ciscoSystems", oid: "1.3.6.1.4.1.9" } },
        { index: 2, label: "directory-hit", oid: "2.16.840.1.101.3.4.2.1", status: "oidbase_directory_match", risk: "low", oidbase_match: { source_url: "https://oid-base.com/get/2.16.840.1.101.3.4.2.1" } },
        { index: 3, label: "unknown-enterprise", oid: "1.3.6.1.4.1.999999.1", status: "unknown_private_enterprise_oid", risk: "medium" },
        { index: 4, label: "bad-row", oid: "not-an-oid", status: "invalid_value", risk: "high" }
      ]
    }
  });

  assert.equal(board.summary.total_items, 4);
  assert.equal(board.summary.p0_items, 1);
  assert.equal(board.summary.p1_items, 1);
  assert.equal(board.summary.p2_items, 2);
  assert.equal(board.summary.evidence_ready_items, 2);
  assert.equal(board.summary.client_action_items, 2);
  assert.equal(board.rows[0].id, "OID-004");
  assert.equal(board.rows[0].priority, "P0");
  assert.ok(board.rows[0].acceptance_check.includes("re-runs"));
  assert.ok(board.rows.some((row) => row.evidence_url === "https://oid-base.com/get/2.16.840.1.101.3.4.2.1"));

  const markdown = renderRemediationBoardMarkdown(board);
  assert.ok(markdown.includes("# OID Remediation Board"));
  assert.ok(markdown.includes("Client action items: `2`"));
  assert.ok(markdown.includes("Invalid OID syntax"));
  assert.ok(markdown.includes("Sanitized finding"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);

  const csv = renderRemediationBoardCsv(board);
  assert.ok(csv.startsWith("id,priority,asset,oid,status"));
  assert.ok(csv.includes("OID-004,P0,bad-row,not-an-oid"));
  assert.equal(csv.includes("\u8d5a\u94b1"), false);
}

function testEngagementBriefRenderer() {
  const brief = renderEngagementBrief({
    generatedAt: "2026-06-24T00:00:00.000Z",
    assetAudit: {
      summary: {
        total_assets: 12,
        valid_oids: 10,
        invalid_values: 2,
        evidence_ready_assets: 5,
        unresolved_assets: 7,
        quality_score: 71
      },
      action_plan: [
        { priority: "P0", title: "Correct invalid OID values", count: 2, action: "Fix malformed values." },
        { priority: "P1", title: "Review unmatched valid OIDs", count: 3, action: "Check internal registry." }
      ]
    },
    coverageReport: {
      summary: {
        total_public_pen_records: 65959,
        exact_oidbase_matches: 127,
        subtree_only_matches: 289,
        missing_oidbase_entries: 65543,
        coverage_score: 1
      }
    },
    sourcePolicy: {
      source_urls: {
        sitemap: "https://oid-base.com/sitemap.xml",
        terms: "https://oid-base.com/disclaimer.htm.md"
      },
      collection_boundary: {
        full_crawl_requires_authorization: true,
        page_bodies_publishable_without_authorization: false
      }
    }
  });

  assert.ok(brief.includes("# OID Inventory Assessment Brief"));
  assert.ok(brief.includes("## Executive Summary"));
  assert.ok(brief.includes("## Best Fit"));
  assert.ok(brief.includes("## First Review Call Agenda"));
  assert.ok(brief.includes("## Client Inputs"));
  assert.ok(brief.includes("## Deliverables"));
  assert.ok(brief.includes("## Acceptance Criteria"));
  assert.ok(brief.includes("Start with a sanitized inventory sample"));
  assert.ok(brief.includes("SNMP/MIB owner review"));
  assert.ok(brief.includes("internal OID registry cleanup"));
  assert.ok(brief.includes("Quality score: `71/100`"));
  assert.ok(brief.includes("Full OID-base page bodies are outside the default scope"));
  assert.ok(brief.includes("Correct invalid OID values"));
  assert.equal(brief.includes("money" + "-goal"), false);
  assert.equal(brief.includes("USD " + "200"), false);
  assert.equal(brief.includes("\u8d5a\u94b1"), false);
}

function testPublishGuardFlagsPrivateMirrorFiles() {
  const audit = auditPublishableFileList([
    "README.md",
    "reports/oid-base-sitemap-index.json",
    "data/full/records.jsonl",
    "data/raw/1.2.3.md",
    "data/sample/1.2.3.md",
    "data/sample/records.jsonl"
  ]);

  assert.equal(audit.ok, false);
  assert.equal(audit.blockers.length, 4);
  assert.ok(audit.blockers.some((item) => item.path === "data/full/records.jsonl"));
  assert.ok(audit.blockers.some((item) => item.path === "data/raw/1.2.3.md"));
  assert.ok(audit.blockers.some((item) => item.path === "data/sample/1.2.3.md"));
  assert.ok(audit.blockers.some((item) => item.path === "data/sample/records.jsonl"));
}

function testPublishGuardAllowsPublicArtifacts() {
  const audit = auditPublishableFileList([
    "README.md",
    "README.zh.md",
    "src/cli.js",
    "reports/oid-base-sitemap-index.json",
    "reports/iana-pen-public-index.json",
    "reports/dataset-manifest.json",
    "data/README.md",
    "data/iana/RUN-20260624.md",
    "data/sample/RUN-20260624.md",
    "public/index.html"
  ]);

  assert.equal(audit.ok, true);
  assert.equal(audit.blockers.length, 0);
}

function testChineseOperatorDocsAreReadableUtf8() {
  const docs = [
    "README.zh.md",
    "docs/operator-reading-order.zh.md",
    "docs/authorized-full-crawl.zh.md",
    "docs/snapshot-20260624.zh.md"
  ];
  const requiredPhrasesByDoc = {
    "README.zh.md": [
      "\u672c\u9879\u76ee",
      "\u53ef\u4ee5\u516c\u5f00",
      "\u6388\u6743\u540e"
    ],
    "docs/operator-reading-order.zh.md": [
      "\u9605\u8bfb\u987a\u5e8f",
      "\u5feb\u901f\u540c\u6b65",
      "\u6388\u6743\u5168\u91cf\u91c7\u96c6"
    ],
    "docs/authorized-full-crawl.zh.md": [
      "\u6388\u6743\u5168\u91cf\u91c7\u96c6",
      "\u9ed8\u8ba4\u6a21\u5f0f",
      "\u53d1\u5e03\u8fb9\u754c"
    ],
    "docs/snapshot-20260624.zh.md": [
      "\u6570\u636e\u5feb\u7167",
      "\u5df2\u8fd0\u884c\u7684\u91c7\u96c6",
      "\u5408\u89c4\u8fb9\u754c"
    ]
  };
  const mojibakePattern = /锛|涓|涔|佺|绋|鐨|鏄|璇|鈥|鎺|鏁|閫|闆|鍙|绱|缁|瀹|锟|�/;

  for (const doc of docs) {
    const text = fs.readFileSync(path.join(ROOT, doc), "utf8");
    assert.equal(mojibakePattern.test(text), false, `${doc} contains likely mojibake`);
    assert.ok(text.includes("OID"), `${doc} should describe the OID project`);
    for (const phrase of requiredPhrasesByDoc[doc]) {
      assert.ok(text.includes(phrase), `${doc} should contain readable Chinese phrase: ${phrase}`);
    }
  }
}

function testArticleSampleIndexIncludesOidAssessmentProposal() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/submission-landing.md",
    "docs/articles/publication-proposal-oid-inventory-assessment.md",
    "public/writing-samples.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("publication-proposal-oid-inventory-assessment.md") || file.endsWith("publication-proposal-oid-inventory-assessment.md"), `${file} should link the OID assessment proposal`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const proposal = fs.readFileSync(path.join(ROOT, "docs/articles/publication-proposal-oid-inventory-assessment.md"), "utf8");
  assert.ok(proposal.includes("Turn a messy OID inventory into a safe review package"));
  assert.ok(proposal.includes("https://ooyxloo.github.io/oid-knowledge-lab/consulting-brief.html"));
  assert.ok(proposal.includes("npm run guard:publishable"));
}

function testArticleSampleIndexIncludesAirbytePipelineProof() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/submission-landing.md",
    "docs/articles/editor-pitch-pack.md",
    "public/writing-samples.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("airbyte-friendly-registry-evidence-pipeline.md"), `${file} should link the Airbyte-friendly registry evidence pipeline sample`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const sample = fs.readFileSync(path.join(ROOT, "docs/articles/airbyte-friendly-registry-evidence-pipeline.md"), "utf8");
  assert.ok(sample.includes("Airbyte-friendly registry evidence pipeline"));
  assert.ok(sample.includes("source boundary"));
  assert.ok(sample.includes("sanitized local inventory"));
}

function testBuyerSignalPackRenderer() {
  assert.equal(buyerSignalPackModule.__loadError, undefined, buyerSignalPackModule.__loadError);
  const { buildBuyerSignalPack, renderBuyerSignalMarkdown } = buyerSignalPackModule;
  const pack = buildBuyerSignalPack({
    assetAudit: {
      summary: {
        total_assets: 12,
        evidence_ready_assets: 4,
        unresolved_assets: 6,
        invalid_values: 2,
        unknown_private_enterprise_oids: 3,
        quality_score: 72
      },
      action_plan: [
        { priority: "P0", title: "Correct invalid OID values", count: 2, action: "Fix malformed values." },
        { priority: "P1", title: "Identify owners for unknown private enterprise arcs", count: 3, action: "Map PEN owners." }
      ]
    },
    coverageReport: {
      summary: {
        total_public_pen_records: 65959,
        exact_oidbase_matches: 127,
        subtree_only_matches: 289,
        missing_oidbase_entries: 65543,
        coverage_score: 1
      }
    },
    sourcePolicy: {
      collection_boundary: {
        full_crawl_requires_authorization: true,
        page_bodies_publishable_without_authorization: false
      }
    },
    generatedAt: "2026-06-27T00:00:00.000Z"
  });

  assert.equal(pack.schema_version, "oid-buyer-signal-pack/v1");
  assert.equal(pack.generated_at, "2026-06-27T00:00:00.000Z");
  assert.ok(pack.buyer_summary.includes("12 sanitized OID assets"));
  assert.ok(pack.buyer_signals.some((item) => item.signal.includes("6 unresolved")));
  assert.ok(pack.qualifying_questions.some((item) => item.includes("SNMP")));
  assert.ok(pack.first_scope_offer.includes("sanitized OID inventory"));
  assert.ok(pack.subject_lines.length >= 3);
  assert.ok(pack.proof_links.some((item) => item.path === "reports/remediation-board.md"));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("\u8d5a\u94b1"), false);

  const markdown = renderBuyerSignalMarkdown(pack);
  assert.ok(markdown.includes("# OID Buyer Signal Pack"));
  assert.ok(markdown.includes("## Buyer Signals"));
  assert.ok(markdown.includes("## First Scope Offer"));
  assert.ok(markdown.includes("reports/remediation-board.md"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function main() {
  testSitemapParser();
  testSitemapIndex();
  testSourcePolicySnapshotDocumentsCollectionBoundary();
  testSourcePolicyMarkdownAvoidsFullTermsMirror();
  testRobots();
  testMarkdownParser();
  testReport();
  testCrawlResumeSelectionSkipsExistingRecords();
  testCrawlResumeSelectionSupportsUnlimitedLimit();
  testCrawlFailureSummaryKeepsResumeStateUseful();
  testAuthorizedCrawlPlanDocumentsBoundaryAndScale();
  testDatasetManifest();
  testIanaPenParser();
  testSiteRenderer();
  testClientIntakePack();
  testClientReadinessPackRenderer();
  testVerticalUseCasePackRenderer();
  testScopeProposalPackRenderer();
  testStatementOfWorkPackRenderer();
  testDecisionOnePagerRenderer();
  testClientKickoffPackRenderer();
  testAssetAudit();
  testAssetAuditRecognizesCertificatePolicyOidHeader();
  testCoverageReport();
  testDeliveryPackRenderer();
  testRemediationBoardRenderer();
  testEngagementBriefRenderer();
  testPublishGuardFlagsPrivateMirrorFiles();
  testPublishGuardAllowsPublicArtifacts();
  testChineseOperatorDocsAreReadableUtf8();
  testArticleSampleIndexIncludesOidAssessmentProposal();
  testArticleSampleIndexIncludesAirbytePipelineProof();
  testBuyerSignalPackRenderer();
  console.log("oid knowledge tests passed");
}

main();
