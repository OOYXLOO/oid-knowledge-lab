function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function findDataset(snapshot, name) {
  return asArray(snapshot.datasets).find((dataset) => dataset.name === name);
}

function fieldTags(dataset, fieldNames) {
  const wanted = new Set(asArray(fieldNames));
  return asArray(dataset.fields)
    .filter((field) => wanted.has(field.name))
    .flatMap((field) => asArray(field.tags).map((tag) => ({ field: field.name, tag })));
}

function scoreChange(snapshot, change) {
  const dataset = findDataset(snapshot, change.dataset);
  if (!dataset) {
    return {
      id: change.id,
      status: "blocked",
      score: 100,
      title: change.summary,
      dataset: change.dataset,
      findings: [`Dataset ${change.dataset} was not found in the metadata snapshot.`],
      blockers: ["Missing dataset context"]
    };
  }

  let score = 0;
  const findings = [];
  const blockers = [];

  if (asArray(dataset.owners).length === 0) {
    score += 25;
    blockers.push("No dataset owner is listed");
  } else {
    findings.push(`Owner: ${dataset.owners.join(", ")}`);
  }

  const tags = fieldTags(dataset, change.fields);
  const sensitiveTags = tags.filter(({ tag }) => ["pii", "sensitive"].includes(tag));
  if (sensitiveTags.length > 0) {
    score += 25;
    blockers.push(`Sensitive fields touched: ${sensitiveTags.map((item) => `${item.field}:${item.tag}`).join(", ")}`);
  }

  if (change.type === "schema_removal") {
    score += 20;
    findings.push("Schema removal requires downstream compatibility review.");
  }

  const highDownstream = asArray(dataset.downstream).filter((asset) => asset.criticality === "high");
  if (highDownstream.length > 0) {
    score += 20;
    findings.push(`High-criticality downstream assets: ${highDownstream.map((asset) => asset.name).join(", ")}`);
  }

  const openIncidents = asArray(dataset.incidents).filter((incident) => incident.status === "open");
  if (openIncidents.length > 0) {
    score += 20;
    blockers.push(`Open incidents: ${openIncidents.map((incident) => incident.id).join(", ")}`);
  }

  if (Number(dataset.freshnessHours) > 24) {
    score += 15;
    blockers.push(`Freshness is stale at ${dataset.freshnessHours} hours`);
  }

  const status = score >= 70 ? "blocked" : score >= 40 ? "review" : "ready";

  return {
    id: change.id,
    status,
    score,
    title: change.summary,
    dataset: dataset.name,
    domain: dataset.domain,
    findings,
    blockers
  };
}

function analyzeSnapshot(snapshot) {
  const changes = asArray(snapshot.proposedChanges).map((change) => scoreChange(snapshot, change));
  const blocked = changes.filter((change) => change.status === "blocked").length;
  const review = changes.filter((change) => change.status === "review").length;
  const ready = changes.filter((change) => change.status === "ready").length;

  return {
    generatedAt: snapshot.generatedAt || new Date().toISOString(),
    workspace: snapshot.workspace || "unknown",
    summary: {
      total: changes.length,
      blocked,
      review,
      ready
    },
    changes
  };
}

function renderMarkdown(report) {
  const lines = [
    `# DataHub Context Compass Brief`,
    "",
    `Workspace: ${report.workspace}`,
    `Generated: ${report.generatedAt}`,
    "",
    `## Summary`,
    "",
    `- Total proposed changes: ${report.summary.total}`,
    `- Blocked: ${report.summary.blocked}`,
    `- Needs review: ${report.summary.review}`,
    `- Ready: ${report.summary.ready}`,
    ""
  ];

  for (const change of report.changes) {
    lines.push(`## ${change.id}: ${change.title}`);
    lines.push("");
    lines.push(`- Dataset: ${change.dataset}`);
    if (change.domain) lines.push(`- Domain: ${change.domain}`);
    lines.push(`- Status: ${change.status}`);
    lines.push(`- Risk score: ${change.score}`);
    if (change.findings.length > 0) {
      lines.push("- Evidence:");
      for (const finding of change.findings) lines.push(`  - ${finding}`);
    }
    if (change.blockers.length > 0) {
      lines.push("- Blockers:");
      for (const blocker of change.blockers) lines.push(`  - ${blocker}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

module.exports = {
  analyzeSnapshot,
  renderMarkdown,
  scoreChange
};
