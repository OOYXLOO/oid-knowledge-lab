"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const checkedDirs = ["api", "docs", "examples", "public", "scripts", "src", "test"];
const checkedRootFiles = ["README.md", "package.json"];
const ignoredDirs = new Set([".git", ".vercel", "node_modules"]);
const checkedExtensions = new Set([".js", ".json", ".md", ".html", ".css", ".txt"]);
const internalProjectLabel = "money" + "-goal";

const forbidden = [
  { name: "internal project label", pattern: new RegExp(internalProjectLabel, "i") },
  { name: "internal USD target", pattern: /USD\s*200/i },
  { name: "internal Chinese target", pattern: new RegExp("赚钱" + "目标") },
  { name: "local project path", pattern: new RegExp("D:\\\\hks\\\\hks-yxl\\\\" + internalProjectLabel, "i") },
  { name: "local codex temp path", pattern: /C:\\Users\\YXL\\.codex/i },
  { name: "probable password assignment", pattern: /\bpassword\b\s*[:=]\s*["'][^"']{4,}/i },
  { name: "probable cookie assignment", pattern: /\bcookie\b\s*[:=]\s*["'][^"']{8,}/i },
  { name: "probable secret key assignment", pattern: /\b(secret|private)[_-]?key\b\s*[:=]\s*["'][^"']{8,}/i },
  { name: "probable token assignment", pattern: /\b(token|api[_-]?key)\b\s*[:=]\s*["'][A-Za-z0-9_\-]{12,}/i },
];

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
      continue;
    }
    if (entry.isFile() && checkedExtensions.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

function collectFiles() {
  const files = [];
  for (const dir of checkedDirs) {
    const fullPath = path.join(root, dir);
    if (fs.existsSync(fullPath)) files.push(...walk(fullPath));
  }
  for (const file of checkedRootFiles) {
    const fullPath = path.join(root, file);
    if (fs.existsSync(fullPath)) files.push(fullPath);
  }
  return files.sort();
}

const files = collectFiles();
const blockers = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const { name, pattern } of forbidden) {
    if (pattern.test(text)) {
      blockers.push({
        file: path.relative(root, file).replace(/\\/g, "/"),
        check: name,
      });
    }
  }
}

const result = {
  ok: blockers.length === 0,
  checked_files: files.length,
  blockers,
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
