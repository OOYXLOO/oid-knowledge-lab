# Judge Verification Checklist

Last updated: 2026-06-29

## Open These First

```text
Submission page:
https://review-log-agent-slack.vercel.app/submission.html

Interactive playground:
https://review-log-agent-slack.vercel.app/playground.html

Demo video:
https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4

Slash-command endpoint:
https://review-log-agent-slack.vercel.app/api/slack/commands/review-log

Public verification:
https://review-log-agent-slack.vercel.app/docs/public-verification.md

Public source snapshot:
https://review-log-agent-slack.vercel.app/docs/source-snapshot.md
```

## What To Check

1. The submission page describes the project, challenge fit, demo links, architecture, and current Slack boundaries.
2. The playground regenerates a Markdown evidence log from synthetic Slack-style input in the browser.
3. The demo video shows the review flow without using private Slack exports, tokens, customer content, or account screenshots.
4. The slash-command endpoint returns `405` for a browser `GET`, and returns Slack-compatible JSON for a `POST`.
5. The public docs clearly state what is implemented now and what still requires a live Slack app or final challenge submission.
6. The public source snapshot links reviewable source, tests, docs, and manifest files with SHA-256 hashes while the standalone GitHub repository is pending.

## Local Verification Commands

```bash
npm run check
npm test
npm run build
npm run guard:publishable
```

## Safe Test POST

```bash
curl -X POST https://review-log-agent-slack.vercel.app/api/slack/commands/review-log \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "text=Summarize%20the%20release%20review"
```

Expected result:

```text
The endpoint returns Slack-compatible JSON with a text response.
```

## Current External Gaps

```text
Public GitHub repository URL: not reachable yet
Slack app / sandbox URL: not created or not published yet
Devpost submission URL: not submitted yet
```

## Publication Boundary

The public demo uses synthetic examples only. It does not require private Slack messages, Slack tokens, cookies, customer support content, account screenshots, payment data, KYC data, or private workspace exports.
