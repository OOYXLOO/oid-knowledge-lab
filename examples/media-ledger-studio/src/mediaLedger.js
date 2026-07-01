export const sampleRuns = [
  {
    id: "run-cover-001",
    title: "Editorial cover image",
    status: "Ready for client review",
    owner: "Mira Chen",
    brief: "A quiet cinematic cover for an article about resilient cloud storage for generated media teams.",
    prompt:
      "A production desk with generated image contact sheets, storage labels, and a calm cloud operations mood.",
    negativePrompt: "no distorted text, no brand impersonation, no private data",
    provider: "Genblaze",
    model: "genblaze-image-studio-v1",
    seed: 482910,
    durationMs: 18400,
    retryCount: 1,
    license: "Internal demo asset, replace before production",
    safetyNotes: ["No likeness request", "No private source files", "Human review required before client delivery"],
    storage: {
      bucket: "media-ledger-demo",
      objectKey: "projects/editorial-cover/run-cover-001/final.png",
      checksumSha256: "9c9f1ee3a4315f8367b39c31d93a4ef5d6a71e9a45c8e66111108b2419a31a77",
      contentType: "image/png",
      bytes: 2843920,
      storageClass: "Backblaze B2 Standard",
      createdAt: "2026-06-27T08:05:00Z"
    },
    review: {
      score: 92,
      decision: "Approved with metadata note",
      notes: "Strong composition. Add final campaign ID before handoff."
    },
    thumbnail:
      "linear-gradient(135deg, #16323b 0%, #1e6c6b 42%, #f2d179 43%, #e86f51 100%)"
  },
  {
    id: "run-storyboard-014",
    title: "Launch storyboard clip",
    status: "Needs provenance fix",
    owner: "Alex Rivera",
    brief: "A short product explainer storyboard for a generated media archive.",
    prompt:
      "Four-panel storyboard showing prompt intake, generated media review, B2 storage, and final client delivery.",
    negativePrompt: "no fake logos, no real customer names, no private screenshots",
    provider: "Genblaze",
    model: "genblaze-motion-board-v0",
    seed: 771245,
    durationMs: 31200,
    retryCount: 2,
    license: "Synthetic storyboard draft",
    safetyNotes: ["Replace placeholder company names", "Confirm music rights before export"],
    storage: {
      bucket: "media-ledger-demo",
      objectKey: "projects/launch-storyboard/run-storyboard-014/storyboard.webm",
      checksumSha256: "4b6e1e673946d762748fbd140af8fd0f7b0fe8de9814be868d77df483cb6a334",
      contentType: "video/webm",
      bytes: 9432104,
      storageClass: "Backblaze B2 Standard",
      createdAt: "2026-06-27T08:18:00Z"
    },
    review: {
      score: 78,
      decision: "Hold",
      notes: "Sidecar metadata is complete, but final transcript needs reviewer initials."
    },
    thumbnail:
      "linear-gradient(135deg, #263238 0%, #42565c 35%, #f4f0e8 36%, #55a6a3 100%)"
  },
  {
    id: "run-audio-006",
    title: "Ambient audio bed",
    status: "Archived",
    owner: "Noor Patel",
    brief: "A calm ambient background loop for a product walkthrough.",
    prompt: "Warm minimal ambient audio bed, soft pulse, no vocals, no recognizable melody.",
    negativePrompt: "no copyrighted melody, no voice, no aggressive percussion",
    provider: "Genblaze",
    model: "genblaze-audio-loop-v2",
    seed: 194207,
    durationMs: 22600,
    retryCount: 0,
    license: "Synthetic loop, production license pending",
    safetyNotes: ["Run duplicate melody check", "Keep original prompt in handoff"],
    storage: {
      bucket: "media-ledger-demo",
      objectKey: "projects/audio-bed/run-audio-006/loop.wav",
      checksumSha256: "683d0ac237fe701b7ad2a7325374388f3d78fb8c8a89a66f8d9b97d7c413f442",
      contentType: "audio/wav",
      bytes: 5814200,
      storageClass: "Backblaze B2 Standard",
      createdAt: "2026-06-27T08:32:00Z"
    },
    review: {
      score: 86,
      decision: "Archive candidate",
      notes: "Ready for storage proof. Needs final license check before reuse."
    },
    thumbnail:
      "linear-gradient(135deg, #15292f 0%, #2b7a78 48%, #ffffff 49%, #c9583c 100%)"
  }
];

