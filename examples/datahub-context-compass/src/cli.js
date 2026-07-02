const fs = require("fs");
const path = require("path");
const { analyzeSnapshot, renderMarkdown } = require("./analyze");

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function main(argv) {
  const [inputPath, markdownPath, jsonPath] = argv;
  if (!inputPath) {
    throw new Error("Usage: node src/cli.js <snapshot.json> [brief.md] [brief.json]");
  }

  const snapshot = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const report = analyzeSnapshot(snapshot);
  const markdown = renderMarkdown(report);

  if (markdownPath) {
    ensureDir(markdownPath);
    fs.writeFileSync(markdownPath, markdown);
  }

  if (jsonPath) {
    ensureDir(jsonPath);
    fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  process.stdout.write(markdown);
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
