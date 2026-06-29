# Slack App Handler Contract

## Purpose

This contract describes the smallest live Slack layer needed for the Review Log Agent demo. It does not store Slack tokens, private workspace exports, cookies, payment data, customer support content, or account screenshots.

## Recommended App Shape

Use two lightweight entry points:

1. Slash command: `/review-log`
2. Message shortcut: `Build review log`

Both should call the same review-log core after sanitizing input.

## Slash Command Flow

1. User runs `/review-log` with sanitized review notes.
2. Slack sends the command payload to `/slack/commands/review-log`.
3. Handler verifies the Slack signature.
4. Handler converts the text into a synthetic thread object.
5. Handler calls `buildEvidenceLog()` and `renderMarkdown()`.
6. Handler returns an ephemeral response with the Markdown evidence log.

## Message Shortcut Flow

1. User selects a message and chooses `Build review log`.
2. Slack sends an interactivity payload to `/slack/interactivity`.
3. Handler verifies the Slack signature.
4. Handler extracts sanitized selected-message text only.
5. Handler calls the review-log core.
6. Handler returns an ephemeral response for owner review.

## Required Environment Variables

Do not commit these values:

```text
SLACK_SIGNING_SECRET
SLACK_BOT_TOKEN
```

## Public Demo Boundary

The public demo can use synthetic Slack-style JSON only. A real workspace demo should avoid private customer exports and should not request broad scopes.

## Minimum Scopes

```text
commands
chat:write
```

## Placeholder URLs

The manifest points to the stable public Vercel API endpoints:

```text
https://review-log-agent-slack.vercel.app/api/slack/commands/review-log
https://review-log-agent-slack.vercel.app/api/slack/interactivity
```

If the app is deployed under another domain, replace these URLs with that deployment's command and interactivity endpoints.

## Acceptance Check

The live Slack app is good enough for a challenge demo when:

1. `/review-log` returns an ephemeral evidence log from sanitized notes.
2. `Build review log` message shortcut returns the same handoff shape.
3. The demo does not expose tokens, private workspace data, or customer content.
4. The public submission page links to the Slack developer sandbox URL.
