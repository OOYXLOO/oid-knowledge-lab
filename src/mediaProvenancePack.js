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

module.exports = {
  buildMediaProvenancePack,
  renderMediaProvenanceMarkdown,
  writeMediaProvenancePack
};
