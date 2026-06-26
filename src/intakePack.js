"use strict";

function buildClientIntakePack(options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const sampleCsv = [
    "asset,oid,notes",
    "router-core,1.3.6.1.4.1.9.9.41,sanitized network device example",
    "sha256-policy,2.16.840.1.101.3.4.2.1,public algorithm OID example",
    "internal-policy,1.2.840.113549,internal review example"
  ].join("\n") + "\n";
  const checklist = [
    "Replace hostnames, customer names, ticket numbers, serial numbers, and user identifiers with sanitized asset labels.",
    "Include one OID per row with an optional note that explains the system area without exposing private data.",
    "Remove credentials, cookies, tokens, account exports, private correspondence, payment data, and production secrets.",
    "Keep the source inventory local unless a redacted subset is intentionally shared for review.",
    "Use CSV, TSV, or one OID per line; CSV with asset, oid, and notes columns gives the clearest handoff."
  ];
  const acceptanceCriteria = [
    "The submitted CSV has an oid column or one OID per line.",
    "Every asset label is sanitized and can be shown in a derived report.",
    "The data owner has confirmed that no credentials or private account exports are included.",
    "The review can classify invalid values, public registry evidence, unknown private enterprise arcs, and unresolved valid OIDs."
  ];
  const copyText = [
    "OID Assessment Client Intake Pack",
    "",
    "Please provide a sanitized OID inventory using this CSV shape:",
    "",
    sampleCsv.trimEnd(),
    "",
    "Do not include credentials, cookies, tokens, account exports, private correspondence, payment data, production secrets, or copied OID-base page bodies.",
    "",
    "Before sending, confirm:",
    ...checklist.map((item) => `- ${item}`)
  ].join("\n");

  return {
    generated_at: generatedAt,
    title: "OID Assessment Client Intake Pack",
    accepted_columns: ["asset", "oid", "notes"],
    sample_csv: sampleCsv,
    checklist,
    acceptance_criteria: acceptanceCriteria,
    copy_text: copyText
  };
}

function renderClientIntakeMarkdown(pack = buildClientIntakePack()) {
  return `# ${pack.title}

Generated at: ${pack.generated_at}

## Accepted input

Use CSV, TSV, or one OID per line. The recommended CSV columns are:

${pack.accepted_columns.map((column) => `- \`${column}\``).join("\n")}

## Sample CSV

\`\`\`csv
${pack.sample_csv.trimEnd()}
\`\`\`

## Sanitization checklist

${pack.checklist.map((item) => `- ${item}`).join("\n")}

## Acceptance criteria

${pack.acceptance_criteria.map((item) => `- ${item}`).join("\n")}

## Data boundary

Do not include credentials, cookies, tokens, account exports, private correspondence, payment data, production secrets, or copied OID-base page bodies. The public dashboard is designed to work with sanitized input and derived findings.
`;
}

module.exports = {
  buildClientIntakePack,
  renderClientIntakeMarkdown
};
