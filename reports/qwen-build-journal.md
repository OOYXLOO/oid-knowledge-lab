# From OID Evidence to an Autopilot Review Queue

This build journal describes a Qwen Cloud hackathon candidate for source-grounded OID review. It is intentionally written as an implementation note, not as a claim that the project is already deployed on Qwen Cloud or Alibaba Cloud.

## Problem

Object Identifier inventories are quiet until they become expensive. Certificate policy OIDs, vendor arcs, private enterprise numbers, and identity-infrastructure references can sit in documentation for years. When a migration, renewal, or compliance review starts, teams need to know which references are assigned, which claims are backed by public sources, and which remediation notes are safe to publish or send to a client.

The hard part is not generating a paragraph. The hard part is keeping the paragraph tied to source evidence.

## Current Prototype

OID Knowledge Lab already separates deterministic checks from generated language:

- public OID-base sitemap indexing
- IANA Private Enterprise Number import
- source-policy and publish-guard reports
- static evidence pages for reviewers
- sample asset audits and remediation queues
- public-safe proof pages that exclude credentials, tokens, private account screens, and customer data

The current Qwen-facing prototype is a candidate workflow:

1. Ingest public OID and PEN evidence.
2. Build a deterministic review packet.
3. Generate risk and remediation notes from the packet.
4. Keep generated suggestions separate from source facts.
5. Require a human approval gate before publishing, submitting, or sending the output.

## Why Qwen Cloud Fits

The project maps naturally to an autopilot-agent track because the model should not replace the reviewer. It should help the reviewer move faster through a structured queue:

- summarize assigned and unassigned identifiers
- explain why a reference matters
- draft remediation notes with source links
- flag missing evidence instead of hallucinating certainty
- produce a short handoff for non-specialist reviewers

Qwen Cloud would be used for the language and reasoning layer, while local deterministic code keeps the source ledger, validation status, and publish boundary.

## Evidence Boundary

This journal does not claim:

- a live Qwen Cloud deployment
- a live Alibaba Cloud backend
- a stored DashScope API key
- a private account integration
- a paid or production customer workflow

Those should only be added after a real cloud run exists and after secrets, private console details, billing data, and account identifiers are removed from public artifacts.

## Next Build Steps

1. Add a small Qwen Cloud runner that accepts a sanitized evidence packet and returns a draft remediation note.
2. Save only a redacted execution receipt: timestamp, model family, input hash, output hash, and non-sensitive run status.
3. Deploy a minimal backend on Alibaba Cloud or a public equivalent that can be replaced by Alibaba Cloud before final submission.
4. Add a judge page that shows the evidence packet, deterministic checks, generated notes, and human approval status.
5. Record the final boundary in the README before any Devpost submission.

## Public Links

- Project repository: `https://github.com/OOYXLOO/oid-knowledge-lab`
- Qwen candidate page: `https://ooyxloo.github.io/oid-knowledge-lab/qwen-autopilot-agent-one-link.html`
- Build journal page: `https://ooyxloo.github.io/oid-knowledge-lab/qwen-build-journal.html`
- Submission packet: `https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/qwen-submission-pack.md`
