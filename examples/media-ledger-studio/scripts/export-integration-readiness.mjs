import { writeFileSync } from "node:fs";
import { createIntegrationReadinessReport, sampleRuns } from "../src/mediaLedger.js";

const report = createIntegrationReadinessReport(sampleRuns, {
  publicBaseUrl: "https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/",
  b2BucketName: "media-ledger-demo",
  b2Prefix: "challenge-dry-run",
  env: {
    B2_KEY_ID: process.env.B2_KEY_ID,
    B2_APP_KEY: process.env.B2_APP_KEY,
    B2_BUCKET: process.env.B2_BUCKET,
    GMI_API_KEY: process.env.GMI_API_KEY
  }
});

writeFileSync("docs/integration-readiness-report.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
