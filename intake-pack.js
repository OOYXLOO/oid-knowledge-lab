window.OID_CLIENT_INTAKE_PACK = {
  "generated_at": "2026-06-24T10:54:20.274Z",
  "title": "OID Assessment Client Intake Pack",
  "accepted_columns": [
    "asset",
    "oid",
    "notes"
  ],
  "sample_csv": "asset,oid,notes\nrouter-core,1.3.6.1.4.1.9.9.41,sanitized network device example\nsha256-policy,2.16.840.1.101.3.4.2.1,public algorithm OID example\ninternal-policy,1.2.840.113549,internal review example\n",
  "checklist": [
    "Replace hostnames, customer names, ticket numbers, serial numbers, and user identifiers with sanitized asset labels.",
    "Include one OID per row with an optional note that explains the system area without exposing private data.",
    "Remove credentials, cookies, tokens, account exports, private correspondence, payment data, and production secrets.",
    "Keep the source inventory local unless a redacted subset is intentionally shared for review.",
    "Use CSV, TSV, or one OID per line; CSV with asset, oid, and notes columns gives the clearest handoff."
  ],
  "acceptance_criteria": [
    "The submitted CSV has an oid column or one OID per line.",
    "Every asset label is sanitized and can be shown in a derived report.",
    "The data owner has confirmed that no credentials or private account exports are included.",
    "The review can classify invalid values, public registry evidence, unknown private enterprise arcs, and unresolved valid OIDs."
  ],
  "copy_text": "OID Assessment Client Intake Pack\n\nPlease provide a sanitized OID inventory using this CSV shape:\n\nasset,oid,notes\nrouter-core,1.3.6.1.4.1.9.9.41,sanitized network device example\nsha256-policy,2.16.840.1.101.3.4.2.1,public algorithm OID example\ninternal-policy,1.2.840.113549,internal review example\n\nDo not include credentials, cookies, tokens, account exports, private correspondence, payment data, production secrets, or copied OID-base page bodies.\n\nBefore sending, confirm:\n- Replace hostnames, customer names, ticket numbers, serial numbers, and user identifiers with sanitized asset labels.\n- Include one OID per row with an optional note that explains the system area without exposing private data.\n- Remove credentials, cookies, tokens, account exports, private correspondence, payment data, and production secrets.\n- Keep the source inventory local unless a redacted subset is intentionally shared for review.\n- Use CSV, TSV, or one OID per line; CSV with asset, oid, and notes columns gives the clearest handoff.",
  "markdown": "# OID Assessment Client Intake Pack\n\nGenerated at: 2026-06-24T10:54:20.274Z\n\n## Accepted input\n\nUse CSV, TSV, or one OID per line. The recommended CSV columns are:\n\n- `asset`\n- `oid`\n- `notes`\n\n## Sample CSV\n\n```csv\nasset,oid,notes\nrouter-core,1.3.6.1.4.1.9.9.41,sanitized network device example\nsha256-policy,2.16.840.1.101.3.4.2.1,public algorithm OID example\ninternal-policy,1.2.840.113549,internal review example\n```\n\n## Sanitization checklist\n\n- Replace hostnames, customer names, ticket numbers, serial numbers, and user identifiers with sanitized asset labels.\n- Include one OID per row with an optional note that explains the system area without exposing private data.\n- Remove credentials, cookies, tokens, account exports, private correspondence, payment data, and production secrets.\n- Keep the source inventory local unless a redacted subset is intentionally shared for review.\n- Use CSV, TSV, or one OID per line; CSV with asset, oid, and notes columns gives the clearest handoff.\n\n## Acceptance criteria\n\n- The submitted CSV has an oid column or one OID per line.\n- Every asset label is sanitized and can be shown in a derived report.\n- The data owner has confirmed that no credentials or private account exports are included.\n- The review can classify invalid values, public registry evidence, unknown private enterprise arcs, and unresolved valid OIDs.\n\n## Data boundary\n\nDo not include credentials, cookies, tokens, account exports, private correspondence, payment data, production secrets, or copied OID-base page bodies. The public dashboard is designed to work with sanitized input and derived findings.\n"
};
