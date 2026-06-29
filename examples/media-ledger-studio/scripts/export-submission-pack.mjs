import { mkdirSync, writeFileSync } from "node:fs";
import { createSubmissionPack, sampleRuns } from "../src/mediaLedger.js";

const outDir = "docs";
mkdirSync(outDir, { recursive: true });

const pack = createSubmissionPack(sampleRuns);
writeFileSync(`${outDir}/submission-pack.json`, `${JSON.stringify(pack, null, 2)}\n`);
writeFileSync(
  `${outDir}/submission-pack.md`,
  `# Media Ledger Studio Submission Pack

Public demo: ${pack.publicDemoUrl}

## Reviewer Path

${pack.reviewerPath.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## Technology Fit

- Storage: ${pack.requiredTechnology.storage}
- Generation: ${pack.requiredTechnology.generation}

## Sample Object Keys

${pack.sampleObjectKeys.map((key) => `- \`${key}\``).join("\n")}

## Sidecar Metadata Pairs

${pack.sidecarMetadataManifest.map((item) => `- \`${item.objectKey}\` -> \`${item.sidecarKey}\``).join("\n")}

## Summary

- Runs: ${pack.summary.totalRuns}
- Ready records: ${pack.summary.ready}
- Needs action: ${pack.summary.needsAction}
- Average review score: ${pack.summary.averageScore}
- Stored data: ${pack.summary.totalMegabytes} MB
`
);

console.log(`Exported ${outDir}/submission-pack.md and ${outDir}/submission-pack.json`);
