"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { analyzeAssetText, buildAssessmentHandoff, renderAssetAuditCsv, renderAssetAuditMarkdown } = require("../src/assetAudit");
let agentSubmissionPackModule;
try {
  agentSubmissionPackModule = require("../src/agentSubmissionPack");
} catch (error) {
  agentSubmissionPackModule = { __loadError: error.message };
}
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
const { buildQwenAgentPlan, buildQwenChatRequest, callQwenChat, renderQwenAgentMarkdown, writeQwenAgentDemo } = require("../src/qwenAgent");
let qwenSubmissionPackModule;
try {
  qwenSubmissionPackModule = require("../src/qwenSubmissionPack");
} catch (error) {
  qwenSubmissionPackModule = { __loadError: error.message };
}
let mediaProvenancePackModule;
try {
  mediaProvenancePackModule = require("../src/mediaProvenancePack");
} catch (error) {
  mediaProvenancePackModule = { __loadError: error.message };
}
let proofDeskPackModule;
try {
  proofDeskPackModule = require("../src/proofDeskPack");
} catch (error) {
  proofDeskPackModule = { __loadError: error.message };
}

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

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("airbyte-submission-brief.md"), `${file} should link the Airbyte submission brief`);
  }

  const brief = fs.readFileSync(path.join(ROOT, "docs/articles/airbyte-submission-brief.md"), "utf8");
  assert.ok(brief.includes("Airbyte submission brief"));
  assert.ok(brief.includes("Article promise"));
  assert.ok(brief.includes("Airbyte-style pipeline map"));
  assert.ok(brief.includes("Connector Builder"));
  assert.ok(brief.includes("Local JSON destination"));
  assert.ok(brief.includes("https://ooyxloo.github.io/oid-knowledge-lab/sample-assessment.html"));
  assert.equal(brief.includes("money" + "-goal"), false);
  assert.equal(brief.includes("USD " + "200"), false);
  assert.equal(brief.includes("\u8d5a\u94b1"), false);
}

function testArticleSampleIndexIncludesAirbyteFullDraft() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/submission-landing.md",
    "docs/articles/airbyte-submission-brief.md",
    "public/writing-samples.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("airbyte-registry-evidence-dashboard-full-draft.md"), `${file} should link the Airbyte full draft`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const draft = fs.readFileSync(path.join(ROOT, "docs/articles/airbyte-registry-evidence-dashboard-full-draft.md"), "utf8");
  assert.ok(draft.includes("Build a Safe Registry Evidence Dashboard from Public and Local Data"));
  assert.ok(draft.includes("sanitized local inventory"));
  assert.ok(draft.includes("Airbyte adaptation path"));
  assert.ok(draft.includes("Low-code CDK"));
  assert.ok(draft.includes("File source"));
  assert.ok(draft.includes("Local JSON destination"));
  assert.ok(draft.includes("publish guard"));
  assert.ok(draft.includes("https://ooyxloo.github.io/oid-knowledge-lab/sample-assessment.html"));
  assert.equal(draft.includes("money" + "-goal"), false);
  assert.equal(draft.includes("USD " + "200"), false);
  assert.equal(draft.includes("\u8d5a\u94b1"), false);
}

function testAirbyteReviewerHubIncludesRunnableProofPack() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/airbyte-submission-brief.md",
    "public/airbyte-reviewer-hub.html",
    "public/writing-samples.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("airbyte-runnable-proof-pack.md"), `${file} should link the runnable Airbyte proof pack`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const proof = fs.readFileSync(path.join(ROOT, "docs/articles/airbyte-runnable-proof-pack.md"), "utf8");
  assert.ok(proof.includes("Runnable Airbyte proof pack"));
  assert.ok(proof.includes("npm run audit:local"));
  assert.ok(proof.includes("Connector Builder"));
  assert.ok(proof.includes("sanitized local inventory"));
  assert.ok(proof.includes("reports/dataset-manifest.json"));
  assert.ok(proof.includes("public/airbyte-reviewer-hub.html"));
  assert.equal(proof.includes("money" + "-goal"), false);
  assert.equal(proof.includes("USD " + "200"), false);
  assert.equal(proof.includes("\u8d5a\u94b1"), false);
}

function testArticleSampleIndexIncludesCivoSubmissionBrief() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/submission-landing.md",
    "docs/articles/editor-pitch-pack.md",
    "public/writing-samples.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("civo-submission-brief.md"), `${file} should link the Civo submission brief`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const brief = fs.readFileSync(path.join(ROOT, "docs/articles/civo-submission-brief.md"), "utf8");
  assert.ok(brief.includes("Civo submission brief"));
  assert.ok(brief.includes("Civo Kubernetes"));
  assert.ok(brief.includes("kubectl"));
  assert.ok(brief.includes("cluster"));
  assert.ok(brief.includes("container image"));
  assert.ok(brief.includes("release evidence"));
  assert.ok(brief.includes("GitHub Pages"));
  assert.ok(brief.includes("release guard"));
  assert.ok(brief.includes("npm run guard:publishable"));
  assert.ok(brief.includes("https://ooyxloo.github.io/oid-knowledge-lab/"));
  assert.equal(brief.includes("money" + "-goal"), false);
  assert.equal(brief.includes("USD " + "200"), false);
  assert.equal(brief.includes("\u8d5a\u94b1"), false);
}

function testArticleSampleIndexIncludesCivoFullDraft() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/submission-landing.md",
    "docs/articles/civo-submission-brief.md",
    "public/writing-samples.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("civo-static-evidence-dashboard-full-draft.md"), `${file} should link the Civo full draft`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const draft = fs.readFileSync(path.join(ROOT, "docs/articles/civo-static-evidence-dashboard-full-draft.md"), "utf8");
  assert.ok(draft.includes("Build a Kubernetes Release Evidence Dashboard for Civo with Node.js and a Release Guard"));
  assert.ok(draft.includes("Civo Kubernetes"));
  assert.ok(draft.includes("kubectl"));
  assert.ok(draft.includes("container image"));
  assert.ok(draft.includes("release evidence"));
  assert.ok(draft.includes("GitHub Pages"));
  assert.ok(draft.includes("release guard"));
  assert.ok(draft.includes("npm run guard:publishable"));
  assert.equal(draft.includes("money" + "-goal"), false);
  assert.equal(draft.includes("USD " + "200"), false);
  assert.equal(draft.includes("\u8d5a\u94b1"), false);
}

function testArticleSampleIndexIncludesDirectusFullDraft() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/submission-landing.md",
    "docs/articles/directus-submission-brief.md",
    "public/writing-samples.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("directus-registry-evidence-review-hub-full-draft.md"), `${file} should link the Directus full draft`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const draft = fs.readFileSync(path.join(ROOT, "docs/articles/directus-registry-evidence-review-hub-full-draft.md"), "utf8");
  assert.ok(draft.includes("Build a Registry Evidence Review Hub with Directus, Generated JSON, and a Static Proof Page"));
  assert.ok(draft.includes("Directus"));
  assert.ok(draft.includes("Data Studio"));
  assert.ok(draft.includes("Items API"));
  assert.ok(draft.includes("roles and permissions"));
  assert.ok(draft.includes("Directus Flow"));
  assert.ok(draft.includes("many-to-one relation"));
  assert.ok(draft.includes("review_status"));
  assert.ok(draft.includes("static proof page"));
  assert.equal(draft.includes("money" + "-goal"), false);
  assert.equal(draft.includes("USD " + "200"), false);
  assert.equal(draft.includes("\u8d5a\u94b1"), false);
}

