#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { buildEvidenceLog, renderMarkdown } = require("./reviewLog");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function renderMetric(label, value, note) {
  return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
}

function renderRecords(title, records, fallback) {
  const rows = records && records.length
    ? records.map((record) => `<li><strong>${escapeHtml(record.author)}</strong><span>${escapeHtml(record.text)}</span></li>`).join("\n")
    : `<li><span>${escapeHtml(fallback)}</span></li>`;
  return `<section class="panel">
      <h2>${escapeHtml(title)}</h2>
      <ul class="record-list">${rows}</ul>
    </section>`;
}

function renderDemoPage(log) {
  const markdown = renderMarkdown(log);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Review Log Agent for Slack</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #172033;
      --muted: #5d667a;
      --line: #d9deea;
      --paper: #f6f8fb;
      --panel: #ffffff;
      --accent: #126e68;
      --warn: #9a3412;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: var(--paper);
      line-height: 1.55;
    }
    main {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 34px 0 48px;
    }
    header, .panel, .metric-grid article {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    header {
      padding: 26px;
      margin-bottom: 16px;
    }
    h1, h2, p { margin-top: 0; }
    h1 {
      max-width: 780px;
      font-size: 2.35rem;
      line-height: 1.08;
      letter-spacing: 0;
    }
    h2 {
      font-size: 1.12rem;
      letter-spacing: 0;
    }
    .summary {
      max-width: 800px;
      color: var(--muted);
      font-size: 1.03rem;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }
    a {
      color: var(--accent);
      font-weight: 700;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin: 16px 0;
    }
    .metric-grid article {
      padding: 16px;
      min-height: 104px;
    }
    .metric-grid span, .metric-grid small {
      display: block;
      color: var(--muted);
      font-size: 0.84rem;
    }
    .metric-grid strong {
      display: block;
      margin-top: 10px;
      font-size: 1.7rem;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(320px, 430px);
      gap: 16px;
      align-items: start;
    }
    .panel {
      padding: 20px;
      margin-bottom: 16px;
    }
    .record-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
    }
    .record-list li {
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcff;
    }
    .record-list strong {
      display: block;
      color: var(--accent);
      font-size: 0.82rem;
      margin-bottom: 4px;
    }
    .record-list span {
      color: var(--ink);
    }
    .decision {
      border-color: ${log.summary.blockers ? "#f1c9b8" : "#b6ded7"};
      background: ${log.summary.blockers ? "#fff8f4" : "#f2fbf8"};
    }
    .decision strong {
      color: ${log.summary.blockers ? "var(--warn)" : "var(--accent)"};
    }
    pre {
      max-height: 720px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      padding: 14px;
      border-radius: 8px;
      background: #111827;
      color: #f8fafc;
      font: 0.86rem/1.5 "SFMono-Regular", Consolas, monospace;
    }
    @media (max-width: 840px) {
      main { width: min(100% - 20px, 1120px); padding-top: 20px; }
      h1 { font-size: 1.8rem; }
      .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .metric-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Review Log Agent for Slack</h1>
      <p class="summary">A small prototype that turns Slack-style support or documentation review threads into source-aware evidence logs. It keeps source facts, draft claims, reviewer checks, publication blockers, and private-data boundaries visible before a team publishes an answer.</p>
      <div class="links">
        <a href="playground.html">Interactive playground</a>
        <a href="submission.html">Submission pack</a>
        <a href="https://oid-knowledge-lab.vercel.app/evidence-log-playground.html">Evidence Log Playground</a>
      </div>
    </header>

    <section class="metric-grid" aria-label="Review log metrics">
      ${renderMetric("Messages", log.summary.total_messages, "thread items")}
      ${renderMetric("Source facts", log.summary.source_facts, "verified inputs")}
      ${renderMetric("Checks", log.summary.reviewer_checks, "review steps")}
      ${renderMetric("Blockers", log.summary.blockers, "before publish")}
    </section>

    <div class="layout">
      <div>
        <section class="panel decision">
          <h2>Decision</h2>
          <p><strong>${escapeHtml(log.decision)}</strong></p>
        </section>
        ${renderRecords("Reader Questions", log.groups.question, "No reader question recorded.")}
        ${renderRecords("Source Facts", log.groups.sourceFact, "No source facts recorded.")}
        ${renderRecords("Draft Claims", log.groups.draftClaim, "No draft claims recorded.")}
        ${renderRecords("Reviewer Checks", log.groups.reviewerCheck, "No reviewer checks recorded.")}
        ${renderRecords("Publication Blockers", log.groups.blocker, "No blockers recorded.")}
        ${renderRecords("Privacy Boundaries", log.groups.boundary, "No privacy boundary recorded.")}
      </div>
      <section class="panel">
        <h2>Generated Markdown Handoff</h2>
        <pre>${escapeHtml(markdown)}</pre>
      </section>
    </div>
  </main>
</body>
</html>`;
}

function main(argv) {
  const inputPath = argv[2] || "examples/slack-thread.json";
  const outputPath = argv[3] || "public/index.html";
  const parsed = JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8"));
  const log = buildEvidenceLog(parsed);
  const html = renderDemoPage(log);
  const target = path.resolve(outputPath);
  ensureDir(target);
  fs.writeFileSync(target, html, "utf8");
  process.stdout.write(`demo page written: ${target}\n`);
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv);
  } catch (error) {
    process.stderr.write(`render demo failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  renderDemoPage
};
