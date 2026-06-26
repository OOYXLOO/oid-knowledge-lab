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
  const auditCopySummary = document.querySelector("[data-audit-copy-summary]");
  const auditDownloadMarkdown = document.querySelector("[data-audit-download-markdown]");
  const auditDownloadCsv = document.querySelector("[data-audit-download-csv]");
  const auditDownloadJson = document.querySelector("[data-audit-download-json]");
  const auditSummary = document.querySelector("[data-audit-summary]");
  const auditResults = document.querySelector("[data-audit-results]");
  const auditStatus = document.querySelector("[data-audit-status]");
  const auditHandoff = document.querySelector("[data-audit-handoff]");
  const index = Array.isArray(window.OID_KNOWLEDGE_INDEX) ? window.OID_KNOWLEDGE_INDEX : [];
  const oidBaseDirectory = Array.isArray(window.OID_BASE_DIRECTORY) ? window.OID_BASE_DIRECTORY : [];
  const penByNumber = new Map(index.map((record) => [Number(record.number), record]));
  const oidBaseByOid = new Map(oidBaseDirectory.map((record) => [String(record.oid), record]));
  const privateEnterprisePrefix = "1.3.6.1.4.1";
  const oidPattern = /^(?:0|1|2)(?:\.\d+)*$/;
  let latestHandoff = null;

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
    const unknownPrivate = findings.filter((item) => item.status === "unknown_private_enterprise_oid").length;
    const validUnmatched = findings.filter((item) => item.status === "valid_oid_unmatched").length;
    const score = Math.max(0, Math.min(100, Math.round(100 - invalid * 15 - findings.filter((item) => item.status === "unknown_private_enterprise_oid").length * 10 - findings.filter((item) => item.status === "valid_oid_unmatched").length * 7)));
    return {
      generated_at: new Date().toISOString(),
      source_kind: "browser local OID asset list",
      summary: {
        total_assets: findings.length,
        valid_oids: findings.length - invalid,
        invalid_values: invalid,
        private_enterprise_oids: findings.filter((item) => privateEnterpriseNumber(item.oid) != null).length,
        known_enterprises: known,
        oidbase_directory_matches: oidBaseMatches,
        evidence_ready_assets: findings.filter((item) => item.enterprise || item.oidbase_match).length,
        unresolved_assets: unresolved,
        unknown_private_enterprise_oids: unknownPrivate,
        valid_oid_unmatched: validUnmatched,
        high_risk_findings: findings.filter((item) => item.risk === "high").length,
        medium_risk_findings: findings.filter((item) => item.risk === "medium").length,
        quality_score: score
      },
      findings
    };
  }

  function csvCell(value) {
    const text = String(value == null ? "" : value);
    return /[",\r\n]/.test(text) ? "\"" + text.replace(/"/g, "\"\"") + "\"" : text;
  }

  function nextActionForFinding(finding) {
    if (finding.status === "invalid_value") return "Correct the malformed OID value before using this row as evidence.";
    if (finding.status === "unknown_private_enterprise_oid") return "Identify the private enterprise owner from vendor or internal registration records.";
    if (finding.status === "valid_oid_unmatched") return "Confirm whether this valid OID is internal, deprecated, or covered by another registry.";
    return "Preserve the public registry evidence with the asset record.";
  }

  function renderAuditCsv(audit) {
    const rows = [[
      "index",
      "label",
      "oid",
      "status",
      "risk",
      "enterprise",
      "oidbase_source",
      "next_action"
    ]].concat(audit.findings.map((finding) => [
      finding.index,
      finding.label,
      finding.oid,
      finding.status,
      finding.risk,
      finding.enterprise ? finding.enterprise.organization : "",
      finding.oidbase_match ? finding.oidbase_match.source_url : "",
      nextActionForFinding(finding)
    ]));
    return rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
  }

  function buildSummaryText(audit) {
    const summary = audit.summary;
    return [
      "OID inventory assessment handoff",
      "Quality score: " + summary.quality_score + "/100",
      "Assets reviewed: " + summary.total_assets,
      "Evidence-ready assets: " + summary.evidence_ready_assets,
      "Unresolved assets: " + summary.unresolved_assets,
      "Invalid values: " + summary.invalid_values,
      "Unknown private enterprise OIDs: " + summary.unknown_private_enterprise_oids,
      "Client data boundary: derived findings only; raw inventories, credentials, private exports, and copied OID-base page bodies stay out of this package."
    ].join("\n");
  }

  function markdownRow(values) {
    return "| " + values.map((value) => String(value == null ? "" : value).replace(/\|/g, "\\|")).join(" | ") + " |";
  }

  function buildAssessmentHandoff(audit) {
    const summaryText = buildSummaryText(audit);
    const markdown = [
      "# OID Inventory Assessment Handoff",
      "",
      "Generated at: " + audit.generated_at,
      "",
      "## Decision summary",
      "",
      summaryText.split("\n").map((line) => "- " + line).join("\n"),
      "",
      "## Derived findings",
      "",
      "| # | Asset | OID | Status | Risk | Enterprise | OID-base source | Next action |",
      "|---|---|---|---|---|---|---|---|",
      audit.findings.map((finding) => markdownRow([
        finding.index,
        finding.label,
        finding.oid,
        finding.status,
        finding.risk,
        finding.enterprise ? finding.enterprise.organization : "",
        finding.oidbase_match ? finding.oidbase_match.source_url : "",
        nextActionForFinding(finding)
      ])).join("\n"),
      "",
      "## Client data boundary",
      "",
      "This handoff contains derived findings only. Raw inventories, credentials, private account exports, contact-level registry records, and copied OID-base page bodies should not be published in this repository.",
      ""
    ].join("\n");
    return {
      generated_at: audit.generated_at,
      source_kind: audit.source_kind,
      summary_text: summaryText,
      markdown,
      csv: renderAuditCsv(audit),
      summary: audit.summary,
      findings: audit.findings
    };
  }

  function setAuditStatus(message) {
    if (auditStatus) auditStatus.textContent = message || "";
  }

  function downloadText(filename, mimeType, text) {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderAudit() {
    if (!auditInput || !auditSummary || !auditResults) return;
    const rows = parseAuditRows(auditInput.value);
    if (rows.length === 0) {
      latestHandoff = null;
      auditSummary.innerHTML = "";
      auditResults.innerHTML = "";
      if (auditHandoff) {
        auditHandoff.textContent = "";
        auditHandoff.classList.remove("is-visible");
      }
      setAuditStatus("");
      return;
    }
    const audit = analyzeAuditRows(rows);
    latestHandoff = buildAssessmentHandoff(audit);
    auditSummary.innerHTML =
      "<span>Total<strong>" + audit.summary.total_assets.toLocaleString("en-US") + "</strong></span>" +
      "<span>Valid OIDs<strong>" + audit.summary.valid_oids.toLocaleString("en-US") + "</strong></span>" +
      "<span>Evidence matches<strong>" + (audit.summary.known_enterprises + audit.summary.oidbase_directory_matches).toLocaleString("en-US") + "</strong></span>" +
      "<span>Quality score<strong>" + audit.summary.quality_score + "/100</strong></span>";
    if (auditHandoff) {
      auditHandoff.textContent = latestHandoff.summary_text;
      auditHandoff.classList.add("is-visible");
    }
    setAuditStatus("Assessment handoff is ready for copy or local download.");
    const shown = audit.findings.slice(0, 50);
    auditResults.innerHTML = "<table><thead><tr><th>Asset</th><th>OID</th><th>Status</th><th>Enterprise</th><th>OID-base</th><th>Risk</th></tr></thead><tbody>" +
      shown.map((finding) => "<tr><td>" + escapeHtml(finding.label) + "</td><td><code>" + escapeHtml(finding.oid) + "</code></td><td><span class=\"status-badge\">" + escapeHtml(finding.status) + "</span></td><td>" + escapeHtml(finding.enterprise ? finding.enterprise.organization : "") + "</td><td>" + (finding.oidbase_match ? "<a href=\"" + escapeHtml(finding.oidbase_match.source_url) + "\">source</a>" : "") + "</td><td>" + escapeHtml(finding.risk) + "</td></tr>").join("") +
      "</tbody></table>";
  }

  function ensureHandoff() {
    if (!latestHandoff) renderAudit();
    if (!latestHandoff) setAuditStatus("Paste or load an OID inventory before exporting.");
    return latestHandoff;
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
  if (auditCopySummary) auditCopySummary.addEventListener("click", function () {
    const handoff = ensureHandoff();
    if (!handoff) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(handoff.summary_text).then(function () {
        setAuditStatus("Summary copied to clipboard.");
      }).catch(function () {
        setAuditStatus("Copy failed. The summary remains visible for manual selection.");
      });
    } else {
      setAuditStatus("Clipboard API unavailable. The summary remains visible for manual selection.");
    }
  });
  if (auditDownloadMarkdown) auditDownloadMarkdown.addEventListener("click", function () {
    const handoff = ensureHandoff();
    if (handoff) downloadText("oid-assessment-handoff.md", "text/markdown;charset=utf-8", handoff.markdown);
  });
  if (auditDownloadCsv) auditDownloadCsv.addEventListener("click", function () {
    const handoff = ensureHandoff();
    if (handoff) downloadText("oid-assessment-findings.csv", "text/csv;charset=utf-8", handoff.csv);
  });
  if (auditDownloadJson) auditDownloadJson.addEventListener("click", function () {
    const handoff = ensureHandoff();
    if (handoff) downloadText("oid-assessment-handoff.json", "application/json;charset=utf-8", JSON.stringify(handoff, null, 2) + "\n");
  });
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
