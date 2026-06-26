"use strict";

const fs = require("fs");
const path = require("path");
const { ensureDir, writeJson } = require("./net");

function countFindings(assetAudit, predicate) {
  return (assetAudit.findings || []).filter(predicate).length;
}

function sampleFindings(assetAudit, predicate, limit = 3) {
  return (assetAudit.findings || [])
    .filter(predicate)
    .slice(0, limit)
    .map((finding) => ({
      label: finding.label || "",
      oid: finding.oid || "",
      status: finding.status || "",
      evidence: finding.enterprise?.organization || finding.oidbase_match?.source_url || "review queue"
    }));
}

function buildVerticalUseCasePack({
  assetAudit = {},
  coverageReport = {},
  sourcePolicy = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const summary = assetAudit.summary || {};
  const coverage = coverageReport.summary || {};
  const privateEnterprise = Number(summary.private_enterprise_oids || 0);
  const knownEnterprises = Number(summary.known_enterprises || 0);
  const oidbaseMatches = Number(summary.oidbase_directory_matches || 0);
  const unresolved = Number(summary.unresolved_assets || 0);
  const invalid = Number(summary.invalid_values || 0);
  const valid = Number(summary.valid_oids || 0);
  const boundary = sourcePolicy.collection_boundary || {};

  const useCases = [
    {
      id: "snmp-mib-pen-inventory",
      title: "SNMP / MIB vendor PEN inventory",
      audience: "Network, NOC, and observability teams that need to reconcile enterprise OIDs found in MIBs, traps, or device exports.",
      fit_score: Math.min(100, 45 + privateEnterprise * 15 + knownEnterprises * 20),
      fit_signals: [
        `${privateEnterprise} private enterprise OIDs in the sample inventory`,
        `${knownEnterprises} known public PEN owner matches`,
        `${coverage.total_public_pen_records || 0} public PEN records available for owner evidence`
      ],
      input_request: "A sanitized CSV with device, MIB, trap, or asset labels and the OID values to reconcile.",
      delivery_slice: "Classify known enterprise roots, unknown enterprise arcs, and owner evidence gaps; return a cleanup queue and evidence links.",
      acceptance_checks: [
        "Known PEN roots include public owner evidence.",
        "Unknown enterprise arcs are isolated for internal owner review.",
        "Invalid values are separated before any owner mapping is trusted."
      ],
      sample_oids: sampleFindings(assetAudit, (finding) => String(finding.status || "").includes("enterprise"))
    },
    {
      id: "pki-certificate-policy-oid-review",
      title: "PKI certificate policy OID review",
      audience: "Security, compliance, and platform teams that maintain certificate policy, algorithm, or assurance OIDs.",
      fit_score: Math.min(100, 45 + oidbaseMatches * 25 + valid * 5),
      fit_signals: [
        `${valid} syntactically valid OIDs in the sample inventory`,
        `${oidbaseMatches} OID-base sitemap directory evidence matches`,
        `${coverage.exact_oidbase_matches || 0} public exact directory matches in the broader coverage report`
      ],
      input_request: "A sanitized list of certificate policy, algorithm, or registry OIDs plus optional labels describing where they appear.",
      delivery_slice: "Separate registry-backed OIDs from unmatched values and produce an acceptance checklist for policy documentation.",
      acceptance_checks: [
        "Registry-backed OIDs include a public source URL or are marked for internal policy evidence.",
        "Unmatched policy OIDs are listed with a precise evidence gap.",
        "No certificate private keys, secrets, or account exports are requested."
      ],
      sample_oids: sampleFindings(assetAudit, (finding) => finding.status === "oidbase_directory_match" || /^2\.16\.840|^1\.2\.840/.test(String(finding.oid || "")))
    },
    {
      id: "internal-oid-registry-cleanup",
      title: "Internal OID registry cleanup",
      audience: "Architecture and identity teams that have inherited OID lists with unclear owners, malformed values, or mixed namespace conventions.",
      fit_score: Math.min(100, 40 + unresolved * 15 + invalid * 20),
      fit_signals: [
        `${unresolved} unresolved or review-needed sample assets`,
        `${invalid} invalid OID values requiring correction`,
        `${summary.quality_score || 0}/100 sample inventory quality score`
      ],
      input_request: "A sanitized export from the internal registry or spreadsheet with OID, asset label, and optional notes columns.",
      delivery_slice: "Create a prioritized owner-review queue, invalid-value correction list, and re-run acceptance checklist.",
      acceptance_checks: [
        "Every row is classified as invalid, evidence-ready, or owner-review required.",
        "The remediation CSV can be imported into a tracker.",
        "A re-run can confirm that cleanup reduced unresolved and invalid rows."
      ],
      sample_oids: sampleFindings(assetAudit, (finding) => ["unknown_private_enterprise_oid", "valid_oid_unmatched", "invalid_value"].includes(finding.status))
    }
  ];

  return {
    schema_version: "oid-vertical-use-case-pack/v1",
    generated_at: generatedAt,
    title: "OID Inventory Assessment Vertical Fit Pack",
    source_boundary: {
      full_crawl_requires_authorization: boundary.full_crawl_requires_authorization !== false,
      page_bodies_publishable_without_authorization: boundary.page_bodies_publishable_without_authorization === true
    },
    use_cases: useCases,
    discovery_questions: [
      "Do the OIDs come from SNMP/MIB exports, traps, or device telemetry?",
      "Are any OIDs used in certificate policy, algorithm, assurance, or PKI documentation?",
      "Is there an internal registry or spreadsheet that should become the source of truth?",
      "Which rows can be shared as sanitized labels, and which must stay local-only?",
      "What evidence should be accepted for each row: public PEN owner, OID-base sitemap URL, internal owner, or correction ticket?"
    ],
    public_artifacts: [
      { path: "reports/vertical-use-case-pack.md", purpose: "Vertical fit map for SNMP/MIB, PKI, and internal registry reviews" },
      { path: "reports/client-readiness-pack.md", purpose: "Client intake, review flow, acceptance evidence, and excluded-data boundary" },
      { path: "reports/sample-delivery-pack.md", purpose: "Sanitized evidence delivery example" },
      { path: "reports/remediation-board.csv", purpose: "Importable cleanup queue" },
      { path: "public/index.html", purpose: "Browser-only local OID list audit surface" },
      { path: "public/sample-assessment.html", purpose: "Browser-readable sample handoff" }
    ],
    excluded_data: [
      "Raw client inventories",
      "credentials, OTPs, cookies, API keys, private keys, and tokens",
      "payment, tax, KYC, billing, or private account material",
      "OID-base raw page-body mirrors without explicit source-owner authorization"
    ]
  };
}

function row(values) {
  return `| ${values.map((value) => String(value ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

function renderVerticalUseCaseMarkdown(pack) {
  const useCaseSections = pack.use_cases.map((item) => {
    const signalList = item.fit_signals.map((signal) => `- ${signal}`).join("\n");
    const acceptanceList = item.acceptance_checks.map((check) => `- ${check}`).join("\n");
    const sampleRows = item.sample_oids.length
      ? item.sample_oids.map((sample) => row([sample.label, sample.oid, sample.status, sample.evidence])).join("\n")
      : row(["No sample row", "", "", "Use a sanitized inventory to generate one"]);

    return `## ${item.title}

Audience: ${item.audience}

Fit score: \`${item.fit_score}/100\`

### Fit Signals

${signalList}

### Input Request

${item.input_request}

### Delivery Slice

${item.delivery_slice}

### Acceptance Checks

${acceptanceList}

### Sample OID Rows

| Label | OID | Status | Evidence |
| --- | --- | --- | --- |
${sampleRows}
`;
  }).join("\n");

  const artifactRows = pack.public_artifacts.map((item) => row([item.path, item.purpose])).join("\n");

  return `# ${pack.title}

Generated: \`${pack.generated_at}\`

This pack maps the same OID inventory assessment engine to three practical review contexts. It is a public, source-safe planning artifact: it uses derived findings, public registry evidence, and source-boundary receipts, not raw client inventories or copied OID-base page bodies.

${useCaseSections}

## Discovery Questions

${pack.discovery_questions.map((item) => `- ${item}`).join("\n")}

## Public Artifacts

| Artifact | Purpose |
| --- | --- |
${artifactRows}

## Excluded Data

${pack.excluded_data.map((item) => `- ${item}`).join("\n")}

## Source Boundary

Full OID-base page-body collection requires explicit source-owner authorization. Published reports should keep using sitemap metadata, public IANA PEN aggregates, and derived client findings unless that authorization exists.
`;
}

function writeVerticalUseCasePack({
  assetAuditFile,
  coverageReportFile,
  sourcePolicyFile,
  jsonOutFile,
  markdownOutFile
}) {
  const assetAudit = JSON.parse(fs.readFileSync(assetAuditFile, "utf8"));
  const coverageReport = JSON.parse(fs.readFileSync(coverageReportFile, "utf8"));
  const sourcePolicy = JSON.parse(fs.readFileSync(sourcePolicyFile, "utf8"));
  const pack = buildVerticalUseCasePack({ assetAudit, coverageReport, sourcePolicy });
  ensureDir(path.dirname(jsonOutFile));
  writeJson(jsonOutFile, pack);
  if (markdownOutFile) {
    ensureDir(path.dirname(markdownOutFile));
    fs.writeFileSync(markdownOutFile, renderVerticalUseCaseMarkdown(pack), "utf8");
  }
  return pack;
}

module.exports = {
  buildVerticalUseCasePack,
  renderVerticalUseCaseMarkdown,
  writeVerticalUseCasePack
};

