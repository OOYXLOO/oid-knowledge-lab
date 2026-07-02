# DigitalOcean proposal: OID Lookup API with FastAPI and PostgreSQL

## Working title

How To Build an OID Lookup API with FastAPI and PostgreSQL on Ubuntu

## One-sentence pitch

Teach readers how to build and deploy a small production-style lookup API for Object Identifier records using PostgreSQL, FastAPI, Uvicorn, systemd, and Nginx on an Ubuntu server.

## Why this fits DigitalOcean Community readers

DigitalOcean tutorials work best when readers leave with a reproducible server workflow. This topic is practical and cloud-friendly:

- PostgreSQL schema design for reference data.
- Python API development with FastAPI.
- Input validation and JSON error handling.
- Uvicorn service management with systemd.
- Nginx reverse proxy deployment on Ubuntu.
- A small final project that can be adapted to standards registries, internal metadata catalogs, compliance lookup tables, and PKI/SNMP reference data.

## Proposed reader outcome

After completing the tutorial, a reader should be able to:

1. Create a PostgreSQL table for OID records.
2. Load a small sample OID dataset.
3. Build `/oids/{oid}` and `/search` endpoints with FastAPI.
4. Validate dotted-decimal OID input.
5. Return predictable JSON responses and errors.
6. Run the API as a systemd service.
7. Put Nginx in front of the API.
8. Add a short hardening checklist for rate limits, read-only database access, and backups.

## Proposed outline

1. Introduction: why OID lookup APIs are useful for standards and internal metadata.
2. Prerequisites: Ubuntu server, Python 3, PostgreSQL, Nginx, and a non-root sudo user.
3. Create the PostgreSQL database and `oids` table.
4. Load sample OID records.
5. Create a FastAPI project and database connection.
6. Add the lookup endpoint.
7. Add search, validation, and clear JSON errors.
8. Run Uvicorn behind systemd.
9. Configure Nginx as a reverse proxy.
10. Test the public endpoint.
11. Optional hardening and next steps.

## Proof links

- Public proposal page: <https://ooyxloo.github.io/oid-knowledge-lab/digitalocean-oid-api-tutorial-proposal.html>
- OID Knowledge Lab repository: <https://github.com/OOYXLOO/oid-knowledge-lab>
- Enterprise OID market brief: <https://ooyxloo.github.io/oid-knowledge-lab/enterprise-market-brief.html>
- Writing samples: <https://ooyxloo.github.io/oid-knowledge-lab/writing-samples.html>
- Editor trust packet: <https://ooyxloo.github.io/oid-knowledge-lab/editor-trust-packet.html>

## Publication boundary

This is a topic proposal, not a finished DigitalOcean tutorial. If accepted, the final article should be freshly written for DigitalOcean's current format, originality requirements, editorial review, and technical review.

The public proof avoids credentials, private data, payment data, and live account exports. The tutorial can use a small synthetic OID seed dataset unless editors prefer a specific public source.
