# Media Ledger Studio Judging Evidence Pack

## Thesis

Generated-media teams need a durable review ledger, not only final files. Media Ledger Studio links prompts, model metadata, reviewer decisions, Backblaze B2-shaped object records, checksums, and sidecar JSON so a generated asset can be inspected before handoff.

## Differentiation

- Covers image, video, and audio runs in one reviewer-facing workflow.
- Pairs each media object with a sidecar metadata object that can travel with the file in B2.
- Keeps dry-run evidence honest: the app shows storage and provider plans without claiming live uploads when credentials are absent.
- Turns generated-media provenance into operational handoff fields a production lead can copy or audit.

## Metrics

- Runs: 3
- Asset types: image, video, audio
- Total media size: 17.25 MB
- Readiness score: 100/100
- Media upload plans: 3
- Sidecar upload plans: 3
- Genblaze request plans: 3

## Judging Checklist

- Working application [ready]: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/
- Source snapshot [ready]: https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/media-ledger-studio
- Backblaze B2 usage [dry-run-ready]: 3 B2-shaped media records and 3 sidecar records
- Genblaze usage [dry-run-ready]: 3 Genblaze-shaped provider/model records
- Integrity evidence [ready]: SHA-256 media checksums plus sidecar-to-media pairing checks
- Live adapter boundary [blocked-on-env]: Missing 4 live environment variable(s): B2_KEY_ID, B2_APP_KEY, B2_BUCKET, GMI_API_KEY

## Review Risk Matrix

- Client-ready assets: 1
- Assets needing review: 2
- High-risk assets: 1

- Editorial cover image [medium]: Add final campaign ID and metadata note to the delivery record.
- Launch storyboard clip [high]: Add reviewer initials and transcript metadata before client handoff.
- Ambient audio bed [low]: Confirm license and rights checks, then attach the result to the sidecar.

## Honest Boundary

This public build is a dry-run prototype. It does not claim real B2 uploads or real Genblaze calls until live credentials and provider access are supplied.

## Next Upgrade

Connect live B2 and Genblaze credentials in a private environment, run the adapter verification, and replace the dry-run blocker summary with a live-ready report.
