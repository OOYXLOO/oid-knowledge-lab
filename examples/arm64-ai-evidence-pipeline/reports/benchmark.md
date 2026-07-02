# Arm64 AI Evidence Pipeline Benchmark

Generated at: 2026-07-02T05:44:24.572Z

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
| Baseline scan | 51.339 | 0.042782 | 638344 |
| Indexed query | 32.347 | 0.026956 | 1047136 |

Speedup estimate: 1.59x

## Submission Boundary

This benchmark is a reproducible local proof artifact. It does not claim Arm64 optimization unless rerun on an Arm64 environment and committed with the updated platform evidence.