function testDraftDevEditorialFitBriefMatchesWriterNetwork() {
  const brief = fs.readFileSync(path.join(ROOT, "docs/articles/draftdev-editorial-fit-brief.md"), "utf8");
  assert.ok(brief.includes("Draft.dev writer-network application"));
  assert.ok(brief.includes("developer-tool"));
  assert.ok(brief.includes("client brief"));
  assert.ok(brief.includes("SME notes"));
  assert.ok(brief.includes("outline"));
  assert.ok(brief.includes("revision"));
  assert.ok(brief.includes("byline or ghostwritten"));
  assert.equal(brief.includes("money" + "-goal"), false);
  assert.equal(brief.includes("USD " + "200"), false);
  assert.equal(brief.includes("\u8d5a\u94b1"), false);
}

function testArticleSampleIndexIncludesAppSignalFullDraft() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/submission-landing.md",
    "docs/articles/appsignal-submission-brief.md",
    "public/writing-samples.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("appsignal-production-integration-debugging-full-draft.md"), `${file} should link the AppSignal full draft`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const draft = fs.readFileSync(path.join(ROOT, "docs/articles/appsignal-production-integration-debugging-full-draft.md"), "utf8");
  assert.ok(draft.includes("Debug a Node.js Integration Failure with AppSignal APM, Error Tracking, and Custom Metrics"));
  assert.ok(draft.includes("AppSignal APM"));
  assert.ok(draft.includes("error tracking"));
  assert.ok(draft.includes("custom metrics"));
  assert.ok(draft.includes("performance"));
  assert.ok(draft.includes("Node.js"));
  assert.ok(draft.includes("namespace"));
  assert.ok(draft.includes("logs"));
  assert.ok(draft.includes("metrics"));
  assert.ok(draft.includes("traces"));
  assert.equal(draft.includes("money" + "-goal"), false);
  assert.equal(draft.includes("USD " + "200"), false);
  assert.equal(draft.includes("\u8d5a\u94b1"), false);
}

function testArticleSampleIndexIncludesSigNozFullDraft() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/submission-landing.md",
    "docs/articles/signoz-submission-brief.md",
    "public/writing-samples.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("signoz-observability-debugging-full-draft.md"), `${file} should link the SigNoz full draft`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const draft = fs.readFileSync(path.join(ROOT, "docs/articles/signoz-observability-debugging-full-draft.md"), "utf8");
  assert.ok(draft.includes("Instrument a Node.js Webhook Worker with OpenTelemetry and Debug It in SigNoz"));
  assert.ok(draft.includes("Node.js"));
  assert.ok(draft.includes("logs"));
  assert.ok(draft.includes("metrics"));
  assert.ok(draft.includes("traces"));
  assert.ok(draft.includes("OpenTelemetry"));
  assert.ok(draft.includes("OTLP exporter"));
  assert.ok(draft.includes("SigNoz Explorer"));
  assert.ok(draft.includes("trace-log correlation"));
  assert.equal(draft.includes("money" + "-goal"), false);
  assert.equal(draft.includes("USD " + "200"), false);
  assert.equal(draft.includes("\u8d5a\u94b1"), false);
}

function testKnowledgeOwlEvidenceLogTemplateIsLinkedAndBoundarySafe() {
  const files = [
    "public/knowledgeowl-reviewer-hub.html",
    "public/writing-samples.html",
    "docs/articles/README.md"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("knowledgeowl-evidence-log-template.md"), `${file} should link the KnowledgeOwl evidence log template`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const template = fs.readFileSync(path.join(ROOT, "docs/articles/knowledgeowl-evidence-log-template.md"), "utf8");
  assert.ok(template.includes("Reader question"));
  assert.ok(template.includes("Source facts"));
  assert.ok(template.includes("Draft claims to verify"));
  assert.ok(template.includes("Publication blockers"));
  assert.ok(template.includes("Privacy boundary"));
  assert.ok(template.includes("Decision"));
  assert.equal(template.includes("money" + "-goal"), false);
  assert.equal(template.includes("USD " + "200"), false);
  assert.equal(template.includes("\u8d5a\u94b1"), false);
}

function testKnowledgeOwlApplicationFieldPackIsPublicAndSubmitReady() {
  const files = [
    "docs/articles/knowledgeowl-application-field-pack.md",
    "public/knowledgeowl-application-field-pack.html",
    "public/knowledgeowl-one-link.html"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("KnowledgeOwl"), `${file} should name KnowledgeOwl`);
    assert.ok(text.includes("blog@knowledgeowl.com"), `${file} should include the submission address`);
    assert.ok(text.includes("USD 250") || text.includes("$250"), `${file} should include the public minimum article rate`);
    assert.ok(text.includes("topic ideas"), `${file} should include topic ideas`);
    assert.ok(text.includes("brief outline"), `${file} should include a brief outline`);
    assert.ok(text.includes("samples"), `${file} should include sample links`);
    assert.ok(text.includes("knowledgeowl-editorial-draft-preview"), `${file} should link the draft preview`);
    assert.ok(text.includes("knowledgeowl-evidence-log-template"), `${file} should link the evidence log template`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
    assert.equal(text.includes("D:\\hks"), false);
  }
}

function testArticleSampleIndexIncludesRealPythonMiniSample() {
  const files = [
    "docs/articles/README.md",
    "public/writing-samples.html",
    "public/realpython-ai-reviewer-hub.html",
    "docs/articles/realpython-paid-pilot-readiness-pack.md",
    "docs/articles/realpython-application-one-link.md"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    if (file !== "docs/articles/realpython-application-one-link.md") {
      assert.ok(text.includes("realpython-ai-validation-mini-sample.md"), `${file} should link the Real Python mini sample`);
    }
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  for (const file of [
    "public/realpython-ai-reviewer-hub.html",
    "docs/articles/realpython-paid-pilot-readiness-pack.md",
    "docs/articles/realpython-application-one-link.md"
  ]) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("duration_parser_review"), `${file} should link the duration parser review case`);
    assert.ok(text.includes("Duration parser"), `${file} should name the duration parser review case`);
  }

  const sample = fs.readFileSync(path.join(ROOT, "docs/articles/realpython-ai-validation-mini-sample.md"), "utf8");
  assert.ok(sample.includes("Validate AI-Generated Python Code"));
  assert.ok(sample.includes("pytest"));
  assert.ok(sample.includes("Evidence log"));
  assert.ok(sample.includes("When to reject"));
  assert.ok(sample.includes("No secrets"));
  assert.equal(sample.includes("money" + "-goal"), false);
  assert.equal(sample.includes("USD " + "200"), false);
  assert.equal(sample.includes("\u8d5a\u94b1"), false);
}

function testWritingSamplesPageHasEditorDecisionPanel() {
  const text = fs.readFileSync(path.join(ROOT, "public/writing-samples.html"), "utf8");
  assert.ok(text.includes("Editor quick decision"), "writing samples page should include a fast editorial decision panel");
  assert.ok(text.includes("Submission-ready queue"), "writing samples page should show the submission-ready queue");
  assert.ok(text.includes("editor-pitch-pack.html"), "writing samples page should link the field-ready editor pitch pack");
  assert.ok(text.includes("editor-assignment-fit.html"), "writing samples page should link the assignment fit page");
  for (const platform of ["Airbyte", "Civo", "Draft.dev", "Directus", "AppSignal", "SigNoz"]) {
    assert.ok(text.includes(platform), `writing samples page should include ${platform}`);
  }
  assert.equal(text.includes("money" + "-goal"), false);
  assert.equal(text.includes("USD " + "200"), false);
  assert.equal(text.includes("\u8d5a\u94b1"), false);
}

