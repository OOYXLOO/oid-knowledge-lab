(function () {
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
  const oidPattern = /^(?:0|1|2)(?:\.\d+)*$/;

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
    return String(line).includes("\t")
      ? String(line).split("\t").map((part) => part.trim())
      : String(line).split(",").map((part) => part.trim());
  }

  function looksLikeAuditHeader(parts) {
    return parts.some((part) => ["oid", "object_identifier", "object identifier"].includes(normalize(part)));
  }

  function parseAuditRows(text) {
    const lines = String(text || "").split(/\r?\n/)
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
    return /^\d+$/.test(segment) ? Number(segment) : null;
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
      shown.map((finding) => "<tr><td>" + escapeHtml(finding.label) + "</td><td><code>" + escapeHtml(finding.oid) + "</code></td><td><span class=\"status-badge\">" + escapeHtml(finding.status) + "</span></td><td>" + escapeHtml(finding.enterprise ? finding.enterprise.organization : "") + "</td><td>" + (finding.oidbase_match ? "<a href=\"" + escapeHtml(finding.oidbase_match.source_url) + "\">source</a>" : "") + "</td><td>" + escapeHtml(finding.risk) + "</td></tr>").join("") +
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
      shown.map((record) => "<tr><td><code>" + escapeHtml(record.oid) + "</code></td><td>" + escapeHtml(record.depth) + "</td><td>" + escapeHtml(record.sitemap_lastmod || "") + "</td><td><a href=\"" + escapeHtml(record.source_url) + "\">source</a></td></tr>").join("") +
      "</tbody></table>";
  }

  if (input) input.addEventListener("input", renderPen);
  if (oidBaseInput) oidBaseInput.addEventListener("input", renderOidBase);
  if (auditRun) auditRun.addEventListener("click", renderAudit);
  if (auditSample && auditInput) auditSample.addEventListener("click", function () {
    auditInput.value = "asset,oid\nrouter-core,1.3.6.1.4.1.9.9.41\nsha256-policy,2.16.840.1.101.3.4.2.1\nunknown-enterprise,1.3.6.1.4.1.999999.1\nbad-row,not-an-oid";
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
