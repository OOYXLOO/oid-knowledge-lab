# OID Intelligence Lab Ad Video

This repository contains a neutral 30-second product ad prototype for OID Intelligence Lab.

It is intended as a lightweight product-marketing asset:

- `public/ad.html` renders the animated canvas ad.
- `scripts/record-webm.mjs` records the canvas animation to `dist/oid-intelligence-lab-ad.webm`.
- `dist/` stores generated local preview output and can be regenerated.

The ad avoids private data, credentials, account screenshots, customer records, and payment details.

## Render Locally

```powershell
npm install
node scripts/record-webm.mjs
```

Output:

```text
dist/oid-intelligence-lab-ad.webm
```

## Product Links

- Product page: https://ooyxloo.github.io/oid-knowledge-lab/oid-intelligence-lab.html
- Repository: https://github.com/OOYXLOO/oid-knowledge-lab
