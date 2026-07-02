# TSPerf Type Lens Source Snapshot

This folder is a public source snapshot of the TSPerf Type Lens prototype used by the TypeScript performance case study.

## Verify

```powershell
npm install
npm run verify
```

The snapshot intentionally does not include `node_modules` or generated package archives.

Latest local verification before publication:

```powershell
npm run verify
node scripts/smoke-test.js
```

The smoke test reports `ok: true` and ranks the sample `DeepReadonly` helper as the top hotspot.

## Boundary

This is a research prototype. The analyzer uses compiler API timing and structural heuristics; it should be compared with `tsserver` traces before being treated as a complete performance diagnostic.
