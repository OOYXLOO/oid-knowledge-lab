# Qwen Devpost Field Pack

Prepared at: 2026-07-02T00:00:00.000Z

This pack is a concise, copy-ready version of the Qwen Cloud Hackathon submission materials for OID Knowledge Lab. It keeps the public claims limited to what is already represented by the repository and public proof pages.

## Project title

OID Knowledge Lab: Qwen Remediation Autopilot

## Tagline

Qwen-assisted OID remediation handoffs with deterministic registry checks and human approval gates.

## Short summary

OID Knowledge Lab explores how a Qwen-assisted review agent can turn sanitized Object Identifier evidence into a remediation queue while keeping deterministic checks, source links, and human approval gates separate from model-written notes.

## What it does

The project accepts sanitized OID inventory input, classifies known enterprise roots and malformed values, generates a remediation queue, drafts reviewer-friendly summaries, and exports public-safe proof artifacts. It is designed for PKI, SNMP/MIB, IAM, and internal registry owners who need a reviewable OID cleanup workflow before any external action is taken.

## How Qwen is used

Qwen is positioned as the language and reasoning layer after deterministic OID parsing and registry checks. The model summarizes evidence, explains uncertain rows, and drafts remediation notes, while local code preserves source status, validation results, and human approval gates.

## Built with

Node.js, static HTML/CSS/JavaScript, public IANA PEN data, OID-base sitemap metadata, DashScope OpenAI-compatible Qwen chat API adapter, Alibaba Function Compute handler source, Markdown/JSON/CSV artifact generation.

## Main links

- Final overview: https://ooyxloo.github.io/oid-knowledge-lab/qwen-final-submission-overview.html
- Repository: https://github.com/OOYXLOO/oid-knowledge-lab
- Demo reel: https://ooyxloo.github.io/oid-knowledge-lab/qwen-demo-reel.html
- Three-minute walkthrough: https://ooyxloo.github.io/oid-knowledge-lab/qwen-3-minute-walkthrough.html
- Blog award draft: https://ooyxloo.github.io/oid-knowledge-lab/qwen-blog-post-award-draft.html
- One-link packet: https://ooyxloo.github.io/oid-knowledge-lab/qwen-autopilot-agent-one-link.html
- Build journal: https://ooyxloo.github.io/oid-knowledge-lab/qwen-build-journal.html
- Submission pack: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/qwen-submission-pack.md
- Redacted run receipt template: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/qwen-run-receipt.md
- Function Compute handler source: https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/deploy/alibaba-function-compute-qwen-handler.js
- Open-source license: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/LICENSE

## Honest proof boundary

This public draft describes a source-grounded Qwen Cloud candidate and its proof boundary. It does not claim a live Qwen Cloud deployment, a live Alibaba Cloud backend, or a production customer workflow. A live-run claim should only be added after a private run produces a redacted receipt with no secrets, account screenshots, private console details, or account-specific metadata.

## Suggested Devpost challenge notes

The project focuses on safe AI-assisted infrastructure review rather than automated production change. Qwen improves the readability and usefulness of the remediation handoff, but deterministic checks and human approval gates remain separate and auditable.
