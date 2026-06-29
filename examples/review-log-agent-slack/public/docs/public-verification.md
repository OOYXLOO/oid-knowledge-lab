# Public Verification

Last checked: 2026-06-29

## Stable URLs

```text
https://review-log-agent-slack.vercel.app/
https://review-log-agent-slack.vercel.app/playground.html
https://review-log-agent-slack.vercel.app/submission.html
https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4
https://review-log-agent-slack.vercel.app/api/slack/commands/review-log
https://review-log-agent-slack.vercel.app/docs/judge-verification.md
https://review-log-agent-slack.vercel.app/docs/source-snapshot.md
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack
```

## Verified Behavior

- The main static demo returns HTTP 200.
- The submission page returns HTTP 200.
- The demo video returns HTTP 200 with `video/mp4`.
- The slash-command endpoint accepts POST requests and returns Slack-compatible JSON.
- The judge verification checklist gives a short review path, local commands, and safe test POST.
- The source snapshot exposes reviewable source/test/doc copies and SHA-256 hashes, and the OID Knowledge Lab repository contains a public source copy.
- Demo input is synthetic and contains no private Slack export, token, cookie, payment data, customer data, or account screenshot.

## Still Needed

- Optional standalone GitHub repository URL for this project.
- Slack developer sandbox or app listing URL.
- Challenge submission URL after final external submission.
