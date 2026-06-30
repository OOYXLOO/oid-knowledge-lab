import { mkdirSync, writeFileSync } from "node:fs";
import {
  createIntegrationReadinessReport,
  createLiveIntegrationBundle,
  sampleRuns
} from "../src/mediaLedger.js";

const env = {
  B2_APP_ID: process.env.B2_APP_ID,
  B2_APP_VALUE: process.env.B2_APP_VALUE,
  B2_BUCKET_NAME: process.env.B2_BUCKET_NAME,
  GENBLAZE_AUTH_VALUE: process.env.GENBLAZE_AUTH_VALUE,
  GENBLAZE_ENDPOINT: process.env.GENBLAZE_ENDPOINT
};

const options = {
  publicBaseUrl: process.env.PUBLIC_APP_URL || "https://media-ledger-studio-static.vercel.app",
  b2BucketName: process.env.B2_BUCKET_NAME || "media-ledger-demo",
  b2Prefix: process.env.B2_PREFIX || "challenge-dry-run",
  genblazeEndpoint: process.env.GENBLAZE_ENDPOINT || "https://api.genblaze.example/v1/generate",
  env
};

const bundle = createLiveIntegrationBundle(sampleRuns, options);
const report = createIntegrationReadinessReport(sampleRuns, options);

const mediaUploads = bundle.b2UploadPlan.filter((item) => item.kind === "media");
const sidecarUploads = bundle.b2UploadPlan.filter((item) => item.kind === "sidecar");
const uploadPairsMatch = bundle.publicReviewLinks.every((link, index) => {
  const media = mediaUploads[index];
  const sidecar = sidecarUploads[index];
  return Boolean(media && sidecar)
    && link.requiredUploadPair[0] === media.objectKey
    && link.requiredUploadPair[1] === sidecar.objectKey;
});
const objectKeysUnique = new Set(bundle.b2UploadPlan.map((item) => item.objectKey)).size
  === bundle.b2UploadPlan.length;
const genblazeRequestsComplete = bundle.genblazeRequestPlan.every((request) =>
  request.endpoint
  && request.model
  && request.prompt
  && request.negativePrompt
  && Number.isInteger(request.seed)
  && request.outputType
);

const result = {
  ok: uploadPairsMatch && objectKeysUnique && genblazeRequestsComplete,
  mode: bundle.mode,
  readyForLiveRun: report.readyForLiveRun,
  missingEnv: report.missingEnv,
  checks: {
    uploadPairsMatch,
    objectKeysUnique,
    genblazeRequestsComplete,
    mediaUploads: mediaUploads.length,
    sidecarUploads: sidecarUploads.length,
    genblazeRequests: bundle.genblazeRequestPlan.length
  },
  firstObjects: {
    media: report.firstB2MediaObject,
    sidecar: report.firstB2SidecarObject,
    model: report.firstGenblazeModel
  }
};

mkdirSync("docs", { recursive: true });
writeFileSync("docs/integration-adapter-verification.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
