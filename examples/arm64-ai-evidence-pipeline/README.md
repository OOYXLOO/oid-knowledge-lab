# Arm64 AI Evidence Pipeline

This example is a small benchmark harness for the Arm Create AI Optimization Challenge route.

It compares two ways to answer repeated evidence-log questions:

- Baseline scan: normalize and scan every event for every question.
- Indexed query: build a token index once, then reuse it across repeated questions.

The current report is only a local baseline unless it is rerun on an Arm64 environment.

## Run

```bash
npm run arm:benchmark
```

Custom platform note:

```bash
node examples/arm64-ai-evidence-pipeline/run-benchmark.js --platform-note "linux/arm64 runner"
```

## Outputs

```text
examples/arm64-ai-evidence-pipeline/reports/benchmark.json
examples/arm64-ai-evidence-pipeline/reports/benchmark.md
```

## Boundary

Do not claim Arm64 optimization until the benchmark is rerun on an Arm64 platform and the resulting report shows `environment.arch` as `arm64`.
