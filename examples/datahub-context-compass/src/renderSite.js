const fs = require("fs");
const path = require("path");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(report) {
  const cards = report.changes.map((change) => {
    const blockers = change.blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const findings = change.findings.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    return `
      <article class="change ${escapeHtml(change.status)}">
        <header>
          <span>${escapeHtml(change.status)}</span>
          <strong>${escapeHtml(change.id)}</strong>
        </header>
        <h2>${escapeHtml(change.title)}</h2>
        <p>${escapeHtml(change.dataset)}</p>
        <div class="score">${escapeHtml(change.score)}</div>
        <section><h3>Evidence</h3><ul>${findings || "<li>No supporting facts recorded.</li>"}</ul></section>
        <section><h3>Blockers</h3><ul>${blockers || "<li>No blockers found.</li>"}</ul></section>
      </article>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DataHub Context Compass</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f6f7f9; color: #18202a; }
    body { margin: 0; }
    main { max-width: 1120px; margin: 0 auto; padding: 32px 20px 48px; }
    .hero { display: grid; gap: 18px; padding: 28px 0 22px; border-bottom: 1px solid #d9dee7; }
    h1 { margin: 0; font-size: clamp(2rem, 5vw, 4.2rem); line-height: 0.96; letter-spacing: 0; max-width: 820px; }
    .lede { max-width: 780px; font-size: 1.05rem; line-height: 1.65; color: #465366; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 22px 0; }
    .metric { background: white; border: 1px solid #dfe4ec; border-radius: 8px; padding: 16px; }
    .metric b { display: block; font-size: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
    .change { background: white; border: 1px solid #dfe4ec; border-radius: 8px; padding: 18px; min-height: 340px; display: grid; gap: 12px; align-content: start; }
    .change header { display: flex; justify-content: space-between; gap: 12px; align-items: center; text-transform: uppercase; font-size: 0.76rem; color: #58667a; }
    .change header span { padding: 5px 8px; border-radius: 999px; background: #eef2f7; }
    .change.blocked { border-top: 5px solid #c73535; }
    .change.review { border-top: 5px solid #d89517; }
    .change.ready { border-top: 5px solid #207a4c; }
    .change h2 { margin: 0; font-size: 1.2rem; line-height: 1.3; }
    .change p { margin: 0; color: #58667a; overflow-wrap: anywhere; }
    .score { width: 64px; height: 64px; display: grid; place-items: center; border: 1px solid #dfe4ec; border-radius: 50%; font-size: 1.5rem; font-weight: 750; }
    h3 { margin: 0 0 6px; font-size: 0.9rem; }
    ul { margin: 0; padding-left: 18px; color: #344154; line-height: 1.45; }
    footer { margin-top: 28px; color: #58667a; font-size: 0.92rem; }
    @media (max-width: 720px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>DataHub Context Compass</h1>
      <p class="lede">An agent-ready metadata risk brief for proposed data changes. The demo reads sanitized DataHub-style context and explains ownership, lineage, sensitive fields, incidents, and release blockers before an automated action proceeds.</p>
    </section>
    <section class="metrics" aria-label="Summary metrics">
      <div class="metric"><b>${report.summary.total}</b><span>changes</span></div>
      <div class="metric"><b>${report.summary.blocked}</b><span>blocked</span></div>
      <div class="metric"><b>${report.summary.review}</b><span>review</span></div>
      <div class="metric"><b>${report.summary.ready}</b><span>ready</span></div>
    </section>
    <section class="grid">${cards}</section>
    <footer>Generated for ${escapeHtml(report.workspace)} at ${escapeHtml(report.generatedAt)}. Sample data only.</footer>
  </main>
</body>
</html>
`;
}

function main(argv) {
  const [inputPath, outputPath] = argv;
  if (!inputPath || !outputPath) {
    throw new Error("Usage: node src/renderSite.js <report.json> <output.html>");
  }
  const report = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, render(report));
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { render };
