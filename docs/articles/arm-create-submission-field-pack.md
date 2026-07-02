# Arm Create Submission Field Pack

This pack is a copy-ready draft for the Arm Create: AI Optimization Challenge. It is not a submitted Devpost entry yet.

## Project Title

Arm64 Cloud AI Evidence Pipeline

## Tagline

A reproducible evidence-log benchmark that turns repeated AI review questions into measurable scan-versus-index optimization proof, with an explicit Arm64 verification gate.

## Project URL

https://ooyxloo.github.io/oid-knowledge-lab/arm64-ai-evidence-pipeline.html

## Source Code

https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/arm64-ai-evidence-pipeline

## Workflow / CI Evidence

https://github.com/OOYXLOO/oid-knowledge-lab/actions/workflows/arm-benchmark.yml

Latest public baseline run:

https://github.com/OOYXLOO/oid-knowledge-lab/actions/runs/28568753640

Latest public baseline job:

https://github.com/OOYXLOO/oid-knowledge-lab/actions/runs/28568753640/job/84701531693

## What It Does

Arm64 Cloud AI Evidence Pipeline is a small developer workflow for benchmarking repeated evidence-log questions. It compares two paths:

1. A baseline path that normalizes and scans every event for every question.
2. An indexed path that builds a normalized token index once and reuses it across repeated evidence questions.

The project outputs benchmark JSON and Markdown with runtime, average iteration time, heap delta, platform, CPU model, Node.js version, architecture, and an explicit claim boundary.

The current public report is a local x64 baseline. The project is designed so the same command can be rerun on an Arm64 environment, then verified with a stricter `--require-arm64` gate before any challenge submission claims Arm64 optimization.

## Why It Fits Arm Create

The Cloud AI track asks for practical Arm-powered cloud and AI workflows, including inference performance, agents, frameworks, and production-ready developer workflows. This project focuses on the often-overlooked production workflow around AI agents: repeatable evidence lookup, review handoff, and benchmark-backed optimization.

Instead of only showing a UI, it provides:

- A reproducible benchmark harness.
- A CI workflow that verifies the benchmark as a baseline.
- A stricter verifier that refuses to accept x64 output as Arm64 evidence.
- Public-safe sample data with no credentials, cookies, OTPs, payment data, private customer payloads, or account exports.

## How It Works

The benchmark loads `sample-review-events.json`, then answers repeated evidence questions such as:

- Which events explain webhook retry trace latency?
- Which notes mention privacy boundary and credentials?
- Which evidence points should be included in an editor handoff?
- Which optimization uses cache and query planning?

The baseline implementation normalizes text repeatedly during each scan. The optimized implementation builds a token index and reuses that index when answering repeated questions.

## Reproduction Steps

```bash
npm install
npm run arm:benchmark
npm run arm:verify
```

To verify a real Arm64 result:

```bash
npm run arm:benchmark -- --platform-note "Arm64 environment"
npm run arm:verify -- --require-arm64
```

The strict verifier fails on non-Arm64 reports. On the current local x64 baseline it correctly fails with:

```text
Expected arm64 report, got x64
```

## Current Baseline Result

Current local x64 baseline:

- `environment.arch`: `x64`
- `arm64_ready`: `false`
- speedup estimate: about `1.52x`

This result is useful as a baseline, but not sufficient for an Arm challenge claim.

## What Still Needs To Be Done Before Submission

- Rerun the benchmark on an Arm64 environment.
- Commit the Arm64 benchmark JSON and Markdown.
- Confirm the public page links the Arm64 run.
- Record the Arm64 workflow/job URL.
- Optional: record a short demo video under 3 minutes.
- Recheck official eligibility and final Devpost fields before submission.

## Technologies Used

- Node.js
- GitHub Actions
- Static HTML
- JSON benchmark reports
- Markdown benchmark reports
- Public-safe evidence-log fixtures

## Safety And Data Boundary

The project uses small synthetic/public-safe review events. It excludes credentials, API keys, auth headers, cookies, OTPs, payment data, private customer payloads, account exports, and private platform messages.

## Suggested Devpost Long Description

AI agents and review assistants often generate evidence logs repeatedly: what happened, which source supports it, what should be excluded, and which handoff fields are safe to share. If that workflow scans every event for every question, it wastes time and makes optimization hard to prove.

Arm64 Cloud AI Evidence Pipeline turns that workflow into a measurable benchmark. It compares a simple repeated scan with an indexed evidence lookup path, then emits JSON and Markdown reports with runtime, memory, platform, architecture, and a strict claim boundary.

The current version is deliberately honest: it publishes a local x64 baseline and a GitHub Actions baseline run, but it does not claim Arm64 optimization yet. The verifier includes a `--require-arm64` mode that fails unless the report is generated on an Arm64 environment. That means the same project can be rerun on Arm64 and upgraded into real challenge evidence without changing the review process or weakening the submission boundary.

The result is a production-style developer workflow: reproducible command, CI check, benchmark report, public proof page, and a clear path to Arm64 validation.

## Suggested Built With

```text
Node.js, GitHub Actions, JavaScript, JSON, Markdown, Static HTML
```

## Suggested Challenge Track

Cloud AI.

## Submission Boundary

Do not submit this as an Arm64 optimization entry until the Arm64 benchmark has been generated and `npm run arm:verify -- --require-arm64` passes.
