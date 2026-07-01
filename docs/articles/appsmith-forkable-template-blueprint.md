# Appsmith forkable template blueprint: OID review queue

This blueprint supports an Appsmith Writers Program article pitch. It is not a finished Appsmith Marketplace template and does not claim assignment acceptance.

## Template promise

Build a small internal review app that lets a team inspect a sanitized OID inventory, classify risky rows, add reviewer decisions, and export a safe Markdown handoff.

## App pages

1. **Intake**
   - Upload or paste a sanitized CSV.
   - Validate required columns: `asset_label`, `oid`, `source`, `severity`, `owner_hint`.
   - Block rows with obvious secrets, account exports, private URLs, or customer identifiers.
2. **Review queue**
   - Table widget with columns for OID, asset label, source, severity, registry match, and review status.
   - Tabs for `Invalid syntax`, `Unknown PEN`, `Policy OID`, `Accepted`, and `Blocked`.
   - Select widget for owner or system area when that field is safe to store.
3. **Evidence panel**
   - Shows public registry evidence summary, source policy notes, and generated finding text.
   - Keeps raw third-party page bodies and private inventory details out of the app.
4. **Handoff**
   - Button that runs a JSObject formatter.
   - Exports a Markdown remediation queue with only sanitized fields and reviewer decisions.

## Seed data shape

```csv
asset_label,oid,source,severity,owner_hint
sample-router-policy,1.3.6.1.4.1.9.9.43,snmp-export,medium,network
sample-certificate-policy,2.23.140.1.2.1,certificate-policy,low,pki
sample-invalid-oid,1.3.6.1.bad.7,manual-review,high,unknown
```

## Suggested Appsmith widgets

- `Table`: primary review queue.
- `Tabs`: risk/status filters.
- `Select`: reviewer decision and safe owner grouping.
- `Input`: reviewer note with length and secret-pattern validation.
- `Button`: export handoff.
- `Text`: public evidence summary and publication boundary.

## Query and JSObject plan

- `loadInventory`: reads sanitized sample data from a public JSON or pasted CSV.
- `classifyRows`: validates OID syntax and maps rows to known public registry evidence.
- `updateReviewDecision`: stores status, reviewer note, and timestamp in the app state or a safe database table.
- `exportMarkdownHandoff`: renders accepted findings and blocked follow-ups as Markdown.

Example export shape:

```js
export default {
  buildHandoff(rows) {
    return rows
      .filter((row) => row.review_status !== "draft")
      .map((row) => [
        `## ${row.asset_label}`,
        `- OID: ${row.oid}`,
        `- Severity: ${row.severity}`,
        `- Review status: ${row.review_status}`,
        `- Public evidence: ${row.public_evidence_summary}`,
        `- Next step: ${row.next_step}`
      ].join("\n"))
      .join("\n\n");
  }
};
```

## Acceptance checks for the tutorial

- A reader can create the Appsmith app from the article steps.
- The sample data is sanitized and deterministic.
- The app blocks or flags obvious private data before export.
- The handoff output is copyable and can be reviewed without logging into private systems.
- The article separates Appsmith implementation steps from the OID Knowledge Lab reference sample.

## Public proof links

- Reviewer hub: <https://ooyxloo.github.io/oid-knowledge-lab/appsmith-oid-reviewer-hub.html>
- Template blueprint page: <https://ooyxloo.github.io/oid-knowledge-lab/appsmith-template-blueprint.html>
- Working dashboard sample: <https://ooyxloo.github.io/oid-knowledge-lab/>
- Writing samples: <https://ooyxloo.github.io/oid-knowledge-lab/writing-samples.html>
- Implementation proof: <https://ooyxloo.github.io/oid-knowledge-lab/implementation-authenticity-proof.html>

## Boundary

The blueprint is a publication planning artifact. It avoids credentials, account exports, customer inventories, payment data, identity records, private messages, private platform screenshots, copied third-party article bodies, and unpublished client code.
