const assert = require("assert");
const sample = require("../examples/metadata-snapshot.json");
const { buildMcpReadPlan, renderMcpPlanMarkdown } = require("../src/mcpPlan");

const plan = buildMcpReadPlan(sample);

assert.strictEqual(plan.safety.includes("Read-only"), true);
assert.ok(plan.tools.some((item) => item.tool === "search"));
assert.ok(plan.tools.some((item) => item.tool === "get_entities"));
assert.ok(plan.tools.some((item) => item.tool === "list_schema_fields"));
assert.ok(plan.tools.some((item) => item.tool === "get_lineage"));
assert.ok(plan.tools.some((item) => item.tool === "list_pending_proposals"));

const markdown = renderMcpPlanMarkdown(plan);
assert.ok(markdown.includes("DataHub MCP Read Plan"));
assert.ok(markdown.includes("analytics.customer_orders"));
assert.ok(markdown.includes("raw.support_tickets"));

console.log("datahub mcp plan tests passed");
