"use strict";

const fs = require("fs");
const path = require("path");

function normalizeClaim(claim, index) {
  return {
    id: claim.id || `claim-${index + 1}`,
    title: claim.title || "Untitled review claim",
    source_url: claim.sourceUrl || claim.source_url || "",
    artifact_type: claim.artifactType || claim.artifact_type || "artifact",
    expected_outcome: claim.expectedOutcome || claim.expected_outcome || "review-ready handoff",
    owner_note: claim.ownerNote || claim.owner_note || "",
    evidence_links: (claim.evidenceLinks || claim.evidence_links || []).map((link) => ({
      label: link.label || "Evidence",
      url: link.url || "",
      status: link.status || "needs_review"
    })),
    blockers: claim.blockers || [],
    human_gates: claim.humanGates || claim.human_gates || []
  };
}

function statusForClaim(claim) {
  if (claim.blockers.length > 0 || claim.human_gates.length > 0) return "needs_human_review";
  if (claim.evidence_links.length === 0) return "needs_evidence";
  if (claim.evidence_links.every((link) => link.status === "ready")) return "ready";
  return "needs_review";
}

function nextActionForClaim(claim) {
  if (claim.blockers.length > 0) return `Resolve blocker: ${claim.blockers[0]}`;
  if (claim.human_gates.length > 0) return `Ask a human to complete: ${claim.human_gates[0]}`;
  if (claim.evidence_links.length === 0) return "Add at least one public evidence link.";
  return "Review the packet summary and approve the handoff.";
}

function buildProofDeskPack({ generatedAt = new Date().toISOString(), claims = [] } = {}) {
  const normalizedClaims = claims.map(normalizeClaim).map((claim) => ({
    ...claim,
    status: statusForClaim(claim),
    next_action: nextActionForClaim(claim)
  }));
  const ready = normalizedClaims.filter((claim) => claim.status === "ready").length;
  const needsHumanReview = normalizedClaims.filter((claim) => claim.status === "needs_human_review").length;
  const needsEvidence = normalizedClaims.filter((claim) => claim.status === "needs_evidence").length;

  return {
    schema_version: "proofdesk-pack/v1",
    generated_at: generatedAt,
    product: {
      name: "ProofDesk",
      summary: "A review-thread workflow that turns public or sanitized claims into source-aware proof packets."
    },
    summary: {
      total_claims: normalizedClaims.length,
      ready_claims: ready,
      needs_human_review: needsHumanReview,
      needs_evidence: needsEvidence,
      evidence_links: normalizedClaims.reduce((sum, claim) => sum + claim.evidence_links.length, 0)
    },
    claims: normalizedClaims,
    slack_handoff: normalizedClaims.map((claim) => ({
      claim_id: claim.id,
      title: claim.title,
      status: claim.status,
      message: `[${claim.status}] ${claim.title} - ${claim.next_action}`
    })),
    boundaries: [
      "Use public or sanitized inputs only.",
      "Do not request credentials, tokens, cookies, private exports, private customer data, payment data, identity records, or raw third-party page bodies.",
      "Keep final approval with a human reviewer."
    ]
  };
}

function markdownRow(values) {
  return `| ${values.map((value) => String(value ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

function renderProofDeskMarkdown(pack) {
  const lines = [
    "# ProofDesk Proof Packet",
    "",
    `Generated at: \`${pack.generated_at}\``,
    `Claims reviewed: \`${pack.summary.total_claims}\``,
    `Ready claims: \`${pack.summary.ready_claims}\``,
    `Needs human review: \`${pack.summary.needs_human_review}\``,
    `Needs evidence: \`${pack.summary.needs_evidence}\``,
    "",
    "## Review Queue",
    "",
    "| Claim | Type | Status | Next action | Evidence links |",
    "| --- | --- | --- | --- | --- |",
    ...pack.claims.map((claim) => markdownRow([
      claim.title,
      claim.artifact_type,
      claim.status,
      claim.next_action,
      claim.evidence_links.length
    ])),
    "",
    "## Slack Handoff",
    "",
    ...pack.slack_handoff.map((item) => `- ${item.message}`),
    "",
    "## Evidence Links",
    ""
  ];

  for (const claim of pack.claims) {
    lines.push(`### ${claim.title}`, "");
    if (claim.evidence_links.length === 0) {
      lines.push("- No evidence links yet.");
    } else {
      for (const link of claim.evidence_links) {
        lines.push(`- [${link.label}](${link.url}) - ${link.status}`);
      }
    }
    lines.push("");
  }

  lines.push("## Boundaries", "");
  for (const boundary of pack.boundaries) {
    lines.push(`- ${boundary}`);
  }

  return lines.join("\n");
}

function writeProofDeskPack({ claimsFile, jsonOutFile, markdownOutFile, generatedAt }) {
  const claims = JSON.parse(fs.readFileSync(claimsFile, "utf8"));
  const pack = buildProofDeskPack({ generatedAt, claims });
  fs.mkdirSync(path.dirname(jsonOutFile), { recursive: true });
  fs.mkdirSync(path.dirname(markdownOutFile), { recursive: true });
  fs.writeFileSync(jsonOutFile, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownOutFile, `${renderProofDeskMarkdown(pack)}\n`, "utf8");
  return { pack, jsonOutFile, markdownOutFile };
}

module.exports = {
  buildProofDeskPack,
  renderProofDeskMarkdown,
  writeProofDeskPack
};

