# Hasura OID GraphQL Review API Example

This example supports a Hasura tutorial pitch: model a sanitized Object Identifier inventory in Postgres, expose review queues through Hasura GraphQL, and keep private inventories out of public exports.

It is sample material for an article pitch, not a production migration bundle.

## What It Demonstrates

- A small Postgres schema for OID assets, findings, and reviewer assignments.
- Seed data that uses public, representative OID values only.
- GraphQL queries for unresolved findings, certificate-related rows, private enterprise branches, and owner queues.
- A role boundary that separates read-only reviewers from maintainers who can update finding status.
- A publication boundary for exporting Markdown or CSV summaries without secrets or private customer records.

## Files

- `schema.sql` - Postgres schema and seed rows.
- `queries.graphql` - Hasura GraphQL operations for review workflows.
- `permissions.md` - Suggested Hasura role and permission model.

## Safety Boundary

Use sanitized or public sample records only. Do not import private customer inventories, raw production scans, credentials, account exports, API tokens, screenshots containing identity data, or copied third-party registry page bodies.

## Tutorial Outline

1. Create a small Postgres schema for OID assets and review findings.
2. Load a public seed dataset.
3. Track the tables in Hasura.
4. Add reviewer and maintainer roles.
5. Query unresolved OID findings through GraphQL.
6. Update review status through a restricted mutation.
7. Export a safe review summary for handoff.
