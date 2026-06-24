"use strict";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function formatDuration(ms) {
  const seconds = Math.ceil(Number(ms || 0) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (remainingSeconds || parts.length === 0) parts.push(`${remainingSeconds}s`);
  return parts.join(" ");
}

function buildAuthorizedCrawlPlan(options = {}) {
  const oidEntries = Array.isArray(options.oidEntries) ? options.oidEntries : [];
  const delayMs = Math.max(500, Number(options.delayMs || 1500));
  const requestGaps = Math.max(0, oidEntries.length - 1);
  const sampleEntries = oidEntries.slice(0, 10).map((entry) => ({
    oid: entry.oid,
    markdown_url: entry.markdown_url
  }));

  return {
    name: "OID-base authorized full crawl plan",
    generated_at: options.generatedAt || new Date().toISOString(),
    source: "https://oid-base.com/",
    source_kind: "public sitemap plus authorized page-body collection",
    entry_count: oidEntries.length,
    delay_ms: delayMs,
    estimated_request_duration_ms: requestGaps * delayMs,
    estimated_request_duration_human: formatDuration(requestGaps * delayMs),
    output_policy: {
      output_dir: options.outDir || "data/full",
      tracked_in_git: false,
      publishable_without_source_authorization: false,
      raw_markdown_default: false
    },
    required_gates: [
      "Written authorization or another clear license basis from the source owner.",
      "Set OID_BASE_FULL_CRAWL_AUTHORIZED=1 before running the crawler.",
      "Pass --authorized-full and a non-empty --authorization-note value.",
      "Respect robots.txt and avoid disallowed paths.",
      "Use a polite delay between page-body requests."
    ],
    publishable_outputs: [
      "crawler code",
      "sitemap metadata index",
      "aggregate reports",
      "hashes and dataset manifests",
      "small parser-validation receipts"
    ],
    excluded_outputs: [
      "unauthorized OID-base page bodies",
      "raw Markdown or HTML mirrors",
      "complete JSONL page-body exports without source authorization",
      "credentials, cookies, tokens, account data, or private correspondence"
    ],
    sample_entries: sampleEntries
  };
}

function renderAuthorizedCrawlPlanMarkdown(plan) {
  const gates = (plan.required_gates || []).map((item) => `- ${item}`).join("\n");
  const publishable = (plan.publishable_outputs || []).map((item) => `- ${item}`).join("\n");
  const excluded = (plan.excluded_outputs || []).map((item) => `- ${item}`).join("\n");
  const samples = (plan.sample_entries || [])
    .map((entry) => `- \`${entry.oid}\` -> ${entry.markdown_url}`)
    .join("\n") || "- none";

  return `# Authorized Full Crawl Plan

Generated at: \`${plan.generated_at}\`

## Scope

- Source: ${plan.source}
- Source kind: ${plan.source_kind}
- Entries planned: \`${formatNumber(plan.entry_count)}\`
- Delay between requests: \`${plan.delay_ms} ms\`
- Estimated request time: \`${plan.estimated_request_duration_human}\`

## Output Boundary

- Output directory: \`${plan.output_policy?.output_dir}\`
- Tracked in Git: \`${plan.output_policy?.tracked_in_git}\`
- Publishable without source authorization: \`${plan.output_policy?.publishable_without_source_authorization}\`
- Raw Markdown saved by default: \`${plan.output_policy?.raw_markdown_default}\`

The full crawl output is local operational evidence, not a publishable page-body mirror.

## Required Gates

${gates}

## Publishable Outputs

${publishable}

## Excluded Outputs

${excluded}

## First Planned Entries

${samples}
`;
}

module.exports = {
  buildAuthorizedCrawlPlan,
  formatDuration,
  renderAuthorizedCrawlPlanMarkdown
};