function testEditorAssignmentFitPageIsLinkedAndBoundarySafe() {
  const page = fs.readFileSync(path.join(ROOT, "public/editor-assignment-fit.html"), "utf8");
  assert.ok(page.includes("Three editor-ready article directions"), "assignment fit page should state the decision purpose");
  assert.ok(page.includes("KnowledgeOwl"), "assignment fit page should include KnowledgeOwl");
  assert.ok(page.includes("Amezmo"), "assignment fit page should include Amezmo");
  assert.ok(page.includes("Unleash"), "assignment fit page should include Unleash");
  assert.ok(page.includes("knowledgeowl-one-link.html"), "assignment fit page should link KnowledgeOwl proof");
  assert.ok(page.includes("amezmo-php-deployment-one-link.html"), "assignment fit page should link Amezmo proof");
  assert.ok(page.includes("unleash-continuous-delivery-one-link.html"), "assignment fit page should link Unleash proof");
  assert.ok(page.includes("writing-samples.html"), "assignment fit page should link writing samples");
  assert.equal(page.includes("money" + "-goal"), false);
  assert.equal(page.includes("USD " + "200"), false);
  assert.equal(page.includes("\u8d5a\u94b1"), false);

  for (const file of ["public/writing-samples.html", "public/paid-writing-editor-brief.html", "src/site.js", "README.md"]) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("editor-assignment-fit.html"), `${file} should link the assignment fit page`);
  }
}

function testUnleashContinuousDeliveryPacketIsLinkedAndBoundarySafe() {
  const page = fs.readFileSync(path.join(ROOT, "public/unleash-continuous-delivery-one-link.html"), "utf8");
  assert.ok(page.includes("Feature flags as the rollout boundary"), "Unleash packet should include feature-flag positioning");
  assert.ok(page.includes("continuous delivery"), "Unleash packet should include continuous delivery positioning");
  assert.ok(page.includes("release-guard-static-artifacts.md"), "Unleash packet should link the release guard sample");
  assert.ok(page.includes("civo-static-evidence-dashboard-full-draft.md"), "Unleash packet should link a long-form release evidence draft");
  assert.ok(page.includes("implementation-authenticity-proof.html"), "Unleash packet should link authenticity proof");
  assert.equal(page.includes("money" + "-goal"), false);
  assert.equal(page.includes("USD " + "200"), false);
  assert.equal(page.includes("\u8d5a\u94b1"), false);

  for (const file of ["public/writing-samples.html", "public/editor-assignment-fit.html", "src/site.js", "README.md"]) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("unleash-continuous-delivery-one-link.html"), `${file} should link the Unleash packet`);
  }
}

function testHoneybadgerDebuggingPacketIsLinkedAndBoundarySafe() {
  const page = fs.readFileSync(path.join(ROOT, "public/honeybadger-debugging-one-link.html"), "utf8");
  assert.ok(page.includes("Reproducible debugging handoffs"), "Honeybadger packet should include debugging positioning");
  assert.ok(page.includes("Python"), "Honeybadger packet should include Python/backend positioning");
  assert.ok(page.includes("observability-debugging-handoff-playbook.md"), "Honeybadger packet should link the debugging handoff playbook");
  assert.ok(page.includes("appsignal-production-integration-debugging-full-draft.md"), "Honeybadger packet should link a long-form debugging draft");
  assert.ok(page.includes("production-integration-handoff-template.md"), "Honeybadger packet should link the handoff template");
  assert.ok(page.includes("technical-rigor-proof.html"), "Honeybadger packet should link technical proof");
  assert.equal(page.includes("money" + "-goal"), false);
  assert.equal(page.includes("USD " + "200"), false);
  assert.equal(page.includes("\u8d5a\u94b1"), false);
  assert.equal(page.includes("D:\\hks"), false);

  for (const file of ["public/writing-samples.html", "public/paid-writing-editor-brief.html", "src/site.js", "README.md"]) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("honeybadger-debugging-one-link.html"), `${file} should link the Honeybadger debugging packet`);
  }
}

function testPhpDeploymentEvidenceChecklistIsLinkedAndBoundarySafe() {
  const files = [
    "docs/articles/amezmo-php-deployment-evidence-checklist.md",
    "public/amezmo-php-deployment-one-link.html",
    "public/index.html",
    "public/writing-samples.html",
    "docs/articles/README.md"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("PHP"), `${file} should include PHP positioning`);
    assert.ok(text.includes("deployment") || text.includes("Deployment"), `${file} should include deployment positioning`);
    assert.ok(text.includes("No secrets") || text.includes("no-secret") || text.includes("Secrets excluded") || text.includes("credentials"), `${file} should include secret boundary`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const page = fs.readFileSync(path.join(ROOT, "public/amezmo-php-deployment-one-link.html"), "utf8");
  assert.ok(page.includes("composer validate --strict"));
  assert.ok(page.includes("php artisan migrate --pretend"));
  assert.ok(page.includes("Rollback"));
  assert.ok(page.includes("Screenshot storyboard"));
  assert.ok(page.includes("Pre-flight terminal"));
  assert.ok(page.includes("Post-release checks"));
  assert.ok(page.includes("amezmo-php-deployment-evidence-checklist.md"));
}

function testAppsmithOidReviewerHubIsPublicAndBoundarySafe() {
  const files = [
    "docs/articles/appsmith-oid-review-app-one-pager.md",
    "public/appsmith-oid-reviewer-hub.html",
    "public/writing-samples.html",
    "README.md"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("Appsmith"), `${file} should include Appsmith positioning`);
    assert.ok(text.includes("OID"), `${file} should include OID positioning`);
    assert.ok(text.includes("review") || text.includes("Review"), `${file} should include review workflow positioning`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const page = fs.readFileSync(path.join(ROOT, "public/appsmith-oid-reviewer-hub.html"), "utf8");
  assert.ok(page.includes("Table"));
  assert.ok(page.includes("JSObject"));
  assert.ok(page.includes("Markdown handoff"));
  assert.ok(page.includes("appsmith-oid-review-app-one-pager.md"));
}

function testPaidWritingApplicationDeskIsPublicAndBoundarySafe() {
  const files = [
    "docs/articles/README.md",
    "docs/articles/paid-writing-application-desk.md",
    "docs/articles/p1-application-answer-sheet.md",
    "public/writing-samples.html",
    "public/paid-writing-application-desk.html",
    "public/p1-application-answer-sheet.html"
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    for (const platform of ["Real Python", "Vultr", "Draft.dev", "DigitalOcean"]) {
      assert.ok(text.includes(platform), `${file} should include ${platform}`);
    }
    assert.ok(
      text.includes("https://ooyxloo.github.io/oid-knowledge-lab/writing-samples.html") ||
        text.includes("writing-samples.html"),
      `${file} should link to the writing samples portfolio`
    );
    assert.ok(text.includes("No credentials"));
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }
  for (const file of ["docs/articles/paid-writing-application-desk.md", "public/paid-writing-application-desk.html"]) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("Paid writing application desk"), `${file} should include the application desk title`);
  }
  const page = fs.readFileSync(path.join(ROOT, "public/paid-writing-application-desk.html"), "utf8");
  assert.ok(page.includes("realpython-ai-validation-mini-sample.md"));
  assert.ok(page.includes("vultr-creator-readiness-pack.md"));
  assert.ok(page.includes("draftdev-writer-profile-one-pager.md"));
  assert.ok(page.includes("digitalocean-topic-proposal-readiness-pack.md"));
  assert.ok(page.includes("p1-application-answer-sheet.html"));
  const answerSheet = fs.readFileSync(path.join(ROOT, "public/p1-application-answer-sheet.html"), "utf8");
  assert.ok(answerSheet.includes("Universal bio"));
  assert.ok(answerSheet.includes("Real Python"));
  assert.ok(answerSheet.includes("Vultr Creator Program"));
  assert.ok(answerSheet.includes("Draft.dev"));
  assert.ok(answerSheet.includes("DigitalOcean entry check"));
}

