function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildMcpReadPlan(snapshot) {
  const datasetNames = unique((snapshot.proposedChanges || []).map((change) => change.dataset));
  const fieldRequests = (snapshot.proposedChanges || [])
    .filter((change) => Array.isArray(change.fields) && change.fields.length > 0)
    .map((change) => ({
      tool: "list_schema_fields",
      reason: `Inspect fields touched by ${change.id}`,
      input: {
        dataset: change.dataset,
        keywords: change.fields
      }
    }));

  const datasetRequests = datasetNames.flatMap((dataset) => [
    {
      tool: "search",
      reason: "Resolve dataset name to DataHub entity URN",
      input: {
        query: dataset,
        entityTypes: ["DATASET"]
      }
    },
    {
      tool: "get_entities",
      reason: "Read ownership, tags, domain, freshness, and documentation",
      input: {
        names: [dataset]
      }
    },
    {
      tool: "get_lineage",
      reason: "Check downstream impact before approving an automated change",
      input: {
        entity: dataset,
        direction: "DOWNSTREAM",
        hops: 2
      }
    }
  ]);

  return {
    purpose: "Collect read-only DataHub context before scoring proposed data changes.",
    safety: "Read-only plan. Do not call mutation tools until a reviewer approves the brief.",
    tools: [
      ...datasetRequests,
      ...fieldRequests,
      {
        tool: "list_pending_proposals",
        reason: "Avoid conflicting with governance changes already awaiting review",
        input: {}
      }
    ]
  };
}

function renderMcpPlanMarkdown(plan) {
  const lines = [
    "# DataHub MCP Read Plan",
    "",
    plan.purpose,
    "",
    `Safety: ${plan.safety}`,
    "",
    "## Tool Calls"
  ];

  for (const [index, item] of plan.tools.entries()) {
    lines.push("");
    lines.push(`### ${index + 1}. ${item.tool}`);
    lines.push("");
    lines.push(`Reason: ${item.reason}`);
    lines.push("");
    lines.push("```json");
    lines.push(JSON.stringify(item.input, null, 2));
    lines.push("```");
  }

  return `${lines.join("\n").trim()}\n`;
}

module.exports = {
  buildMcpReadPlan,
  renderMcpPlanMarkdown
};
