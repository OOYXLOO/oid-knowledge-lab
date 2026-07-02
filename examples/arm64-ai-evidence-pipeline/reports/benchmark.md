# Arm64 AI Evidence Pipeline Benchmark

Generated at: 2026-07-02T05:52:58.172Z

## Platform

- Node.js: v24.13.0
- OS: win32 10.0.26200
- Architecture: x64
- CPU model: Intel(R) Core(TM) i7-14650HX
- Platform note: local baseline; rerun on an Arm64 environment before challenge submission

## Workload

- Events: 5
- Questions: 4
- Iterations: 1200

## Results

| Mode | Total ms | Avg iteration ms | Heap delta bytes |
|---|---:|---:|---:|
| Baseline scan | 52.091 | 0.043409 | 638344 |
| Indexed query | 34.3 | 0.028583 | -79744 |

Speedup estimate: 1.52x

## Submission Boundary

This benchmark is a reproducible local proof artifact. It does not claim Arm64 optimization unless rerun on an Arm64 environment and committed with the updated platform evidence.