function testBackupPitchPackIsPublicAndBoundarySafe() {
  const combinedFiles = [
    "docs/articles/README.md",
    "docs/articles/sitepoint-testdriven-backup-pitch-pack.md",
    "public/writing-samples.html",
    "public/content-backup-pitch-pack.html"
  ];
  for (const file of combinedFiles) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("Tuts+"), `${file} should include Tuts+`);
    assert.ok(text.includes("TestDriven.io"), `${file} should include TestDriven.io`);
    assert.ok(text.includes("No credentials"), `${file} should include submission boundaries`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }
  for (const file of ["docs/articles/tutsplus-tutorial-readiness-pack.md", "public/tutsplus-tutorial-reviewer-hub.html"]) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("Tuts+"), `${file} should include Tuts+`);
    assert.ok(text.includes("No credentials"), `${file} should include submission boundaries`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }
  const page = fs.readFileSync(path.join(ROOT, "public/content-backup-pitch-pack.html"), "utf8");
  assert.ok(page.includes("tutsplus-tutorial-reviewer-hub.html"));
  assert.ok(page.includes("tutsplus-tutorial-readiness-pack.md"));
  assert.ok(page.includes("static-evidence-dashboard-github-pages.md"));
  assert.ok(page.includes("realpython-ai-validation-mini-sample.md"));
  const hub = fs.readFileSync(path.join(ROOT, "public/tutsplus-tutorial-reviewer-hub.html"), "utf8");
  assert.ok(hub.includes("Tuts+ tutorial reviewer hub"));
  assert.ok(hub.includes("tutsplus-tutorial-readiness-pack.md"));
  const instructorFiles = [
    "docs/articles/envato-tutsplus-instructor-pack.md",
    "public/envato-tutsplus-instructor-hub.html",
    "public/writing-samples.html",
    "public/content-backup-pitch-pack.html",
    "docs/articles/README.md"
  ];
  for (const file of instructorFiles) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("Envato Tuts+"), `${file} should include Envato Tuts+`);
    assert.ok(text.includes("video"), `${file} should include video-course positioning`);
    assert.ok(text.includes("No credentials"), `${file} should include submission boundaries`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }
}

function testPublicEditorPitchPackHasFieldReadyCopy() {
  const text = fs.readFileSync(path.join(ROOT, "public/editor-pitch-pack.html"), "utf8");
  assert.ok(text.includes("Field-ready editor pitch pack"));
  assert.ok(text.includes("editor-submission-field-pack.html"));
  for (const platform of ["Airbyte", "Civo", "Draft.dev", "Directus", "AppSignal", "SigNoz"]) {
    assert.ok(text.includes(platform), `editor pitch pack should include ${platform}`);
  }
  assert.ok(text.includes("Build a Safe Registry Evidence Dashboard from Public and Local Data"));
  assert.ok(text.includes("Build a Kubernetes Release Evidence Dashboard for Civo"));
  assert.ok(text.includes("Build a Registry Evidence Review Hub with Directus Data Studio"));
  assert.ok(text.includes("Developer-tool tutorials"));
  assert.ok(text.includes("Debug a Node.js Integration Failure with AppSignal APM"));
  assert.ok(text.includes("Instrument a Node.js Webhook Worker with OpenTelemetry"));
  assert.equal(text.includes("money" + "-goal"), false);
  assert.equal(text.includes("USD " + "200"), false);
  assert.equal(text.includes("\u8d5a\u94b1"), false);
}

function testEditorSubmissionFieldPackIsPublicAndBoundarySafe() {
  const markdown = fs.readFileSync(path.join(ROOT, "docs/articles/editor-submission-field-pack.md"), "utf8");
  const page = fs.readFileSync(path.join(ROOT, "public/editor-submission-field-pack.html"), "utf8");
  for (const text of [markdown, page]) {
    assert.ok(text.includes("Editor submission field pack"));
    assert.ok(text.includes("Short bio"));
    assert.ok(text.includes("Airbyte"));
    assert.ok(text.includes("Civo"));
    assert.ok(text.includes("Draft.dev"));
    assert.ok(text.includes("Directus"));
    assert.ok(text.includes("AppSignal"));
    assert.ok(text.includes("SigNoz"));
    assert.ok(text.includes("https://ooyxloo.github.io/oid-knowledge-lab/editor-pitch-pack.html"));
    assert.ok(text.includes("No credentials"));
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }
  assert.ok(page.includes("airbyte-registry-evidence-dashboard-full-draft.md"));
  assert.ok(page.includes("Connector Builder"));
  assert.ok(page.includes("civo-static-evidence-dashboard-full-draft.md"));
  assert.ok(page.includes("signoz-observability-debugging-full-draft.md"));
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

function testAiEvaluatorPortfolioIncludesDurationParserReviewCase() {
  const caseDir = path.join(ROOT, "examples", "ai-validation-python", "duration_parser_review");
  const readmePath = path.join(caseDir, "README.md");
  const testPath = path.join(caseDir, "test_duration_parser.py");
  const evidencePath = path.join(caseDir, "evidence-log.md");
  const publicFiles = [
    "public/ai-code-evaluator-portfolio.html",
    "public/mindrift-code-reviewer-hub.html",
    "docs/articles/ai-code-evaluator-portfolio-pack.md"
  ];

  assert.ok(fs.existsSync(readmePath), "duration parser review README should exist");
  assert.ok(fs.existsSync(testPath), "duration parser review tests should exist");
  assert.ok(fs.existsSync(evidencePath), "duration parser review evidence log should exist");

  const readme = fs.readFileSync(readmePath, "utf8");
  const evidence = fs.readFileSync(evidencePath, "utf8");

  assert.ok(readme.includes("AI Coding Evaluator"));
  assert.ok(readme.includes("silently returns 0 for unknown units"));
  assert.ok(evidence.includes("Reject the generated implementation as written"));
  assert.equal(readme.includes("money" + "-goal"), false);
  assert.equal(evidence.includes("USD " + "200"), false);

  for (const file of publicFiles) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("duration_parser_review"), `${file} should link the duration parser review case`);
    assert.ok(text.includes("Duration parser review"), `${file} should name the duration parser review case`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }
}

function testAiEvaluatorApplicationPacketIsPublicAndBoundarySafe() {
  const files = [
    "public/ai-evaluator-application-packet.html",
    "docs/articles/ai-evaluator-application-one-link.md",
    "public/ai-code-evaluator-portfolio.html",
    "public/mindrift-code-reviewer-hub.html"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(/AI [Ee]valuator [Aa]pplication [Pp]acket/.test(text), `${file} should include the packet title`);
    assert.ok(text.includes("duration_parser_review"), `${file} should link the duration parser case`);
    assert.ok(text.includes("accept/revise/reject") || text.includes("accepted, revised, or rejected"), `${file} should include evaluator verdict framing`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  const page = fs.readFileSync(path.join(ROOT, "public/ai-evaluator-application-packet.html"), "utf8");
  assert.ok(page.includes("Short role summary"));
  assert.ok(page.includes("Verdict frame"));
  assert.ok(page.includes("Best-fit tasks"));
  assert.ok(page.includes("No private data") || page.includes("private account exports"));
}

function testAiCodeReviewCasebookIsLinkedAndBoundarySafe() {
  const files = [
    "public/ai-code-review-casebook.html",
    "docs/articles/ai-code-review-casebook.md"
  ];
  const linkSources = [
    "public/ai-evaluator-application-packet.html",
    "public/mindrift-code-one-link.html",
    "public/alignerr-python-one-link.html",
    "public/ai-code-evaluator-portfolio.html"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("AI Code Review Casebook"), `${file} should include the casebook title`);
    assert.ok(text.includes("Verdict:"), `${file} should include the verdict answer frame`);
    assert.ok(text.includes("duration_parser_review"), `${file} should link the duration parser review case`);
    assert.ok(text.includes("accept / revise / reject"), `${file} should include explicit verdict options`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  for (const file of linkSources) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("ai-code-review-casebook.html"), `${file} should link the AI code review casebook`);
  }
}

function testAiReviewerApplicationSummaryIsLinkedAndBoundarySafe() {
  const summaryPath = path.join(ROOT, "docs", "articles", "ai-reviewer-application-summary.md");
  const summary = fs.readFileSync(summaryPath, "utf8");
  const linkSources = [
    "public/ai-code-review-casebook.html",
    "public/ai-evaluator-application-packet.html",
    "public/mindrift-code-one-link.html",
    "public/alignerr-python-one-link.html"
  ];

  assert.ok(summary.includes("AI Reviewer Application Summary"));
  assert.ok(summary.includes("Mindrift Code"));
  assert.ok(summary.includes("Alignerr Python"));
  assert.ok(summary.includes("AI Code Review Casebook"));
  assert.ok(summary.includes("Verdict:"));
  assert.ok(summary.includes("duration_parser_review"));
  assert.equal(summary.includes("money" + "-goal"), false);
  assert.equal(summary.includes("USD " + "200"), false);
  assert.equal(summary.includes("\u8d5a\u94b1"), false);

  for (const file of linkSources) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("ai-reviewer-application-summary.md"), `${file} should link the AI reviewer application summary`);
  }
}

