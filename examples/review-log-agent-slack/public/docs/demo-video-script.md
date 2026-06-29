# Demo Video Script

Target length: about 3 minutes.

## 0:00 - 0:20 Problem

Show the static demo home page.

Narration:

```text
Teams often draft support answers, runbook updates, and documentation changes in Slack. AI can help write the first version, but the team still needs to know what question is being answered, which source facts support it, what the draft claims, and what still blocks publication.
```

## 0:20 - 0:55 Input

Open the playground.

Show the synthetic Slack-style thread JSON. Point out:

- reader question,
- source fact,
- AI-assisted draft claim,
- reviewer check,
- publication blocker,
- private-data boundary.

Narration:

```text
This prototype starts from a sanitized Slack-style thread. The example is synthetic, so it does not require Slack credentials or private workspace data.
```

## 0:55 - 1:35 Generate Evidence Log

Click the generate button in the playground.

Show the generated Markdown handoff.

Narration:

```text
The review core normalizes each message, classifies it by role, and generates a Markdown evidence log. The handoff keeps source facts, draft claims, reviewer checks, blockers, and privacy boundaries separate.
```

## 1:35 - 2:10 Decision Boundary

Show the decision and metric cards.

Narration:

```text
The decision text tells the owner whether the thread looks ready for review or still needs more source facts. This is not an automatic publish button. It is a structured handoff that helps a human owner decide what to publish, revise, or reject.
```

## 2:10 - 2:40 Slack / MCP Integration Shape

Show `docs/architecture.md` or the architecture diagram.

Narration:

```text
The same core can sit behind a Slack message shortcut, slash command, workflow step, or MCP-style tool wrapper. The MCP-style wrapper already exposes a build_review_log tool that receives a sanitized thread and returns the Markdown evidence log. A later Slack layer can stay thin: receive selected text, sanitize it, call the core, and return an ephemeral handoff for owner review.
```

## 2:40 - 3:00 Close

Return to the live demo page.

Narration:

```text
Review Log Agent for Slack is designed for teams that use AI-assisted drafting but still need a visible review trail before a support answer, runbook update, or knowledge base article goes live.
```

## Recording Checklist

- Do not show private Slack workspaces.
- Do not show credentials, tokens, account pages, customer data, payment data, or local browser storage.
- Use only the synthetic playground input.
- Keep the final video under 3 minutes.
