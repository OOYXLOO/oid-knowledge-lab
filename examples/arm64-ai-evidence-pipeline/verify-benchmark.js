#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = {
    report: path.join(__dirname, "reports", "benchmark.json"),
    requireArm64: false,
    minSpeedup: 1
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--report") {
      args.report = value;
      i += 1;
    } else if (key === "--require-arm64") {
      args.requireArm64 = true;
    } else if (key === "--min-speedup") {
      args.minSpeedup = Number(value);
      i += 1;
    }
  }

  if (!Number.isFinite(args.minSpeedup) || args.minSpeedup <= 0) {
    throw new Error("--min-speedup must be a positive number");
  }

  return args;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const args = parseArgs(process.argv);
  const report = JSON.parse(fs.readFileSync(args.report, "utf8"));

  assert(report.generated_at, "Missing generated_at");
  assert(report.environment && report.environment.arch, "Missing environment.arch");
  assert(report.workload && report.workload.iterations > 0, "Missing workload.iterations");
  assert(report.results && report.results.baseline && report.results.optimized, "Missing benchmark results");
  assert(report.results.baseline.duration_ms > 0, "Baseline duration must be positive");
  assert(report.results.optimized.duration_ms > 0, "Optimized duration must be positive");
  assert(report.summary && typeof report.summary.speedup === "number", "Missing summary.speedup");
  assert(report.summary.speedup >= args.minSpeedup, `Speedup ${report.summary.speedup} is below ${args.minSpeedup}`);
  assert(
    String(report.summary.claim_boundary || "").includes("Do not claim Arm64 optimization"),
    "Missing explicit Arm64 claim boundary"
  );

  if (args.requireArm64) {
    assert(report.environment.arch === "arm64", `Expected arm64 report, got ${report.environment.arch}`);
    assert(report.summary.arm64_ready === true, "Expected arm64_ready true");
  }

  process.stdout.write(JSON.stringify({
    ok: true,
    report: args.report,
    arch: report.environment.arch,
    arm64_ready: report.summary.arm64_ready,
    speedup: report.summary.speedup,
    require_arm64: args.requireArm64
  }, null, 2) + "\n");
}

if (require.main === module) {
  main();
}
