"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir } = require("./net");
const { generatedTimestamp } = require("./time");

const PRIORITY_WEIGHT = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3
};

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
}

function csvCell(value) {
  const text = String(value ?? "");
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function classifyFinding(finding = {}) {
  const status = finding.status || "unclassified";
  if (status === "invalid_value") {
    return {
      priority: "P0",
      issue: "Invalid OID syntax",
      owner_action: "Correct or remove the value before using it in audit evidence, device metadata, or policy documentation.",
      acceptance_check: "The replacement value matches numeric OID syntax and re-runs without an invalid_value finding.",
      evidence: "Local syntax validation"
    };
  }
  if (status === "unknown_private_enterprise_oid") {
    return {
      priority: "P1",
      issue: "Unknown private enterprise arc",
      owner_action: "Identify the enterprise owner from vendor records, internal registry notes, or a formal PEN assignment.",
      acceptance_check: "The enterprise root has a documented owner or is moved to an internal-review exception list.",
      evidence: "IANA PEN public index miss"
    };
  }
  if (status === "valid_oid_unmatched") {
    return {
      priority: "P1",
      issue: "Valid OID without public directory evidence",
      owner_action: "Check internal registry notes or another authoritative source before relying on this OID externally.",
      acceptance_check: "A source link, internal registry reference, or explicit unresolved disposition is attached.",
      evidence: "No exact OID-base sitemap or public PEN mapping"
    };
  }
  if (status === "oidbase_directory_match") {
    return {
      priority: "P2",
      issue: "Public directory evidence ready",
      owner_action: "Preserve the source URL with the asset record and verify the business meaning with the owning team.",
      acceptance_check: "The asset record includes the OID-base source URL and an internal owner.",
      evidence: finding.oidbase_match?.source_url || "OID-base sitemap evidence"
    };
  }
  if (status === "known_private_enterprise_oid") {
    return {
      priority: "P2",
      issue: "Known private enterprise arc",
      owner_action: "Attach the public enterprise owner mapping and confirm the sub-arc meaning with vendor or internal docs.",
      acceptance_check: "The asset record includes enterprise owner, enterprise root, and local sub-arc purpose.",
      evidence: finding.enterprise?.organization || "IANA PEN public index"
    };
  }
  return {
    priority: "P3",
    issue: "Unclassified OID review item",
    owner_action: "Review manually and assign a disposition.",
    acceptance_check: "The item has a documented disposition.",
    evidence: "Local audit output"
  };
}

function buildRemediationBoard({ assetAudit = {}, generatedAt = generatedTimestamp() }) {
  const findings = assetAudit.findings || [];
  const rows = findings.map((finding, index) => {
    const classification = classifyFinding(finding);
    const enterprise = finding.enterprise || null;
    const oidbaseMatch = finding.oidbase_match || null;
    return {
      id: `OID-${String(index + 1).padStart(3, "0")}`,
      source_index: finding.index || index + 1,
      priority: classification.priority,
      asset: finding.label || finding.asset || `asset-${index + 1}`,
      oid: finding.oid || "",
      status: finding.status || "unclassified",
      issue: classification.issue,
      risk: finding.risk || "",
      evidence: classification.evidence,
      evidence_url: oidbaseMatch?.source_url || "",
      enterprise_owner: enterprise?.organization || "",
      enterprise_oid: enterprise?.oid || "",
      owner_action: classification.owner_action,
      acceptance_check: classification.acceptance_check,
      publishable_boundary: "Sanitized finding only; do not attach raw client inventory or copied OID-base page bodies."
    };
  }).sort((left, right) => {
    const priorityDelta = (PRIORITY_WEIGHT[left.priority] ?? 99) - (PRIORITY_WEIGHT[right.priority] ?? 99);
    return priorityDelta || left.source_index - right.source_index;
  });

  const summary = {
    generated_at: generatedAt,
    total_items: rows.length,
    p0_items: rows.filter((row) => row.priority === "P0").length,
    p1_items: rows.filter((row) => row.priority === "P1").length,
    p2_items: rows.filter((row) => row.priority === "P2").length,
    evidence_ready_items: rows.filter((row) => ["oidbase_directory_match", "known_private_enterprise_oid"].includes(row.status)).length,
    client_action_items: rows.filter((row) => ["P0", "P1"].includes(row.priority)).length
  };

  return {
    generated_at: generatedAt,
    source_kind: "OID asset audit remediation board",
    summary,
    rows
  };
}

function renderRemediationBoardMarkdown(board = {}) {
  const summary = board.summary || {};
  const rows = board.rows || [];
  const tableRows = rows.map((row) => `| ${[
    row.id,
    row.priority,
    row.asset,
    row.oid,
    row.issue,
    row.owner_action,
    row.acceptance_check
  ].map(escapeTable).join(" | ")} |`);

  return `# OID Remediation Board

Generated: \`${board.generated_at || generatedTimestamp()}\`

This board turns an OID asset audit into a client-action queue. It is safe to publish as a sanitized sample because it contains derived findings and public source pointers, not raw client inventories or copied OID-base page bodies.

## Summary

- Total items: \`${summary.total_items || 0}\`
- P0 correction items: \`${summary.p0_items || 0}\`
- P1 review items: \`${summary.p1_items || 0}\`
- P2 evidence-preservation items: \`${summary.p2_items || 0}\`
- Evidence-ready items: \`${summary.evidence_ready_items || 0}\`
- Client action items: \`${summary.client_action_items || 0}\`

## Board

| ID | Priority | Asset | OID | Issue | Owner action | Acceptance check |
| --- | --- | --- | --- | --- | --- | --- |
${tableRows.length ? tableRows.join("\n") : "| - | - | - | - | No items | - | - |"}

## Handling Boundary

- Keep raw client inventories local.
- Keep credentials, tokens, cookies, account data, and private correspondence out of the repository.
- Sanitized finding boundary: treat every row as derived review output, not as the raw client inventory.
- Use OID-base sitemap links as pointers only; do not copy OID-base page bodies into public artifacts.
- Re-run the asset audit after corrections to close the board.
`;
}

function renderRemediationBoardCsv(board = {}) {
  const columns = [
    "id",
    "priority",
    "asset",
    "oid",
    "status",
    "issue",
    "risk",
    "enterprise_owner",
    "enterprise_oid",
    "evidence_url",
    "owner_action",
    "acceptance_check"
  ];
  const rows = [columns.join(",")];
  for (const row of board.rows || []) {
    rows.push(columns.map((column) => csvCell(row[column])).join(","));
  }
  return `${rows.join("\n")}\n`;
}

function writeRemediationBoard({ assetAuditFile, jsonOutFile, markdownOutFile, csvOutFile }) {
  const assetAudit = JSON.parse(fs.readFileSync(assetAuditFile, "utf8"));
  const board = buildRemediationBoard({ assetAudit });

  if (jsonOutFile) {
    ensureDir(path.dirname(jsonOutFile));
    fs.writeFileSync(jsonOutFile, `${JSON.stringify(board, null, 2)}\n`, "utf8");
  }
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderRemediationBoardMarkdown(board), "utf8");
  }
  if (csvOutFile) {
    ensureDir(path.dirname(csvOutFile));
    fs.writeFileSync(csvOutFile, renderRemediationBoardCsv(board), "utf8");
  }

  return board;
}

module.exports = {
  buildRemediationBoard,
  classifyFinding,
  renderRemediationBoardCsv,
  renderRemediationBoardMarkdown,
  writeRemediationBoard
};