function testPythonAssessmentDrillIsLinkedAndBoundarySafe() {
  const files = [
    "public/python-assessment-drill.html",
    "docs/articles/python-assessment-drill.md"
  ];
  const linkSources = [
    "public/mindrift-code-one-link.html",
    "public/alignerr-python-one-link.html",
    "public/ai-code-review-casebook.html",
    "docs/articles/README.md"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("Python Assessment Drill"), `${file} should include the drill title`);
    assert.ok(text.includes("Bug triage prompt"), `${file} should include a bug triage prompt`);
    assert.ok(text.includes("Model answer rubric"), `${file} should include a model answer rubric`);
    assert.ok(text.includes("pytest"), `${file} should include pytest-oriented assessment proof`);
    assert.ok(text.includes("No credentials"), `${file} should include public safety boundaries`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  for (const file of linkSources) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("python-assessment-drill"), `${file} should link the Python assessment drill`);
  }
}

function testModelResponseComparisonLabIsLinkedAndBoundarySafe() {
  const files = [
    "public/model-response-comparison-lab.html",
    "docs/articles/model-response-comparison-lab.md"
  ];
  const linkSources = [
    "public/mindrift-code-one-link.html",
    "public/alignerr-python-one-link.html",
    "public/ai-code-review-casebook.html",
    "public/ai-evaluator-application-packet.html",
    "docs/articles/README.md"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("Model Response Comparison Lab"), `${file} should include the lab title`);
    assert.ok(text.includes("Candidate A"), `${file} should include candidate A`);
    assert.ok(text.includes("Candidate B"), `${file} should include candidate B`);
    assert.ok(text.includes("Winning answer"), `${file} should include a winning-answer verdict`);
    assert.ok(text.includes("pytest"), `${file} should include test-oriented evidence`);
    assert.ok(text.includes("Residual risk"), `${file} should include residual risk`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  for (const file of linkSources) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("model-response-comparison-lab"), `${file} should link the model response comparison lab`);
  }
}

function testOpenTrainAiCodeEvaluationOneLinkIsLinkedAndBoundarySafe() {
  const files = [
    "public/opentrain-ai-code-evaluation-one-link.html",
    "docs/articles/opentrain-ai-code-evaluation-one-link.md"
  ];
  const linkSources = [
    "public/ai-evaluator-application-packet.html",
    "public/index.html",
    "public/writing-samples.html"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("OpenTrain"), `${file} should include the OpenTrain label`);
    assert.ok(text.includes("AI code evaluation") || text.includes("code-evaluation"), `${file} should include code evaluation positioning`);
    assert.ok(text.includes("Python Assessment Drill"), `${file} should link the Python assessment drill`);
    assert.ok(text.includes("Model Response Comparison Lab"), `${file} should link the model comparison lab`);
    assert.ok(text.includes("duration_parser_review"), `${file} should link the duration parser review case`);
    assert.ok(text.includes("Verdict:"), `${file} should include the verdict frame`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }

  for (const file of linkSources) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("opentrain-ai-code-evaluation-one-link.html"), `${file} should link the OpenTrain one-link packet`);
  }
}

function testAiEvaluatorUnifiedApplicationDeskIsPublicAndSubmitReady() {
  const files = [
    "docs/articles/ai-evaluator-unified-application-desk.md",
    "public/ai-evaluator-unified-application-desk.html",
    "public/ai-evaluator-application-packet.html",
    "public/mindrift-code-one-link.html",
    "public/alignerr-python-one-link.html",
    "public/opentrain-ai-code-evaluation-one-link.html"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("AI evaluator"), `${file} should include AI evaluator positioning`);
    assert.ok(text.includes("Mindrift"), `${file} should include Mindrift`);
    assert.ok(text.includes("Alignerr"), `${file} should include Alignerr`);
    assert.ok(text.includes("OpenTrain"), `${file} should include OpenTrain`);
    assert.ok(text.includes("Short role summary"), `${file} should include a short role summary`);
    assert.ok(text.includes("Verdict:"), `${file} should include verdict frame`);
    assert.ok(text.includes("duration_parser_review"), `${file} should link the duration parser proof`);
    assert.ok(text.includes("Python Assessment Drill"), `${file} should link the Python drill`);
    assert.ok(text.includes("Model Response Comparison Lab"), `${file} should link model comparison proof`);
    assert.ok(text.includes("No credentials"), `${file} should include public safety boundaries`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
    assert.equal(text.includes("D:\\hks"), false);
  }
}

function testQwenAgentPlanBuildsOfflineRemediationHandoff() {
  const plan = buildQwenAgentPlan({
    generatedAt: "2026-06-29T00:00:00.000Z",
    findings: [
      { label: "router-core", oid: "1.3.6.1.4.1.9.9.41", status: "known_private_enterprise_oid", risk: "low", enterprise: { organization: "ciscoSystems" } },
      { label: "bad-row", oid: "not-an-oid", status: "invalid_value", risk: "high" }
    ],
    mode: "offline"
  });

  assert.equal(plan.provider, "qwen-compatible");
  assert.equal(plan.mode, "offline");
  assert.equal(plan.summary.total_findings, 2);
  assert.equal(plan.summary.human_gated_actions, 2);
  assert.ok(plan.remediation_queue.some((item) => item.action.includes("Correct the malformed OID")));
  assert.ok(plan.boundaries.includes("No secrets"));
  assert.equal(JSON.stringify(plan).includes("money" + "-goal"), false);
}

function testQwenChatRequestUsesDashScopeCompatibleMode() {
  const request = buildQwenChatRequest({
    model: "qwen-plus",
    prompt: "Summarize two OID findings.",
    plan: { summary: { total_findings: 2 }, remediation_queue: [] }
  });

  assert.equal(request.url, "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions");
  assert.equal(request.body.model, "qwen-plus");
  assert.equal(request.body.messages[0].role, "system");
  assert.ok(request.body.messages[0].content.includes("human approval gates"));
  assert.ok(request.body.messages[1].content.includes("Summarize two OID findings."));
}

