# Media Ledger Studio Public Review Links

Generated: 2026-07-02

This note collects the public review links for Media Ledger Studio and keeps the review packet explicit about which artifacts are live public pages, which artifacts are source files, and which integration evidence remains a dry-run.

## Primary Review Links

- App: https://media-ledger-studio-static.vercel.app/
- Walkthrough page: https://media-ledger-studio-static.vercel.app/demo-video.html
- Source snapshot: https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/media-ledger-studio
- Final overview: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-final-submission.html
- Judging evidence: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-judging-evidence.html
- Integration readiness: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-integration-readiness.html
- Devpost field pack: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/docs/devpost-field-pack.md

## Video Backup

Use the walkthrough page above for the normal review flow. If a direct MP4 file is required, use this GitHub raw backup:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/public/media-ledger-studio-demo.mp4
```

## Integration Evidence

- Sidecar integrity report: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/docs/sidecar-integrity-report.json
- Integration adapter verification: https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/media-ledger-studio/docs/integration-adapter-verification.json

The public project contains deterministic sample records and dry-run integration plans. It does not contain private Backblaze B2 credentials, Genblaze credentials, private media, cookies, tokens, payment data, or account screenshots.

## Honest Boundary

The current public verification proves that the reviewer-facing workflow, B2-shaped object plan, Genblaze-shaped request plan, and JSON sidecar pairing are internally consistent. It should not be described as a real Backblaze B2 upload or real Genblaze provider run unless a private live adapter run is completed and a new public report is generated without exposing secrets.

