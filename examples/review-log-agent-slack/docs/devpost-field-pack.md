# Devpost Field Pack

## Project Name

```text
Review Log Agent for Slack
```

## Tagline

```text
Turn Slack-style review threads into source-aware evidence logs before publishing.
```

## Short Description

```text
Review Log Agent for Slack helps teams turn support, documentation, and runbook review conversations into source-aware Markdown evidence logs. It separates reader questions, source facts, draft claims, reviewer checks, publication blockers, and private-data boundaries so a human owner can decide whether an AI-assisted answer is ready to publish.
```

## What It Does

```text
The prototype accepts a Slack-style JSON thread, classifies each message by review role, and generates a Markdown handoff. The handoff is designed for tickets, pull requests, knowledge base reviews, or Slack follow-ups where teams need a visible review trail before publishing a support answer or documentation update.
```

## Inspiration

```text
Teams increasingly use AI-assisted drafting inside collaboration tools, but the review trail often disappears. This project focuses on the moment before publishing: what question is being answered, which source facts support it, what the draft claims, which checks were performed, and what blockers or privacy boundaries remain.
```

## How It Works

```text
1. A reviewer provides a Slack-style thread as JSON.
2. The core normalizes each message and classifies it as a question, source fact, draft claim, reviewer check, blocker, decision, or boundary.
3. The renderer builds a Markdown evidence log and a static review page.
4. The playground lets reviewers edit sample input in the browser and regenerate the handoff without uploading credentials or private Slack data.
```

## Challenge Fit

```text
This project is currently a prototype core, static demo, browser playground, and MCP-style tool wrapper for a Slack review agent. The planned Slack shape is a message shortcut, slash command, workflow step, or MCP tool integration that receives a sanitized thread, calls the review-log core, and returns an ephemeral Markdown handoff for owner review.
```

## Built With

```text
JavaScript
Node.js
MCP-style tool interface
Static HTML/CSS
Vercel
```

## Demo Links

```text
https://review-log-agent-slack.vercel.app/
https://review-log-agent-slack.vercel.app/playground.html
https://review-log-agent-slack.vercel.app/submission.html
https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4
https://review-log-agent-slack.vercel.app/docs/judge-verification.md
https://review-log-agent-slack.vercel.app/docs/source-snapshot.md
https://oid-knowledge-lab.vercel.app/evidence-log-playground.html
```

## Architecture

```text
docs/architecture.md
```

## Demo Video Script

```text
docs/demo-video-script.md
```

## Slack Developer Sandbox URL

```text
Add the Slack developer sandbox URL after the Slack app or sandbox is created.
```

## Slack App Manifest

```text
docs/slack-app-manifest.json
```

The manifest defines `/review-log`, a `Build review log` message shortcut, and the minimum bot scopes `commands` and `chat:write`. It points to the stable Vercel API endpoints for the command and interactivity handler.

## Repository Link

```text
Add the public GitHub repository URL after the standalone repository is reachable.
```

## Verification

```text
npm run check
npm test
npm run build
npm run demo
```

## Current Limitations

```text
This is a dependency-free prototype core, static demo, browser playground, public Vercel API endpoint, and rendered demo video. It does not yet include a live Slack app, Slack developer sandbox URL, OAuth flow, workspace installation, private message access, or production data storage. Demo inputs are synthetic and should stay sanitized.
```

## Privacy Boundary

```text
The project does not require Slack credentials, tokens, cookies, private workspace exports, payment data, customer support content, or account screenshots. Public demos use synthetic examples only.
```
