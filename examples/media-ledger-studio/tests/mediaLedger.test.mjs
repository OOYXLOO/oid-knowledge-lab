import assert from "node:assert/strict";
import {
  createChallengeReadinessScore,
  createDevpostFields,
  createIntegrationReadinessReport,
  createProviderModelList,
  createReadinessChecklist,
  createSidecarMetadataManifest,
  createStorageHandoffManifest,
  createSubmissionPack,
  createLiveIntegrationBundle,
  findRunById,
  sampleRuns,
  summarizeLedger
} from "../src/mediaLedger.js";

const summary = summarizeLedger(sampleRuns);
assert.equal(summary.totalRuns, 3);
assert.equal(summary.ready, 2);
assert.equal(summary.needsAction, 1);
assert.equal(summary.averageScore, 85);
assert.equal(summary.totalMegabytes > 10, true);

const selected = findRunById("run-storyboard-014", sampleRuns);
assert.equal(selected.title, "Launch storyboard clip");
assert.equal(selected.storage.storageClass, "Backblaze B2 Standard");

const pack = createSubmissionPack(sampleRuns);
assert.equal(pack.appName, "Media Ledger Studio");
assert.equal(pack.sampleObjectKeys.length, 3);
assert.match(pack.requiredTechnology.storage, /Backblaze B2/);
assert.match(pack.requiredTechnology.generation, /Genblaze/);
assert.equal(pack.providerModels.length, 3);
assert.equal(pack.storageHandoffManifest.length, 3);
assert.equal(pack.sidecarMetadataManifest.length, 3);
assert.equal(pack.sidecarMetadataManifest[0].sidecarKey.endsWith(".metadata.json"), true);
assert.equal(pack.challengeReadiness.score >= 90, true);
assert.equal(pack.readiness.length, 6);
assert.equal(pack.readiness.filter((item) => item.status === "ready").length, 6);
assert.equal(pack.readiness.some((item) => item.label === "Source repository" && item.status === "ready"), true);
assert.equal(pack.readiness.some((item) => item.label === "Demo video" && item.status === "ready"), true);

const providerModels = createProviderModelList(sampleRuns);
assert.equal(providerModels.some((entry) => entry.model === "genblaze-image-studio-v1"), true);

const manifest = createStorageHandoffManifest(sampleRuns);
assert.equal(manifest[0].bucket, "media-ledger-demo");
assert.match(manifest[0].checksumSha256, /^[a-f0-9]{64}$/);

const sidecars = createSidecarMetadataManifest(sampleRuns);
assert.equal(sidecars[0].requiredUploadPair.length, 2);
assert.equal(sidecars[0].sidecarBody.checksumSha256, sampleRuns[0].storage.checksumSha256);
assert.match(sidecars[0].sidecarKey, /final\.png\.metadata\.json$/);

const completeReadiness = createReadinessChecklist({ sourceRepoReady: true, demoVideoReady: true });
assert.equal(completeReadiness.every((item) => item.status === "ready"), true);
const completeScore = createChallengeReadinessScore(sampleRuns, completeReadiness);
assert.equal(completeScore.score, 100);

const devpostFields = createDevpostFields();
assert.match(devpostFields.howBackblazeB2IsUsed, /object key/);
assert.match(devpostFields.howGenblazeIsUsed, /prompt/);
assert.match(devpostFields.challengeReadiness, /Readiness score/);
assert.match(devpostFields.storageHandoffSummary, /3 generated assets/);
assert.match(devpostFields.storageHandoffSummary, /JSON sidecar records/);
assert.equal(devpostFields.appUrl, "https://media-ledger-studio-static.vercel.app");
assert.match(devpostFields.videoUrl, /media-ledger-studio-demo\.mp4$/);
assert.match(devpostFields.sourceRepoUrl, /github\.com\/OOYXLOO\/oid-knowledge-lab/);
assert.match(devpostFields.challengeFit, /Backblaze B2/);

