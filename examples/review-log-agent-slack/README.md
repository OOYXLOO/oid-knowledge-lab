# Review Log Agent for Slack

Review Log Agent is a small prototype for turning Slack-style review threads into
source-aware evidence logs.

The project focuses on documentation, support, and runbook updates where a team
may use AI-assisted drafting but still needs human review, source boundaries,
open questions, and publication blockers before sharing an answer.

## What It Does

- Reads a Slack-like thread export from JSON.
- Classifies messages into reader questions, source facts, draft claims,
  reviewer checks, blockers, decisions, and privacy boundaries.
- Produces a Markdown evidence log that can be pasted into a ticket, pull
  request, knowledge base review, or Slack follow-up.
- Keeps secrets and account-local data out of the generated public handoff.
- Exposes the core as a small MCP-style tool wrapper for agent integrations.

## Quick Start

```bash
npm test
npm run build
npm run demo
```

Demo input:

```text
examples/slack-thread.json
```

Static demo output:

```text
public/index.html
public/playground.html
```

Live demo:

```text
https://review-log-agent-slack.vercel.app/
https://review-log-agent-slack.vercel.app/playground.html
```

`public/playground.html` lets reviewers paste or edit a Slack-style JSON thread
and generate a Markdown handoff in the browser.

## Example Output

```text
# Evidence Log: API token rotation article

## Reader Question
- How do I rotate an API token without breaking active integrations?

## Source Facts
- Existing tokens stay valid for 24 hours after replacement.

## Publication Blockers
- Do not tell readers to delete the old token immediately.
```

## Project Boundary

This repository is a technical prototype. It does not include Slack credentials,
workspace exports, private messages, payment information, customer data, API
tokens, cookies, local storage, or account screenshots.

## Possible Slack App Shape

The core can later sit behind:

- a slash command such as `/review-log`,
- a Slack workflow step,
- a message shortcut for selected thread text,
- or an MCP-style agent action that returns a Markdown handoff.

The current version intentionally keeps the logic dependency-free and testable
before any platform-specific integration.

## Repository Checks

The repository includes a GitHub Actions workflow at:

```text
.github/workflows/ci.yml
```

It runs syntax checks, tests, and the static demo build on pushes and pull
requests to `main`.

The repository also includes a GitHub Pages workflow at:

```text
.github/workflows/pages.yml
```

It builds `public/index.html` and publishes the `public` directory as the project
demo site when Pages is enabled for GitHub Actions.

## Push Helper

After the empty GitHub repository exists, this helper verifies and pushes the
local project. Until then, use the live Vercel demo links above for review:

```powershell
scripts\push-after-repo-created.ps1
```

## Submission Notes

For challenge or reviewer handoff material, see:

```text
docs/architecture.md
docs/reviewer-quickstart.md
docs/demo-video-script.md
docs/submission-pack.md
docs/devpost-field-pack.md
```
