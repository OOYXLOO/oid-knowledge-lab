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

The static prototype uses a sample Genblaze-shaped run so reviewers can inspect the workflow without credentials.

## Intended Production Flow

1. Create a media brief.
2. Send the prompt and constraints to Genblaze.
3. Store returned assets and sidecar metadata in Backblaze B2.
4. Record the B2 object keys and content checksums.
5. Route the asset through review.
6. Export the final provenance ledger for client handoff.

