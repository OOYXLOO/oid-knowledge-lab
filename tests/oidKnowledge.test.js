"use strict";

const assert = require("assert");
const { buildIanaPenReport, emailDomain, parseEnterpriseNumbers, parseLastUpdated } = require("../src/ianaPen");
const { parseOidMarkdown } = require("../src/parser");
const { buildReport } = require("../src/report");
const { isAllowedByRobots } = require("../src/robots");
const { escapeHtml, percent, renderDashboard } = require("../src/site");
const { getOidEntries, parseSitemap } = require("../src/sitemap");

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
    sitemap_lastmod: "2026-01-01"
  }]);
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
`;
  const records = parseEnterpriseNumbers(text);
  assert.equal(parseLastUpdated(text), "2026-06-23");
  assert.equal(records.length, 3);
  assert.equal(records[1].oid, "1.3.6.1.4.1.9");
  assert.equal(records[1].organization, "ciscoSystems");
  assert.equal(records[2].notes[0], "extra note");
  assert.equal(emailDomain("davej&cisco.com"), "cisco.com");
  assert.equal(emailDomain("---none---"), "none");

  const report = buildIanaPenReport(records, { lastUpdated: "2026-06-23" });
  assert.equal(report.record_count, 3);
  assert.equal(report.assigned_count, 2);
  assert.equal(report.reserved_count, 1);
  assert.equal(report.highest_enterprise_number, 10);
  assert.ok(report.top_email_domains.some((entry) => entry.key === "cisco.com"));
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
    sample_organizations: [{ enterprise_number: 9, oid: "1.3.6.1.4.1.9", organization: "Example <Org>" }]
  });
  assert.ok(html.includes("IANA Private Enterprise Numbers dashboard"));
  assert.ok(html.includes("66,101") === false);
  assert.ok(html.includes("Example &lt;Org&gt;"));
}

function main() {
  testSitemapParser();
  testRobots();
  testMarkdownParser();
  testReport();
  testIanaPenParser();
  testSiteRenderer();
  console.log("oid knowledge tests passed");
}

main();