const liveBundle = createLiveIntegrationBundle(sampleRuns, {
  publicBaseUrl: "https://media-ledger-studio-static.vercel.app",
  b2BucketName: "media-ledger-demo",
  b2Prefix: "challenge-dry-run",
  genblazeEndpoint: "https://api.genblaze.example/v1/generate"
});
assert.equal(liveBundle.mode, "dry-run");
assert.equal(liveBundle.b2UploadPlan.length, sampleRuns.length * 2);
assert.equal(liveBundle.genblazeRequestPlan.length, sampleRuns.length);
assert.equal(liveBundle.requiredEnv.length, 5);
assert.equal(liveBundle.missingEnv.length, 5);
assert.equal(liveBundle.requiredEnv.includes("GENBLAZE_AUTH_VALUE"), true);
assert.match(liveBundle.b2UploadPlan[0].objectKey, /^challenge-dry-run\//);
assert.equal(liveBundle.b2UploadPlan[1].contentType, "application/json");
assert.equal(liveBundle.genblazeRequestPlan[0].endpoint, "https://api.genblaze.example/v1/generate");
assert.deepEqual(liveBundle.publicReviewLinks[0].requiredUploadPair, [
  liveBundle.b2UploadPlan[0].objectKey,
  liveBundle.b2UploadPlan[1].objectKey
]);

const liveReadyBundle = createLiveIntegrationBundle(sampleRuns, {
  env: {
    B2_APP_ID: "demo-app-id",
    B2_APP_VALUE: "demo-app-value",
    B2_BUCKET_NAME: "live-bucket",
    GENBLAZE_AUTH_VALUE: "demo-auth-value",
    GENBLAZE_ENDPOINT: "https://genblaze.example.test/v1/generate"
  }
});
assert.equal(liveReadyBundle.mode, "live-ready");
assert.equal(liveReadyBundle.missingEnv.length, 0);
assert.equal(liveReadyBundle.b2UploadPlan.every((item) => item.bucket === "live-bucket"), true);
assert.equal(
  liveReadyBundle.genblazeRequestPlan.every((request) => request.endpoint === "https://genblaze.example.test/v1/generate"),
  true
);

const readinessReport = createIntegrationReadinessReport(sampleRuns, {
  publicBaseUrl: "https://media-ledger-studio-static.vercel.app",
  b2Prefix: "challenge-dry-run"
});
assert.equal(readinessReport.mode, "dry-run");
assert.equal(readinessReport.readyForLiveRun, false);
assert.equal(readinessReport.totals.mediaUploads, sampleRuns.length);
assert.equal(readinessReport.totals.sidecarUploads, sampleRuns.length);
assert.equal(readinessReport.totals.genblazeRequests, sampleRuns.length);
assert.equal(readinessReport.totals.reviewLinks, sampleRuns.length);
assert.equal(readinessReport.totals.totalMediaBytes, summary.totalBytes);
assert.match(readinessReport.firstB2MediaObject, /^challenge-dry-run\//);
assert.match(readinessReport.firstB2SidecarObject, /^challenge-dry-run\//);
assert.match(readinessReport.blockerSummary, /Missing 5 live environment variable/);

const liveReadyReport = createIntegrationReadinessReport(sampleRuns, {
  env: {
    B2_APP_ID: "demo-app-id",
    B2_APP_VALUE: "demo-app-value",
    B2_BUCKET_NAME: "live-bucket",
    GENBLAZE_AUTH_VALUE: "demo-auth-value",
    GENBLAZE_ENDPOINT: "https://genblaze.example.test/v1/generate"
  }
});
assert.equal(liveReadyReport.mode, "live-ready");
assert.equal(liveReadyReport.readyForLiveRun, true);
assert.match(liveReadyReport.blockerSummary, /All live environment variables are present/);

console.log("mediaLedger tests passed");
