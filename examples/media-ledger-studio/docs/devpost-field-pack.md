# Media Ledger Studio Devpost Field Pack

## Project Name

Media Ledger Studio

## Tagline

An operations ledger for generated media provenance, review, and Backblaze B2 storage handoff.

## Links

- App: https://media-ledger-studio-static.vercel.app
- Source repository: https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/media-ledger-studio
- Demo video: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/public/media-ledger-studio-demo.mp4
- 3-minute walkthrough: https://ooyxloo.github.io/oid-knowledge-lab/demo-video.html
- 3-minute walkthrough raw backup: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/gh-pages/demo-video.html
- Integration readiness: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-integration-readiness.html
- Sidecar integrity report: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/docs/sidecar-integrity-report.json
- Integration adapter verification: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/docs/integration-adapter-verification.json
- Judging evidence: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-judging-evidence.html

## Built With

React, Vite, deterministic sample media records, Backblaze B2-shaped object manifests, and Genblaze-shaped generation metadata.

## Provider and Model List

- Genblaze / genblaze-image-studio-v1 (image/png)
- Genblaze / genblaze-motion-board-v0 (video/webm)
- Genblaze / genblaze-audio-loop-v2 (audio/wav)

## Inspiration

Generated media teams need more than a final image or clip. They need a handoff that explains which prompt, provider, model, storage object, checksum, license note, and human review decision belongs to each asset.

## What It Does

Media Ledger Studio lets a reviewer inspect generated image, video, and audio runs; compare prompt and negative prompt records; verify B2 object keys and checksums; and copy a submission-ready ledger summary.

## How It Uses Backblaze B2

The prototype records a Backblaze B2-style bucket, object key, content type, byte size, storage class, creation time, and SHA-256 checksum for each generated media output. A live adapter can upload final assets and sidecar metadata to B2 while preserving this same reviewer-facing ledger.

## How It Uses Genblaze

The prototype models Genblaze generation runs with provider, model, prompt, negative prompt, seed, duration, retry count, output type, and safety notes. A live Genblaze adapter can replace the deterministic sample runs without changing the dashboard workflow.

## Challenge Fit

The app is built around generated media operations: prompt intake, Genblaze-shaped generation metadata, human review, durable Backblaze B2-shaped object storage, provenance inspection, and client handoff.

## Challenge Readiness

Dry-run readiness score: 100/100. image run present; video run present; audio run present; B2-shaped storage manifest complete; Genblaze-shaped run metadata complete. Adapter verification remains dry-run; Missing 5 live environment variable(s): B2_APP_ID, B2_APP_VALUE, B2_BUCKET_NAME, GENBLAZE_AUTH_VALUE, GENBLAZE_ENDPOINT. Do not describe this as a live B2 upload or live Genblaze run until a private live adapter run is completed.

## Storage Handoff Summary

The bundled manifest covers 3 generated assets with bucket, object key, content type, byte size, SHA-256 checksum, provider, model, seed, and review decision. It also defines 3 JSON sidecar records that can be uploaded next to the final media objects.

## What's Next

Set the live Backblaze B2 and Genblaze environment variables in a private environment, run the adapter verification without printing secrets, then update the public evidence from dry-run to live-ready only if the verification report supports it.