export function summarizeLedger(runs = sampleRuns) {
  const bytes = runs.reduce((sum, run) => sum + run.storage.bytes, 0);
  const ready = runs.filter((run) => /ready|archived/i.test(run.status)).length;
  const needsAction = runs.length - ready;
  const averageScore = Math.round(
    runs.reduce((sum, run) => sum + run.review.score, 0) / Math.max(runs.length, 1)
  );

  return {
    totalRuns: runs.length,
    ready,
    needsAction,
    averageScore,
    totalBytes: bytes,
    totalMegabytes: Number((bytes / 1024 / 1024).toFixed(2))
  };
}

export function createSubmissionPack(runs = sampleRuns) {
  const summary = summarizeLedger(runs);
  const readiness = createReadinessChecklist();
  const challengeReadiness = createChallengeReadinessScore(runs, readiness);
  const liveIntegration = createLiveIntegrationBundle(runs);
  return {
    appName: "Media Ledger Studio",
    publicDemoUrl: "https://media-ledger-studio-static.vercel.app",
    summary,
    challengeReadiness,
    liveIntegration,
    requiredTechnology: {
      storage: "Backblaze B2-shaped object records and dry-run upload plans are captured per generated asset.",
      generation:
        "Genblaze-shaped provider metadata and dry-run request plans are captured per generation run and linked to stored outputs."
    },
    reviewerPath: [
      "Open the dashboard.",
      "Select each media run.",
      "Inspect prompt, provider, model, storage object key, checksum, review status, and safety notes.",
      "Export or copy the ledger summary for handoff."
    ],
    sampleObjectKeys: runs.map((run) => run.storage.objectKey),
    providerModels: createProviderModelList(runs),
    storageHandoffManifest: createStorageHandoffManifest(runs),
    sidecarMetadataManifest: createSidecarMetadataManifest(runs),
    readiness
  };
}

export function findRunById(id, runs = sampleRuns) {
  return runs.find((run) => run.id === id) || runs[0];
}

