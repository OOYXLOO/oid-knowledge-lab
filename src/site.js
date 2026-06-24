"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir } = require("./net");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function percent(part, total) {
  if (!total) return "0.0%";
  return `${((Number(part || 0) / Number(total)) * 100).toFixed(1)}%`;
}

function barRows(items, total, label) {
  return (items || []).slice(0, 12).map((item) => {
    const width = Math.max(2, Math.round((Number(item.count || 0) / Math.max(1, total)) * 100));
    return `<div class="bar-row">
      <span class="bar-label">${escapeHtml(item.key)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${width}%"></span></span>
      <span class="bar-value">${formatNumber(item.count)} ${escapeHtml(label)}</span>
    </div>`;
  }).join("\n");
}

function renderSearchPanel(searchCount) {
  return `<section class="panel search-panel">
      <div>
        <p class="eyebrow">Lookup tool</p>
        <h2>Search enterprise OIDs</h2>
        <p class="panel-copy">Search ${formatNumber(searchCount)} public IANA PEN assignments by enterprise number, OID, or organization name. Contact-level records are not included in this published index.</p>
      </div>
      <label class="search-label" for="pen-search">Search term</label>
      <input id="pen-search" data-search-input type="search" placeholder="Try 9, 1.3.6.1.4.1.9, Cisco, IBM" autocomplete="off">
      <p class="search-count" data-search-count></p>
      <div class="search-results" data-search-results></div>
    </section>`;
}

function renderOidBasePanel(directoryCount) {
  return `<section class="panel search-panel">
      <div>
        <p class="eyebrow">OID-base directory</p>
        <h2>Search sitemap catalog</h2>
        <p class="panel-copy">Search ${formatNumber(directoryCount)} OID-base sitemap entries by OID, root arc, source URL, or last-modified date. This catalog stores directory metadata only and does not copy OID-base page bodies.</p>
      </div>
      <label class="search-label" for="oid-base-search">Search term</label>
      <input id="oid-base-search" data-oidbase-input type="search" placeholder="Try 2.16.840, root:2, 2026, certificate" autocomplete="off">
      <p class="search-count" data-oidbase-count></p>
      <div class="search-results" data-oidbase-results></div>
    </section>`;
}

function renderAuditPanel() {
  return `<section class="panel audit-panel">
      <div>
        <p class="eyebrow">Asset audit</p>
        <h2>Audit local OID list</h2>
        <p class="panel-copy">Paste CSV or one OID per line. Analysis runs in this browser and is not uploaded.</p>
      </div>
      <label class="search-label" for="asset-audit-input">OID inventory</label>
      <textarea id="asset-audit-input" data-audit-input rows="7" spellcheck="false" placeholder="asset,oid&#10;router-core,1.3.6.1.4.1.9.9.41&#10;sha256-policy,2.16.840.1.101.3.4.2.1"></textarea>
      <div class="audit-actions">
        <button type="button" data-audit-run>Run audit</button>
        <button type="button" data-audit-sample>Load sample</button>
        <button type="button" data-audit-clear>Clear</button>
      </div>
      <div class="audit-summary" data-audit-summary></div>
      <div class="search-results" data-audit-results></div>
    </section>`;
}

