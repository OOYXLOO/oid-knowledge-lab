"use strict";

const DEFAULT_TITLE = "Slack Review Thread";

const TAGS = {
  question: ["question", "reader question", "user question", "ask"],
  sourceFact: ["source", "fact", "verified", "docs say", "policy"],
  draftClaim: ["draft", "claim", "ai draft", "proposal"],
  reviewerCheck: ["check", "review", "test", "verify"],
  blocker: ["blocker", "risk", "do not publish", "unsafe", "wrong"],
  decision: ["decision", "ship", "revise", "approved", "reject"],
  boundary: ["private", "secret", "token", "credential", "payment", "screenshot"]
};

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function inferKind(message) {
  const explicit = normalizeText(message.kind || message.type || message.category).toLowerCase();
  if (explicit) {
    const explicitMap = {
      question: "question",
      sourcefact: "sourceFact",
      source_fact: "sourceFact",
      draftclaim: "draftClaim",
      draft_claim: "draftClaim",
      reviewercheck: "reviewerCheck",
      reviewer_check: "reviewerCheck",
      blocker: "blocker",
      decision: "decision",
      boundary: "boundary"
    };
    if (explicitMap[explicit]) {
      return explicitMap[explicit];
    }
  }

  const text = normalizeText(message.text).toLowerCase();
  if (text.endsWith("?")) return "question";
  for (const [kind, markers] of Object.entries(TAGS)) {
    if (markers.some((marker) => text.includes(marker))) return kind;
  }
  return "note";
}

function toMessageRecords(thread) {
  const messages = Array.isArray(thread) ? thread : asArray(thread.messages);
  return messages.map((message, index) => ({
    index: index + 1,
    author: normalizeText(message.author || message.user || "unknown"),
    text: normalizeText(message.text),
    ts: normalizeText(message.ts || message.time || ""),
    kind: inferKind(message)
  })).filter((message) => message.text);
}

function groupMessages(records) {
  return records.reduce((groups, message) => {
    const kind = message.kind || "note";
    if (!groups[kind]) groups[kind] = [];
    groups[kind].push(message);
    return groups;
  }, {});
}

function bullet(message) {
  const source = message.author && message.author !== "unknown" ? ` (${message.author})` : "";
  return `- ${message.text}${source}`;
}

function section(title, records, fallback) {
  const lines = records && records.length ? records.map(bullet) : [`- ${fallback}`];
  return [`## ${title}`, "", ...lines, ""].join("\n");
}

function deriveDecision(groups) {
  if (groups.blocker && groups.blocker.length) {
    return "Revise before publication; blockers are still present.";
  }
  if (groups.reviewerCheck && groups.reviewerCheck.length && groups.sourceFact && groups.sourceFact.length) {
    return "Ready for owner review with source facts and reviewer checks attached.";
  }
  return "Needs more source facts before publication review.";
}

function buildEvidenceLog(input) {
  const thread = Array.isArray(input) ? { title: DEFAULT_TITLE, messages: input } : input || {};
  const title = normalizeText(thread.title || DEFAULT_TITLE);
  const records = toMessageRecords(thread);
  const groups = groupMessages(records);
  const generatedAt = normalizeText(thread.generated_at) || new Date().toISOString();

  return {
    title,
    generated_at: generatedAt,
    summary: {
      total_messages: records.length,
      questions: (groups.question || []).length,
      source_facts: (groups.sourceFact || []).length,
      draft_claims: (groups.draftClaim || []).length,
      reviewer_checks: (groups.reviewerCheck || []).length,
      blockers: (groups.blocker || []).length,
      boundaries: (groups.boundary || []).length
    },
    decision: deriveDecision(groups),
    groups,
    records
  };
}

function renderMarkdown(log) {
  return [
    `# Evidence Log: ${log.title}`,
    "",
    `Generated at: ${log.generated_at}`,
    "",
    "## Summary",
    "",
    `- Messages reviewed: ${log.summary.total_messages}`,
    `- Source facts: ${log.summary.source_facts}`,
    `- Reviewer checks: ${log.summary.reviewer_checks}`,
    `- Publication blockers: ${log.summary.blockers}`,
    "",
    section("Reader Questions", log.groups.question, "No reader question recorded."),
    section("Source Facts", log.groups.sourceFact, "No source facts recorded."),
    section("Draft Claims", log.groups.draftClaim, "No draft claims recorded."),
    section("Reviewer Checks", log.groups.reviewerCheck, "No reviewer checks recorded."),
    section("Publication Blockers", log.groups.blocker, "No blockers recorded."),
    section("Privacy Boundaries", log.groups.boundary, "No privacy boundary recorded."),
    "## Decision",
    "",
    `- ${log.decision}`,
    "",
    "## Safety Boundary",
    "",
    "- Do not include passwords, API tokens, cookies, account exports, private support tickets, payment data, or copied third-party article bodies.",
    ""
  ].join("\n");
}

module.exports = {
  buildEvidenceLog,
  deriveDecision,
  inferKind,
  renderMarkdown,
  toMessageRecords
};
