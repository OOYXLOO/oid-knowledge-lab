# TSPerf Type Lens Multi-File Validation

Generated: 2026-06-28T12:26:31.870Z
Target: `type-fest/source`
Command: `node scripts/analyze-many.js <path-to-type-fest/source> 30`

## Summary

- Files analyzed: 80
- Type/interface/class declarations analyzed: 209
- Files with diagnostics: 0
- Parse/analyze errors: 0
- Highest score: 241
- Average score: 89.4
- Highest checker ms: 78.268
- Average checker ms: 1.5

## Top Type Hotspots

| Rank | Score | File | Line | Name | Checker ms | Depth | Drivers | Primary action |
|---:|---:|---|---:|---|---:|---:|---|---|
| 1 | 241 | `type-fest/source/greater-than.d.ts` | 58 | `GreaterThan` | 0.317 | 15 | depth:15, generics:2, conditional:11, infer:2 | Reduce nested conditional/mapped depth or introduce capped helper aliases. |
| 2 | 219 | `type-fest/source/delimiter-cased-properties-deep.d.ts` | 92 | `DelimiterCasedPropertiesArrayDeep` | 0.054 | 10 | depth:10, generics:3, recursive, conditional:7 | Reduce nested conditional/mapped depth or introduce capped helper aliases. |
| 3 | 219 | `type-fest/source/get.d.ts` | 130 | `PropertyOf` | 0.037 | 10 | depth:10, generics:3, recursive, conditional:9 | Reduce nested conditional/mapped depth or introduce capped helper aliases. |
| 4 | 194 | `type-fest/source/internal/array.d.ts` | 116 | `_CollapseRestElement` | 0.04 | 9 | depth:9, generics:3, recursive, conditional:6 | Review nested helper depth before this type becomes an editor hotspot. |
| 5 | 190 | `type-fest/source/camel-cased-properties-deep.d.ts` | 86 | `CamelCasedPropertiesArrayDeep` | 0.053 | 9 | depth:9, generics:2, recursive, conditional:6 | Review nested helper depth before this type becomes an editor hotspot. |
| 6 | 189 | `type-fest/source/array-slice.d.ts` | 81 | `_ArraySlice` | 37.336 | 6 | resolve:37.23ms, depth:6, generics:3, recursive | Capture a tsc/tsserver trace and split or cache this declaration first. |
| 7 | 182 | `type-fest/source/array-slice.d.ts` | 104 | `ArraySliceHelper` | 0.416 | 6 | depth:6, generics:8, recursive, conditional:6 | Add an explicit recursion-depth guard or a narrower accumulator shape. |
| 8 | 176 | `type-fest/source/array-reverse.d.ts` | 61 | `_ArrayReverse` | 0.103 | 8 | depth:8, generics:4, recursive, conditional:4 | Review nested helper depth before this type becomes an editor hotspot. |
| 9 | 167 | `type-fest/source/conditional-keys.d.ts` | 56 | `_ConditionalKeys` | 41.625 | 5 | resolve:40.988ms, generics:2, recursive, conditional:1 | Capture a tsc/tsserver trace and split or cache this declaration first. |
| 10 | 166 | `type-fest/source/array-splice.d.ts` | 22 | `SplitVariableArrayByIndex` | 0.082 | 8 | depth:8, generics:4, recursive, conditional:5 | Review nested helper depth before this type becomes an editor hotspot. |
| 11 | 157 | `type-fest/source/absolute.d.ts` | 44 | `Absolute` | 4.933 | 4 | print:4.04ms, generics:1, conditional:3, infer:2 | Inspect expanded output; expose a smaller alias or simplify template-literal expansion. |
| 12 | 157 | `type-fest/source/get.d.ts` | 73 | `FixPathSquareBrackets` | 0.02 | 6 | depth:6, generics:1, recursive, conditional:3 | Add an explicit recursion-depth guard or a narrower accumulator shape. |
| 13 | 156 | `type-fest/source/exact.d.ts` | 58 | `Exact` | 0.08 | 10 | depth:10, generics:2, recursive, conditional:6 | Reduce nested conditional/mapped depth or introduce capped helper aliases. |
| 14 | 155 | `type-fest/source/extends-strict.d.ts` | 136 | `_ExtendsStrict` | 0.053 | 7 | depth:7, generics:3, recursive, conditional:6 | Review nested helper depth before this type becomes an editor hotspot. |
| 15 | 155 | `type-fest/source/int-range.d.ts` | 48 | `PrivateIntRange` | 0.038 | 6 | depth:6, generics:6, recursive, conditional:3 | Add an explicit recursion-depth guard or a narrower accumulator shape. |
| 16 | 153 | `type-fest/source/internal/object.d.ts` | 28 | `BuildObject` | 0.242 | 6 | depth:6, generics:3, conditional:3, mapped:4 | Precompute key unions or simplify mapped/indexed lookups. |
| 17 | 152 | `type-fest/source/delimiter-cased-properties-deep.d.ts` | 73 | `_DelimiterCasedPropertiesDeep` | 0.033 | 8 | depth:8, generics:3, recursive, conditional:4 | Review nested helper depth before this type becomes an editor hotspot. |
| 18 | 150 | `type-fest/source/array-slice.d.ts` | 59 | `ArraySlice` | 0.297 | 7 | depth:7, generics:3, conditional:8 | Review nested helper depth before this type becomes an editor hotspot. |
| 19 | 150 | `type-fest/source/internal/string.d.ts` | 194 | `PositiveNumericCharacterGt` | 0.343 | 5 | generics:2, recursive, conditional:3, infer:6 | Add an explicit recursion-depth guard or a narrower accumulator shape. |
| 20 | 149 | `type-fest/source/all-union-fields.d.ts` | 71 | `AllUnionFields` | 1.198 | 10 | resolve:1.046ms, depth:10, generics:1, conditional:2 | Reduce nested conditional/mapped depth or introduce capped helper aliases. |
| 21 | 147 | `type-fest/source/all-extend.d.ts` | 106 | `_AllExtend` | 0.143 | 8 | depth:8, generics:3, recursive, conditional:4 | Review nested helper depth before this type becomes an editor hotspot. |
| 22 | 145 | `type-fest/source/camel-cased-properties-deep.d.ts` | 69 | `_CamelCasedPropertiesDeep` | 0.032 | 8 | depth:8, generics:2, recursive, conditional:4 | Review nested helper depth before this type becomes an editor hotspot. |
| 23 | 143 | `type-fest/source/internal/keys.d.ts` | 7 | `BaseKeyFilter` | 0.155 | 7 | depth:7, generics:2, recursive, conditional:4 | Review nested helper depth before this type becomes an editor hotspot. |
| 24 | 142 | `type-fest/source/conditional-pick-deep.d.ts` | 110 | `_ConditionalPickDeep` | 0.019 | 8 | depth:8, generics:3, recursive, conditional:2 | Review nested helper depth before this type becomes an editor hotspot. |
| 25 | 142 | `type-fest/source/internal/object.d.ts` | 230 | `_ApplyDefaultOptions` | 0.024 | 8 | depth:8, generics:3, recursive, conditional:2 | Review nested helper depth before this type becomes an editor hotspot. |
| 26 | 140 | `type-fest/source/internal/keys.d.ts` | 25 | `FilterDefinedKeys` | 0.176 | 9 | depth:9, generics:1, conditional:4, mapped:1 | Review nested helper depth before this type becomes an editor hotspot. |
| 27 | 135 | `type-fest/source/internal/object.d.ts` | 82 | `UndefinedToOptional` | 2.144 | 6 | resolve:1.659ms, depth:6, generics:1, mapped:2 | No immediate rewrite; keep as a baseline comparison. |
| 28 | 135 | `type-fest/source/internal/string.d.ts` | 147 | `SameLengthPositiveNumericStringGt` | 0.067 | 5 | generics:2, recursive, conditional:3, infer:4 | Add an explicit recursion-depth guard or a narrower accumulator shape. |
| 29 | 134 | `type-fest/source/camel-case.d.ts` | 52 | `CamelCaseFromArray` | 0.401 | 6 | depth:6, generics:3, recursive, conditional:2 | Add an explicit recursion-depth guard or a narrower accumulator shape. |
| 30 | 134 | `type-fest/source/delimiter-case.d.ts` | 11 | `DelimiterCaseFromArray` | 0.165 | 7 | depth:7, generics:3, recursive, conditional:3 | Review nested helper depth before this type becomes an editor hotspot. |

