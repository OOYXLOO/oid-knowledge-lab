# Qwen Autopilot Agent Packet

## One-line pitch

OID Knowledge Lab can be upgraded into a Qwen Cloud Autopilot Agent that turns sanitized OID inventories into evidence-backed remediation queues with deterministic checks and human approval gates.

## Problem

Teams that own PKI policy OIDs, SNMP/MIB enterprise OIDs, or internal registry spreadsheets often have messy inventory rows, unclear ownership, invalid values, and weak public evidence. A manual review is slow, but a fully autonomous agent would be risky because registry changes, vendor outreach, and production tickets need human approval.

## Agent workflow

1. Parse a sanitized CSV or pasted OID list.
2. Classify OIDs with local deterministic checks against public IANA PEN data and OID-base sitemap metadata.
3. Use Qwen Cloud to explain the findings, draft remediation summaries, and ask for missing safe context.
4. Label each action as evidence-ready, unresolved, invalid, or human-gated.
5. Export Markdown, CSV, and JSON handoff files for review.

## Qwen Cloud role

Qwen should be used for reasoning and language work, not for unverified final authority:

- Explain ambiguous spreadsheet fields.
- Summarize why an OID is evidence-ready or unresolved.
- Draft a client-safe action queue.
- Produce concise stakeholder summaries.
- Refuse to turn private exports, secrets, or copied third-party page bodies into public artifacts.

## Deterministic guardrails

- OID parsing and malformed-value detection are deterministic.
- Public registry evidence is linked to generated JSON and reproducible reports.
- The project does not publish copied OID-base page bodies.
- The project does not publish raw customer inventories, account exports, secrets, private messages, payment data, tax records, or identity documents.
- The agent stops before contacting vendors, changing registries, opening production tickets, or publishing customer-specific data.

## Public proof links

- Dashboard: `https://oid-knowledge-lab.vercel.app/`
- Qwen packet: `https://oid-knowledge-lab.vercel.app/qwen-autopilot-agent-one-link.html`
- Agent demo report: `https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/qwen-agent-demo.md`
- Submission pack: `https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/qwen-submission-pack.md`
- Architecture diagram source: `https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/qwen-architecture.mmd`
- Qwen adapter source: `https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/src/qwenAgent.js`
- Sample assessment: `https://oid-knowledge-lab.vercel.app/sample-assessment.html`
- Direct client fit: `https://oid-knowledge-lab.vercel.app/direct-client-fit.html`
- Consulting brief: `https://oid-knowledge-lab.vercel.app/consulting-brief.html`
- Starter scope: `https://oid-knowledge-lab.vercel.app/starter-scope.html`
- Technical rigor proof: `https://oid-knowledge-lab.vercel.app/technical-rigor-proof.html`
- Source repository: `https://github.com/OOYXLOO/oid-knowledge-lab`

## Submission gaps before Devpost

- Run one live Qwen Cloud call with `DASHSCOPE_API_KEY` and save redacted proof.
- Record a three-minute public demo video.
- Render the Mermaid architecture diagram into a Devpost-friendly image.
- Confirm the required Alibaba Cloud/Qwen Cloud proof format.
- Confirm the license expected by the challenge before final submission.
