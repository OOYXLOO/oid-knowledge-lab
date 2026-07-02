# DataHub MCP Read Plan

Collect read-only DataHub context before scoring proposed data changes.

Safety: Read-only plan. Do not call mutation tools until a reviewer approves the brief.

## Tool Calls

### 1. search

Reason: Resolve dataset name to DataHub entity URN

```json
{
  "query": "analytics.customer_orders",
  "entityTypes": [
    "DATASET"
  ]
}
```

### 2. get_entities

Reason: Read ownership, tags, domain, freshness, and documentation

```json
{
  "names": [
    "analytics.customer_orders"
  ]
}
```

### 3. get_lineage

Reason: Check downstream impact before approving an automated change

```json
{
  "entity": "analytics.customer_orders",
  "direction": "DOWNSTREAM",
  "hops": 2
}
```

### 4. search

Reason: Resolve dataset name to DataHub entity URN

```json
{
  "query": "raw.support_tickets",
  "entityTypes": [
    "DATASET"
  ]
}
```

### 5. get_entities

Reason: Read ownership, tags, domain, freshness, and documentation

```json
{
  "names": [
    "raw.support_tickets"
  ]
}
```

### 6. get_lineage

Reason: Check downstream impact before approving an automated change

```json
{
  "entity": "raw.support_tickets",
  "direction": "DOWNSTREAM",
  "hops": 2
}
```

### 7. list_schema_fields

Reason: Inspect fields touched by CHG-1001

```json
{
  "dataset": "analytics.customer_orders",
  "keywords": [
    "coupon_code"
  ]
}
```

### 8. list_schema_fields

Reason: Inspect fields touched by CHG-1002

```json
{
  "dataset": "raw.support_tickets",
  "keywords": [
    "body",
    "requester_email"
  ]
}
```

### 9. list_pending_proposals

Reason: Avoid conflicting with governance changes already awaiting review

```json
{}
```
