import { mkdirSync, writeFileSync } from "node:fs";
import { createJudgingEvidencePack, sampleRuns } from "../src/mediaLedger.js";

const outDir = "docs";
mkdirSync(outDir, { recursive: true });

const evidence = createJudgingEvidencePack(sampleRuns);

writeFileSync(`${outDir}/judging-evidence-pack.json`, `${JSON.stringify(evidence, null, 2)}\n`);
writeFileSync(
  `${outDir}/judging-evidence-pack.md`,
  `# Media Ledger Studio Judging Evidence Pack

## Thesis

${evidence.thesis}

## Differentiation

${evidence.differentiation.map((item) => `- ${item}`).join("\n")}

## Metrics

- Runs: ${evidence.metrics.runs}
- Asset types: ${evidence.metrics.assetTypes.join(", ")}
- Total media size: ${evidence.metrics.totalMegabytes} MB
- Readiness score: ${evidence.metrics.readinessScore}/100
- Media upload plans: ${evidence.metrics.mediaUploadPlans}
- Sidecar upload plans: ${evidence.metrics.sidecarUploadPlans}
- Genblaze request plans: ${evidence.metrics.genblazeRequestPlans}

## Judging Checklist

${evidence.judgingChecklist
  .map((item) => `- ${item.label} [${item.status}]: ${item.evidence}`)
  .join("\n")}

## Review Risk Matrix

- Client-ready assets: ${evidence.reviewRiskMatrix.summary.clientReady}
- Assets needing review: ${evidence.reviewRiskMatrix.summary.needsReview}
- High-risk assets: ${evidence.reviewRiskMatrix.summary.highRisk}

${evidence.reviewRiskMatrix.rows
  .map((row) => `- ${row.title} [${row.severity}]: ${row.nextAction}`)
  .join("\n")}

## Honest Boundary

${evidence.honestBoundary}

## Next Upgrade

${evidence.nextUpgrade}
`
);

console.log(`Exported ${outDir}/judging-evidence-pack.md and ${outDir}/judging-evidence-pack.json`);
