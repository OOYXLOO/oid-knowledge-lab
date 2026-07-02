# Backblaze Final Submission Checklist

Source: https://backblaze-generative-media.devpost.com/

Deadline: 2026-08-03 5:00pm EDT.

## Required Fields

- Working app URL: `https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/`
- Source repository: `https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/media-ledger-studio`
- Demo walkthrough: `https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/demo-video/`
- Demo MP4: `https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/public/media-ledger-studio-demo.mp4`
- Providers and models: see `docs/devpost-field-pack.md`
- B2 and Genblaze usage: see `docs/devpost-field-pack.md`

## Fit Against Judging Criteria

### Real-World Utility

Media Ledger Studio targets generated-media teams that need a reviewable handoff before assets reach a client. It tracks prompts, model metadata, human review notes, safety notes, license notes, object keys, checksums, and next actions.

### Production Readiness

The app is static and credential-free for public review, but its records are structured around a live adapter boundary. The dry-run reports avoid claiming real uploads when credentials are absent.

### B2 Storage and Data Orchestration

Each generated media record has a Backblaze B2-shaped bucket, object key, content type, byte size, storage class, timestamp, checksum, and paired JSON sidecar metadata record.

### Genblaze Usage

Each sample run includes Genblaze-shaped provider, model, prompt, negative prompt, seed, duration, retry count, output type, and safety metadata. The adapter verification report defines the live credential boundary.

## Remaining Before Submission

- Join the Devpost hackathon under the user's account.
- Submit the project form on Devpost.
- If possible, connect real Backblaze B2 and Genblaze credentials in a private environment and rerun the verification reports.
- Do not claim live B2 uploads or live Genblaze calls unless private verification proves them.
