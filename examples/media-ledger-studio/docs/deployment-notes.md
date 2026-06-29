# Deployment Notes

## Current Production URL

https://media-ledger-studio.vercel.app

## Latest Deployment

- Production app alias: https://media-ledger-studio.vercel.app
- Stable static walkthrough alias: https://media-ledger-studio-static.vercel.app/demo-video
- Vercel project: media-ledger-studio
- Static fallback deployment: https://dist-119m5tsei-c4ppp.vercel.app

## Why This Exists

The project deploys through the normal Vercel project flow for the main app. The build also prepares a directory-style static route for the demo walkthrough so `/demo-video` works without requiring reviewers to know the `.html` filename.

The latest root-project deployment produced a direct deployment URL where `/demo-video` works, but Vercel kept that deployment in an `UNKNOWN` API state and would not attach the main alias to it. The stable static fallback is therefore the current public walkthrough link.

## Reproduce

```bash
npm run check
npm test
npm run export:submission-pack
npm run export:devpost-fields
npm run build
npx vercel deploy --prod --yes
npx vercel deploy .\dist --prod --yes
npx vercel alias set <dist-deployment-url> media-ledger-studio-static.vercel.app
```

## Follow-Up

After the GitHub repository is created, connect it to Vercel so future deployments are triggered from Git commits. Then retire the static fallback once the main project alias serves `/demo-video`.
