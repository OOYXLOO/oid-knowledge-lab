# Slack Sandbox Setup Card

This card is the shortest account-side path for turning the public Review Log Agent prototype into a Slack developer sandbox entry for Devpost.

## Goal

Create or confirm a Slack app/sandbox that can provide the Devpost field:

```text
Slack developer sandbox URL
```

Official FAQ requirement checked on 2026-07-02:

```text
Sandbox event code:
SABC-7X2K-M9PL-4QFN

Judge access emails:
slackhack@salesforce.com
testing@devpost.com
```

## Public Endpoints

Use the stable Vercel deployment:

```text
Slash command Request URL:
https://review-log-agent-slack.vercel.app/api/slack/commands/review-log

Interactivity Request URL:
https://review-log-agent-slack.vercel.app/api/slack/interactivity

Agent tools endpoint:
https://review-log-agent-slack.vercel.app/api/agent/tools

Agent call endpoint:
https://review-log-agent-slack.vercel.app/api/agent/call
```

## Manifest Path

Use this manifest as the starting point:

```text
docs/slack-app-manifest.json
```

Public copy:

```text
https://review-log-agent-slack.vercel.app/docs/slack-app-manifest.json
```

## Minimal Manual Steps

1. Join or open the Slack Developer Program and provision the developer sandbox using the event code:

```text
SABC-7X2K-M9PL-4QFN
```

2. Open Slack API app creation:

```text
https://api.slack.com/apps
```

3. Create an app from the manifest.
4. Paste the contents of `docs/slack-app-manifest.json`.
5. Install the app into the developer sandbox.
6. Confirm `/review-log` is available.
7. Invite the required judge/testing accounts as Members, not Guests:

```text
slackhack@salesforce.com
testing@devpost.com
```

8. Run `/review-log` with sanitized sample text, for example:

```text
Reader asks how to rotate an API token. Source says old tokens remain valid for 24 hours. Draft says delete old token immediately. Reviewer flags this as unsafe.
```

9. Confirm the response is an evidence log.
10. Copy the Slack app/sandbox URL into the Devpost field.

## Acceptance Check

The sandbox is good enough for submission when:

- `/review-log` exists.
- The slash command returns an evidence-log style response.
- The app uses only the minimum scopes `commands` and `chat:write`.
- Both judge/testing emails have sandbox access as Members.
- The demo uses sanitized text only.
- No Slack tokens, signing secrets, workspace exports, customer data, cookies, account screenshots, payment data, or KYC data are copied into this repository or Devpost.

## If Slack App Setup Is Not Finished

Use the current public prototype as fallback evidence:

```text
Submission page:
https://review-log-agent-slack.vercel.app/submission.html

Official requirements map:
https://review-log-agent-slack.vercel.app/docs/official-submission-requirements.md

Public slash endpoint:
https://review-log-agent-slack.vercel.app/api/slack/commands/review-log

Public agent tool endpoint:
https://review-log-agent-slack.vercel.app/api/agent/tools
```