async function testQwenChatCallUsesBearerKeyAndParsesMessage() {
  const originalFetch = global.fetch;
  let captured = null;
  global.fetch = async (url, options) => {
    captured = { url, options };
    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({
          choices: [
            { message: { content: "Review summary ready." } }
          ]
        });
      }
    };
  };

  try {
    const result = await callQwenChat({
      apiKey: "test-key",
      model: "qwen-plus",
      prompt: "Summarize.",
      plan: buildQwenAgentPlan({ generatedAt: "2026-06-29T00:00:00.000Z" })
    });

    assert.equal(captured.url, "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions");
    assert.equal(captured.options.method, "POST");
    assert.equal(captured.options.headers.authorization, "Bearer test-key");
    assert.equal(JSON.parse(captured.options.body).model, "qwen-plus");
    assert.equal(result.message, "Review summary ready.");
  } finally {
    global.fetch = originalFetch;
  }
}

function testQwenAgentMarkdownAndDemoFilesArePublicSafe() {
  const outDir = "C:\\Users\\YXL\\.codex\\tmp\\oid-knowledge-lab-test-qwen-agent";
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const result = writeQwenAgentDemo({
    jsonOutFile: path.join(outDir, "qwen-agent-demo.json"),
    markdownOutFile: path.join(outDir, "qwen-agent-demo.md"),
    generatedAt: "2026-06-29T00:00:00.000Z"
  });
  const markdown = renderQwenAgentMarkdown(result.plan);

  assert.ok(fs.existsSync(path.join(outDir, "qwen-agent-demo.json")));
  assert.ok(fs.existsSync(path.join(outDir, "qwen-agent-demo.md")));
  assert.ok(markdown.includes("# Qwen Autopilot Agent Demo"));
  assert.ok(markdown.includes("Human approval gates"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testQwenSubmissionPackBuildsJudgingAssets() {
  assert.equal(qwenSubmissionPackModule.__loadError, undefined, qwenSubmissionPackModule.__loadError);
  const { buildQwenSubmissionPack, renderQwenSubmissionMarkdown, renderQwenArchitectureMermaid, renderQwenArchitectureSvg, renderQwenArchitectureHtml } = qwenSubmissionPackModule;
  const pack = buildQwenSubmissionPack({
    generatedAt: "2026-06-29T00:00:00.000Z",
    publicBaseUrl: "https://ooyxloo.github.io/oid-knowledge-lab"
  });

  assert.equal(pack.schema_version, "qwen-submission-pack/v1");
  assert.ok(pack.devpost_fields.project_pitch.includes("OID remediation"));
  assert.ok(pack.devpost_fields.built_with.includes("Qwen"));
  assert.ok(pack.demo_script.scenes.length >= 5);
  assert.ok(pack.proof_checklist.some((item) => item.label === "Live Qwen run"));
  assert.ok(pack.proof_links.some((item) => item.url === "https://ooyxloo.github.io/oid-knowledge-lab/qwen-autopilot-agent-one-link.html"));
  assert.ok(pack.architecture.nodes.some((node) => node.id === "qwen"));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("D:\\hks"), false);

  const markdown = renderQwenSubmissionMarkdown(pack);
  assert.ok(markdown.includes("# Qwen Submission Pack"));
  assert.ok(markdown.includes("## Devpost Field Draft"));
  assert.ok(markdown.includes("## Three-Minute Demo Script"));
  assert.ok(markdown.includes("Live Qwen run"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);

  const mermaid = renderQwenArchitectureMermaid(pack);
  assert.ok(mermaid.includes("flowchart LR"));
  assert.ok(mermaid.includes("Qwen Cloud"));
  assert.ok(mermaid.includes("Human approval gate"));

  const svg = renderQwenArchitectureSvg(pack);
  assert.ok(svg.includes("<svg"));
  assert.ok(svg.includes("Qwen Cloud reasoning step"));
  assert.ok(svg.includes("Human approval gate"));
  assert.equal(svg.includes("money" + "-goal"), false);

  const html = renderQwenArchitectureHtml(pack);
  assert.ok(html.includes("Qwen Architecture Diagram"));
  assert.ok(html.includes("qwen-architecture.svg"));
  assert.ok(html.includes("Qwen Cloud reasoning step"));
  assert.equal(html.includes("USD " + "200"), false);
}

function testQwenSubmissionPackWritesPublicSafeFiles() {
  assert.equal(qwenSubmissionPackModule.__loadError, undefined, qwenSubmissionPackModule.__loadError);
  const { writeQwenSubmissionPack } = qwenSubmissionPackModule;
  const outDir = "C:\\Users\\YXL\\.codex\\tmp\\oid-knowledge-lab-test-qwen-submission-pack";
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const result = writeQwenSubmissionPack({
    jsonOutFile: path.join(outDir, "qwen-submission-pack.json"),
    markdownOutFile: path.join(outDir, "qwen-submission-pack.md"),
    mermaidOutFile: path.join(outDir, "qwen-architecture.mmd"),
    svgOutFile: path.join(outDir, "qwen-architecture.svg"),
    htmlOutFile: path.join(outDir, "qwen-architecture.html"),
    generatedAt: "2026-06-29T00:00:00.000Z",
    publicBaseUrl: "https://ooyxloo.github.io/oid-knowledge-lab"
  });

  assert.equal(result.pack.schema_version, "qwen-submission-pack/v1");
  for (const file of ["qwen-submission-pack.json", "qwen-submission-pack.md", "qwen-architecture.mmd", "qwen-architecture.svg", "qwen-architecture.html"]) {
    const text = fs.readFileSync(path.join(outDir, file), "utf8");
    assert.ok(text.length > 100, `${file} should contain useful content`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("D:\\hks"), false);
  }
}

function testQwenOneLinkReferencesSubmissionPack() {
  const page = fs.readFileSync(path.join(ROOT, "public", "qwen-autopilot-agent-one-link.html"), "utf8");
  const markdown = fs.readFileSync(path.join(ROOT, "docs", "articles", "qwen-autopilot-agent-one-link.md"), "utf8");
  for (const text of [page, markdown]) {
    assert.ok(text.includes("qwen-submission-pack.md"));
    assert.ok(text.includes("qwen-architecture.mmd"));
    assert.ok(text.includes("qwen-architecture.svg"));
    assert.ok(text.includes("qwen-architecture.html"));
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("\u8d5a\u94b1"), false);
  }
}

function testMediaProvenancePackBuildsDeliveryArtifacts() {
  assert.equal(mediaProvenancePackModule.__loadError, undefined, mediaProvenancePackModule.__loadError);
  const { buildMediaProvenancePack, renderMediaProvenanceMarkdown } = mediaProvenancePackModule;
  const pack = buildMediaProvenancePack({
    generatedAt: "2026-06-30T00:00:00.000Z",
    assets: [
      {
        name: "OID Intelligence explainer cover",
        type: "Image",
        status: "Approved",
        modelNote: "Generated cover image draft",
        evidenceNote: "Prompt summary and final hash recorded.",
        storageRef: "b2://demo/oid-cover.png",
        hash: "sha256:cover"
      },
      {
        name: "Registry review short ad",
        type: "Video",
        status: "Review",
        modelNote: "Generated storyboard",
        evidenceNote: "Needs caption proof.",
        storageRef: "b2://demo/review-ad.mp4",
        hash: "sha256:video"
      }
    ]
  });

  assert.equal(pack.schema_version, "media-provenance-pack/v1");
  assert.equal(pack.summary.total_assets, 2);
  assert.equal(pack.summary.approved_assets, 1);
  assert.equal(pack.summary.review_required_assets, 1);
  assert.deepEqual(pack.summary.media_types, ["Image", "Video"]);
  assert.ok(pack.delivery_sheet.some((item) => item.name === "OID Intelligence explainer cover"));
  assert.ok(pack.review_queue.some((item) => item.name === "Registry review short ad"));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);

  const markdown = renderMediaProvenanceMarkdown(pack);
  assert.ok(markdown.includes("# Media Provenance Delivery Sheet"));
  assert.ok(markdown.includes("Approved assets: `1`"));
  assert.ok(markdown.includes("Registry review short ad"));
  assert.ok(markdown.includes("Review queue"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testMediaProvenancePackWritesPublicSafeFiles() {
  assert.equal(mediaProvenancePackModule.__loadError, undefined, mediaProvenancePackModule.__loadError);
  const { writeMediaProvenancePack } = mediaProvenancePackModule;
  const outDir = "C:\\Users\\YXL\\.codex\\tmp\\oid-knowledge-lab-test-media-provenance";
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const result = writeMediaProvenancePack({
    jsonOutFile: path.join(outDir, "media-provenance-pack.json"),
    markdownOutFile: path.join(outDir, "media-provenance-pack.md"),
    generatedAt: "2026-06-30T00:00:00.000Z",
    assets: [
      {
        name: "Product architecture diagram",
        type: "Diagram",
        status: "Approved",
        modelNote: "Architecture diagram from product notes",
        evidenceNote: "Public-source boundary included.",
        storageRef: "b2://demo/diagram.png",
        hash: "sha256:diagram"
      }
    ]
  });

  assert.equal(result.pack.summary.total_assets, 1);
  for (const file of ["media-provenance-pack.json", "media-provenance-pack.md"]) {
    const text = fs.readFileSync(path.join(outDir, file), "utf8");
    assert.ok(text.includes("Product architecture diagram"));
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("D:\\hks"), false);
  }
}

function testBackblazeReadinessPackDocumentsCloudGate() {
  assert.equal(mediaProvenancePackModule.__loadError, undefined, mediaProvenancePackModule.__loadError);
  const { buildBackblazeReadinessPack, renderBackblazeReadinessMarkdown } = mediaProvenancePackModule;
  const mediaPack = mediaProvenancePackModule.buildMediaProvenancePack({
    generatedAt: "2026-06-30T00:00:00.000Z",
    assets: [
      {
        name: "OID Intelligence explainer cover",
        type: "Image",
        status: "Approved",
        modelNote: "Generated cover image draft",
        evidenceNote: "Prompt summary and final hash recorded.",
        storageRef: "b2://demo/oid-cover.png",
        hash: "sha256:cover"
      }
    ]
  });

  const readiness = buildBackblazeReadinessPack({
    generatedAt: "2026-06-30T00:00:00.000Z",
    mediaPack,
    publicBaseUrl: "https://ooyxloo.github.io/oid-knowledge-lab"
  });

  assert.equal(readiness.schema_version, "backblaze-readiness-pack/v1");
  assert.equal(readiness.project.title, "Media Provenance Studio");
  assert.equal(readiness.cloud_integration.status, "prototype_without_live_b2_credentials");
  assert.ok(readiness.devpost_fields.built_with.includes("Backblaze B2"));
  assert.ok(readiness.devpost_fields.built_with.includes("Genblaze"));
  assert.ok(readiness.required_gates.some((gate) => gate.includes("Backblaze B2")));
  assert.ok(readiness.proof_links.some((link) => link.url.includes("media-provenance-studio.html")));
  assert.equal(JSON.stringify(readiness).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(readiness).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(readiness).includes("D:\\hks"), false);

  const markdown = renderBackblazeReadinessMarkdown(readiness);
  assert.ok(markdown.includes("# Backblaze Generative Media Readiness Pack"));
  assert.ok(markdown.includes("prototype_without_live_b2_credentials"));
  assert.ok(markdown.includes("Backblaze B2"));
  assert.ok(markdown.includes("Genblaze"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testBackblazeReadinessPageIsPublicAndBoundarySafe() {
  const page = fs.readFileSync(path.join(ROOT, "public", "backblaze-readiness-pack.html"), "utf8");
  const linkSources = [
    "public/media-provenance-studio.html",
    "README.md"
  ];

  assert.ok(page.includes("Backblaze Generative Media Readiness Pack"));
  assert.ok(page.includes("Media Provenance Studio"));
  assert.ok(page.includes("prototype_without_live_b2_credentials"));
  assert.ok(page.includes("Backblaze B2"));
  assert.ok(page.includes("Genblaze"));
  assert.ok(page.includes("reports/backblaze-readiness-pack.md"));
  assert.ok(page.includes("reports/media-provenance-pack.md"));
  assert.equal(page.includes("money" + "-goal"), false);
  assert.equal(page.includes("USD " + "200"), false);
  assert.equal(page.includes("D:\\hks"), false);

  for (const file of linkSources) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("backblaze-readiness-pack.html"), `${file} should link the Backblaze readiness page`);
  }
}

function testProofDeskPackBuildsReviewHandoff() {
  assert.equal(proofDeskPackModule.__loadError, undefined, proofDeskPackModule.__loadError);
  const { buildProofDeskPack, renderProofDeskMarkdown } = proofDeskPackModule;
  const pack = buildProofDeskPack({
    generatedAt: "2026-06-30T00:00:00.000Z",
    claims: [
      {
        title: "Ready launch packet",
        artifact_type: "public demo",
        evidence_links: [{ label: "Demo", url: "https://example.com/demo", status: "ready" }]
      },
      {
        title: "Gated cloud integration",
        artifact_type: "readiness page",
        evidence_links: [{ label: "Readiness", url: "https://example.com/ready", status: "ready" }],
        blockers: ["Connect a real storage bucket."],
        human_gates: ["Confirm final submission details."]
      }
    ]
  });

  assert.equal(pack.schema_version, "proofdesk-pack/v1");
  assert.equal(pack.summary.total_claims, 2);
  assert.equal(pack.summary.ready_claims, 1);
  assert.equal(pack.summary.needs_human_review, 1);
  assert.ok(pack.slack_handoff[0].message.includes("[ready]"));
  assert.ok(pack.slack_handoff[1].message.includes("Connect a real storage bucket"));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("D:\\hks"), false);

  const markdown = renderProofDeskMarkdown(pack);
  assert.ok(markdown.includes("# ProofDesk Proof Packet"));
  assert.ok(markdown.includes("## Slack Handoff"));
  assert.ok(markdown.includes("Ready launch packet"));
  assert.ok(markdown.includes("Gated cloud integration"));
  assert.equal(markdown.includes("money" + "-goal"), false);
  assert.equal(markdown.includes("USD " + "200"), false);
}

function testProofDeskPackWritesPublicSafeFiles() {
  assert.equal(proofDeskPackModule.__loadError, undefined, proofDeskPackModule.__loadError);
  const { writeProofDeskPack } = proofDeskPackModule;
  const outDir = "C:\\Users\\YXL\\.codex\\tmp\\oid-knowledge-lab-test-proofdesk";
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const claimsFile = path.join(outDir, "claims.json");
  fs.writeFileSync(claimsFile, JSON.stringify([
    {
      title: "Public packet",
      artifact_type: "demo",
      evidence_links: [{ label: "Demo", url: "https://example.com", status: "ready" }]
    }
  ]), "utf8");

  const result = writeProofDeskPack({
    claimsFile,
    jsonOutFile: path.join(outDir, "proofdesk-pack.json"),
    markdownOutFile: path.join(outDir, "proofdesk-pack.md"),
    generatedAt: "2026-06-30T00:00:00.000Z"
  });

  assert.equal(result.pack.summary.total_claims, 1);
  for (const file of ["proofdesk-pack.json", "proofdesk-pack.md"]) {
    const text = fs.readFileSync(path.join(outDir, file), "utf8");
    assert.ok(text.includes("Public packet"));
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("D:\\hks"), false);
  }
}

function testProofDeskPagesArePublicAndBoundarySafe() {
  const files = [
    "docs/articles/proofdesk-slack-workflow-brief.md",
    "public/proofdesk-slack-workflow.html",
    "public/proofdesk-packet-demo.html"
  ];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert.ok(text.includes("ProofDesk"), `${file} should describe ProofDesk`);
    assert.ok(text.includes("public") || text.includes("Public"), `${file} should describe public inputs`);
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("D:\\hks"), false);
  }

  const demo = fs.readFileSync(path.join(ROOT, "public", "proofdesk-packet-demo.html"), "utf8");
  assert.ok(demo.includes("proofdesk-input"));
  assert.ok(demo.includes("proofdesk-run"));
  assert.ok(demo.includes("proofdesk-copy"));
  assert.ok(demo.includes("proofdesk-download"));
  assert.ok(demo.includes("function buildPacket"));
  assert.ok(demo.includes("Packet generated in this browser."));
  assert.ok(demo.includes("Nothing is uploaded."));
}

