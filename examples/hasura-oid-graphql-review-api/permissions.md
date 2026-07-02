# Suggested Hasura Permissions

## Role: `oid_reviewer`

Purpose: read sanitized OID review queues and export safe handoff summaries.

Recommended permissions:

- `select` on `oid_assets`
  - Columns: `asset_key`, `dotted_oid`, `friendly_name`, `category`, `source_note`, `owner_team`, `created_at`
  - Row filter: none for the public sample dataset; add owner-team filters for private deployments.
- `select` on `oid_findings`
  - Columns: `id`, `severity`, `finding_type`, `reviewer_note`, `status`, `action_owner`, `updated_at`, `oid_asset_id`
  - Row filter: `{ "status": { "_neq": "resolved" } }` if reviewers only need active work.

Do not grant insert, update, or delete to this role for the first tutorial version.

## Role: `oid_maintainer`

Purpose: update review status and reviewer notes after a finding has been checked.

Recommended permissions:

- `select` on both tables.
- `update` on `oid_findings`
  - Columns: `status`, `reviewer_note`, `action_owner`
  - Row filter: `{ "action_owner": { "_eq": "X-Hasura-User-Team" } }` for team-scoped deployments.
  - Check constraint: keep `status` inside the database enum-like check constraint.

## Publication Boundary

Public exports should contain only:

- Dotted OID
- Friendly name
- Category
- Sanitized reviewer note
- Status
- Owner team name if it is already public or generic

Public exports should never contain private certificate material, private keys, customer hostnames, raw scans, API tokens, billing data, account exports, or copied registry page bodies.
