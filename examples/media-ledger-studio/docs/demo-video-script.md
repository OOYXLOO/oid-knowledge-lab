# Media Ledger Studio Demo Video Script

Target length: about 3 minutes for a full narration recording.

Public browser walkthrough: https://media-ledger-studio-static.vercel.app/demo-video.html

## 0:00 - 0:20 Opening

Media Ledger Studio is an operations cockpit for generated media teams. It turns image, video, and audio generation runs into an auditable ledger that connects prompts, model metadata, review notes, and Backblaze B2 storage records.

## 0:20 - 0:55 Problem

Generated media teams often produce assets quickly, but the handoff becomes messy: the prompt lives in one place, the file is stored somewhere else, review notes are separate, and nobody can quickly prove which model, license note, checksum, or storage object belongs to the final asset.

## 0:55 - 1:35 Product Walkthrough

Open the dashboard. The queue shows three generated media records: an editorial cover image, a storyboard clip, and an audio loop. Selecting a record updates the provenance inspector with owner, provider, model, seed, retry count, bucket, object key, checksum, file size, and license note.

## 1:35 - 2:10 Backblaze B2 Fit

Each media run stores a Backblaze B2-shaped record: bucket, object key, content type, byte size, storage class, creation timestamp, and SHA-256 checksum. The static demo uses deterministic records, but the adapter boundary is ready for real B2 uploads and sidecar metadata.

## 2:10 - 2:35 Genblaze Fit

Each generated asset also carries a Genblaze-shaped generation run: provider, model, prompt, negative prompt, seed, duration, retry count, and safety notes. This lets reviewers understand how the asset was produced, not just where it is stored.

## 2:35 - 3:00 Close

The result is a practical generated media handoff: reviewers can inspect provenance, storage, safety, and approval status from one place. Next steps are live B2 uploads, real Genblaze responses, signed metadata, and team review permissions.