function testAgentSubmissionPackBuildsHackathonFields() {
  assert.equal(agentSubmissionPackModule.__loadError, undefined, agentSubmissionPackModule.__loadError);
  const { buildAgentSubmissionPack, renderAgentSubmissionMarkdown } = agentSubmissionPackModule;
  const pack = buildAgentSubmissionPack({
    generatedAt: "2026-06-30T00:00:00.000Z",
    publicBaseUrl: "https://ooyxloo.github.io/oid-knowledge-lab"
  });

  assert.equal(pack.schema_version, "agent-submission-pack/v1");
  assert.equal(pack.project.name, "ProofDesk");
  assert.ok(pack.shared_fields.what_it_does.includes("proof packets"));
  assert.ok(pack.slack_agent_builder.future_slack_commands.includes("/proofdesk packet"));
  assert.ok(pack.google_rapid_agent.agent_behavior.some((item) => item.includes("Classify")));
  assert.ok(pack.shared_fields.proof_links.some((link) => link.url.includes("proofdesk-packet-demo.html")));
  assert.equal(JSON.stringify(pack).includes("money" + "-goal"), false);
  assert.equal(JSON.stringify(pack).includes("USD " + "200"), false);
  assert.equal(JSON.stringify(pack).includes("D:\\hks"), false);

  const markdown = renderAgentSubmissionMarkdown(pack);
  assert.ok(markdown.includes("# ProofDesk Agent Submission Pack"));
  assert.ok(markdown.includes("## Slack Agent Builder Fit"));
  assert.ok(markdown.includes("## Google Rapid Agent Fit"));
  assert.ok(markdown.includes("Interactive ProofDesk packet demo"));
  assert.equal(markdown.includes("money" + "-goal"), false);
}

