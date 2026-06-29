"use strict";

const fs = require("fs");
const path = require("path");

function normalizeAsset(asset) {
  return {
    name: asset.name || "Untitled asset",
    type: asset.type || "Unknown",
    status: asset.status || "Draft",
    model_note: asset.modelNote || asset.model_note || "",
    evidence_note: asset.evidenceNote || asset.evidence_note || "",
    storage_ref: asset.storageRef || asset.storage_ref || "",
    hash: asset.hash || ""
  };
}

function buildMediaProvenancePack({ generatedAt = new Date().toISOString(), assets = [] } = {}) {
  const normalizedAssets = assets.map(normalizeAsset);
  const approved = normalizedAssets.filter((asset) => asset.status === "Approved");
  const reviewQueue = normalizedAssets.filter((asset) => asset.status !== "Approved");
  const mediaTypes = [...new Set(normalizedAssets.map((asset) => asset.type))].sort();

  return {
    schema_version: "media-provenance-pack/v1",
    generated_at: generatedAt,
    summary: {
      total_assets: normalizedAssets.length,
      approved_assets: approved.length,
      review_required_assets: reviewQueue.length,
      media_types: mediaTypes
    },
    delivery_sheet: normalizedAssets,
    review_queue: reviewQueue,
    boundaries: [
      "No private customer files are included.",
      "No account credentials, API keys, payment data, or personal identifiers are included.",
      "Storage references are examples or non-sensitive delivery references."
    ]
  };
}

function renderMediaProvenanceMarkdown(pack) {
  const lines = [
    "# Media Provenance Delivery Sheet",
    "",
    `Generated at: \`${pack.generated_at}\``,
    `Total assets: \`${pack.summary.total_assets}\``,
    `Approved assets: \`${pack.summary.approved_assets}\``,
    `Review required: \`${pack.summary.review_required_assets}\``,
    `Media types: \`${pack.summary.media_types.join(", ") || "none"}\``,
    "",
    "## Delivery Sheet",
    "",
    "| Asset | Type | Status | Model note | Evidence note | Storage | Hash |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...pack.delivery_sheet.map((asset) => `| ${asset.name} | ${asset.type} | ${asset.status} | ${asset.model_note} | ${asset.evidence_note} | ${asset.storage_ref} | ${asset.hash} |`),
    "",
    "## Review queue",
    ""
  ];

  if (pack.review_queue.length === 0) {
    lines.push("All assets are approved for delivery.");
  } else {
    for (const asset of pack.review_queue) {
      lines.push(`- ${asset.name}: ${asset.status} - ${asset.evidence_note}`);
    }
  }

  lines.push("", "## Boundaries", "");
  for (const boundary of pack.boundaries) {
    lines.push(`- ${boundary}`);
  }

  return lines.join("\n");
}

function writeMediaProvenancePack({ jsonOutFile, markdownOutFile, generatedAt, assets = [] }) {
  const pack = buildMediaProvenancePack({ generatedAt, assets });
  fs.mkdirSync(path.dirname(jsonOutFile), { recursive: true });
  fs.mkdirSync(path.dirname(markdownOutFile), { recursive: true });
  fs.writeFileSync(jsonOutFile, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownOutFile, `${renderMediaProvenanceMarkdown(pack)}\n`, "utf8");
  return { pack, jsonOutFile, markdownOutFile };
}

