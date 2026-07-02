# Media Ledger Studio Demo Video Script

Target length: about 3 minutes for a full narration recording.

Public browser walkthrough: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/demo-video/

Current public page mode: 3-minute guided loop with six 30-second scenes.

## 0:00 - 0:20 Opening

Media Ledger Studio is an operations cockpit for generated media teams. It turns image, video, and audio generation runs into an auditable ledger that connects prompts, model metadata, review notes, and Backblaze B2 storage records.

## 0:20 - 0:55 Problem

Generated media teams often produce assets quickly, but the handoff becomes messy: the prompt lives in one place, the file is stored somewhere else, review notes are separate, and nobody can quickly prove which model, license note, checksum, or storage object belongs to the final asset.

## 0:55 - 1:35 Product Walkthrough

Open the dashboard. The queue shows three generated media records: an editorial cover image, a storyboard clip, and an audio loop. Selecting a record updates the provenance inspector with owner, provider, model, seed, retry count, bucket, object key, checksum, file size, and license note.

## 1:35 - 2:00 Backblaze B2 and Genblaze Fit

Each media run stores a Backblaze B2-shaped record: bucket, object key, content type, byte size, storage class, creation timestamp, and SHA-256 checksum. The static demo uses deterministic records, but the adapter boundary is ready for real B2 uploads and sidecar metadata.

Each generated asset also carries a Genblaze-shaped generation run: provider, model, prompt, negative prompt, seed, duration, retry count, and safety notes.

## 2:00 - 2:35 Review and Judging Flow

The Review view turns scattered notes into a client handoff risk matrix. It separates client-ready assets from items that need transcript, license, score, or campaign metadata follow-up. Judges can also open direct links like `?view=review`, `?view=evidence`, or `?run=run-storyboard-014`.

## 2:35 - 3:00 Close

The result is a practical generated media handoff: reviewers can inspect provenance, storage, safety, approval status, and submission evidence from one place. The dashboard also includes a Copy Devpost fields action, so the remaining work is account-side Devpost submission and optional private live adapter proof.