function testAgentSubmissionPackWritesPublicSafeFiles() {
  assert.equal(agentSubmissionPackModule.__loadError, undefined, agentSubmissionPackModule.__loadError);
  const { writeAgentSubmissionPack } = agentSubmissionPackModule;
  const outDir = "C:\\Users\\YXL\\.codex\\tmp\\oid-knowledge-lab-test-agent-submission";
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const result = writeAgentSubmissionPack({
    jsonOutFile: path.join(outDir, "agent-submission-pack.json"),
    markdownOutFile: path.join(outDir, "agent-submission-pack.md"),
    generatedAt: "2026-06-30T00:00:00.000Z",
    publicBaseUrl: "https://ooyxloo.github.io/oid-knowledge-lab"
  });

  assert.equal(result.pack.project.name, "ProofDesk");
  for (const file of ["agent-submission-pack.json", "agent-submission-pack.md"]) {
    const text = fs.readFileSync(path.join(outDir, file), "utf8");
    assert.ok(text.includes("ProofDesk"));
    assert.equal(text.includes("money" + "-goal"), false);
    assert.equal(text.includes("USD " + "200"), false);
    assert.equal(text.includes("D:\\hks"), false);
  }
}

function testProofDeskAgentSubmissionPageIsPublicAndBoundarySafe() {
  const page = fs.readFileSync(path.join(ROOT, "public", "proofdesk-agent-submission-pack.html"), "utf8");
  assert.ok(page.includes("ProofDesk Agent Submission Pack"));
  assert.ok(page.includes("Open generated pack"));
  assert.ok(page.includes("Open interactive demo"));
  assert.ok(page.includes("Slack"));
  assert.ok(page.includes("Final approval stays with a human reviewer"));
  assert.equal(page.includes("money" + "-goal"), false);
  assert.equal(page.includes("USD " + "200"), false);
  assert.equal(page.includes("D:\\hks"), false);
}

async function main() {
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
  testArticleSampleIndexIncludesAirbyteFullDraft();
  testAirbyteReviewerHubIncludesRunnableProofPack();
  testArticleSampleIndexIncludesCivoSubmissionBrief();
  testArticleSampleIndexIncludesCivoFullDraft();
  testArticleSampleIndexIncludesDirectusFullDraft();
  testArticleSampleIndexIncludesAppSignalFullDraft();
  testArticleSampleIndexIncludesSigNozFullDraft();
  testKnowledgeOwlEvidenceLogTemplateIsLinkedAndBoundarySafe();
  testKnowledgeOwlApplicationFieldPackIsPublicAndSubmitReady();
  testArticleSampleIndexIncludesRealPythonMiniSample();
  testWritingSamplesPageHasEditorDecisionPanel();
  testEditorAssignmentFitPageIsLinkedAndBoundarySafe();
  testUnleashContinuousDeliveryPacketIsLinkedAndBoundarySafe();
  testHoneybadgerDebuggingPacketIsLinkedAndBoundarySafe();
  testPhpDeploymentEvidenceChecklistIsLinkedAndBoundarySafe();
  testAppsmithOidReviewerHubIsPublicAndBoundarySafe();
  testPaidWritingApplicationDeskIsPublicAndBoundarySafe();
  testBackupPitchPackIsPublicAndBoundarySafe();
  testPublicEditorPitchPackHasFieldReadyCopy();
  testEditorSubmissionFieldPackIsPublicAndBoundarySafe();
  testAiEvaluatorPortfolioIncludesDurationParserReviewCase();
  testAiEvaluatorApplicationPacketIsPublicAndBoundarySafe();
  testAiCodeReviewCasebookIsLinkedAndBoundarySafe();
  testAiReviewerApplicationSummaryIsLinkedAndBoundarySafe();
  testPythonAssessmentDrillIsLinkedAndBoundarySafe();
  testModelResponseComparisonLabIsLinkedAndBoundarySafe();
  testOpenTrainAiCodeEvaluationOneLinkIsLinkedAndBoundarySafe();
  testAiEvaluatorUnifiedApplicationDeskIsPublicAndSubmitReady();
  testQwenAgentPlanBuildsOfflineRemediationHandoff();
  testQwenChatRequestUsesDashScopeCompatibleMode();
  await testQwenChatCallUsesBearerKeyAndParsesMessage();
  testQwenAgentMarkdownAndDemoFilesArePublicSafe();
  testQwenSubmissionPackBuildsJudgingAssets();
  testQwenSubmissionPackWritesPublicSafeFiles();
  testQwenOneLinkReferencesSubmissionPack();
  testMediaProvenancePackBuildsDeliveryArtifacts();
  testMediaProvenancePackWritesPublicSafeFiles();
  testBackblazeReadinessPackDocumentsCloudGate();
  testBackblazeReadinessPageIsPublicAndBoundarySafe();
  testProofDeskPackBuildsReviewHandoff();
  testProofDeskPackWritesPublicSafeFiles();
  testProofDeskPagesArePublicAndBoundarySafe();
  testAgentSubmissionPackBuildsHackathonFields();
  testAgentSubmissionPackWritesPublicSafeFiles();
  testProofDeskAgentSubmissionPageIsPublicAndBoundarySafe();
  testBuyerSignalPackRenderer();
  console.log("oid knowledge tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
