# Backblaze and Genblaze Integration Notes

Media Ledger Studio keeps the product workflow stable while separating demo data from provider adapters.

## Backblaze B2 Adapter Boundary

The app expects a storage record with:

- `bucket`
- `objectKey`
- `checksumSha256`
- `contentType`
- `bytes`
- `storageClass`
- `createdAt`

In the demo build, these values are deterministic sample records. In a live build, the same shape can be produced after uploading generated media and sidecar metadata to Backblaze B2.

## Genblaze Adapter Boundary

The app expects a generation run with:

- `provider`
- `model`
- `prompt`
- `negativePrompt`
- `seed`
- `durationMs`
- `retryCount`
- `outputs`
- `safetyNotes`

The static prototype uses sample Genblaze-shaped runs so reviewers can inspect the workflow without credentials.

## Dry-run Adapter Bundle

`createLiveIntegrationBundle()` now produces a credential-free adapter plan for the full handoff:

- one Backblaze B2 media upload plan per generated asset
- one Backblaze B2 JSON sidecar upload plan per generated asset
- one Genblaze generation request plan per generated asset
- one public review link per generated asset
- an environment checklist that switches the bundle from `dry-run` to `live-ready`

Required live environment variables:

- `B2_KEY_ID`
- `B2_APP_KEY`
- `B2_BUCKET`
- `GMI_API_KEY`

The public build intentionally leaves those values unset. That keeps the repository credential-free while showing exactly what would be sent to B2 and Genblaze during a live challenge run.

## Intended Production Flow

1. Create a media brief.
2. Send the prompt and constraints to Genblaze.
3. Build the dry-run adapter bundle and inspect planned B2 media/sidecar objects.
4. Store returned assets and sidecar metadata in Backblaze B2.
5. Record the B2 object keys and content checksums.
6. Route the asset through review.
7. Export the final provenance ledger for client handoff.