function renderDashboard(report, oidBaseDirectoryCount = 0) {
  const assigned = Number(report.assigned_count || 0);
  const total = Number(report.record_count || 0);
  const reserved = Number(report.reserved_count || 0);
  const domainMax = Math.max(...(report.top_email_domains || []).map((item) => Number(item.count || 0)), 1);
  const initialMax = Math.max(...(report.organization_initials || []).map((item) => Number(item.count || 0)), 1);
  const samples = (report.sample_organizations || []).slice(0, 16).map((item) => `<tr>
    <td>${formatNumber(item.enterprise_number)}</td>
    <td><code>${escapeHtml(item.oid)}</code></td>
    <td>${escapeHtml(item.organization)}</td>
  </tr>`).join("\n");

  const searchCount = Number(report.search_index_count || report.assigned_count || 0);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OID Knowledge Lab</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">OID Knowledge Lab</p>
      <h1>OID and enterprise registry dashboard</h1>
      <p class="summary">A compact, publishable workspace for <code>${escapeHtml(report.prefix)}</code> enterprise OIDs and OID-base directory coverage. It combines open IANA data with sitemap-level OID-base metadata.</p>
      <div class="links">
        <a href="${escapeHtml(report.source_url)}">IANA source</a>
        <a href="${escapeHtml(report.license_url)}">Licensing terms</a>
        <a href="https://oid-base.com/sitemap.xml">OID-base sitemap</a>
      </div>
    </section>

    <section class="metrics" aria-label="Registry metrics">
      <article><span>Total records</span><strong>${formatNumber(total)}</strong></article>
      <article><span>Assigned</span><strong>${formatNumber(assigned)}</strong><small>${percent(assigned, total)}</small></article>
      <article><span>Reserved</span><strong>${formatNumber(reserved)}</strong><small>${percent(reserved, total)}</small></article>
      <article><span>OID-base entries</span><strong>${formatNumber(oidBaseDirectoryCount)}</strong></article>
    </section>

    <section class="panel">
      <div>
        <p class="eyebrow">Contact-domain aggregate</p>
        <h2>Top public email domains</h2>
      </div>
      <div class="bars">${barRows(report.top_email_domains, domainMax, "records")}</div>
    </section>

    <section class="panel">
      <div>
        <p class="eyebrow">Organization aggregate</p>
        <h2>Leading organization initials</h2>
      </div>
      <div class="bars">${barRows(report.organization_initials, initialMax, "orgs")}</div>
    </section>

    ${renderSearchPanel(searchCount)}

    ${renderOidBasePanel(oidBaseDirectoryCount)}

    ${renderAuditPanel()}

    <section class="panel">
      <div>
        <p class="eyebrow">Sample lookup surface</p>
        <h2>First organizations in the registry</h2>
      </div>
      <table>
        <thead><tr><th>Number</th><th>OID</th><th>Organization</th></tr></thead>
        <tbody>${samples}</tbody>
      </table>
    </section>

    <section class="note">
      <h2>Data boundary</h2>
      <p>${escapeHtml(report.license_summary)}</p>
      <p>Generated from a local aggregate report at ${escapeHtml(report.generated_at)}. Full JSONL imports and contact-level records are kept out of the published dashboard.</p>
    </section>
  </main>
  <script src="data.js"></script>
  <script src="search-index.js"></script>
  <script src="oid-base-directory.js"></script>
  <script src="app.js"></script>
</body>
</html>`;
}

function renderCss() {
  return `:root {
  color-scheme: light;
  --ink: #17202a;
  --muted: #5d6d7e;
  --line: #d8dee9;
  --paper: #f7f9fb;
  --accent: #1f7a8c;
  --accent-2: #bf5b04;
  --white: #ffffff;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--ink);
  background: var(--paper);
}
main {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0 48px;
}
.hero {
  padding: 28px 0 18px;
  border-bottom: 1px solid var(--line);
}
.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}
h1, h2, p { margin-top: 0; }
h1 {
  max-width: 820px;
  font-size: 2.5rem;
  line-height: 1.05;
  letter-spacing: 0;
}
h2 {
  font-size: 1.15rem;
  letter-spacing: 0;
}
.summary {
  max-width: 780px;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.55;
}
.links { display: flex; flex-wrap: wrap; gap: 10px; }
a {
  color: var(--accent);
  font-weight: 700;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0;
}
.metrics article, .panel, .note {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.metrics article {
  padding: 16px;
  min-height: 104px;
}
.metrics span, .metrics small {
  display: block;
  color: var(--muted);
  font-size: 0.84rem;
}
.metrics strong {
  display: block;
  margin-top: 12px;
  font-size: 1.75rem;
}
.panel, .note {
  margin-top: 16px;
  padding: 20px;
}
.panel-copy {
  max-width: 760px;
  color: var(--muted);
  line-height: 1.55;
}
.search-label {
  display: block;
  margin: 12px 0 6px;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 700;
}
.search-panel input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  font: inherit;
}
.audit-panel textarea {
  width: 100%;
  min-height: 148px;
  resize: vertical;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  background: var(--white);
  font: 0.92rem/1.45 "SFMono-Regular", Consolas, monospace;
}
.audit-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.audit-actions button {
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  background: #eef4f6;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.audit-actions button:hover {
  border-color: var(--accent);
}
.audit-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 14px 0 6px;
}
.audit-summary span {
  display: block;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfd;
  color: var(--muted);
  font-size: 0.82rem;
}
.audit-summary strong {
  display: block;
  margin-top: 4px;
  color: var(--ink);
  font-size: 1.25rem;
}
.status-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 999px;
  background: #eef4f6;
  color: var(--ink);
  font-size: 0.78rem;
  font-weight: 700;
}
.search-count {
  margin: 10px 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.search-results {
  overflow-x: auto;
}
.bar-row {
  display: grid;
  grid-template-columns: minmax(100px, 180px) 1fr minmax(92px, auto);
  gap: 12px;
  align-items: center;
  min-height: 30px;
}
.bar-label, .bar-value {
  color: var(--muted);
  font-size: 0.88rem;
}
.bar-track {
  position: relative;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e9edf2;
}
.bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
th, td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}
code {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.9em;
}
.note {
  color: var(--muted);
}
@media (max-width: 760px) {
  main { width: min(100% - 20px, 1120px); padding-top: 18px; }
  h1 { font-size: 1.8rem; }
  .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .audit-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bar-row { grid-template-columns: 1fr; gap: 5px; margin-bottom: 12px; }
  table { display: block; overflow-x: auto; }
}
`;
}

function renderAppJs() {
  return `(function () {
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const count = document.querySelector("[data-search-count]");
  const oidBaseInput = document.querySelector("[data-oidbase-input]");
  const oidBaseResults = document.querySelector("[data-oidbase-results]");
  const oidBaseCount = document.querySelector("[data-oidbase-count]");
  const auditInput = document.querySelector("[data-audit-input]");
  const auditRun = document.querySelector("[data-audit-run]");
  const auditSample = document.querySelector("[data-audit-sample]");
  const auditClear = document.querySelector("[data-audit-clear]");
  const auditSummary = document.querySelector("[data-audit-summary]");
  const auditResults = document.querySelector("[data-audit-results]");
  const index = Array.isArray(window.OID_KNOWLEDGE_INDEX) ? window.OID_KNOWLEDGE_INDEX : [];
  const oidBaseDirectory = Array.isArray(window.OID_BASE_DIRECTORY) ? window.OID_BASE_DIRECTORY : [];
  const penByNumber = new Map(index.map((record) => [Number(record.number), record]));
  const oidBaseByOid = new Map(oidBaseDirectory.map((record) => [String(record.oid), record]));
  const privateEnterprisePrefix = "1.3.6.1.4.1";
  const oidPattern = /^(?:0|1|2)(?:\\.\\d+)*$/;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function matches(record, query) {
    if (!query) return true;
    return String(record.number).includes(query) ||
      normalize(record.oid).includes(query) ||
      normalize(record.organization).includes(query);
  }

  function matchesOidBase(record, query) {
    if (!query) return true;
    const normalizedQuery = query.replace(/^root:/, "");
    return normalize(record.oid).includes(query) ||
      normalize(record.source_url).includes(query) ||
      normalize(record.markdown_url).includes(query) ||
      normalize(record.sitemap_lastmod).includes(query) ||
      normalize(record.root_arc).includes(normalizedQuery);
  }

  function splitAuditRow(line) {
    return String(line).includes("\\t")
      ? String(line).split("\\t").map((part) => part.trim())
      : String(line).split(",").map((part) => part.trim());
  }

  function looksLikeAuditHeader(parts) {
    return parts.some((part) => ["oid", "object_identifier", "object identifier"].includes(normalize(part)));
  }

  function parseAuditRows(text) {
    const lines = String(text || "").split(/\\r?\\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    if (lines.length === 0) return [];

    let headers = null;
    let startIndex = 0;
    const firstParts = splitAuditRow(lines[0]);
    if (firstParts.length > 1 && looksLikeAuditHeader(firstParts)) {
      headers = firstParts.map((part) => normalize(part));
      startIndex = 1;
    }

    return lines.slice(startIndex).map((line, index) => {
      const parts = splitAuditRow(line);
      const oidIndex = headers ? headers.findIndex((header) => ["oid", "object_identifier", "object identifier"].includes(header)) : (parts.length > 1 ? 1 : 0);
      const labelIndex = headers ? headers.findIndex((header) => ["asset", "name", "id", "label"].includes(header)) : (parts.length > 1 ? 0 : -1);
      return {
        index: index + 1,
        label: labelIndex >= 0 ? parts[labelIndex] || "asset-" + (index + 1) : "asset-" + (index + 1),
        oid: parts[oidIndex] || line
      };
    });
  }

  function privateEnterpriseNumber(oid) {
    const prefix = privateEnterprisePrefix + ".";
    if (!String(oid).startsWith(prefix)) return null;
    const segment = String(oid).slice(prefix.length).split(".")[0];
    return /^\\d+$/.test(segment) ? Number(segment) : null;
  }

  function analyzeAuditRows(rows) {
    const findings = rows.map((row) => {
      const oid = String(row.oid || "").trim();
      const valid = oidPattern.test(oid);
      if (!valid) {
        return Object.assign({}, row, {
          oid,
          status: "invalid_value",
          risk: "high",
          enterprise: null,
          oidbase_match: null
        });
      }
      const enterpriseNumber = privateEnterpriseNumber(oid);
      const enterprise = enterpriseNumber == null ? null : penByNumber.get(enterpriseNumber) || null;
      const oidbaseMatch = oidBaseByOid.get(oid) || null;
      const status = oidbaseMatch
        ? "oidbase_directory_match"
        : enterprise
          ? "known_private_enterprise_oid"
          : enterpriseNumber == null
            ? "valid_oid_unmatched"
            : "unknown_private_enterprise_oid";
      return Object.assign({}, row, {
        oid,
        status,
        risk: status === "unknown_private_enterprise_oid" ? "medium" : "low",
        enterprise,
        oidbase_match: oidbaseMatch
      });
    });
    const invalid = findings.filter((item) => item.status === "invalid_value").length;
    const known = findings.filter((item) => item.enterprise).length;
    const oidBaseMatches = findings.filter((item) => item.oidbase_match).length;
    const unresolved = findings.filter((item) => ["invalid_value", "unknown_private_enterprise_oid", "valid_oid_unmatched"].includes(item.status)).length;
    const score = Math.max(0, Math.min(100, Math.round(100 - invalid * 15 - findings.filter((item) => item.status === "unknown_private_enterprise_oid").length * 10 - findings.filter((item) => item.status === "valid_oid_unmatched").length * 7)));
    return {
      summary: {
        total_assets: findings.length,
        valid_oids: findings.length - invalid,
        invalid_values: invalid,
        known_enterprises: known,
        oidbase_directory_matches: oidBaseMatches,
        unresolved_assets: unresolved,
        quality_score: score
      },
      findings
    };
  }

  function renderAudit() {
    if (!auditInput || !auditSummary || !auditResults) return;
    const rows = parseAuditRows(auditInput.value);
    if (rows.length === 0) {
      auditSummary.innerHTML = "";
      auditResults.innerHTML = "";
      return;
    }
    const audit = analyzeAuditRows(rows);
    auditSummary.innerHTML =
      "<span>Total<strong>" + audit.summary.total_assets.toLocaleString("en-US") + "</strong></span>" +
      "<span>Valid OIDs<strong>" + audit.summary.valid_oids.toLocaleString("en-US") + "</strong></span>" +
      "<span>Evidence matches<strong>" + (audit.summary.known_enterprises + audit.summary.oidbase_directory_matches).toLocaleString("en-US") + "</strong></span>" +
      "<span>Quality score<strong>" + audit.summary.quality_score + "/100</strong></span>";
    const shown = audit.findings.slice(0, 50);
    auditResults.innerHTML = "<table><thead><tr><th>Asset</th><th>OID</th><th>Status</th><th>Enterprise</th><th>OID-base</th><th>Risk</th></tr></thead><tbody>" +
      shown.map((finding) => "<tr><td>" + escapeHtml(finding.label) + "</td><td><code>" + escapeHtml(finding.oid) + "</code></td><td><span class=\\"status-badge\\">" + escapeHtml(finding.status) + "</span></td><td>" + escapeHtml(finding.enterprise ? finding.enterprise.organization : "") + "</td><td>" + (finding.oidbase_match ? "<a href=\\"" + escapeHtml(finding.oidbase_match.source_url) + "\\">source</a>" : "") + "</td><td>" + escapeHtml(finding.risk) + "</td></tr>").join("") +
      "</tbody></table>";
  }

  function renderPen() {
    if (!input || !results || !count) return;
    const query = normalize(input.value);
    const matchesList = index.filter((record) => matches(record, query));
    const shown = matchesList.slice(0, query ? 25 : 12);
    count.textContent = query
      ? "Showing " + shown.length.toLocaleString("en-US") + " of " + matchesList.length.toLocaleString("en-US") + " matches"
      : "Showing first " + shown.length.toLocaleString("en-US") + " of " + index.length.toLocaleString("en-US") + " searchable assignments";
    results.innerHTML = "<table><thead><tr><th>Number</th><th>OID</th><th>Organization</th></tr></thead><tbody>" +
      shown.map((record) => "<tr><td>" + Number(record.number).toLocaleString("en-US") + "</td><td><code>" + escapeHtml(record.oid) + "</code></td><td>" + escapeHtml(record.organization) + "</td></tr>").join("") +
      "</tbody></table>";
  }

  function renderOidBase() {
    if (!oidBaseInput || !oidBaseResults || !oidBaseCount) return;
    const query = normalize(oidBaseInput.value);
    const matchesList = oidBaseDirectory.filter((record) => matchesOidBase(record, query));
    const shown = matchesList.slice(0, query ? 25 : 12);
    oidBaseCount.textContent = query
      ? "Showing " + shown.length.toLocaleString("en-US") + " of " + matchesList.length.toLocaleString("en-US") + " matches"
      : "Showing first " + shown.length.toLocaleString("en-US") + " of " + oidBaseDirectory.length.toLocaleString("en-US") + " sitemap entries";
    oidBaseResults.innerHTML = "<table><thead><tr><th>OID</th><th>Depth</th><th>Last modified</th><th>Source</th></tr></thead><tbody>" +
      shown.map((record) => "<tr><td><code>" + escapeHtml(record.oid) + "</code></td><td>" + escapeHtml(record.depth) + "</td><td>" + escapeHtml(record.sitemap_lastmod || "") + "</td><td><a href=\\"" + escapeHtml(record.source_url) + "\\">source</a></td></tr>").join("") +
      "</tbody></table>";
  }

  if (input) input.addEventListener("input", renderPen);
  if (oidBaseInput) oidBaseInput.addEventListener("input", renderOidBase);
  if (auditRun) auditRun.addEventListener("click", renderAudit);
  if (auditSample && auditInput) auditSample.addEventListener("click", function () {
    auditInput.value = "asset,oid\\nrouter-core,1.3.6.1.4.1.9.9.41\\nsha256-policy,2.16.840.1.101.3.4.2.1\\nunknown-enterprise,1.3.6.1.4.1.999999.1\\nbad-row,not-an-oid";
    renderAudit();
  });
  if (auditClear && auditInput) auditClear.addEventListener("click", function () {
    auditInput.value = "";
    renderAudit();
  });
  renderPen();
  renderOidBase();
  renderAudit();
}());
`;
}

function readSearchIndex(indexFile, report) {
  if (indexFile && fs.existsSync(indexFile)) {
    return JSON.parse(fs.readFileSync(indexFile, "utf8"));
  }
  return (report.sample_organizations || []).map((record) => ({
    number: record.enterprise_number,
    oid: record.oid,
    organization: record.organization
  }));
}

function readOidBaseDirectory(sitemapFile) {
  if (!sitemapFile || !fs.existsSync(sitemapFile)) return [];
  const catalog = JSON.parse(fs.readFileSync(sitemapFile, "utf8"));
  return (catalog.entries || []).map((entry) => ({
    oid: entry.oid,
    source_url: entry.source_url,
    markdown_url: entry.markdown_url,
    sitemap_lastmod: entry.sitemap_lastmod,
    root_arc: entry.root_arc,
    depth: entry.depth
  }));
}

function buildSite({ indexFile, reportFile, sitemapFile, outDir }) {
  const report = JSON.parse(fs.readFileSync(reportFile, "utf8"));
  const searchIndex = readSearchIndex(indexFile, report);
  const oidBaseDirectory = readOidBaseDirectory(sitemapFile);
  report.search_index_count = searchIndex.length;
  report.oid_base_directory_count = oidBaseDirectory.length;
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, "index.html"), renderDashboard(report, oidBaseDirectory.length), "utf8");
  fs.writeFileSync(path.join(outDir, "styles.css"), renderCss(), "utf8");
  fs.writeFileSync(path.join(outDir, "data.js"), `window.OID_KNOWLEDGE_REPORT = ${JSON.stringify(report, null, 2)};\n`, "utf8");
  fs.writeFileSync(path.join(outDir, "search-index.js"), `window.OID_KNOWLEDGE_INDEX = ${JSON.stringify(searchIndex)};\n`, "utf8");
  fs.writeFileSync(path.join(outDir, "oid-base-directory.js"), `window.OID_BASE_DIRECTORY = ${JSON.stringify(oidBaseDirectory)};\n`, "utf8");
  fs.writeFileSync(path.join(outDir, "app.js"), renderAppJs(), "utf8");
  const outputFiles = ["index.html", "styles.css", "data.js", "search-index.js", "oid-base-directory.js", "app.js"];
  return {
    output_files: outputFiles.map((file) => path.join(outDir, file)),
    record_count: report.record_count,
    search_record_count: searchIndex.length,
    oid_base_directory_count: oidBaseDirectory.length,
    source: report.source
  };
}

module.exports = {
  buildSite,
  escapeHtml,
  formatNumber,
  percent,
  renderAuditPanel,
  renderDashboard,
  renderOidBasePanel,
  renderSearchPanel
};
