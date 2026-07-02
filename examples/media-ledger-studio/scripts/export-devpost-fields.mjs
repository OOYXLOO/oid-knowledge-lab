import { mkdirSync, writeFileSync } from "node:fs";
import { createDevpostFields, createDevpostSubmissionText } from "../src/mediaLedger.js";

const outDir = "docs";
mkdirSync(outDir, { recursive: true });

const fields = createDevpostFields();
writeFileSync(`${outDir}/devpost-field-pack.json`, `${JSON.stringify(fields, null, 2)}\n`);
writeFileSync(`${outDir}/devpost-submission-copy.txt`, `${createDevpostSubmissionText(fields)}\n`);
writeFileSync(
  `${outDir}/devpost-field-pack.md`,
  `# Media Ledger Studio Devpost Field Pack

## Project Name

${fields.projectName}

## Tagline

${fields.tagline}

## Links

- App: ${fields.appUrl}
- Review risk matrix: ${fields.reviewRiskUrl}
- Judging evidence view: ${fields.judgingEvidenceUrl}
- Source repository: ${fields.sourceRepoUrl}
- Demo video: ${fields.videoUrl}
- 3-minute walkthrough: ${fields.walkthroughUrl}
- 3-minute walkthrough raw backup: ${fields.walkthroughRawUrl}
- Integration readiness: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-integration-readiness.html
- Sidecar integrity report: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/docs/sidecar-integrity-report.json
- Integration adapter verification: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/docs/integration-adapter-verification.json
- Judging evidence: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-judging-evidence.html

## Built With

${fields.builtWith}

## Provider and Model List

${fields.providerAndModels
  .map((entry) => `- ${entry.provider} / ${entry.model} (${entry.assetType})`)
  .join("\n")}

## Inspiration

${fields.inspiration}

## What It Does

${fields.whatItDoes}

## How It Uses Backblaze B2

${fields.howBackblazeB2IsUsed}

## How It Uses Genblaze

${fields.howGenblazeIsUsed}

## Challenge Fit

${fields.challengeFit}

## Challenge Readiness

${fields.challengeReadiness}

## Storage Handoff Summary

${fields.storageHandoffSummary}

## What's Next

${fields.whatIsNext}
`
);

console.log(`Exported ${outDir}/devpost-field-pack.md, ${outDir}/devpost-field-pack.json, and ${outDir}/devpost-submission-copy.txt`);
