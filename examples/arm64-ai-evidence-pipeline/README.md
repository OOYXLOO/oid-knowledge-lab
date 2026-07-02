# Arm64 AI Evidence Pipeline

[![Arm evidence benchmark](https://github.com/OOYXLOO/oid-knowledge-lab/workflows/Arm%20evidence%20benchmark/badge.svg)](https://github.com/OOYXLOO/oid-knowledge-lab/actions/workflows/arm-benchmark.yml)

This example is a small benchmark harness for the Arm Create AI Optimization Challenge route.

It compares two ways to answer repeated evidence-log questions:

- Baseline scan: normalize and scan every event for every question.
- Indexed query: build a token index once, then reuse it across repeated questions.

The current report is only a local baseline unless it is rerun on an Arm64 environment.

## Run

```bash
npm run arm:benchmark
npm run arm:verify
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

For a real challenge submission, rerun the benchmark on an Arm64 environment and verify with:

```bash
npm run arm:verify -- --require-arm64
```

The GitHub Actions workflow `.github/workflows/arm-benchmark.yml` is intentionally a baseline verifier by default. It does not create an Arm64 claim on `ubuntu-latest`.

Latest public baseline run:

```text
https://github.com/OOYXLOO/oid-knowledge-lab/actions/runs/28568753640
```

Latest public job:

```text
https://github.com/OOYXLOO/oid-knowledge-lab/actions/runs/28568753640/job/84701531693
```
