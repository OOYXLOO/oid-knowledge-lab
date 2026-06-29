# ProofDesk Agent Submission Pack

Generated at: `2026-06-30T00:00:00.000Z`

## Project

Name: `ProofDesk`

ProofDesk helps teams turn public or sanitized review claims into source-aware proof packets with evidence links, blocker status, human gates, and a Slack-ready handoff.

## What It Does

ProofDesk accepts a public artifact URL or sanitized claim list, normalizes each claim, separates ready items from human-gated items, and generates Markdown plus JSON proof packets that can be shared in review threads.

## How It Is Built

The current demo is a dependency-light JavaScript and static HTML workflow. It includes a Node.js packet generator for repeatable reports and a browser-only interactive page for local claim editing and packet export.

## Demo Script

1. Open the ProofDesk packet demo.
2. Review the sample claim JSON.
3. Add or edit a claim with a public artifact URL.
4. Generate a proof packet in the browser.
5. Copy Markdown or download JSON.
6. Show how ready claims and human-gated claims stay separate.

## Slack Agent Builder Fit

Slack review threads are a natural surface for ProofDesk because the final handoff is already concise, status-oriented, and human-reviewed.

- Read a public URL or pasted claim from a thread.
- Ask for missing source or approval context when evidence is weak.
- Generate a proof packet summary.
- Post a short status message with blockers and next actions.

## Google Rapid Agent Fit

ProofDesk can be adapted as an agent that turns public artifact claims into auditable packets and routes human approval gates.

- Classify artifact claims.
- Check evidence link completeness.
- Summarize blockers and human gates.
- Produce structured JSON and Markdown for downstream review.

## Proof Links

- [Interactive ProofDesk packet demo](https://ooyxloo.github.io/oid-knowledge-lab/proofdesk-packet-demo.html)
- [ProofDesk workflow brief](https://ooyxloo.github.io/oid-knowledge-lab/proofdesk-slack-workflow.html)
- [Generated proof packet](https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/proofdesk-pack.md)
- [Source repository](https://github.com/OOYXLOO/oid-knowledge-lab)

## Boundaries

- Use public or sanitized inputs only.
- Keep final approval with a human reviewer.
- Do not imply live third-party integrations until they are implemented and verified.
