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
  const index = Array.isArray(window.OID_KNOWLEDGE_INDEX) ? window.OID_KNOWLEDGE_INDEX : [];
  const oidBaseDirectory = Array.isArray(window.OID_BASE_DIRECTORY) ? window.OID_BASE_DIRECTORY : [];

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
  renderPen();
  renderOidBase();
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
  renderDashboard,
  renderOidBasePanel,
  renderSearchPanel
};