export function createProviderModelList(runs = sampleRuns) {
  const seen = new Set();
  return runs
    .map((run) => ({ provider: run.provider, model: run.model, assetType: run.storage.contentType }))
    .filter((entry) => {
      const key = `${entry.provider}/${entry.model}/${entry.assetType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function createDevpostFields({
  appUrl = "https://media-ledger-studio-static.vercel.app",
  sourceRepoUrl = "https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/media-ledger-studio",
  videoUrl = "https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/public/media-ledger-studio-demo.mp4"
} = {}) {
  const pack = createSubmissionPack(sampleRuns);
  const integration = createIntegrationReadinessReport(sampleRuns);
  return {
    projectName: "Media Ledger Studio",
    tagline: "An operations ledger for generated media provenance, review, and Backblaze B2 storage handoff.",
    appUrl,
    sourceRepoUrl,
    videoUrl,
    walkthroughUrl: "https://media-ledger-studio-static.vercel.app/demo-video.html",
    providerAndModels: pack.providerModels,
    builtWith:
      "React, Vite, deterministic sample media records, Backblaze B2-shaped object manifests, and Genblaze-shaped generation metadata.",
    inspiration:
      "Generated media teams need more than a final image or clip. They need a handoff that explains which prompt, provider, model, storage object, checksum, license note, and human review decision belongs to each asset.",
    whatItDoes:
      "Media Ledger Studio lets a reviewer inspect generated image, video, and audio runs; compare prompt and negative prompt records; verify B2 object keys and checksums; and copy a submission-ready ledger summary.",
    howBackblazeB2IsUsed:
      "The prototype records a Backblaze B2-style bucket, object key, content type, byte size, storage class, creation time, and SHA-256 checksum for each generated media output. A live adapter can upload final assets and sidecar metadata to B2 while preserving this same reviewer-facing ledger.",
    howGenblazeIsUsed:
      "The prototype models Genblaze generation runs with provider, model, prompt, negative prompt, seed, duration, retry count, output type, and safety notes. A live Genblaze adapter can replace the deterministic sample runs without changing the dashboard workflow.",
    challengeFit:
      "The app is built around generated media operations: prompt intake, Genblaze-shaped generation metadata, human review, durable Backblaze B2-shaped object storage, provenance inspection, and client handoff.",
    challengeReadiness:
      `Dry-run readiness score: ${pack.challengeReadiness.score}/100. ` +
      `${pack.challengeReadiness.readySignals.join("; ")}. ` +
      `Adapter verification remains ${integration.mode}; ${integration.blockerSummary}. ` +
      "Do not describe this as a live B2 upload or live Genblaze run until a private live adapter run is completed.",
    storageHandoffSummary:
      `The bundled manifest covers ${pack.storageHandoffManifest.length} generated assets with bucket, object key, content type, byte size, SHA-256 checksum, provider, model, seed, and review decision. ` +
      `It also defines ${pack.sidecarMetadataManifest.length} JSON sidecar records that can be uploaded next to the final media objects.`,
    whatIsNext:
      "Set the live Backblaze B2 and Genblaze environment variables in a private environment, run the adapter verification without printing secrets, then update the public evidence from dry-run to live-ready only if the verification report supports it."
  };
}

export function createJudgingEvidencePack(runs = sampleRuns) {
  const pack = createSubmissionPack(runs);
  const integration = createIntegrationReadinessReport(runs);
  const assetTypes = [...new Set(runs.map((run) => run.storage.contentType.split("/")[0]))];
  return {
    projectName: "Media Ledger Studio",
    thesis:
      "Generated-media teams need a durable review ledger, not only final files. Media Ledger Studio links prompts, model metadata, reviewer decisions, Backblaze B2-shaped object records, checksums, and sidecar JSON so a generated asset can be inspected before handoff.",
    differentiation: [
      "Covers image, video, and audio runs in one reviewer-facing workflow.",
      "Pairs each media object with a sidecar metadata object that can travel with the file in B2.",
      "Keeps dry-run evidence honest: the app shows storage and provider plans without claiming live uploads when credentials are absent.",
      "Turns generated-media provenance into operational handoff fields a production lead can copy or audit."
    ],
    judgingChecklist: [
      {
        label: "Working application",
        evidence: pack.publicDemoUrl,
        status: "ready"
      },
      {
        label: "Source snapshot",
        evidence: "https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/media-ledger-studio",
        status: "ready"
      },
      {
        label: "Backblaze B2 usage",
        evidence: `${pack.storageHandoffManifest.length} B2-shaped media records and ${pack.sidecarMetadataManifest.length} sidecar records`,
        status: "dry-run-ready"
      },
      {
        label: "Genblaze usage",
        evidence: `${pack.providerModels.length} Genblaze-shaped provider/model records`,
        status: "dry-run-ready"
      },
      {
        label: "Integrity evidence",
        evidence: "SHA-256 media checksums plus sidecar-to-media pairing checks",
        status: "ready"
      },
      {
        label: "Live adapter boundary",
        evidence: integration.blockerSummary,
        status: integration.readyForLiveRun ? "live-ready" : "blocked-on-env"
      }
    ],
    metrics: {
      runs: runs.length,
      assetTypes,
      totalMegabytes: pack.summary.totalMegabytes,
      readinessScore: pack.challengeReadiness.score,
      mediaUploadPlans: integration.totals.mediaUploads,
      sidecarUploadPlans: integration.totals.sidecarUploads,
      genblazeRequestPlans: integration.totals.genblazeRequests
    },
    honestBoundary:
      integration.readyForLiveRun
        ? "All required live environment variables are present for an adapter run. Credential values are never printed."
        : "This public build is a dry-run prototype. It does not claim real B2 uploads or real Genblaze calls until live credentials and provider access are supplied.",
    nextUpgrade:
      "Connect live B2 and Genblaze credentials in a private environment, run the adapter verification, and replace the dry-run blocker summary with a live-ready report."
  };
}

export function createStorageHandoffManifest(runs = sampleRuns) {
  return runs.map((run) => ({
    runId: run.id,
    title: run.title,
    assetType: run.storage.contentType,
    bucket: run.storage.bucket,
    objectKey: run.storage.objectKey,
    bytes: run.storage.bytes,
    checksumSha256: run.storage.checksumSha256,
    provider: run.provider,
    model: run.model,
    seed: run.seed,
    reviewDecision: run.review.decision,
    safetyNotes: run.safetyNotes
  }));
}

export function createSidecarMetadataManifest(runs = sampleRuns) {
  return runs.map((run) => {
    const sidecarKey = `${run.storage.objectKey}.metadata.json`;
    return {
      runId: run.id,
      objectKey: run.storage.objectKey,
      sidecarKey,
      contentType: "application/json",
      checksumSha256: run.storage.checksumSha256,
      provider: run.provider,
      model: run.model,
      seed: run.seed,
      reviewDecision: run.review.decision,
      requiredUploadPair: [run.storage.objectKey, sidecarKey],
      sidecarBody: {
        runId: run.id,
        title: run.title,
        objectKey: run.storage.objectKey,
        checksumSha256: run.storage.checksumSha256,
        provider: run.provider,
        model: run.model,
        seed: run.seed,
        license: run.license,
        reviewDecision: run.review.decision,
        safetyNotes: run.safetyNotes
      }
    };
  });
}

export function createLiveIntegrationBundle(runs = sampleRuns, {
  publicBaseUrl = "https://media-ledger-studio-static.vercel.app",
  b2BucketName = "media-ledger-demo",
  b2Prefix = "generated-media-ledger",
  genblazeEndpoint = "https://api.genblaze.example/v1/generate",
  env = {}
} = {}) {
  const requiredEnv = [
    "B2_APP_ID",
    "B2_APP_VALUE",
    "B2_BUCKET_NAME",
    "GENBLAZE_AUTH_VALUE",
    "GENBLAZE_ENDPOINT"
  ];
  const missingEnv = requiredEnv.filter((name) => !env[name]);
  const sidecars = createSidecarMetadataManifest(runs);
  const b2UploadPlan = runs.flatMap((run, index) => {
    const mediaKey = joinObjectKey(b2Prefix, run.storage.objectKey);
    const sidecarKey = joinObjectKey(b2Prefix, sidecars[index].sidecarKey);
    return [
      {
        runId: run.id,
        kind: "media",
        bucket: env.B2_BUCKET_NAME || b2BucketName,
        objectKey: mediaKey,
        contentType: run.storage.contentType,
        checksumSha256: run.storage.checksumSha256,
        bytes: run.storage.bytes
      },
      {
        runId: run.id,
        kind: "sidecar",
        bucket: env.B2_BUCKET_NAME || b2BucketName,
        objectKey: sidecarKey,
        contentType: "application/json",
        checksumSha256: run.storage.checksumSha256,
        bodyPreview: sidecars[index].sidecarBody
      }
    ];
  });
  const genblazeRequestPlan = runs.map((run) => ({
    runId: run.id,
    endpoint: env.GENBLAZE_ENDPOINT || genblazeEndpoint,
    model: run.model,
    prompt: run.prompt,
    negativePrompt: run.negativePrompt,
    seed: run.seed,
    outputType: run.storage.contentType,
    safetyNotes: run.safetyNotes
  }));
  const publicReviewLinks = sidecars.map((sidecar, index) => ({
    runId: sidecar.runId,
    reviewUrl: `${publicBaseUrl}/?run=${encodeURIComponent(sidecar.runId)}`,
    requiredUploadPair: [
      b2UploadPlan[index * 2].objectKey,
      b2UploadPlan[index * 2 + 1].objectKey
    ]
  }));
  return {
    mode: missingEnv.length ? "dry-run" : "live-ready",
    requiredEnv,
    missingEnv,
    b2UploadPlan,
    genblazeRequestPlan,
    publicReviewLinks
  };
}

export function createIntegrationReadinessReport(runs = sampleRuns, options = {}) {
  const bundle = createLiveIntegrationBundle(runs, options);
  const mediaUploads = bundle.b2UploadPlan.filter((item) => item.kind === "media");
  const sidecarUploads = bundle.b2UploadPlan.filter((item) => item.kind === "sidecar");
  const totalMediaBytes = mediaUploads.reduce((sum, item) => sum + item.bytes, 0);
  const uploadPairsReady = bundle.publicReviewLinks.every((link) => link.requiredUploadPair.length === 2);
  return {
    mode: bundle.mode,
    readyForLiveRun: bundle.mode === "live-ready" && uploadPairsReady,
    missingEnv: bundle.missingEnv,
    requiredEnv: bundle.requiredEnv,
    totals: {
      runs: runs.length,
      mediaUploads: mediaUploads.length,
      sidecarUploads: sidecarUploads.length,
      genblazeRequests: bundle.genblazeRequestPlan.length,
      reviewLinks: bundle.publicReviewLinks.length,
      totalMediaBytes,
      totalMediaMegabytes: Number((totalMediaBytes / 1024 / 1024).toFixed(2))
    },
    firstB2MediaObject: mediaUploads[0]?.objectKey || null,
    firstB2SidecarObject: sidecarUploads[0]?.objectKey || null,
    firstGenblazeModel: bundle.genblazeRequestPlan[0]?.model || null,
    publicReviewLinks: bundle.publicReviewLinks,
    blockerSummary: bundle.missingEnv.length
      ? `Missing ${bundle.missingEnv.length} live environment variable(s): ${bundle.missingEnv.join(", ")}`
      : "All live environment variables are present for a live adapter run."
  };
}

function joinObjectKey(prefix, objectKey) {
  return [prefix, objectKey]
    .map((part) => String(part || "").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

export function createChallengeReadinessScore(runs = sampleRuns, readiness = createReadinessChecklist()) {
  const hasImage = runs.some((run) => run.storage.contentType.startsWith("image/"));
  const hasVideo = runs.some((run) => run.storage.contentType.startsWith("video/"));
  const hasAudio = runs.some((run) => run.storage.contentType.startsWith("audio/"));
  const hasStorageRecords = runs.every((run) =>
    run.storage.bucket
    && run.storage.objectKey
    && run.storage.checksumSha256
    && run.storage.bytes > 0
  );
  const hasGenblazeRecords = runs.every((run) => run.provider && run.model && run.prompt && Number.isInteger(run.seed));
  const readyCount = readiness.filter((item) => item.status === "ready").length;
  const score = Math.round(
    (hasImage ? 12 : 0)
    + (hasVideo ? 12 : 0)
    + (hasAudio ? 12 : 0)
    + (hasStorageRecords ? 24 : 0)
    + (hasGenblazeRecords ? 24 : 0)
    + (readyCount / readiness.length) * 16
  );
  const blockers = readiness
    .filter((item) => item.status !== "ready")
    .map((item) => `${item.label}: ${item.detail}`);
  return {
    score,
    readySignals: [
      hasImage ? "image run present" : "image run missing",
      hasVideo ? "video run present" : "video run missing",
      hasAudio ? "audio run present" : "audio run missing",
      hasStorageRecords ? "B2-shaped storage manifest complete" : "storage manifest incomplete",
      hasGenblazeRecords ? "Genblaze-shaped run metadata complete" : "generation metadata incomplete"
    ],
    blockers: blockers.length ? blockers : ["No submission blockers in the current checklist"]
  };
}

export function createReadinessChecklist({
  sourceRepoReady = true,
  publicAppReady = true,
  demoVideoReady = true,
  b2BoundaryReady = true,
  genblazeBoundaryReady = true,
  privateDataFree = true
} = {}) {
  return [
    {
      label: "Public app URL",
      status: publicAppReady ? "ready" : "missing",
      detail: "The Vercel production app is reachable by reviewers."
    },
    {
      label: "Source repository",
      status: sourceRepoReady ? "ready" : "blocked",
      detail: sourceRepoReady
        ? "A public source snapshot is available in the OID Knowledge Lab repository."
        : "Create and push the public GitHub repository before final submission."
    },
    {
      label: "Demo video",
      status: demoVideoReady ? "ready" : "missing",
      detail: "A 30-second MP4 walkthrough is available for reviewers, with the browser walkthrough page kept as a readable fallback."
    },
    {
      label: "Backblaze B2 boundary",
      status: b2BoundaryReady ? "ready" : "missing",
      detail: "Each sample asset has a B2-shaped bucket, object key, content type, size, class, and checksum."
    },
    {
      label: "Genblaze boundary",
      status: genblazeBoundaryReady ? "ready" : "missing",
      detail: "Each sample asset has provider, model, prompt, seed, retry, and safety metadata."
    },
    {
      label: "Public safety",
      status: privateDataFree ? "ready" : "blocked",
      detail: "The public build uses synthetic records and avoids private media or credentials."
    }
  ];
}
