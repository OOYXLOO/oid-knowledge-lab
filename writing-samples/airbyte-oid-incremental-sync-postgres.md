# Build an Incremental OID Knowledge Pipeline with Airbyte and Postgres

Public registries are useful when they are searchable, refreshable, and easy to join with operational data. Object Identifiers, or OIDs, are a good example. They appear in certificate policies, private enterprise numbers, SNMP metadata, ASN.1 modules, healthcare identifiers, and vendor-specific protocol documentation, but many teams still inspect them by opening registry pages one at a time.

This tutorial shows how to model an OID registry as an incremental data pipeline. The example uses a public OID source, an Airbyte-style extraction boundary, and Postgres as the destination. The output is not a mirror of a website. It is a structured knowledge base that keeps source attribution, detects changes, and gives downstream tools a stable query surface.

## What We Are Building

The pipeline has four stages:

1. Discover public OID records from an allowed source index or sitemap.
2. Capture each source page with retrieval metadata and a content hash.
3. Normalize OID nodes, parent-child edges, and source evidence into Postgres.
4. Run incremental refreshes that classify records as new, changed, unchanged, failed, or removed from the public index.

The final tables answer practical questions:

- Which OIDs changed since the last sync?
- Which enterprise or certificate-policy branches are missing descriptions?
- Which records have source evidence but no normalized parent edge?
- Which OID subtree should an agent include when answering a certificate or network-management question?

## Source Boundary

Start by writing down what the connector is allowed to fetch. For a public registry, the safe boundary is usually:

- Public index or sitemap URLs.
- Public detail pages for individual OID records.
- Retrieval timestamp, HTTP status, source URL, and content hash.
- No account pages, private exports, cookies, API keys, CAPTCHA bypass, or authenticated consoles.

That boundary matters because the destination table will be reused by humans and tools. If the connector only stores public source evidence, the generated knowledge base is easier to audit and safer to publish.

## Destination Schema

A compact Postgres schema is enough for a first version:

```sql
create table oid_source_records (
  source_url text primary key,
  oid text not null,
  title text,
  body_text text,
  content_hash text not null,
  http_status integer not null,
  fetched_at timestamptz not null,
  sync_status text not null check (
    sync_status in ('new', 'changed', 'unchanged', 'failed', 'removed')
  )
);

create table oid_nodes (
  oid text primary key,
  label text,
  description text,
  source_url text references oid_source_records(source_url),
  updated_at timestamptz not null
);

create table oid_edges (
  parent_oid text not null references oid_nodes(oid),
  child_oid text not null references oid_nodes(oid),
  source_url text references oid_source_records(source_url),
  primary key (parent_oid, child_oid)
);

create index oid_nodes_description_search
  on oid_nodes using gin (to_tsvector('english', coalesce(description, '')));
```

This separates raw source evidence from normalized graph data. If a parser changes later, the team can rebuild `oid_nodes` and `oid_edges` from source records without pretending that the original capture was different.

## Incremental Sync Logic

The connector should treat the public URL as the stable record key and the page content hash as the change detector.

```js
import crypto from "node:crypto";

function hashContent(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function classifySync(previous, next) {
  if (!previous) return "new";
  if (previous.http_status !== 200 && next.http_status === 200) return "changed";
  if (previous.content_hash !== next.content_hash) return "changed";
  return "unchanged";
}
```

An Airbyte source can emit each record with metadata fields such as `_source_url`, `_fetched_at`, `_content_hash`, and `_sync_status`. The destination can then upsert records by `source_url`.

```json
{
  "source_url": "https://example.org/oid/1.3.6.1.4.1.343",
  "oid": "1.3.6.1.4.1.343",
  "title": "Example enterprise branch",
  "content_hash": "4f0f4c...",
  "http_status": 200,
  "fetched_at": "2026-07-02T00:00:00.000Z",
  "sync_status": "changed"
}
```

## Normalize Parent Edges

OIDs are dotted paths. A simple parent function can create graph edges even when the source page does not explicitly list them.

```js
function parentOid(oid) {
  const parts = oid.split(".");
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join(".");
}

function edgeFor(record) {
  const parent = parentOid(record.oid);
  if (!parent) return null;
  return {
    parent_oid: parent,
    child_oid: record.oid,
    source_url: record.source_url
  };
}
```

The important detail is to keep the source URL on the edge. If a branch looks wrong later, the reviewer can trace it back to the page that created it.

## Quality Checks

Before exposing the knowledge base to search or AI tools, run checks that editors, security engineers, and data owners can understand:

```sql
-- Records captured but not normalized.
select source_url, oid, sync_status
from oid_source_records
where http_status = 200
  and oid not in (select oid from oid_nodes);

-- Nodes without parent edges, excluding roots.
select n.oid, n.label, n.source_url
from oid_nodes n
where position('.' in n.oid) > 0
  and not exists (
    select 1 from oid_edges e where e.child_oid = n.oid
  );

-- Recently changed records.
select oid, title, source_url, fetched_at
from oid_source_records
where sync_status = 'changed'
order by fetched_at desc
limit 50;
```

These checks turn the pipeline into an operational tool rather than a one-time scrape. The team can spot parser failures, source drift, and suspicious gaps before publishing derived data.

## Query the Knowledge Base

Once the data is normalized, downstream tools can request a small evidence packet instead of reading entire pages.

```sql
select oid, label, description, source_url
from oid_nodes
where to_tsvector('english', coalesce(description, ''))
      @@ plainto_tsquery('english', 'certificate policy')
order by oid
limit 20;
```

For an AI assistant or review tool, return the OID, label, short description, source URL, and fetch timestamp. That keeps generated answers grounded in a retrievable public source.

## What To Avoid

Do not make the connector more powerful than the governance boundary requires.

- Do not crawl authenticated account pages.
- Do not store cookies, API keys, wallet data, private customer exports, or source pages that require human verification.
- Do not hide failed records. Store the HTTP status and failure reason.
- Do not overwrite source evidence when a parser changes. Re-parse into normalized tables instead.

## Next Steps

A production version can add a low-code Airbyte source, dbt models for normalization, dashboard checks for changed records, and a small API that returns evidence packets by OID subtree. The core pattern stays the same: public source boundary, incremental capture, normalized graph tables, and reviewable evidence for every derived record.

