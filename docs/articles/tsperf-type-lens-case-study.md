# TSPerf Type Lens Case Study

TSPerf Type Lens is a research prototype for reviewing TypeScript type-level performance. It combines a VS Code CodeLens surface with a standalone analyzer that ranks `type`, `interface`, and `class` declarations by checker timing, structural depth, generic surface, syntax drivers, and actionable optimization notes.

## Current Scope

- Saved-file TypeScript analysis.
- CodeLens hints for expensive declarations.
- Markdown report generation from the extension command.
- CLI smoke tests and multi-file scans.
- Validation against Type-Fest source declarations.

## Validation Snapshot

The current public validation target is `sindresorhus/type-fest` source declarations at commit `1b7eed6`.

- Files analyzed: 80
- Declarations analyzed: 209
- Diagnostics: 0
- Parse/analyze errors: 0
- Highest score: 241
- Highest checker ms: 78.268

Top reported hotspots included `GreaterThan`, `DelimiterCasedPropertiesArrayDeep`, `PropertyOf`, `_ArraySlice`, `ArraySliceHelper`, `Exact`, and `AllUnionFields`.

## What The Signals Mean

TSPerf Type Lens currently reports a blended score. The score is intentionally heuristic, not a formal proof of TypeScript compiler cost. It combines:

- Declared-type resolution timing.
- `checker.typeToString` timing.
- Expanded type-string length.
- Type nesting depth.
- Generic parameter count.
- AST node count.
- Identifier reference footprint.
- Conditional, mapped, infer, indexed-access, union, intersection, keyof, and template-literal syntax counts.
- Self-recursion signals.

## Why This Is Useful

Complex type helpers are often reviewed as API surface rather than as executable compile-time programs. A reviewer can miss a deep recursive helper, a broad distributive conditional, or a mapped/indexed lookup that expands sharply when users combine it with large object shapes.

The prototype makes those risks visible earlier and gives concrete next actions:

- Capture a `tsc` or `tsserver` trace for timing spikes.
- Add recursion-depth guards.
- Narrow accumulator shapes.
- Split conditional branches.
- Precompute key unions.
- Expose smaller public aliases.

## Remaining Gap

The next step is trace-backed validation. A stronger public result should compare the analyzer's ranked hotspots with actual TypeScript server traces from several public projects. That would show whether the heuristic is reliable enough for challenge submission or extension publication.

