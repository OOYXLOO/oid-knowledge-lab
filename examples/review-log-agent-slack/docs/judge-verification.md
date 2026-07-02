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

Agent tools endpoint:
https://review-log-agent-slack.vercel.app/api/agent/tools

Public verification:
https://review-log-agent-slack.vercel.app/docs/public-verification.md

Official submission requirements:
https://review-log-agent-slack.vercel.app/docs/official-submission-requirements.md

Slack sandbox setup card:
https://review-log-agent-slack.vercel.app/docs/slack-sandbox-setup-card.md

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
5. The public agent tool endpoint lists `build_review_log`, and the call endpoint can invoke it with sanitized JSON input.
6. The official requirements map connects the demo video, architecture, source, Slack endpoint, agent endpoint, and remaining sandbox URL field.
7. The public docs clearly state what is implemented now and what still requires a live Slack app or final challenge submission.
8. The public source snapshot links reviewable source, tests, docs, and manifest files with SHA-256 hashes; the OID Knowledge Lab repository also contains a public source copy.

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

## Safe Agent Tool POST

```bash
curl -X POST https://review-log-agent-slack.vercel.app/api/agent/call \
  -H "Content-Type: application/json" \
  --data '{"name":"build_review_log","arguments":{"thread":{"title":"API answer review","messages":[{"kind":"question","text":"Can we publish this answer?"},{"kind":"sourceFact","text":"The old token remains valid for 24 hours."}]}}}'
```

Expected result:

```text
The endpoint returns JSON with tool `build_review_log` and a Markdown evidence log in `result.content[0].text`.
```

## Current External Gaps

```text
Public GitHub source snapshot: https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack
Slack app / sandbox URL: not created or not published yet
Devpost submission URL: not submitted yet
```

## Publication Boundary

The public demo uses synthetic examples only. It does not require private Slack messages, Slack tokens, cookies, customer support content, account screenshots, payment data, KYC data, or private workspace exports.
