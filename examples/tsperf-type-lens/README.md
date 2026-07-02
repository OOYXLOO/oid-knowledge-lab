# TSPerf Type Lens

Local prototype for the Algora TSPerf challenge.

TSPerf Type Lens is a VS Code extension concept that shows a CodeLens above TypeScript `type`, `interface`, and `class` declarations when a declaration looks expensive for the checker. The prototype uses the TypeScript Compiler API to measure declared-type resolution time, `typeToString` time, total checker time, expanded type-string length, type nesting depth, generic parameter count, AST node count, identifier references, and syntax drivers such as conditional, mapped, infer, indexed-access, union, and intersection types.

## Why It Might Fit The Challenge

The public TSPerf challenge asks for a VS Code extension that helps developers see type complexity or time-to-load signals. This package is not a final prize claim, but it creates a concrete local starting point:

- Saved TypeScript file analysis.
- CodeLens hints in VS Code.
- Markdown report command.
- Standalone CLI smoke test.
- Multi-file validation reports that separate checker latency from structural complexity.
- Per-hotspot optimization notes, such as when to add recursion-depth guards, split conditional branches, precompute key unions, or capture a `tsserver` trace.

## Run

```powershell
npm install
npm run verify
npm run smoke
npm run analyze
npm run analyze:many -- ../tsperf-validation/type-fest/source 20
```

To try the extension manually, open this folder in VS Code and launch an Extension Development Host. Then open `samples/heavy-types.ts` and run `TSPerf Type Lens: Open Report`.

## Current Limits

- It approximates type load cost using compiler API timings and structural complexity; it is not yet wired into `tsserver` internals.
- It analyzes saved files only.
- It needs validation on large real-world repos before any public challenge submission.

## Validation Snapshot

`scripts/analyze-many.js` can scan a public TypeScript project and produce a multi-file hotspot table. The first public validation target is Type-Fest, a type-heavy open-source package.

Current validation:

- Target: `sindresorhus/type-fest` source declarations at commit `1b7eed6`.
- Command: `TSPERF_FILE_LIMIT=80 node scripts/analyze-many.js <type-fest/source> 30`.
- Report: `docs/validation-type-fest.md`.
- Result: 80 files analyzed; top hotspots include `GreaterThan`, `DelimiterCasedPropertiesArrayDeep`, `PropertyOf`, `_ArraySlice`, `ArraySliceHelper`, `Exact`, `AllUnionFields`, and several deep case-conversion helpers.
- The report now includes `Checker ms`, `Depth`, compact driver summaries such as `resolve`, `print`, `depth`, `generics`, `recursive`, syntax counts, and primary optimization actions.

This is enough to prove the analyzer can rank real type-heavy files, but not enough to claim challenge acceptance.

## Submission Boundary

Do not submit this as a final Algora challenge answer yet. The next useful step is profiling it against real TypeScript projects and deciding whether the signal is accurate enough to justify a public GitHub repo and challenge submission.
