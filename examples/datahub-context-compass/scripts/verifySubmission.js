const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function includes(relativePath, needles) {
  const content = read(relativePath);
  return needles.map((needle) => ({
    needle,
    ok: content.includes(needle)
  }));
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function main() {
  const checks = [
    {
      name: "apache-license",
      ok: includes("LICENSE", ["Apache License", "Version 2.0"]).every((item) => item.ok)
    },
    {
      name: "readme-positioning",
      ok: includes("README.md", ["DataHub Context Compass", "DataHub MCP Server", "agent-ready risk brief"]).every((item) => item.ok)
    },
    {
      name: "devpost-field-pack",
      ok: includes("docs/devpost-field-pack.md", ["Project Name", "Public Links", "Verification"]).every((item) => item.ok)
    },
    {
      name: "demo-video-script",
      ok: includes("docs/demo-video-script.md", ["Target length: under 3 minutes", "DataHub MCP Plan"]).every((item) => item.ok)
    },
    {
      name: "sample-risk-brief",
      ok: includes("reports/sample-risk-brief.md", ["Blocked: 1", "Needs review: 1", "Sensitive fields touched"]).every((item) => item.ok)
    },
    {
      name: "mcp-read-plan",
      ok: includes("reports/datahub-mcp-read-plan.md", ["search", "get_entities", "list_schema_fields", "get_lineage", "list_pending_proposals"]).every((item) => item.ok)
    },
    {
      name: "static-demo",
      ok: includes("public/index.html", ["DataHub Context Compass", "metadata risk brief", "CHG-1002"]).every((item) => item.ok)
    },
    {
      name: "source-and-tests",
      ok: [
        "src/analyze.js",
        "src/mcpPlan.js",
        "test/analyze.test.js",
        "test/mcpPlan.test.js"
      ].every(fileExists)
    }
  ];

  const report = {
    ok: checks.every((check) => check.ok),
    generatedAt: new Date().toISOString(),
    checks
  };

  const reportPath = path.join(root, "reports", "submission-verification.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  if (!report.ok) {
    process.exit(1);
  }
}

main();
