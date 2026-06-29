# Media Ledger Studio Submission Pack

Public demo: https://media-ledger-studio-static.vercel.app

## Reviewer Path

1. Open the dashboard.
2. Select each media run.
3. Inspect prompt, provider, model, storage object key, checksum, review status, and safety notes.
4. Export or copy the ledger summary for handoff.

## Technology Fit

- Storage: Backblaze B2-shaped object records are captured per generated asset.
- Generation: Genblaze-shaped provider metadata is captured per generation run and linked to stored outputs.

## Sample Object Keys

- `projects/editorial-cover/run-cover-001/final.png`
- `projects/launch-storyboard/run-storyboard-014/storyboard.webm`
- `projects/audio-bed/run-audio-006/loop.wav`

## Sidecar Metadata Pairs

- `projects/editorial-cover/run-cover-001/final.png` -> `projects/editorial-cover/run-cover-001/final.png.metadata.json`
- `projects/launch-storyboard/run-storyboard-014/storyboard.webm` -> `projects/launch-storyboard/run-storyboard-014/storyboard.webm.metadata.json`
- `projects/audio-bed/run-audio-006/loop.wav` -> `projects/audio-bed/run-audio-006/loop.wav.metadata.json`

## Summary

- Runs: 3
- Ready records: 2
- Needs action: 1
- Average review score: 85
- Stored data: 17.25 MB
