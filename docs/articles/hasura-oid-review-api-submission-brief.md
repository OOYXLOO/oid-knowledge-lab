# Hasura submission brief: GraphQL OID review API

This brief is a review packet for a Hasura technical article pitch. It is not a final publication draft. Its purpose is to show the article promise, implementation direction, and public proof links before an editor asks for the full article.

## Proposed title

Build a GraphQL Review API for OID Inventory Cleanup with Hasura

## Reader outcome

The reader learns how to model a small OID inventory review workflow in Postgres, expose it through Hasura GraphQL, and keep the published review surface separate from private source inventories.

## Why this fits Hasura readers

Hasura readers often care about turning relational data into useful GraphQL APIs quickly while preserving authorization, auditability, and review workflows. OID inventory cleanup is a compact example because it has:

- public reference data,
- local asset inventory rows,
- derived review status,
- owner assignment,
- evidence links,
- mutation boundaries,
- reviewer-facing queries.

## Tutorial map

| Section | Hasura reader framing |
| --- | --- |
| Define the problem | OID inventories are often spread across PKI policy docs, SNMP/MIB notes, device exports, and spreadsheets. |
| Model the tables | `oid_assets`, `oid_findings`, `review_actions`, and `source_evidence`. |
| Import safe sample data | Use sanitized sample rows only; keep client exports local. |
| Expose GraphQL queries | Query unresolved OIDs, private enterprise branches, PKI policy signals, and ownerless records. |
| Add review mutations | Mark a finding as accepted, needs-source, or ready-for-client-review. |
| Discuss permissions | Separate reader, reviewer, and admin capabilities. |
| Publish safe outputs | Export Markdown/CSV summaries without credentials, contact-level records, or private inventories. |

## Sample schema sketch

```sql
create table oid_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null,
  oid text not null,
  owner text,
  source_note text,
  created_at timestamptz not null default now()
);

create table oid_findings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references oid_assets(id),
  severity text not null check (severity in ('high', 'medium', 'low')),
  finding_type text not null,
  reviewer_note text not null,
  status text not null default 'needs_review',
  created_at timestamptz not null default now()
);
```

## Sample GraphQL query

```graphql
query ReviewQueue {
  oid_findings(
    where: { status: { _eq: "needs_review" } }
    order_by: [{ severity: desc }, { created_at: asc }]
  ) {
    severity
    finding_type
    reviewer_note
    oid_asset {
      asset_key
      oid
      owner
    }
  }
}
```

## Public proof links

Reviewer readiness:

```text
https://ooyxloo.github.io/oid-knowledge-lab/reviewer-readiness-one-link.html
```

OID portfolio risk console:

```text
https://ooyxloo.github.io/oid-knowledge-lab/oid-portfolio-risk-console.html
```

Implementation authenticity proof:

```text
https://ooyxloo.github.io/oid-knowledge-lab/implementation-authenticity-proof.html
```

Repository:

```text
https://github.com/OOYXLOO/oid-knowledge-lab
```

## Editorial boundary

The final article should be freshly written for Hasura's audience and product terminology. It should not include private customer data, credentials, account screenshots, copied third-party page bodies, payment data, identity records, or unpublished client code.

