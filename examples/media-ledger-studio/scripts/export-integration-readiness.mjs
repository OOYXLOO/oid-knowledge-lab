import { writeFileSync } from "node:fs";
import { createIntegrationReadinessReport, sampleRuns } from "../src/mediaLedger.js";

const report = createIntegrationReadinessReport(sampleRuns, {
  publicBaseUrl: "https://media-ledger-studio-static.vercel.app",
  b2BucketName: "media-ledger-demo",
  b2Prefix: "challenge-dry-run",
  genblazeEndpoint: "https://api.genblaze.example/v1/generate",
  env: {
    B2_APP_ID: process.env.B2_APP_ID,
    B2_APP_VALUE: process.env.B2_APP_VALUE,
    B2_BUCKET_NAME: process.env.B2_BUCKET_NAME,
    GENBLAZE_AUTH_VALUE: process.env.GENBLAZE_AUTH_VALUE,
    GENBLAZE_ENDPOINT: process.env.GENBLAZE_ENDPOINT
  }
});

writeFileSync("docs/integration-readiness-report.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