function writeBackblazeReadinessPack({ jsonOutFile, markdownOutFile, generatedAt, mediaPack, publicBaseUrl }) {
  const readiness = buildBackblazeReadinessPack({ generatedAt, mediaPack, publicBaseUrl });
  fs.mkdirSync(path.dirname(jsonOutFile), { recursive: true });
  fs.mkdirSync(path.dirname(markdownOutFile), { recursive: true });
  fs.writeFileSync(jsonOutFile, `${JSON.stringify(readiness, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownOutFile, `${renderBackblazeReadinessMarkdown(readiness)}\n`, "utf8");
  return { readiness, jsonOutFile, markdownOutFile };
}

function buildBackblazeReadinessPack({
  generatedAt = new Date().toISOString(),
  mediaPack,
  publicBaseUrl = "https://ooyxloo.github.io/oid-knowledge-lab"
} = {}) {
  const summary = mediaPack?.summary || {
    total_assets: 0,
    approved_assets: 0,
    review_required_assets: 0,
    media_types: []
  };

  return {
    schema_version: "backblaze-readiness-pack/v1",
    generated_at: generatedAt,
    project: {
      title: "Media Provenance Studio",
      tagline: "A generated-media delivery ledger for prompts, storage references, review status, and final hashes.",
      audience: "creative teams, documentation teams, developer relations teams, and agencies"
    },
    asset_scope: {
      total_assets: summary.total_assets,
      approved_assets: summary.approved_assets,
      review_required_assets: summary.review_required_assets,
      media_types: summary.media_types
    },
    cloud_integration: {
      status: "prototype_without_live_b2_credentials",
      ready_adapter_boundary: "Asset records already include B2-style storage references and final hashes.",
      remaining_work: [
        "Connect a real Backblaze B2 bucket after account credentials are available.",
        "Store generated media files and metadata sidecars in the bucket.",
        "Record Genblaze generation details for each produced asset."
      ]
    },
    devpost_fields: {
      project_name: "Media Provenance Studio",
      elevator_pitch: "Media Provenance Studio helps teams turn AI-generated images, diagrams, audio, and video into a reviewable delivery ledger with prompt notes, model notes, B2-ready storage references, review status, and final hashes.",
      built_with: ["JavaScript", "HTML", "CSS", "Backblaze B2", "Genblaze"],
      what_it_does: "Registers generated-media assets, tracks approval state, exports delivery sheets, and keeps a boundary between draft generations and client-ready files.",
      how_it_uses_backblaze: "The current prototype uses B2-style storage references and is prepared for a real Backblaze B2 bucket integration once account credentials are available. Genblaze details are represented as model notes and generation evidence fields."
    },
    proof_links: [
      { label: "Interactive demo", url: `${publicBaseUrl}/media-provenance-studio.html` },
      { label: "Tutorial proposal", url: `${publicBaseUrl}/media-provenance-tutorial-proposal.html` },
      { label: "Generated delivery report", url: "https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/media-provenance-pack.md" }
    ],
    required_gates: [
      "Connect a real Backblaze B2 account before claiming live B2 storage.",
      "Record Genblaze-generated asset details before final Devpost submission.",
      "Avoid uploading private customer files or credentials."
    ]
  };
}

function renderBackblazeReadinessMarkdown(readiness) {
  return [
    "# Backblaze Generative Media Readiness Pack",
    "",
    `Generated at: \`${readiness.generated_at}\``,
    `Project: \`${readiness.project.title}\``,
    `Cloud status: \`${readiness.cloud_integration.status}\``,
    "",
    "## Pitch",
    "",
    readiness.devpost_fields.elevator_pitch,
    "",
    "## Asset Scope",
    "",
    `- Total assets: \`${readiness.asset_scope.total_assets}\``,
    `- Approved assets: \`${readiness.asset_scope.approved_assets}\``,
    `- Review required: \`${readiness.asset_scope.review_required_assets}\``,
    `- Media types: \`${readiness.asset_scope.media_types.join(", ") || "none"}\``,
    "",
    "## Built With",
    "",
    ...readiness.devpost_fields.built_with.map((item) => `- ${item}`),
    "",
    "## Backblaze / Genblaze Boundary",
    "",
    readiness.devpost_fields.how_it_uses_backblaze,
    "",
    "## Proof Links",
    "",
    ...readiness.proof_links.map((link) => `- [${link.label}](${link.url})`),
    "",
    "## Required Gates Before Final Submission",
    "",
    ...readiness.required_gates.map((gate) => `- ${gate}`)
  ].join("\n");
}

module.exports = {
  buildBackblazeReadinessPack,
  buildMediaProvenancePack,
  renderBackblazeReadinessMarkdown,
  renderMediaProvenanceMarkdown,
  writeBackblazeReadinessPack,
  writeMediaProvenancePack
};
