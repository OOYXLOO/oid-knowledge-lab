# Submission Pack

## Project

Review Log Agent for Slack

## Short Description

Review Log Agent turns Slack-style support or documentation review threads into
source-aware Markdown evidence logs. It is designed for teams that use
AI-assisted drafting but still need human review, source facts, publication
blockers, and private-data boundaries before publishing a support answer,
runbook update, or knowledge base article.

## Demo Links

Live demo:

```text
https://review-log-agent-slack.vercel.app/
https://review-log-agent-slack.vercel.app/playground.html
https://review-log-agent-slack.vercel.app/submission.html
```

Local static demo:

```text
public/index.html
public/playground.html
public/submission.html
```

Rendered demo video:

```text
video/demo-submission/renders/review-log-agent-slack-demo.mp4
public/media/review-log-agent-slack-demo.mp4
https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4
```

Related public proof:

```text
https://oid-knowledge-lab.vercel.app/evidence-log-playground.html
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack
https://ooyxloo.github.io/oid-knowledge-lab/review-log-agent-architecture.html
```

## What to Show

1. A Slack-style thread includes a reader question, source facts, an AI-assisted
   draft claim, reviewer checks, a blocker, and a privacy boundary.
2. The prototype classifies the thread.
3. It generates a Markdown evidence log.
4. The generated handoff makes the publication decision visible.
5. Private tokens, account screenshots, customer exports, and copied third-party
   article bodies stay out of the public output.

## Why It Matters

AI-assisted drafting is useful only when teams can review what changed and why.
This prototype gives Slack discussions a lightweight structure: source facts,
draft claims, reviewer checks, blockers, and boundaries stay separate, so a
human owner can decide whether to publish, revise, or reject the draft.

## Verification Commands

```bash
npm run check
npm test
npm run build
npm run demo
```

## Submission Readiness

Ready:

- Static demo.
- Interactive playground.
- Architecture notes.
- Devpost copy-paste submit pack.
- Devpost field pack.
- Demo video script.
- Rendered demo video, 96 seconds, H.264 MP4, under three minutes.
- Synthetic Slack-style sample data.
- Publishable public page.
- Importable Slack app manifest template.
- Slack app handler contract.
- Public Vercel slash-command API endpoint.
- Public Vercel demo video URL verified as reachable.
- Public GitHub source snapshot in the OID Knowledge Lab repository.
- Static architecture SVG and Mermaid source.

Still needed:

- Slack developer sandbox URL.
- Live Slack app shape, such as a message shortcut, slash command, workflow step, or MCP-backed tool handoff.
- Optional standalone GitHub repository URL, if a separate project repository is created later.

## Slack App Setup Assets

```text
docs/slack-app-manifest.json
docs/slack-app-handler-contract.md
docs/devpost-copy-paste-submit.zh.md
```

The manifest points to the stable Vercel API endpoints. Replace the URLs only if the live handler is moved to another deployment.

## Public Verification

```text
https://review-log-agent-slack.vercel.app/
https://review-log-agent-slack.vercel.app/playground.html
https://review-log-agent-slack.vercel.app/submission.html
https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4
https://review-log-agent-slack.vercel.app/api/slack/commands/review-log
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack
https://ooyxloo.github.io/oid-knowledge-lab/review-log-agent-architecture.svg
```

## Current Boundary

This is a dependency-free prototype core and static demo. It does not yet include
a live Slack app, OAuth flow, workspace installation, private message access, or
Devpost submission. Those steps should happen only after eligibility and account
gates are confirmed.