## Optimization Notes

1. `GreaterThan` in `type-fest/source/greater-than.d.ts` line 58: Reduce nested conditional/mapped depth or introduce capped helper aliases. Split conditional branches; avoid accidental distributive conditionals on broad unions. Precompute key unions or simplify mapped/indexed lookups.
2. `DelimiterCasedPropertiesArrayDeep` in `type-fest/source/delimiter-cased-properties-deep.d.ts` line 92: Reduce nested conditional/mapped depth or introduce capped helper aliases. Add an explicit recursion-depth guard or a narrower accumulator shape. Split conditional branches; avoid accidental distributive conditionals on broad unions.
3. `PropertyOf` in `type-fest/source/get.d.ts` line 130: Reduce nested conditional/mapped depth or introduce capped helper aliases. Add an explicit recursion-depth guard or a narrower accumulator shape. Split conditional branches; avoid accidental distributive conditionals on broad unions.
4. `_CollapseRestElement` in `type-fest/source/internal/array.d.ts` line 116: Review nested helper depth before this type becomes an editor hotspot. Add an explicit recursion-depth guard or a narrower accumulator shape. Split conditional branches; avoid accidental distributive conditionals on broad unions.
5. `CamelCasedPropertiesArrayDeep` in `type-fest/source/camel-cased-properties-deep.d.ts` line 86: Review nested helper depth before this type becomes an editor hotspot. Add an explicit recursion-depth guard or a narrower accumulator shape. Split conditional branches; avoid accidental distributive conditionals on broad unions.
6. `_ArraySlice` in `type-fest/source/array-slice.d.ts` line 81: Capture a tsc/tsserver trace and split or cache this declaration first. Add an explicit recursion-depth guard or a narrower accumulator shape.
7. `ArraySliceHelper` in `type-fest/source/array-slice.d.ts` line 104: Add an explicit recursion-depth guard or a narrower accumulator shape. Split conditional branches; avoid accidental distributive conditionals on broad unions. Precompute key unions or simplify mapped/indexed lookups. Reduce generic parameter surface or split helper types.
8. `_ArrayReverse` in `type-fest/source/array-reverse.d.ts` line 61: Review nested helper depth before this type becomes an editor hotspot. Add an explicit recursion-depth guard or a narrower accumulator shape. Reduce generic parameter surface or split helper types.
9. `_ConditionalKeys` in `type-fest/source/conditional-keys.d.ts` line 56: Capture a tsc/tsserver trace and split or cache this declaration first. Add an explicit recursion-depth guard or a narrower accumulator shape.
10. `SplitVariableArrayByIndex` in `type-fest/source/array-splice.d.ts` line 22: Review nested helper depth before this type becomes an editor hotspot. Add an explicit recursion-depth guard or a narrower accumulator shape. Split conditional branches; avoid accidental distributive conditionals on broad unions. Precompute key unions or simplify mapped/indexed lookups. Reduce generic parameter surface or split helper types.
11. `Absolute` in `type-fest/source/absolute.d.ts` line 44: Inspect expanded output; expose a smaller alias or simplify template-literal expansion.
12. `FixPathSquareBrackets` in `type-fest/source/get.d.ts` line 73: Add an explicit recursion-depth guard or a narrower accumulator shape.

## Notes

- Scores are heuristic and need correlation with editor/tsserver latency before public challenge submission.
- This run intentionally avoids private repos, credentials, and telemetry.
