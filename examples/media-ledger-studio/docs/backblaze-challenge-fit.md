# Backblaze Generative Media Challenge Fit

Media Ledger Studio is a generated-media operations cockpit for teams that need to track prompts, model outputs, review decisions, and durable storage records before assets are handed to clients.

## Why This Fits

- Generated media is the primary workflow: each record starts with a brief, prompt, negative prompt, provider, model, seed, output type, and review decision.
- Backblaze B2 is represented as the storage handoff contract: bucket, object key, content type, size, storage class, creation time, and SHA-256 checksum.
- Genblaze is represented as the generation-provider contract: provider, model, prompt, seed, retry count, duration, output manifest, and safety notes.
- The reviewer path is simple: open the dashboard, choose a run, inspect provenance, verify storage metadata, and copy the ledger pack.

## Current Public State

- Public app: `https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/`
- Demo walkthrough: `https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/demo-video/`
- Source repository: https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/media-ledger-studio
- Public data boundary: synthetic records only; no credentials, private media, customer data, payment data, cookies, or account-local storage.

## Remaining Challenge Gates

1. Create the public GitHub repository.
2. Push this source tree and verify the source URL returns HTTP 200.
3. Replace the pending source field in the Devpost pack.
4. Optionally connect a live Backblaze B2 upload path and Genblaze provider call if the challenge rules reward live API usage over a static prototype.
5. Submit only after the public app, public source, and demo walkthrough are all reachable.

## Submission Angle

Generated media tools often stop at producing an asset. Media Ledger Studio focuses on the operational layer after generation: where the output is stored, which prompt produced it, whether a human approved it, what checksum proves the stored asset, and what metadata a client or production lead can audit later.
