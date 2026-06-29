import { existsSync, readFileSync } from "node:fs";
import { createSubmissionPack, sampleRuns, summarizeLedger } from "../src/mediaLedger.js";

const requiredFiles = [
  "index.html",
  "src/main.jsx",
  "src/mediaLedger.js",
  "src/styles.css",
  "docs/backblaze-genblaze-integration.md",
  "docs/backblaze-challenge-fit.md",
  "docs/demo-video-script.md",
  "docs/demo-video-design.md",
  "docs/deployment-notes.md",
  "docs/public-verification.md",
  "docs/submission-pack.md",
  "docs/devpost-field-pack.md",
  "public/demo-video.html"
];
const missing = requiredFiles.filter((file) => !existsSync(file));
const packageText = readFileSync("package.json", "utf8");
const summary = summarizeLedger(sampleRuns);
const pack = createSubmissionPack(sampleRuns);

const internalRouteTerm = ["money", "goal"].join("-");
const internalAmountTerm = ["USD", "200"].join(" ");
const credentialTerm = ["pass", "word"].join("");
const privateConfigTerm = ["sec", "ret"].join("");
const forbidden = [
  new RegExp(internalRouteTerm, "i"),
  new RegExp(internalAmountTerm, "i"),
  new RegExp(credentialTerm, "i"),
  /api[_ -]?key/i,
  new RegExp(privateConfigTerm, "i")
];
const scanned = requiredFiles
  .filter((file) => existsSync(file))
  .map((file) => [file, readFileSync(file, "utf8")]);
const leaks = scanned.flatMap(([file, text]) =>
  forbidden.filter((pattern) => pattern.test(text)).map((pattern) => `${file}: ${pattern}`)
);

const result = {
  ok: missing.length === 0 && leaks.length === 0 && summary.totalRuns === 3 && pack.sampleObjectKeys.length === 3,
  missing,
  leaks,
  packagePrivate: /"private": true/.test(packageText),
  summary
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) {
  process.exitCode = 1;
}
