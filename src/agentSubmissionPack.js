"use strict";

const fs = require("fs");
const path = require("path");

function buildAgentSubmissionPack({
  generatedAt = new Date().toISOString(),
  publicBaseUrl = "https://ooyxloo.github.io/oid-knowledge-lab"
} = {}) {
  const proofLinks = [
    { label: "Interactive ProofDesk packet demo", url: `${publicBaseUrl}/proofdesk-packet-demo.html` },
    { label: "ProofDesk workflow brief", url: `${publicBaseUrl}/proofdesk-slack-workflow.html` },
    { label: "Generated proof packet", url: "https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/proofdesk-pack.md" },
    { label: "Source repository", url: "https://github.com/OOYXLOO/oid-knowledge-lab" }
  ];

  return {
    schema_version: "agent-submission-pack/v1",
    generated_at: generatedAt,
    project: {
      name: "ProofDesk",
      tagline: "Turn review claims into source-aware proof packets.",
      elevator_pitch: "ProofDesk helps teams turn public or sanitized review claims into source-aware proof packets with evidence links, blocker status, human gates, and a Slack-ready handoff.",
      audience: "developer relations teams, documentation teams, launch teams, open-source maintainers, and hackathon teams"
    },
    shared_fields: {
      what_it_does: "ProofDesk accepts a public artifact URL or sanitized claim list, normalizes each claim, separates ready items from human-gated items, and generates Markdown plus JSON proof packets that can be shared in review threads.",
      inspiration: "Review threads often stall because links, blockers, and final approval notes are scattered. ProofDesk turns that thread into a small packet that a human can inspect quickly.",
      how_it_is_built: "The current demo is a dependency-light JavaScript and static HTML workflow. It includes a Node.js packet generator for repeatable reports and a browser-only interactive page for local claim editing and packet export.",
      privacy_boundary: "ProofDesk is designed for public or sanitized inputs. It should not collect credentials, tokens, cookies, private exports, private customer data, payment data, identity records, or raw third-party page bodies.",
      demo_script: [
        "Open the ProofDesk packet demo.",
        "Review the sample claim JSON.",
        "Add or edit a claim with a public artifact URL.",
        "Generate a proof packet in the browser.",
        "Copy Markdown or download JSON.",
        "Show how ready claims and human-gated claims stay separate."
      ],
      proof_links: proofLinks
    },
    slack_agent_builder: {
      fit: "Slack review threads are a natural surface for ProofDesk because the final handoff is already concise, status-oriented, and human-reviewed.",
      agent_behavior: [
        "Read a public URL or pasted claim from a thread.",
        "Ask for missing source or approval context when evidence is weak.",
        "Generate a proof packet summary.",
        "Post a short status message with blockers and next actions."
      ],
      future_slack_commands: [
        "/proofdesk add <url>",
        "/proofdesk packet",
        "/proofdesk blockers",
        "/proofdesk export"
      ]
    },
    google_rapid_agent: {
      fit: "ProofDesk can be adapted as an agent that turns public artifact claims into auditable packets and routes human approval gates.",
      agent_behavior: [
        "Classify artifact claims.",
        "Check evidence link completeness.",
        "Summarize blockers and human gates.",
        "Produce structured JSON and Markdown for downstream review."
      ]
    },
    boundaries: [
      "Use public or sanitized inputs only.",
      "Keep final approval with a human reviewer.",
      "Do not imply live third-party integrations until they are implemented and verified."
    ]
  };
}

function renderAgentSubmissionMarkdown(pack) {
  const lines = [
    "# ProofDesk Agent Submission Pack",
    "",
    `Generated at: \`${pack.generated_at}\``,
    "",
    "## Project",
    "",
    `Name: \`${pack.project.name}\``,
    "",
    pack.project.elevator_pitch,
    "",
    "## What It Does",
    "",
    pack.shared_fields.what_it_does,
    "",
    "## How It Is Built",
    "",
    pack.shared_fields.how_it_is_built,
    "",
    "## Demo Script",
    "",
    ...pack.shared_fields.demo_script.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Slack Agent Builder Fit",
    "",
    pack.slack_agent_builder.fit,
    "",
    ...pack.slack_agent_builder.agent_behavior.map((item) => `- ${item}`),
    "",
    "## Google Rapid Agent Fit",
    "",
    pack.google_rapid_agent.fit,
    "",
    ...pack.google_rapid_agent.agent_behavior.map((item) => `- ${item}`),
    "",
    "## Proof Links",
    "",
    ...pack.shared_fields.proof_links.map((link) => `- [${link.label}](${link.url})`),
    "",
    "## Boundaries",
    "",
    ...pack.boundaries.map((item) => `- ${item}`)
  ];

  return lines.join("\n");
}

function writeAgentSubmissionPack({ jsonOutFile, markdownOutFile, generatedAt, publicBaseUrl }) {
  const pack = buildAgentSubmissionPack({ generatedAt, publicBaseUrl });
  fs.mkdirSync(path.dirname(jsonOutFile), { recursive: true });
  fs.mkdirSync(path.dirname(markdownOutFile), { recursive: true });
  fs.writeFileSync(jsonOutFile, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownOutFile, `${renderAgentSubmissionMarkdown(pack)}\n`, "utf8");
  return { pack, jsonOutFile, markdownOutFile };
}

module.exports = {
  buildAgentSubmissionPack,
  renderAgentSubmissionMarkdown,
  writeAgentSubmissionPack
};

