# Reviewer Quickstart

This quickstart gives reviewers a short path through Media Ledger Studio without requiring Backblaze B2 credentials, Genblaze credentials, private media, or account screenshots.

## 60-Second Review Path

1. Open the public app: <https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/>
2. Open the walkthrough page: <https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/demo-video/>
3. Watch the MP4 walkthrough: <https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/public/media-ledger-studio-demo.mp4>
4. Review the source snapshot: <https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/media-ledger-studio>
5. Open the sidecar proof: <https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-sidecar-proof.html>
6. Read the Devpost field pack: <https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/examples/media-ledger-studio/docs/devpost-field-pack.md>

## What To Look For

- Each generated media record carries provider, model, prompt, negative prompt, seed, duration, retry count, and safety notes.
- Each storage handoff carries a Backblaze B2-shaped bucket, object key, content type, byte size, storage class, creation time, and SHA-256 checksum.
- The dashboard lets reviewers inspect generated image, video, and audio records without private media uploads.
- The sidecar metadata pattern keeps provenance next to final objects so production storage can be audited later.

## Local Verification

```bash
npm run check
npm test
npm run build
npm run audit:local
npm run export:devpost-fields
```

## Current Boundary

This is a credential-free public prototype with deterministic sample records. It does not claim a live Backblaze B2 upload, a live Genblaze response, production media storage, private media review, or payment/account setup. A production version can replace the sample records with live provider responses and signed sidecar uploads while preserving the same reviewer workflow.

## Suggested Reviewer Order

1. App
2. MP4
3. Sidecar proof
4. Source snapshot
5. Devpost field pack
6. Backblaze / Genblaze integration notes

