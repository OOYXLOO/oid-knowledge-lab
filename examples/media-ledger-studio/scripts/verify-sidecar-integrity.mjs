import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { createLiveIntegrationBundle, sampleRuns } from "../src/mediaLedger.js";

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256Hex(text) {
  return createHash("sha256").update(text).digest("hex");
}

const bundle = createLiveIntegrationBundle(sampleRuns, {
  publicBaseUrl: process.env.PUBLIC_APP_URL || "https://media-ledger-studio-static.vercel.app",
  b2BucketName: process.env.B2_BUCKET_NAME || "media-ledger-demo",
  b2Prefix: process.env.B2_PREFIX || "challenge-dry-run",
  genblazeEndpoint: process.env.GENBLAZE_ENDPOINT || "https://api.genblaze.example/v1/generate",
  env: {
    B2_APP_ID: process.env.B2_APP_ID,
    B2_APP_VALUE: process.env.B2_APP_VALUE,
    B2_BUCKET_NAME: process.env.B2_BUCKET_NAME,
    GENBLAZE_AUTH_VALUE: process.env.GENBLAZE_AUTH_VALUE,
    GENBLAZE_ENDPOINT: process.env.GENBLAZE_ENDPOINT
  }
});

const sidecars = bundle.b2UploadPlan.filter((item) => item.kind === "sidecar");
const mediaByRunId = new Map(
  bundle.b2UploadPlan.filter((item) => item.kind === "media").map((item) => [item.runId, item])
);

const records = sidecars.map((sidecar) => {
  const media = mediaByRunId.get(sidecar.runId);
  const canonicalBody = stableJson(sidecar.bodyPreview);
  return {
    runId: sidecar.runId,
    mediaObjectKey: media?.objectKey || null,
    sidecarObjectKey: sidecar.objectKey,
    mediaChecksumSha256: media?.checksumSha256 || null,
    sidecarBodySha256: sha256Hex(canonicalBody),
    sidecarBytes: Buffer.byteLength(canonicalBody),
    bodyLinksToMediaChecksum: sidecar.bodyPreview.checksumSha256 === media?.checksumSha256,
    bodyLinksToMediaObject: sidecar.bodyPreview.objectKey === media?.objectKey?.replace(/^challenge-dry-run\//, "")
  };
});

const result = {
  ok: records.every((record) =>
    record.mediaObjectKey
    && record.sidecarObjectKey.endsWith(".metadata.json")
    && record.bodyLinksToMediaChecksum
    && record.bodyLinksToMediaObject
    && /^[a-f0-9]{64}$/.test(record.sidecarBodySha256)
  ),
  mode: bundle.mode,
  totals: {
    mediaObjects: mediaByRunId.size,
    sidecars: records.length,
    linkedPairs: records.filter((record) => record.bodyLinksToMediaChecksum && record.bodyLinksToMediaObject).length
  },
  records
};

mkdirSync("docs", { recursive: true });
writeFileSync("docs/sidecar-integrity-report.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
