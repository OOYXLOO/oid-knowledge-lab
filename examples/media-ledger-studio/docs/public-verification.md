# Public Verification

## Public App

- Production app: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/
- Expected signal: HTTP 200 and page title `Media Ledger Studio`.
- Latest verified asset should include `Submission readiness`, `Provider and model list`, and `Backblaze B2 usage`.

## Source Repository

- Expected repository: pending public GitHub repository creation.
- Current status: create the repository, push this source tree, then replace the pending source field in the Devpost pack.

## Latest Deployment

- Deployment URL: https://dist-96lc6cnk7-c4ppp.vercel.app
- Inspector: https://vercel.com/c4ppp/dist/Asb2tLw8cp18zE9WbzXqVqVqxhW9
- Alias: https://ooyxloo.github.io/oid-knowledge-lab/media-ledger-studio/

## Local Verification Commands

```bash
npm run check
npm test
npm run export:submission-pack
npm run export:devpost-fields
npm run build
npm run audit:local
```

## Public Safety

The public prototype contains deterministic sample media records only. It does not contain private media, customer data, provider credentials, cookies, payment data, or account-local storage.
