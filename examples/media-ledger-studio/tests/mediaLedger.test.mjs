import assert from "node:assert/strict";
import {
  createChallengeReadinessScore,
  createDevpostFields,
  createProviderModelList,
  createReadinessChecklist,
  createSidecarMetadataManifest,
  createStorageHandoffManifest,
  createSubmissionPack,
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

console.log("mediaLedger tests passed");
