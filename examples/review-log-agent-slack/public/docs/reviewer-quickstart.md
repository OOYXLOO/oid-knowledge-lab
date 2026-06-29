# Reviewer Quickstart

This quickstart gives reviewers a short path through the public prototype without requiring a Slack workspace, account credentials, or private message data.

## 60-Second Review Path

1. Open the static demo: <https://review-log-agent-slack.vercel.app/>
2. Open the playground: <https://review-log-agent-slack.vercel.app/playground.html>
3. Review the sample Slack-style thread in `examples/slack-thread.json`.
4. Generate the Markdown evidence log in the browser.
5. Compare the separated sections: reader question, source facts, draft claims, reviewer checks, blockers, decisions, and privacy boundaries.
6. Watch the demo video: <https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4>

## What To Look For

- The agent keeps source facts separate from draft claims.
- Review checks and publication blockers remain visible.
- Private-data boundaries are preserved in the handoff.
- The same core can be used by a slash command, message shortcut, workflow step, or MCP-style tool integration.

## Local Verification

```bash
npm run check
npm test
npm run build
npm run demo
```

## Slack App Shape

The repository includes:

- `docs/slack-app-manifest.json`
- `docs/slack-app-handler-contract.md`
- `api/slack/commands/review-log.js`
- `api/slack/interactivity.js`

The public API endpoint accepts Slack-style POST requests and returns an ephemeral review-log response. The public demo does not install into a real workspace or access private Slack messages.

## Boundary

Use only synthetic or sanitized review threads. Do not upload tokens, cookies, customer exports, workspace archives, screenshots from private account pages, payment information, or real support conversations.

