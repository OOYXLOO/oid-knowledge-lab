# TSPerf Challenge Proposal Draft

Route: https://algora.io/challenges/tsperf

Prize shape: high-value public challenge, but first-success and technically hard. Treat this as a research prototype, not a near-certain USD 200 route.

## Proposed Approach

Build a VS Code extension, TSPerf Type Lens, that puts a CodeLens above expensive TypeScript type declarations. The current prototype measures:

- Declared-type resolution time.
- `checker.typeToString` elapsed time per type/interface/class declaration.
- Total checker time for the declaration.
- Expanded type string length.
- Type nesting depth.
- Generic parameter count.
- AST node count.
- Identifier reference footprint.
- Conditional/mapped/infer/keyof/indexed-access/template-literal/union/intersection syntax counts.
- Self-recursion signal.

The extension then creates a Markdown report and per-declaration CodeLens labels such as:

`TSPerf 74 · 1.42ms · 812 chars · conditional:3 mapped:1`

Current CodeLens labels now include a stronger triage summary:

`TSPerf 176 · 0.581ms checker · depth 8 · depth:8, generics:1, recursive`

The report also turns signals into optimization notes. Examples:

- Capture a `tsc`/`tsserver` trace for declarations with unusually high checker time.
- Add a recursion-depth guard or narrower accumulator shape for recursive helpers.
- Split conditional branches and avoid accidental distributive conditionals over broad unions.
- Precompute key unions or simplify mapped/indexed lookups.

## Acceptance Gap

The challenge likely expects a stronger signal than approximate local timings. Before any public submission, validate on several large TypeScript projects and compare the extension's hotspots against known editor slowdowns or `tsserver` traces.

## Public Validation Snapshot

The prototype was run against `sindresorhus/type-fest` source declarations at commit `1b7eed6`.

Command:

```powershell
$env:TSPERF_FILE_LIMIT='80'
node scripts\analyze-many.js C:\Users\YXL\.codex\tmp\hks-yxl\money-goal-200usd\tsperf-validation\type-fest\source 30
```

Result:

- 80 Type-Fest declaration files analyzed.
- Top hotspot: `GreaterThan` in `source/greater-than.d.ts`, score 240, depth 15.
- Other high-signal hotspots: `DelimiterCasedPropertiesArrayDeep`, `PropertyOf`, `_ArraySlice`, `ArraySliceHelper`, `Exact`, `AllUnionFields`, deep camel/delimiter case helpers, and internal object/key utilities.
- Validation report now includes primary optimization actions and a short `Optimization Notes` section for the highest-ranked hotspots.
- Full report: `docs/validation-type-fest.md`.

Latest verification:

```powershell
npm run verify
$env:TSPERF_FILE_LIMIT='80'
node scripts\analyze-many.js C:\Users\YXL\.codex\tmp\hks-yxl\money-goal-200usd\tsperf-validation\type-fest\source 30
```

## Next Step

Run the prototype on large public repos with complex TypeScript types, then decide whether to publish a GitHub repo and submit it to Algora.
