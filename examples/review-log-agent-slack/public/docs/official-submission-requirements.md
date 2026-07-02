# Official Submission Requirements Map

This file maps Slack Agent Builder Challenge submission requirements to current Review Log Agent evidence.

## Official Challenge Facts

- Challenge: Slack Agent Builder Challenge.
- Deadline: July 13, 2026 at 5:00 PM PDT.
- Cash prize pool: USD 42,000.
- Total official prize ARV: up to USD 74,400.
- Submission period: May 20, 2026 10:00 AM PT to July 13, 2026 5:00 PM PT.
- Judging period: July 14, 2026 11:00 AM PT to August 6, 2026 11:00 AM PT.
- Winners announced: on or around August 11, 2026 2:00 PM PT.
- Relevant prize targets for this project:
  - New Slack Agent: first place USD 8,000, second place USD 4,000.
  - Best UX: USD 2,000.
  - Most Innovative Slack Agent: USD 2,000.
  - Best Technological Implementation: USD 2,000.
- Required technology fit: the project must use at least one of Slack AI capabilities, MCP server integration, or Real-Time Search API.
- Slack developer sandbox is required for submission.
- Sandbox event code: `SABC-7X2K-M9PL-4QFN`.
- Required sandbox access emails: `slackhack@salesforce.com` and `testing@devpost.com`.

## Required Submission Items

| Requirement | Current Evidence | Status |
| --- | --- | --- |
| Demo video, under/about 3 minutes and publicly visible on an accepted video platform | `https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4` exists; must still mirror to an accepted platform such as YouTube, Vimeo, Facebook Video, or Youku before final Devpost submission if Devpost requires one of those links | Needs final platform URL |
| Architecture diagram | `docs/architecture.md`, `docs/architecture.mmd`, and the public architecture SVG in OID Knowledge Lab | Ready |
| Working project demo | `https://review-log-agent-slack.vercel.app/` and `https://review-log-agent-slack.vercel.app/playground.html` | Ready |
| Slack developer sandbox URL | Must be added after creating or confirming the Slack app/sandbox | Missing account-side field |
| Source code | `https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack` | Ready as source snapshot |
| Slack platform technology | Slash command endpoint plus MCP-style tool wrapper | Ready prototype |
| Public agent tool API | `/api/agent/tools` and `/api/agent/call` | Ready prototype |
| Public verification page | `https://review-log-agent-slack.vercel.app/submission.html` | Ready |

## Slack Technology Mapping

The current project demonstrates three Slack Challenge-relevant integration shapes:

1. Slash command endpoint
   - Endpoint: `https://review-log-agent-slack.vercel.app/api/slack/commands/review-log`
   - Behavior: accepts form-encoded command-style input and returns Slack-compatible JSON with `response_type`.

2. MCP-style tool wrapper
   - Tool name: `build_review_log`
   - Purpose: receives a synthetic or sanitized Slack-style review thread and returns a Markdown evidence log.
   - File: `src/mcpTool.js`

3. Public agent tool API
   - Tools endpoint: `https://review-log-agent-slack.vercel.app/api/agent/tools`
   - Call endpoint: `https://review-log-agent-slack.vercel.app/api/agent/call`
   - Purpose: lets judges inspect and invoke the same `build_review_log` tool boundary without workspace credentials.

## Judge Verification Path

1. Open the public demo page.
2. Open the playground and inspect or edit the sample Slack-style thread.
3. Generate an evidence log.
4. Watch the demo video.
5. Review `docs/architecture.md`.
6. Review the source snapshot in OID Knowledge Lab.
7. Optionally POST a form body to the slash command endpoint and confirm a Slack-compatible JSON response.
8. Optionally GET `/api/agent/tools` and POST `/api/agent/call` with sanitized JSON input.

## Current Missing Items

The remaining required submission-side fields are:

1. Slack developer sandbox URL with judge/testing access.
2. Public video URL on an accepted platform if the direct MP4 URL is not accepted by Devpost.
3. Final Devpost submission URL after submission.

These are account-side platform evidence items, not code gaps. The current implementation should not store Slack credentials, tokens, cookies, private workspace exports, or account-local data.

Setup aid:

```text
https://review-log-agent-slack.vercel.app/docs/slack-sandbox-setup-card.md
```

## Recommended Track Positioning

Primary track:

```text
New Slack Agent
```

Secondary award fit:

```text
Best Technological Implementation
Best UX
Most Innovative Slack Agent
```

Rationale: the project is an original Slack review agent with a tested review-log core, slash-command surface, public agent-tool API, MCP-style tool wrapper, browser playground, source snapshot, and a judge verification path. The remaining sandbox URL is an account-side setup item, not a missing implementation concept.
