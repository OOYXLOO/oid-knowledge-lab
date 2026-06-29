# Media Ledger Studio

Media Ledger Studio is a browser-based operations cockpit for generated media teams. It turns a prompt-to-review workflow into an auditable ledger with model metadata, storage object keys, checksums, licenses, and reviewer notes.

The current build is a static prototype with deterministic sample data. It is designed so a future deployment can attach real Backblaze B2 storage credentials and a Genblaze generation provider without changing the reviewer-facing workflow.

Public demo: https://media-ledger-studio.vercel.app
Demo walkthrough: https://media-ledger-studio-static.vercel.app/demo-video
Demo MP4: `public/media-ledger-studio-demo.mp4`

## What It Shows

- A generated media pipeline from brief to generated asset, review, and storage handoff.
- Backblaze B2-shaped object records with bucket, object key, checksum, size, and storage class.
- Genblaze-shaped generation runs with prompt, model, provider, seed, retry log, and output manifest.
- A provenance inspector for reviewers and production leads.
- Exportable submission notes for product review or hackathon judging.

## Review Materials

- Devpost field pack: `docs/devpost-field-pack.md`
- Reviewer quickstart: `docs/reviewer-quickstart.md`
- Demo video script: `docs/demo-video-script.md`
- Demo video file: `public/media-ledger-studio-demo.mp4`
- Public verification checklist: `docs/public-verification.md`
- Backblaze and Genblaze integration notes: `docs/backblaze-genblaze-integration.md`
- Backblaze challenge fit: `docs/backblaze-challenge-fit.md`
- Deployment notes: `docs/deployment-notes.md`

## Run Locally

```bash
npm install
npm run check
npm test
npm run build
npm run audit:local
npm run export:devpost-fields
```

```bash
npm run dev
```

## Public Safety

This repository does not include credentials, private media, user account data, payment data, or API keys. All bundled records are synthetic examples.
