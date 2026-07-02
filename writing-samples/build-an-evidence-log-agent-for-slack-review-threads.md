# Build an Evidence Log Agent for Slack Review Threads

When teams review support answers, runbook updates, or documentation drafts in Slack, the useful context often disappears into a fast thread. One person asks the original question, another person pastes source material, an AI-assisted draft appears, and a reviewer flags a blocker. A week later, it is hard to tell which claim was supported, which risk was accepted, and what still needed a human decision.

This tutorial shows how to build a small Node.js evidence-log agent for Slack-style review threads. The goal is not to replace the reviewer. The goal is to turn a messy conversation into a structured handoff that separates source facts, draft claims, reviewer checks, blockers, decisions, and private-data boundaries.

The finished prototype can run as a command-line tool, a browser playground, a Vercel API endpoint, or the core behind a Slack slash command.

## What We Are Building

The agent takes a JSON thread shaped like this:

```json
[
  {
    "author": "reader",
    "text": "How do I rotate an API token without breaking active integrations?"
  },
  {
    "author": "docs",
    "text": "Source: Existing tokens stay valid for 24 hours after replacement."
  },
  {
    "author": "assistant",
    "text": "Draft: Delete the old token immediately after creating the new one."
  },
  {
    "author": "reviewer",
    "text": "Blocker: Do not tell readers to delete the old token immediately."
  }
]
```

It returns a Markdown evidence log:

```md
# Evidence Log: API token rotation article

## Reader Question
- How do I rotate an API token without breaking active integrations?

## Source Facts
- Existing tokens stay valid for 24 hours after replacement.

## Draft Claims
- Delete the old token immediately after creating the new one.

## Publication Blockers
- Do not tell readers to delete the old token immediately.
```

That output gives the human owner a compact review artifact. They can paste it into a pull request, ticket, support note, or documentation review.

## Model the Review Thread

The first useful boundary is the data model. Do not start with a large language model prompt. Start by deciding what categories a reviewer actually needs.

For this prototype, the categories are:

- `reader_question`: what the reader or customer is trying to solve.
- `source_fact`: a claim copied or summarized from an authoritative source.
- `draft_claim`: a proposed answer that still needs review.
- `reviewer_check`: a reviewer note that confirms, questions, or amends a claim.
- `blocker`: something that prevents publication.
- `decision`: a final human decision.
- `privacy_boundary`: a note about secrets, account data, customer data, or other material that must not be published.

A small classifier can be enough for the first version:

```js
function classifyMessage(message) {
  const text = message.text.trim();
  const lower = text.toLowerCase();

  if (lower.startsWith("source:")) return "source_fact";
  if (lower.startsWith("draft:")) return "draft_claim";
  if (lower.startsWith("blocker:")) return "blocker";
  if (lower.startsWith("decision:")) return "decision";
  if (lower.includes("do not publish") || lower.includes("private")) {
    return "privacy_boundary";
  }
  if (message.author === "reader" || text.endsWith("?")) {
    return "reader_question";
  }
  return "reviewer_check";
}
```

This is deliberately boring code. That is a feature. A classifier that reviewers can understand is easier to trust and test than a hidden prompt that changes shape every time the model responds.

## Build the Evidence Log

After classification, group messages by category:

```js
function buildEvidenceLog(thread) {
  const buckets = {
    reader_question: [],
    source_fact: [],
    draft_claim: [],
    reviewer_check: [],
    blocker: [],
    decision: [],
    privacy_boundary: []
  };

  for (const message of thread) {
    const category = classifyMessage(message);
    buckets[category].push(cleanPrefix(message.text));
  }

  return buckets;
}

function cleanPrefix(text) {
  return text.replace(/^(source|draft|blocker|decision):\s*/i, "").trim();
}
```

Then render the buckets as Markdown:

```js
const SECTION_TITLES = {
  reader_question: "Reader Question",
  source_fact: "Source Facts",
  draft_claim: "Draft Claims",
  reviewer_check: "Reviewer Checks",
  blocker: "Publication Blockers",
  decision: "Decisions",
  privacy_boundary: "Privacy Boundaries"
};

function renderMarkdown(title, buckets) {
  const lines = [`# Evidence Log: ${title}`, ""];

  for (const [category, items] of Object.entries(buckets)) {
    if (items.length === 0) continue;
    lines.push(`## ${SECTION_TITLES[category]}`);
    for (const item of items) lines.push(`- ${item}`);
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
```

At this point, the project already has a useful dependency-free core. That core can be tested without Slack, Vercel, a database, or an AI provider.

## Add Safety Boundaries

The most important safety rule is that the evidence log must not normalize private material into publishable prose.

Add a simple scanner before rendering:

```js
const PRIVATE_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /token/i,
  /cookie/i,
  /customer export/i,
  /account screenshot/i
];

