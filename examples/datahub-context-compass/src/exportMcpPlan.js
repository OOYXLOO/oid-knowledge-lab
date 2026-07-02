const fs = require("fs");
const path = require("path");
const { buildMcpReadPlan, renderMcpPlanMarkdown } = require("./mcpPlan");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function main(argv) {
  const [inputPath, markdownPath, jsonPath] = argv;
  if (!inputPath || !markdownPath || !jsonPath) {
    throw new Error("Usage: node src/exportMcpPlan.js <snapshot.json> <plan.md> <plan.json>");
  }

  const snapshot = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const plan = buildMcpReadPlan(snapshot);
  ensureDir(markdownPath);
  ensureDir(jsonPath);
  fs.writeFileSync(markdownPath, renderMcpPlanMarkdown(plan));
  fs.writeFileSync(jsonPath, `${JSON.stringify(plan, null, 2)}\n`);
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { main };
