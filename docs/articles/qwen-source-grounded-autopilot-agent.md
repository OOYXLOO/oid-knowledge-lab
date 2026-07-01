# From Static OID Evidence to a Source-Grounded Autopilot Agent

AI agents are most useful in infrastructure work when they make review queues easier to move through, not when they pretend to replace the reviewer.

That distinction matters for Object Identifier work. OIDs appear in certificate policies, SNMP/MIB records, private enterprise arcs, IAM integrations, and old internal registries. They are quiet most of the time. Then a renewal, migration, customer audit, or security review starts, and a team suddenly needs to know which identifiers are assigned, which claims are source-backed, and which remediation notes are safe to send outside the team.

The first prototype for OID Knowledge Lab was intentionally conservative: collect public sitemap-level evidence, import public IANA Private Enterprise Number records, generate deterministic reports, and publish static review pages with a clear boundary. The project does not mirror full third-party page bodies or present private customer data as a demo shortcut.

That makes it a useful candidate for an autopilot-agent workflow.

## The Product Shape

The agent is not a generic chatbot. It is a review assistant that starts from a sanitized OID inventory and turns it into a structured handoff:

1. Parse and validate OID-like values.
2. Compare enterprise roots against public registry evidence.
3. Separate source-backed findings from unresolved claims.
4. Draft reviewer-readable explanations from the deterministic packet.
5. Stop at a human approval gate before publication, vendor contact, customer handoff, or ticket creation.

The important design choice is that deterministic checks remain separate from generated language. A model can help explain why a row matters, but it should not be the source of truth for whether an identifier is assigned or whether a public source supports a claim.

## Where Qwen Fits

Qwen Cloud fits the language and reasoning layer. In a live version, a small Qwen runner would receive a sanitized evidence packet and return draft remediation notes, reviewer summaries, or stakeholder-facing explanations.

The public demo keeps that boundary honest. It shows the intended adapter shape and proof surfaces, but it does not claim a live Qwen Cloud deployment or Alibaba Cloud backend until a real run exists. A safe execution receipt would record only non-sensitive metadata such as:

- timestamp
- model family
- input hash
- output hash
- run status
- redacted prompt and output samples where appropriate

No API key, billing screen, account identifier, private console view, customer spreadsheet, cookie, or token belongs in the public artifact.

## Why This Is an Agent Problem

OID cleanup often fails because the work is small enough to postpone and specialized enough to confuse non-specialists. An autopilot queue helps by creating momentum:

- known rows can be summarized quickly
- malformed values can be separated from uncertain values
- unresolved rows can be explained without inventing confidence
- reviewers can see exactly what needs a human decision
- teams can hand off a small first scope instead of arguing about the entire registry

The agent is useful because it narrows the next action. It should not silently change a registry, contact a third party, or publish a remediation note. Those actions remain behind explicit approval.

## Current Public Proof

The current repository includes:

- a public OID-base sitemap-level directory
- an IANA PEN import and public-safe index
- source-policy and publish-guard reports
- static evidence pages
- sample remediation packs
- Qwen-oriented architecture and submission notes

The Qwen candidate packet is available at:

```text
https://ooyxloo.github.io/oid-knowledge-lab/qwen-autopilot-agent-one-link.html
```

The build journal is available at:

```text
https://ooyxloo.github.io/oid-knowledge-lab/qwen-build-journal.html
```

## Next Build Step

The next meaningful step is not a bigger landing page. It is a small live adapter run with a redacted receipt:

1. prepare one sanitized evidence packet
2. call Qwen through a private environment
3. store only the non-sensitive execution receipt
4. update the public proof page if the receipt supports the claim
5. keep the human approval gate visible in the demo

That would turn the project from a source-grounded candidate into a stronger Qwen Cloud hackathon submission without weakening the publication boundary.

