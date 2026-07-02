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

Official submission requirements:
https://review-log-agent-slack.vercel.app/docs/official-submission-requirements.md

Public source snapshot:
https://review-log-agent-slack.vercel.app/docs/source-snapshot.md

Public GitHub source snapshot:
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack
```

## What To Check

1. The submission page describes the project, challenge fit, demo links, architecture, and current Slack boundaries.
2. The playground regenerates a Markdown evidence log from synthetic Slack-style input in the browser.
3. The demo video shows the review flow without using private Slack exports, tokens, customer content, or account screenshots.
4. The slash-command endpoint returns `405` for a browser `GET`, and returns Slack-compatible JSON for a `POST`.
5. The official requirements map connects the demo video, architecture, source, Slack endpoint, and remaining sandbox URL field.
6. The public docs clearly state what is implemented now and what still requires a live Slack app or final challenge submission.
7. The public source snapshot links reviewable source, tests, docs, and manifest files with SHA-256 hashes; the OID Knowledge Lab repository also contains a public source copy.

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
Public GitHub source snapshot: https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack
Slack app / sandbox URL: not created or not published yet
Devpost submission URL: not submitted yet
```

## Publication Boundary

The public demo uses synthetic examples only. It does not require private Slack messages, Slack tokens, cookies, customer support content, account screenshots, payment data, KYC data, or private workspace exports.
