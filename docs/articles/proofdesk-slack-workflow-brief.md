# ProofDesk Slack Workflow Brief

ProofDesk is a small evidence workflow concept for teams that review public artifacts, launch submissions, documentation drafts, or generated-media deliveries inside Slack.

The workflow starts with a URL, artifact title, or claim. A Slack-facing assistant turns that input into a review packet: source links, evidence status, unresolved blockers, public-safe boundaries, and a final handoff note. The goal is to make review threads easier to close without asking teammates to inspect private exports, credentials, customer files, payment material, or account screenshots.

## Core workflow

1. Capture a public URL, artifact label, or delivery claim from a Slack thread.
2. Normalize the claim into a short review object with source, owner, expected output, and deadline.
3. Run local checks against the existing OID Knowledge Lab reports when relevant.
4. Generate a proof packet with status, blockers, next actions, and public-safe evidence links.
5. Post a concise handoff summary back to the thread for human review.

## Demo scope

- Public artifact review
- Media provenance delivery sheets
- OID inventory evidence packets
- Launch-readiness checklists
- Documentation review handoffs

## Safety boundary

The workflow is designed for public or sanitized inputs. It should not request or store credentials, tokens, cookies, payment information, identity documents, private customer inventories, private account exports, or raw third-party page bodies.

## Review value

ProofDesk is strongest when a team already has public artifacts but lacks a repeatable way to prove what changed, what is ready, and what still needs human action. The first version can remain narrow: one Slack command, one proof packet format, and one public demo page.

