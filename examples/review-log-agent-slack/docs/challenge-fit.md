# Challenge Fit

## Prototype

Review Log Agent for Slack is a small core that can later power a Slack slash
command, workflow step, message shortcut, or agent action.

## Use Case

Teams often discuss support answers, knowledge base updates, release notes, and
runbook changes in Slack. AI-assisted drafting can help, but the team still
needs to preserve source facts, reviewer checks, open blockers, and boundaries
around private data before publishing anything.

## Demo Flow

1. A Slack-style thread contains a reader question, source facts, an AI-assisted
   claim, reviewer checks, and a blocker.
2. The prototype classifies each message.
3. It generates a Markdown evidence log.
4. The team pastes that handoff into a ticket, pull request, or knowledge base
   review.

## Later Slack Integration

Possible integration shapes:

- `/review-log` slash command with pasted thread text.
- Message shortcut on a thread summary.
- Workflow step that receives a thread export from a trusted internal process.
- Agent action that returns a Markdown handoff and asks for owner review.

## Official Submission Notes

- Track: New Slack Agent.
- Required technology angle: MCP server integration through the `build_review_log` tool boundary, plus a Slack slash command endpoint.
- Slack sandbox event code: `SABC-7X2K-M9PL-4QFN`.
- Judges must be able to access the sandbox through `slackhack@salesforce.com` and `testing@devpost.com`.
- Demo video should be under three minutes and hosted on an accepted public video platform for final Devpost submission.

## Safety Boundary

This project should not store Slack credentials, tokens, cookies, private
workspace exports, account screenshots, payment data, or customer support
content. Demo inputs must remain synthetic or explicitly sanitized.
