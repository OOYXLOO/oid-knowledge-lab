# Official Submission Requirements Map

This file maps Slack Agent Builder Challenge submission requirements to current Review Log Agent evidence.

## Required Submission Items

| Requirement | Current Evidence | Status |
| --- | --- | --- |
| Demo video, about 3 minutes | `https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4` | Ready |
| Architecture diagram | `docs/architecture.md`, `docs/architecture.mmd`, and the public architecture SVG in OID Knowledge Lab | Ready |
| Working project demo | `https://review-log-agent-slack.vercel.app/` and `https://review-log-agent-slack.vercel.app/playground.html` | Ready |
| Slack developer sandbox URL | Must be added after creating or confirming the Slack app/sandbox | Missing account-side field |
| Source code | `https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack` | Ready as source snapshot |
| Slack platform technology | Slash command endpoint plus MCP-style tool wrapper | Ready prototype |
| Public agent tool API | `/api/agent/tools` and `/api/agent/call` | Ready prototype |
| Public verification page | `https://review-log-agent-slack.vercel.app/submission.html` | Ready |

## Slack Technology Mapping

The current project demonstrates two Slack Challenge-relevant integration shapes:

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

## Current Missing Item

The only required field still missing is the Slack developer sandbox URL. This is account-side platform evidence, not a code gap. The current implementation should not store Slack credentials, tokens, cookies, private workspace exports, or account-local data.