function findPrivateDataWarnings(thread) {
  return thread
    .filter((message) => PRIVATE_PATTERNS.some((pattern) => pattern.test(message.text)))
    .map((message) => ({
      author: message.author,
      warning: "Potential private or account-local data. Review before publishing."
    }));
}
```

For a production system, this scanner should be more careful and context-aware. For a tutorial prototype, it gives the project a visible boundary: the agent is allowed to help organize review evidence, but it is not allowed to silently publish secrets.

## Expose It as a Slack-Style Handler

The core function can sit behind a Slack slash command. A slash command handler normally receives form-encoded data from Slack and returns JSON that Slack can display.

A minimal handler can look like this:

```js
async function handleReviewLogCommand(request) {
  const body = await parseFormBody(request);
  const thread = JSON.parse(body.text || "[]");

  const buckets = buildEvidenceLog(thread);
  const warnings = findPrivateDataWarnings(thread);
  const markdown = renderMarkdown("Slack review thread", buckets);

  return {
    response_type: "ephemeral",
    text: warnings.length
      ? "Evidence log generated with private-data warnings."
      : "Evidence log generated.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "```" + markdown.slice(0, 2500) + "```"
        }
      }
    ]
  };
}
```

Use an ephemeral response for review artifacts by default. That prevents an early draft from being broadcast to the whole channel before a human has checked it.

## Add a Browser Playground

Before installing anything into a real Slack workspace, create a static playground. The playground only needs:

- a textarea for JSON input,
- a button to generate the evidence log,
- a preview pane for Markdown output,
- a warning area for private-data checks.

This makes the tool easier to review, demo, and test. It also gives non-admin reviewers a way to inspect the workflow without installing a Slack app.

## Test the Core Before the Integration

Write tests around the behavior that matters:

```js
const assert = require("assert");

function testBuildsEvidenceLog() {
  const thread = [
    { author: "reader", text: "How do I rotate an API token?" },
    { author: "docs", text: "Source: Old tokens stay valid for 24 hours." },
    { author: "reviewer", text: "Blocker: Mention the overlap window." }
  ];

  const buckets = buildEvidenceLog(thread);

  assert.deepStrictEqual(buckets.reader_question, [
    "How do I rotate an API token?"
  ]);
  assert.deepStrictEqual(buckets.source_fact, [
    "Old tokens stay valid for 24 hours."
  ]);
  assert.deepStrictEqual(buckets.blocker, [
    "Mention the overlap window."
  ]);
}
```

This style of test is more useful than testing generated HTML first. If the core evidence model is correct, the CLI, web page, and Slack handler can all reuse it.

## Deployment Shape

A practical first deployment can be a Vercel app:

- `public/index.html`: static demo.
- `public/playground.html`: browser-local playground.
- `api/slack/commands/review-log.js`: slash-command endpoint.
- `api/agent/tools.js`: optional tool contract for agent integrations.
- `src/reviewLog.js`: dependency-free evidence-log core.

The Slack app can later point its slash command to the deployed API endpoint. Keep the signing secret and bot token in environment variables, never in the repository.

## Where AI Fits

You can add a model later, but the model should not own the final boundary. A safer pattern is:

1. Deterministic code separates source facts, draft claims, blockers, and privacy boundaries.
2. The model proposes summaries or rewrites inside those categories.
3. The evidence log keeps the source and review structure visible.
4. A human makes the publication decision.

This preserves the part reviewers need most: not just an answer, but a reason to trust or reject the answer.

## Conclusion

Slack review threads already contain the raw material for better documentation and support workflows. An evidence-log agent turns that raw material into a durable review artifact.

The prototype in this tutorial is intentionally small: parse a thread, classify messages, render Markdown, warn on private data, and expose the same core through a CLI, browser playground, and Slack-style handler. That small shape is enough to make AI-assisted review work more auditable without pretending that the agent can replace a human reviewer.

