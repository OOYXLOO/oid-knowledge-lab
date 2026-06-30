# GitHub Source Fallback

Review Log Agent for Slack has a standalone local project, but the public
standalone GitHub repository may not exist yet during platform setup.

Until `OOYXLOO/review-log-agent-slack` is available, use this public source
snapshot:

```text
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack
```

The snapshot contains:

- source code for the review-log core,
- API handlers for the Slack-style command and interactivity endpoints,
- tests,
- challenge and reviewer documentation,
- a Slack app manifest template,
- static demo pages,
- source snapshots rendered as `.txt` files for quick review,
- and the public demo video mirror under `public/media/`.

The public Vercel demo remains:

```text
https://review-log-agent-slack.vercel.app/
```

The public video remains:

```text
https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4
```

This fallback does not include Slack credentials, private workspace exports,
customer data, cookies, tokens, payment information, or account-local browser
storage.
