"use strict";

const assert = require("assert");
const { analyzeAssetText, renderAssetAuditMarkdown } = require("../src/assetAudit");
const { buildIanaPenReport, buildPublicPenIndex, emailDomain, hasPublicContactNoise, parseEnterpriseNumbers, parseLastUpdated } = require("../src/ianaPen");
const { assertPublishableManifest, buildDatasetManifest } = require("../src/manifest");
const { parseOidMarkdown } = require("../src/parser");
const { auditPublishableFileList } = require("../src/publishGuard");
const { buildReport } = require("../src/report");
const { isAllowedByRobots } = require("../src/robots");
const { escapeHtml, percent, renderDashboard } = require("../src/site");
const { buildSitemapIndex, getOidEntries, parseSitemap } = require("../src/sitemap");

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
  }, 42);
  assert.ok(html.includes("OID and enterprise registry dashboard"));
  assert.ok(html.includes("Search enterprise OIDs"));
  assert.ok(html.includes("Search sitemap catalog"));
  assert.ok(html.includes("99 public IANA PEN assignments"));
  assert.ok(html.includes("42 OID-base sitemap entries"));
  assert.ok(html.includes("66,101") === false);
  assert.ok(html.includes("Example &lt;Org&gt;"));
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
bad-row,not-an-oid
`, { penIndex, oidBaseIndex, generatedAt: "2026-06-24T00:00:00.000Z" });

  assert.equal(audit.summary.total_assets, 3);
  assert.equal(audit.summary.valid_oids, 2);
  assert.equal(audit.summary.invalid_values, 1);
  assert.equal(audit.summary.private_enterprise_oids, 1);
  assert.equal(audit.summary.known_enterprises, 1);
  assert.equal(audit.summary.oidbase_directory_matches, 1);
  assert.equal(audit.summary.quality_score, 78);
  assert.equal(audit.findings[0].enterprise.organization, "ciscoSystems");
  assert.equal(audit.findings[1].oidbase_match.source_url, "https://oid-base.com/get/2.16.840.1.101.3.4.2.1");
  assert.equal(audit.findings[2].status, "invalid_value");
  assert.ok(audit.recommendations.some((item) => item.includes("invalid")));

  const markdown = renderAssetAuditMarkdown(audit);
  assert.ok(markdown.includes("# OID Asset Audit"));
  assert.ok(markdown.includes("ciscoSystems"));
  assert.ok(markdown.includes("not-an-oid"));
}

function testPublishGuardFlagsPrivateMirrorFiles() {
  const audit = auditPublishableFileList([
    "README.md",
    "reports/oid-base-sitemap-index.json",
    "data/full/records.jsonl",
    "data/raw/1.2.3.md",
    "data/sample/records.jsonl"
  ]);

  assert.equal(audit.ok, false);
  assert.equal(audit.blockers.length, 3);
  assert.ok(audit.blockers.some((item) => item.path === "data/full/records.jsonl"));
  assert.ok(audit.blockers.some((item) => item.path === "data/raw/1.2.3.md"));
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

function main() {
  testSitemapParser();
  testSitemapIndex();
  testRobots();
  testMarkdownParser();
  testReport();
  testDatasetManifest();
  testIanaPenParser();
  testSiteRenderer();
  testAssetAudit();
  testPublishGuardFlagsPrivateMirrorFiles();
  testPublishGuardAllowsPublicArtifacts();
  console.log("oid knowledge tests passed");
}

main();
