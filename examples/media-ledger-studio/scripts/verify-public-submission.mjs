import { mkdirSync, writeFileSync } from "node:fs";
import { createDevpostFields } from "../src/mediaLedger.js";

const fields = createDevpostFields();
const checks = [
  { name: "appShell", url: fields.appUrl, expectedText: "/oid-knowledge-lab/media-ledger-studio/assets/" },
  { name: "reviewRiskShell", url: fields.reviewRiskUrl, expectedText: "/oid-knowledge-lab/media-ledger-studio/assets/" },
  { name: "judgingEvidenceShell", url: fields.judgingEvidenceUrl, expectedText: "/oid-knowledge-lab/media-ledger-studio/assets/" },
  { name: "appBundle", url: await resolveAppBundleUrl(fields.appUrl), expectedText: "Copy Devpost fields" },
  { name: "walkthroughRaw", url: "https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/gh-pages/media-ledger-studio/demo-video.html", expectedText: "Review risk is visible" },
  { name: "sourceRepo", url: fields.sourceRepoUrl, expectedText: "Media Ledger Studio" },
  { name: "devpostCopyText", url: "https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/docs/devpost-submission-copy.txt", expectedText: "Project Name: Media Ledger Studio" },
  { name: "checklist", url: "https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/docs/backblaze-final-submission-checklist.md", expectedText: "Official Requirement Coverage" }
];

const results = [];
for (const { name, url, expectedText } of checks) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    const text = await response.text();
    results.push({
      name,
      url,
      status: response.status,
      ok: response.ok && text.includes(expectedText),
      expectedTextFound: text.includes(expectedText),
      bytes: text.length
    });
  } catch (error) {
    results.push({
      name,
      url,
      status: null,
      ok: false,
      expectedTextFound: false,
      error: error.message
    });
  }
}

const report = {
  ok: results.every((item) => item.ok),
  checkedAt: new Date().toISOString(),
  results
};

mkdirSync("docs", { recursive: true });
writeFileSync("docs/public-submission-verification.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (!report.ok) {
  process.exitCode = 1;
}

async function resolveAppBundleUrl(appUrl) {
  const response = await fetch(appUrl, { redirect: "follow" });
  const html = await response.text();
  const match = html.match(/src="([^"]+\.js)"/);
  if (!match) {
    return appUrl;
  }
  return new URL(match[1], appUrl).toString();
}
