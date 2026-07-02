#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { performance } = require("perf_hooks");

function parseArgs(argv) {
  const args = {
    input: path.join(__dirname, "sample-review-events.json"),
    out: path.join(__dirname, "reports", "benchmark.json"),
    markdown: path.join(__dirname, "reports", "benchmark.md"),
    iterations: 1200,
    platformNote: "local baseline; rerun on an Arm64 environment before challenge submission"
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--input") args.input = value;
    if (key === "--out") args.out = value;
    if (key === "--markdown") args.markdown = value;
    if (key === "--iterations") args.iterations = Number(value);
    if (key === "--platform-note") args.platformNote = value;
    if (key.startsWith("--")) i += 1;
  }

  if (!Number.isInteger(args.iterations) || args.iterations < 1) {
    throw new Error("--iterations must be a positive integer");
  }

  return args;
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9-]+/g, " ").trim().split(/\s+/).filter(Boolean);
}

function baseline(events, questions) {
  const findings = [];
  for (const question of questions) {
    const terms = normalize(question);
    const matches = [];
    for (const event of events) {
      const haystack = normalize(`${event.text} ${event.tags.join(" ")}`);
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      if (score > 0) matches.push({ id: event.id, score, severity: event.severity });
    }
    findings.push({ question, matches: matches.sort((a, b) => b.score - a.score).slice(0, 3) });
  }
  return findings;
}

function buildIndex(events) {
  const index = new Map();
  const eventById = new Map();
  for (const event of events) {
    eventById.set(event.id, event);
    const tokens = new Set(normalize(`${event.text} ${event.tags.join(" ")}`));
    for (const token of tokens) {
      if (!index.has(token)) index.set(token, new Set());
      index.get(token).add(event.id);
    }
  }
  return { eventById, index };
}

function optimized(events, questions) {
  const { eventById, index } = buildIndex(events);
  const findings = [];
  for (const question of questions) {
    const scores = new Map();
    for (const term of normalize(question)) {
      const ids = index.get(term);
      if (!ids) continue;
      for (const id of ids) scores.set(id, (scores.get(id) || 0) + 1);
    }
    const matches = Array.from(scores.entries())
      .map(([id, score]) => ({ id, score, severity: eventById.get(id).severity }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    findings.push({ question, matches });
  }
  return findings;
}

function measure(label, fn, iterations) {
  const startMemory = process.memoryUsage().heapUsed;
  const start = performance.now();
  let result;
  for (let i = 0; i < iterations; i += 1) {
    result = fn();
  }
  const durationMs = performance.now() - start;
  const endMemory = process.memoryUsage().heapUsed;
  return {
    label,
    duration_ms: Number(durationMs.toFixed(3)),
    avg_iteration_ms: Number((durationMs / iterations).toFixed(6)),
    heap_delta_bytes: endMemory - startMemory,
    result
  };
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function renderMarkdown(report) {
  return `# Arm64 AI Evidence Pipeline Benchmark

Generated at: ${report.generated_at}

## Platform

- Node.js: ${report.environment.node}
- OS: ${report.environment.platform} ${report.environment.release}
- Architecture: ${report.environment.arch}
- CPU model: ${report.environment.cpu_model}
- Platform note: ${report.platform_note}

## Workload

- Events: ${report.workload.events}
- Questions: ${report.workload.questions}
- Iterations: ${report.workload.iterations}

## Results

| Mode | Total ms | Avg iteration ms | Heap delta bytes |
|---|---:|---:|---:|
| Baseline scan | ${report.results.baseline.duration_ms} | ${report.results.baseline.avg_iteration_ms} | ${report.results.baseline.heap_delta_bytes} |
| Indexed query | ${report.results.optimized.duration_ms} | ${report.results.optimized.avg_iteration_ms} | ${report.results.optimized.heap_delta_bytes} |

Speedup estimate: ${report.summary.speedup}x

## Submission Boundary

This benchmark is a reproducible local proof artifact. It does not claim Arm64 optimization unless rerun on an Arm64 environment and committed with the updated platform evidence.
`;
}

function main() {
  const args = parseArgs(process.argv);
  const events = JSON.parse(fs.readFileSync(args.input, "utf8"));
  const questions = [
    "Which events explain webhook retry trace latency?",
    "Which notes mention privacy boundary and credentials?",
    "Which evidence points should be included in editor handoff?",
    "Which optimization uses cache and query planning?"
  ];

  const baselineRun = measure("baseline", () => baseline(events, questions), args.iterations);
  const optimizedRun = measure("optimized", () => optimized(events, questions), args.iterations);
  const speedup = baselineRun.duration_ms > 0
    ? Number((baselineRun.duration_ms / optimizedRun.duration_ms).toFixed(2))
    : 0;

  const cpu = os.cpus()[0] || { model: "unknown" };
  const report = {
    generated_at: new Date().toISOString(),
    platform_note: args.platformNote,
    environment: {
      node: process.version,
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpu_model: cpu.model
    },
    workload: {
      events: events.length,
      questions: questions.length,
      iterations: args.iterations
    },
    results: {
      baseline: baselineRun,
      optimized: optimizedRun
    },
    summary: {
      speedup,
      arm64_ready: os.arch() === "arm64",
      claim_boundary: "Do not claim Arm64 optimization until this benchmark is rerun on Arm64."
    }
  };

  ensureDir(args.out);
  ensureDir(args.markdown);
  fs.writeFileSync(args.out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(args.markdown, renderMarkdown(report), "utf8");
  process.stdout.write(`${JSON.stringify({ ok: true, out: args.out, markdown: args.markdown, speedup }, null, 2)}\n`);
}

if (require.main === module) {
  main();
}
