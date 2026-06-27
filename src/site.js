"use strict";

const fs = require("fs");
const path = require("path");
const { buildClientIntakePack, renderClientIntakeMarkdown } = require("./intakePack");
const { ensureDir } = require("./net");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function percent(part, total) {
  if (!total) return "0.0%";
  return `${((Number(part || 0) / Number(total)) * 100).toFixed(1)}%`;
}

function barRows(items, total, label) {
  return (items || []).slice(0, 12).map((item) => {
    const width = Math.max(2, Math.round((Number(item.count || 0) / Math.max(1, total)) * 100));
    return `<div class="bar-row">
      <span class="bar-label">${escapeHtml(item.key)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${width}%"></span></span>
      <span class="bar-value">${formatNumber(item.count)} ${escapeHtml(label)}</span>
    </div>`;
  }).join("\n");
}

function renderSearchPanel(searchCount) {
  return `<section class="panel search-panel">
      <div>
        <p class="eyebrow">Lookup tool</p>
        <h2>Search enterprise OIDs</h2>
        <p class="panel-copy">Search ${formatNumber(searchCount)} public IANA PEN assignments by enterprise number, OID, or organization name. Contact-level records are not included in this published index.</p>
      </div>
      <label class="search-label" for="pen-search">Search term</label>
      <input id="pen-search" data-search-input type="search" placeholder="Try 9, 1.3.6.1.4.1.9, Cisco, IBM" autocomplete="off">
      <p class="search-count" data-search-count></p>
      <div class="search-results" data-search-results></div>
    </section>`;
}

function renderOidBasePanel(directoryCount) {
  return `<section class="panel search-panel">
      <div>
        <p class="eyebrow">OID-base directory</p>
        <h2>Search sitemap catalog</h2>
        <p class="panel-copy">Search ${formatNumber(directoryCount)} OID-base sitemap entries by OID, root arc, source URL, or last-modified date. This catalog stores directory metadata only and does not copy OID-base page bodies.</p>
      </div>
      <label class="search-label" for="oid-base-search">Search term</label>
      <input id="oid-base-search" data-oidbase-input type="search" placeholder="Try 2.16.840, root:2, 2026, certificate" autocomplete="off">
      <p class="search-count" data-oidbase-count></p>
      <div class="search-results" data-oidbase-results></div>
    </section>`;
}

function renderEditorReviewPathPanel() {
  return `<section class="panel review-path-panel">
      <div>
        <p class="eyebrow">Editor review path</p>
        <h2>Technical writing and documentation samples</h2>
        <p class="panel-copy">A compact review path for editors, DevRel teams, and documentation reviewers who want to evaluate long-form writing, implementation depth, and public verification evidence.</p>
      </div>
      <div class="review-grid">
        <article>
          <span>Long-form sample</span>
          <strong>Observability debugging handoffs</strong>
          <p>Logs, metrics, traces, correlation handles, safe evidence boundaries, and acceptance checks for production integration failures.</p>
          <a href="https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/observability-debugging-handoff-playbook.md">Read sample</a>
        </article>
        <article>
          <span>Submission overview</span>
          <strong>Editor pitch pack</strong>
          <p>Topic fit for developer tooling, DevOps, observability handoffs, release guards, static dashboards, and client-safe evidence workflows.</p>
          <a href="writing-samples.html">Open review path</a>
        </article>
        <article>
          <span>Working proof</span>
          <strong>Public dashboard</strong>
          <p>Runnable data workflow, publishable reports, source boundaries, search surfaces, local audit tools, and release guard checks.</p>
          <a href="https://github.com/OOYXLOO/oid-knowledge-lab">View repository</a>
        </article>
        <article>
          <span>Authenticity proof</span>
          <strong>Implementation-backed samples</strong>
          <p>Public evidence that the article samples are tied to code, generated artifacts, reproducible checks, and publication boundaries.</p>
          <a href="implementation-authenticity-proof.html">Open proof</a>
        </article>
      </div>
    </section>`;
}

function renderAuditPanel() {
  return `<section class="panel audit-panel">
      <div>
        <p class="eyebrow">Asset audit</p>
        <h2>Audit local OID list</h2>
        <p class="panel-copy">Paste CSV or one OID per line. Analysis runs in this browser and is not uploaded.</p>
      </div>
      <label class="search-label" for="asset-audit-input">OID inventory</label>
      <textarea id="asset-audit-input" data-audit-input rows="7" spellcheck="false" placeholder="asset,oid&#10;router-core,1.3.6.1.4.1.9.9.41&#10;sha256-policy,2.16.840.1.101.3.4.2.1"></textarea>
      <div class="audit-actions">
        <button type="button" data-audit-run>Run audit</button>
        <button type="button" data-audit-sample>Load sample</button>
        <button type="button" data-audit-clear>Clear</button>
      </div>
      <div class="audit-summary" data-audit-summary></div>
      <div class="audit-export-actions" aria-label="Assessment exports">
        <button type="button" data-audit-copy-summary>Copy summary</button>
        <button type="button" data-audit-download-markdown>Download Markdown</button>
        <button type="button" data-audit-download-csv>Download CSV</button>
        <button type="button" data-audit-download-json>Download JSON</button>
      </div>
      <p class="audit-status" data-audit-status></p>
      <pre class="audit-handoff" data-audit-handoff></pre>
      <div class="search-results" data-audit-results></div>
    </section>`;
}

function renderSampleAssessmentPanel(assetAudit, coverageReport) {
  if (!assetAudit || !coverageReport) return "";
  const summary = assetAudit.summary || {};
  const coverage = coverageReport.summary || {};
  return `<section class="panel sample-assessment-panel">
      <div>
        <p class="eyebrow">Sample delivery</p>
        <h2>OID inventory assessment sample</h2>
        <p class="panel-copy">Review a sanitized evidence pack that classifies OID rows, separates registry evidence from unresolved items, and keeps client inventory data local.</p>
      </div>
      <div class="mini-metrics">
        <span>Quality score<strong>${escapeHtml(summary.quality_score)}/100</strong></span>
        <span>Evidence-ready assets<strong>${formatNumber(summary.evidence_ready_assets)}</strong></span>
        <span>Unresolved assets<strong>${formatNumber(summary.unresolved_assets)}</strong></span>
        <span>OID-base coverage<strong>${escapeHtml(coverage.coverage_score)}/100</strong></span>
      </div>
      <p><a href="sample-assessment.html">Open sample assessment handoff</a></p>
    </section>`;
}

function renderClientReadinessPanel() {
  return `<section class="panel client-readiness-panel">
      <div>
        <p class="eyebrow">Client readiness</p>
        <h2>OID inventory assessment handoff</h2>
        <p class="panel-copy">Use this page as a public proof surface for a scoped OID inventory review. A client can provide a sanitized CSV locally, run a browser-only audit, and receive an evidence pack without sharing credentials or private exports.</p>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Step</th><th>What is needed</th><th>Output</th></tr></thead>
        <tbody>
          <tr><td>1. Input</td><td>CSV, TSV, or one OID per line; asset labels should be sanitized before review.</td><td>Local-only inventory parsed in the browser or CLI.</td></tr>
          <tr><td>2. Evidence</td><td>IANA PEN index and OID-base sitemap directory metadata.</td><td>Known enterprise roots, directory matches, unresolved OIDs, and malformed values.</td></tr>
          <tr><td>3. Handoff</td><td>Sample assessment page, remediation CSV, and dataset manifest.</td><td>Prioritized cleanup queue plus source boundaries suitable for review.</td></tr>
        </tbody>
      </table>
      <p class="panel-copy"><strong>Acceptance check:</strong> the handoff should identify invalid values, preserve evidence-ready mappings, and list every unresolved OID with a next action. Raw inventories, secrets, account exports, and copied OID-base page bodies stay out of the repository.</p>
      <p><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/client-readiness-pack.md">Client readiness pack</a></p>
    </section>`;
}

function renderVerticalUseCasePanel() {
  return `<section class="panel vertical-fit-panel">
      <div>
        <p class="eyebrow">Use-case fit</p>
        <h2>Vertical use-case fit pack</h2>
        <p class="panel-copy">Map the same assessment engine to SNMP/MIB enterprise OID reviews, PKI certificate policy OID checks, and internal OID registry cleanup without publishing raw client inventories.</p>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Use case</th><th>Input</th><th>Review output</th></tr></thead>
        <tbody>
          <tr><td>SNMP / MIB</td><td>Sanitized device, trap, or MIB OID list.</td><td>PEN owner evidence and unknown enterprise arc queue.</td></tr>
          <tr><td>PKI policy</td><td>Certificate policy, algorithm, or assurance OIDs.</td><td>Registry-backed evidence and documentation gaps.</td></tr>
          <tr><td>Internal registry</td><td>Exported OID spreadsheet with sanitized labels.</td><td>Invalid values, owner-review queue, and re-run checks.</td></tr>
        </tbody>
      </table>
      <p><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/vertical-use-case-pack.md">Vertical use-case fit pack</a></p>
    </section>`;
}

function renderScopeProposalPanel() {
  return `<section class="panel scope-proposal-panel">
      <div>
        <p class="eyebrow">First-scope proposal</p>
        <h2>Scope proposal pack</h2>
        <p class="panel-copy">Translate the sample audit into a small first engagement: client-safe inputs, first 48 hours, acceptance criteria, and excluded data boundaries.</p>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Decision area</th><th>Proposal evidence</th></tr></thead>
        <tbody>
          <tr><td>Start point</td><td>Sanitized OID inventory sample with an explicit <code>oid</code> column.</td></tr>
          <tr><td>First 48 hours</td><td>Inventory shape check, local assessment, action queue, and handoff boundary review.</td></tr>
          <tr><td>Acceptance</td><td>Every row classified as invalid, evidence-ready, or unresolved with a next action.</td></tr>
        </tbody>
      </table>
      <p><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/scope-proposal-pack.md">Scope proposal pack</a></p>
    </section>`;
}

function renderStatementOfWorkPanel() {
  return `<section class="panel statement-of-work-panel">
      <div>
        <p class="eyebrow">Work boundary</p>
        <h2>Statement of work pack</h2>
        <p class="panel-copy">Turn the first-scope proposal into a clean work boundary: objective, schedule, deliverables, client responsibilities, acceptance checklist, change control, and exclusions.</p>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Area</th><th>Boundary</th></tr></thead>
        <tbody>
          <tr><td>Inputs</td><td>Sanitized CSV or TSV inventory with an <code>oid</code> column and safe asset labels.</td></tr>
          <tr><td>Outputs</td><td>Assessment summary, remediation queue, public-source evidence map, and handoff notes.</td></tr>
          <tr><td>Acceptance</td><td>Each row classified with a next action, evidence boundary, and re-run check.</td></tr>
        </tbody>
      </table>
      <p><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/statement-of-work-pack.md">Statement of work pack</a></p>
    </section>`;
}

function renderDecisionOnePagerPanel() {
  return `<section class="panel decision-one-pager-panel">
      <div>
        <p class="eyebrow">Decision summary</p>
        <h2>Decision one-pager</h2>
        <p class="panel-copy">Give a technical owner the first-page answer: why approve a small sanitized OID review, what happens next, which proof links exist, and which data stays out of scope.</p>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Question</th><th>One-page answer</th></tr></thead>
        <tbody>
          <tr><td>Should this proceed?</td><td>Approve a small first review before any broader registry cleanup.</td></tr>
          <tr><td>What is needed?</td><td>Sanitized OID inventory with an <code>oid</code> column and safe labels.</td></tr>
          <tr><td>What is produced?</td><td>Decision-ready summary, remediation queue, public-source evidence map, and re-run notes.</td></tr>
        </tbody>
      </table>
      <p><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/decision-one-pager.md">Decision one-pager</a></p>
    </section>`;
}

function renderClientKickoffPanel() {
  return `<section class="panel client-kickoff-panel">
      <div>
        <p class="eyebrow">Client kickoff</p>
        <h2>Client kickoff pack</h2>
        <p class="panel-copy">Start a first sanitized OID review with a reusable reply, safe intake request, first-call agenda, deliverables preview, acceptance preview, and proof links.</p>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Moment</th><th>Kickoff answer</th></tr></thead>
        <tbody>
          <tr><td>Initial reply</td><td>Recommend a small sanitized review before live cleanup or private access.</td></tr>
          <tr><td>Safe intake</td><td>Ask for an <code>oid</code> column and safe asset labels only.</td></tr>
          <tr><td>First call</td><td>Confirm inventory shape, review lane, unresolved-row handoff, and excluded data.</td></tr>
        </tbody>
      </table>
      <p><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/client-kickoff-pack.md">Client kickoff pack</a></p>
    </section>`;
}

function renderBuyerSignalPanel() {
  return `<section class="panel buyer-signal-panel">
      <div>
        <p class="eyebrow">Buyer signal</p>
        <h2>Buyer signal pack</h2>
        <p class="panel-copy">Turn the sanitized sample assessment into a practical review surface for technical buyers and editors: buyer signals, qualifying questions, subject lines, first-scope offer, proof points, and source-boundary notes.</p>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Use</th><th>What it gives the reviewer</th></tr></thead>
        <tbody>
          <tr><td>First reply</td><td>A compact way to explain why an OID inventory review is worth a small first scope.</td></tr>
          <tr><td>Qualification</td><td>Questions that separate PKI, SNMP/MIB, monitoring, and internal registry cleanup contexts.</td></tr>
          <tr><td>Proof</td><td>Links back to the assessment report, remediation board, decision page, and public sample handoff.</td></tr>
        </tbody>
      </table>
      <p><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/buyer-signal-pack.md">Buyer signal pack</a></p>
    </section>`;
}

function renderArticleSamplesPanel() {
  return `<section class="panel article-samples-panel">
      <div>
        <p class="eyebrow">Technical writing</p>
        <h2>Article samples</h2>
        <p class="panel-copy">Review long-form engineering samples, pitch-ready topic angles, and templates about static evidence dashboards, publish guards, public issue triage, observability handoffs, client-safe data boundaries, and OID inventory assessment workflows.</p>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Sample</th><th>Best-fit reader</th></tr></thead>
        <tbody>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/portfolio-card.md">Portfolio card</a></td><td>Fast writing-positioning overview, best first sample, proof links, and verification boundaries.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/editor-brief.md">Editor brief</a></td><td>Quick topic fit, reader outcomes, proof links, and verification boundaries.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/editor-pitch-pack.md">Editor pitch pack</a></td><td>Publication-ready topic angles mapped to samples, proof links, and safe boundaries.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/implementation-authenticity-proof.md">Implementation authenticity proof</a></td><td>Public trail from working code to generated artifacts to editorial samples, with reproducible checks.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/airbyte-editor-one-pager.md">Airbyte editor one-pager</a></td><td>Fast article-fit review path for a safe registry evidence dashboard and Airbyte-oriented source boundaries.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/civo-editor-one-pager.md">Civo editor one-pager</a></td><td>Kubernetes release evidence tutorial idea with static dashboard and release-guard boundaries.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/draftdev-writer-profile-one-pager.md">Draft.dev writer profile</a></td><td>Implementation-backed writer-network fit, topic lanes, proof links, and delivery style.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/directus-editor-one-pager.md">Directus editor one-pager</a></td><td>Registry evidence review hub idea mapped to Directus collections, permissions, and safe proof pages.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/airbyte-connector-builder-appendix.md">Airbyte Connector Builder appendix</a></td><td>Airbyte-specific adaptation path for Connector Builder, File source, destination shape, and publish-boundary validation.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/submission-landing.md">Submission landing</a></td><td>One-link review path for editor applications, paid writing forms, proof links, and sample fit.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/oid-assessment-client-one-pager.md">OID assessment one-pager</a></td><td>Buyer-readable assessment scope, safe client inputs, deliverables, and acceptance checks.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/certificate-policy-oid-inventory.md">Certificate policy OID inventory</a></td><td>PKI and certificate lifecycle metadata review, renewal-risk triage, and safe policy-OID evidence handling.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/pki-certificate-lifecycle-assessment.md">PKI lifecycle assessment</a></td><td>Metadata-only certificate inventory discovery, owner gaps, renewal risk, and milestone acceptance checks.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/static-evidence-dashboard-github-pages.md">Static evidence dashboard</a></td><td>Node.js, GitHub Pages, manifests, and public release guards.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/public-github-bounty-triage-checklist.md">Public issue triage</a></td><td>Reward signals, queue saturation, acceptance checks, and account-gate boundaries.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/production-integration-debug-handoff.md">Production debug handoff</a></td><td>Observability-oriented handoff notes for logs, metrics, traces, incidents, and safe integration debugging.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/production-integration-handoff-template.md">Integration handoff template</a></td><td>Copyable ticket structure for API, webhook, queue, SaaS sync, and automation failures.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/client-safe-oid-inventory-assessment.md">Client-safe OID assessment</a></td><td>Safe inventory intake, public evidence boundaries, and remediation handoff.</td></tr>
        </tbody>
      </table>
      <p><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/README.md">Article sample index</a></p>
    </section>`;
}

function renderCertificatePolicySamplePanel() {
  return `<section class="panel certificate-policy-sample-panel">
      <div>
        <p class="eyebrow">PKI sample audit</p>
        <h2>Certificate policy OID inventory sample</h2>
        <p class="panel-copy">Review a sanitized X.509 certificate metadata sample, run the policy-OID audit command, and inspect the generated remediation-oriented report without sharing private keys, CA credentials, or production exports.</p>
      </div>
      <table>
        <thead><tr><th>Artifact</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/examples/certificate-policy-assets.csv">Sample CSV</a></td><td>Sanitized certificate metadata with certificate policy OIDs, issuer, expiry, key usage, EKU, source notes, and owner hints.</td></tr>
          <tr><td><code>npm run audit:certificate-policy</code></td><td>Reproducible command that classifies certificate policy OIDs through the same local assessment engine.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/certificate-policy-oid-audit.md">Generated audit report</a></td><td>Derived findings, action plan, registry evidence, invalid-value handling, and safe publication boundary.</td></tr>
          <tr><td><a href="https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/docs/articles/certificate-policy-oid-inventory.md">Article sample</a></td><td>Explains how policy-OID review connects to PKI, certificate lifecycle, renewal risk, and ownership triage.</td></tr>
        </tbody>
      </table>
    </section>`;
}

function renderPublicProofIndexPanel() {
  return `<section class="panel public-proof-index-panel">
      <div>
        <p class="eyebrow">Public proof</p>
        <h2>Public proof index</h2>
        <p class="panel-copy">Use this index as a first review path for editors, reviewers, or technical stakeholders. Every link points to a public page, public source file, or public proof artifact.</p>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Project</th><th>Proof surface</th><th>Review path</th></tr></thead>
        <tbody>
          <tr><td>OID Knowledge Lab</td><td><a href="sample-assessment.html">Sample assessment</a></td><td>Browser-only OID audit, source boundary, generated handoff, and article samples.</td></tr>
          <tr><td>Signal Garden</td><td><a href="https://ooyxloo.github.io/signal-garden/">Playable game</a></td><td><a href="https://ooyxloo.github.io/signal-garden/judge.html">Judge desk</a>, sample route, community proof, and frontend handoff sample.</td></tr>
          <tr><td>Incident Zero Stack</td><td><a href="https://ooyxloo.github.io/incident-zero-stack/">Static incident cockpit</a></td><td><a href="https://raw.githubusercontent.com/OOYXLOO/incident-zero-stack/master/docs/slack_challenge_submission_pack.md">Slack challenge pack</a>, MCP notes, and no-secret handoff boundary.</td></tr>
          <tr><td>Hanzi Scout</td><td><a href="https://ooyxloo.github.io/hanzi-scout/">Playable mini game</a></td><td>Daily goals, share loop, mobile play surface, and publisher handoff notes.</td></tr>
          <tr><td>Helioigma</td><td><a href="https://ooyxloo.github.io/helioigma/">Playable puzzle</a></td><td><a href="https://ooyxloo.github.io/helioigma/judge.html">Judge pack</a>, receipt verifier, source code, and media proof.</td></tr>
        </tbody>
      </table>
      <p class="panel-copy">This page intentionally avoids private account data, credentials, copied page-body mirrors, and unpublished submission material.</p>
    </section>`;
}

function renderClientIntakePackPanel() {
  return `<section class="panel intake-panel">
      <div>
        <p class="eyebrow">Client intake</p>
        <h2>Client-safe intake pack</h2>
        <p class="panel-copy">Copy a short request for a sanitized OID inventory, or download a CSV/Markdown template before running the browser-only audit. The packet defines what to include and what must stay out of the repository.</p>
      </div>
      <div class="audit-actions intake-actions">
        <button type="button" data-intake-copy>Copy intake request</button>
        <button type="button" data-intake-download-markdown>Download intake Markdown</button>
        <button type="button" data-intake-download-csv>Download sample CSV</button>
      </div>
      <p class="audit-status" data-intake-status></p>
      <pre class="audit-handoff intake-preview" data-intake-pack></pre>
    </section>`;
}

function renderActionPlanRows(actionPlan) {
  return (actionPlan || []).map((item) => `<tr>
    <td>${escapeHtml(item.priority)}</td>
    <td>${escapeHtml(item.title)}</td>
    <td>${formatNumber(item.count)}</td>
    <td>${escapeHtml(item.action)}</td>
  </tr>`).join("\n");
}

function renderFindingRows(findings) {
  return (findings || []).slice(0, 12).map((finding) => `<tr>
    <td>${escapeHtml(finding.label)}</td>
    <td><code>${escapeHtml(finding.oid)}</code></td>
    <td><span class="status-badge">${escapeHtml(finding.status)}</span></td>
    <td>${escapeHtml(finding.risk)}</td>
    <td>${escapeHtml(finding.enterprise ? finding.enterprise.organization : "")}${finding.oidbase_match ? `<a href="${escapeHtml(finding.oidbase_match.source_url)}">OID-base source</a>` : ""}</td>
  </tr>`).join("\n");
}

function renderSampleAssessmentPage({ assetAudit, coverageReport }) {
  const summary = assetAudit.summary || {};
  const coverage = coverageReport.summary || {};
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OID Inventory Assessment Sample</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">Sample evidence handoff</p>
      <h1>OID inventory assessment sample</h1>
      <p class="summary">A sanitized example of how OID Knowledge Lab turns a local OID inventory into registry evidence, cleanup priorities, and a client-safe remediation queue. No client data, credentials, contact fields, or OID-base page bodies are published here.</p>
      <div class="links">
        <a href="index.html">Dashboard</a>
        <a href="../reports/sample-delivery-pack.md">Markdown delivery pack</a>
        <a href="../reports/remediation-board.csv">Remediation CSV</a>
        <a href="../reports/dataset-manifest.json">Dataset manifest</a>
      </div>
    </section>

    <section class="metrics" aria-label="Assessment metrics">
      <article><span>Assets reviewed</span><strong>${formatNumber(summary.total_assets)}</strong></article>
      <article><span>Valid OIDs</span><strong>${formatNumber(summary.valid_oids)}</strong></article>
      <article><span>Evidence-ready</span><strong>${formatNumber(summary.evidence_ready_assets)}</strong></article>
      <article><span>Quality score</span><strong>${escapeHtml(summary.quality_score)}/100</strong></article>
    </section>

    <section class="panel">
      <div>
        <p class="eyebrow">Decision summary</p>
        <h2>What the sample assessment proves</h2>
      </div>
      <p class="panel-copy">The assessment separates malformed values, known private enterprise roots, exact OID-base sitemap evidence, and valid-but-unresolved OIDs. That makes the next action clear without uploading a private inventory or mirroring source pages.</p>
      <div class="mini-metrics">
        <span>Invalid values<strong>${formatNumber(summary.invalid_values)}</strong></span>
        <span>Known enterprises<strong>${formatNumber(summary.known_enterprises)}</strong></span>
        <span>OID-base matches<strong>${formatNumber(summary.oidbase_directory_matches)}</strong></span>
        <span>Coverage score<strong>${escapeHtml(coverage.coverage_score)}/100</strong></span>
      </div>
    </section>

    <section class="panel">
      <div>
        <p class="eyebrow">Action plan</p>
        <h2>Cleanup queue</h2>
      </div>
      <table>
        <thead><tr><th>Priority</th><th>Action</th><th>Count</th><th>Delivery note</th></tr></thead>
        <tbody>${renderActionPlanRows(assetAudit.action_plan)}</tbody>
      </table>
    </section>

    <section class="panel client-readiness-panel">
      <div>
        <p class="eyebrow">Engagement scope</p>
        <h2>How to use this sample with a real inventory</h2>
      </div>
      <table class="handoff-table">
        <thead><tr><th>Phase</th><th>Boundary</th><th>Review proof</th></tr></thead>
        <tbody>
          <tr><td>Prepare</td><td>Sanitize asset labels and keep the raw inventory local.</td><td>Input shape: CSV, TSV, or one OID per line.</td></tr>
          <tr><td>Classify</td><td>Use public IANA PEN data and OID-base sitemap metadata only.</td><td>Finding status, registry evidence, and unresolved review queue.</td></tr>
          <tr><td>Deliver</td><td>Share derived findings, not credentials or private exports.</td><td>Markdown pack, remediation CSV, and browser-readable handoff page.</td></tr>
        </tbody>
      </table>
      <p class="panel-copy"><strong>Acceptance check:</strong> a reviewer should be able to see what changed, which OIDs need action, what evidence supports each row, and what data was deliberately excluded.</p>
    </section>

    <section class="panel">
      <div>
        <p class="eyebrow">Sample findings</p>
        <h2>Evidence mapping</h2>
      </div>
      <table>
        <thead><tr><th>Asset</th><th>OID</th><th>Status</th><th>Risk</th><th>Evidence</th></tr></thead>
        <tbody>${renderFindingRows(assetAudit.findings)}</tbody>
      </table>
    </section>

    <section class="note">
      <h2>Client data boundary</h2>
      <p>Client inventories should be processed locally or in the browser. Raw client OID lists, credentials, session data, private account exports, and contact-level registry fields do not belong in this repository.</p>
      <p>OID-base use is limited to sitemap metadata in this publishable package. Full page-body collection requires explicit source-owner authorization.</p>
    </section>
  </main>
</body>
</html>`;
}

function renderDashboard(report, oidBaseDirectoryCount = 0, sampleAssessment = null) {
  const assigned = Number(report.assigned_count || 0);
  const total = Number(report.record_count || 0);
  const reserved = Number(report.reserved_count || 0);
  const domainMax = Math.max(...(report.top_email_domains || []).map((item) => Number(item.count || 0)), 1);
  const initialMax = Math.max(...(report.organization_initials || []).map((item) => Number(item.count || 0)), 1);
  const samples = (report.sample_organizations || []).slice(0, 16).map((item) => `<tr>
    <td>${formatNumber(item.enterprise_number)}</td>
    <td><code>${escapeHtml(item.oid)}</code></td>
    <td>${escapeHtml(item.organization)}</td>
  </tr>`).join("\n");

  const searchCount = Number(report.search_index_count || report.assigned_count || 0);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OID Knowledge Lab</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">OID Knowledge Lab</p>
      <h1>OID and enterprise registry dashboard</h1>
      <p class="summary">A compact, publishable workspace for <code>${escapeHtml(report.prefix)}</code> enterprise OIDs and OID-base directory coverage. It combines open IANA data with sitemap-level OID-base metadata.</p>
      <div class="links">
        <a href="${escapeHtml(report.source_url)}">IANA source</a>
        <a href="${escapeHtml(report.license_url)}">Licensing terms</a>
        <a href="https://oid-base.com/sitemap.xml">OID-base sitemap</a>
        <a href="consulting-brief.html">Assessment brief</a>
        <a href="writing-samples.html">Writing samples</a>
        <a href="implementation-authenticity-proof.html">Implementation proof</a>
      </div>
    </section>

    <section class="metrics" aria-label="Registry metrics">
      <article><span>Total records</span><strong>${formatNumber(total)}</strong></article>
      <article><span>Assigned</span><strong>${formatNumber(assigned)}</strong><small>${percent(assigned, total)}</small></article>
      <article><span>Reserved</span><strong>${formatNumber(reserved)}</strong><small>${percent(reserved, total)}</small></article>
      <article><span>OID-base entries</span><strong>${formatNumber(oidBaseDirectoryCount)}</strong></article>
    </section>

    ${renderEditorReviewPathPanel()}

    <section class="panel">
      <div>
        <p class="eyebrow">Contact-domain aggregate</p>
        <h2>Top public email domains</h2>
      </div>
      <div class="bars">${barRows(report.top_email_domains, domainMax, "records")}</div>
    </section>

    <section class="panel">
      <div>
        <p class="eyebrow">Organization aggregate</p>
        <h2>Leading organization initials</h2>
      </div>
      <div class="bars">${barRows(report.organization_initials, initialMax, "orgs")}</div>
    </section>

    ${renderSearchPanel(searchCount)}

    ${renderOidBasePanel(oidBaseDirectoryCount)}

    ${renderAuditPanel()}

    ${renderSampleAssessmentPanel(sampleAssessment?.assetAudit, sampleAssessment?.coverageReport)}

    ${renderClientIntakePackPanel()}

    ${renderDecisionOnePagerPanel()}

    ${renderClientKickoffPanel()}

    ${renderBuyerSignalPanel()}

    ${renderArticleSamplesPanel()}

    ${renderCertificatePolicySamplePanel()}

    ${renderPublicProofIndexPanel()}

    ${renderClientReadinessPanel()}

    ${renderVerticalUseCasePanel()}

    ${renderScopeProposalPanel()}

    ${renderStatementOfWorkPanel()}

    <section class="panel">
      <div>
        <p class="eyebrow">Sample lookup surface</p>
        <h2>First organizations in the registry</h2>
      </div>
      <table>
        <thead><tr><th>Number</th><th>OID</th><th>Organization</th></tr></thead>
        <tbody>${samples}</tbody>
      </table>
    </section>

    <section class="note">
      <h2>Data boundary</h2>
      <p>${escapeHtml(report.license_summary)}</p>
      <p>Generated from a local aggregate report at ${escapeHtml(report.generated_at)}. Full JSONL imports and contact-level records are kept out of the published dashboard.</p>
    </section>
  </main>
  <script src="data.js"></script>
  <script src="search-index.js"></script>
  <script src="oid-base-directory.js"></script>
  <script src="intake-pack.js"></script>
  <script src="app.js"></script>
</body>
</html>`;
}

function renderCss() {
  return `:root {
  color-scheme: light;
  --ink: #17202a;
  --muted: #5d6d7e;
  --line: #d8dee9;
  --paper: #f7f9fb;
  --accent: #1f7a8c;
  --accent-2: #bf5b04;
  --white: #ffffff;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--ink);
  background: var(--paper);
}
main {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0 48px;
}
.hero {
  padding: 28px 0 18px;
  border-bottom: 1px solid var(--line);
}
.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}
h1, h2, p { margin-top: 0; }
h1 {
  max-width: 820px;
  font-size: 2.5rem;
  line-height: 1.05;
  letter-spacing: 0;
}
h2 {
  font-size: 1.15rem;
  letter-spacing: 0;
}
.summary {
  max-width: 780px;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.55;
}
.links { display: flex; flex-wrap: wrap; gap: 10px; }
a {
  color: var(--accent);
  font-weight: 700;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0;
}
.metrics article, .panel, .note {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.metrics article {
  padding: 16px;
  min-height: 104px;
}
.metrics span, .metrics small {
  display: block;
  color: var(--muted);
  font-size: 0.84rem;
}
.metrics strong {
  display: block;
  margin-top: 12px;
  font-size: 1.75rem;
}
.panel, .note {
  margin-top: 16px;
  padding: 20px;
}
.panel-copy {
  max-width: 760px;
  color: var(--muted);
  line-height: 1.55;
}
.search-label {
  display: block;
  margin: 12px 0 6px;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 700;
}
.search-panel input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  font: inherit;
}
.audit-panel textarea {
  width: 100%;
  min-height: 148px;
  resize: vertical;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  background: var(--white);
  font: 0.92rem/1.45 "SFMono-Regular", Consolas, monospace;
}
.audit-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.audit-actions button, .audit-export-actions button {
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  background: #eef4f6;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.audit-actions button:hover, .audit-export-actions button:hover {
  border-color: var(--accent);
}
.audit-export-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0 4px;
}
.audit-export-actions button {
  background: #fff8ee;
}
.audit-status {
  min-height: 20px;
  margin: 8px 0 0;
  color: var(--accent);
  font-size: 0.88rem;
  font-weight: 700;
}
.audit-handoff {
  display: none;
  max-height: 260px;
  overflow: auto;
  margin: 10px 0 0;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfd;
  color: var(--ink);
  font: 0.84rem/1.45 "SFMono-Regular", Consolas, monospace;
  white-space: pre-wrap;
}
.audit-handoff.is-visible {
  display: block;
}
.audit-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 14px 0 6px;
}
.audit-summary span {
  display: block;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfd;
  color: var(--muted);
  font-size: 0.82rem;
}
.audit-summary strong {
  display: block;
  margin-top: 4px;
  color: var(--ink);
  font-size: 1.25rem;
}
.mini-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 14px 0;
}
.mini-metrics span {
  display: block;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfd;
  color: var(--muted);
  font-size: 0.84rem;
}
.mini-metrics strong {
  display: block;
  margin-top: 6px;
  color: var(--ink);
  font-size: 1.25rem;
}
.review-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.review-grid article {
  min-height: 210px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfd;
}
.review-grid span {
  display: block;
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
}
.review-grid strong {
  display: block;
  margin-top: 8px;
  font-size: 1.02rem;
}
.review-grid p {
  min-height: 74px;
  margin: 10px 0 12px;
  color: var(--muted);
  line-height: 1.45;
}
.decision-strip, .queue-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}
.decision-strip {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.queue-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.decision-strip article, .queue-list article {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfd;
}
.decision-strip span, .queue-list span {
  display: block;
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
}
.decision-strip strong, .queue-list strong {
  display: block;
  margin-top: 8px;
  font-size: 1.02rem;
}
.decision-strip p, .queue-list p {
  margin: 10px 0 12px;
  color: var(--muted);
  line-height: 1.45;
}
.status-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 999px;
  background: #eef4f6;
  color: var(--ink);
  font-size: 0.78rem;
  font-weight: 700;
}
.search-count {
  margin: 10px 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.search-results {
  overflow-x: auto;
}
.bar-row {
  display: grid;
  grid-template-columns: minmax(100px, 180px) 1fr minmax(92px, auto);
  gap: 12px;
  align-items: center;
  min-height: 30px;
}
.bar-label, .bar-value {
  color: var(--muted);
  font-size: 0.88rem;
}
.bar-track {
  position: relative;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e9edf2;
}
.bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
th, td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}
.handoff-table td:first-child {
  width: 132px;
  color: var(--accent);
  font-weight: 700;
}
code {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.9em;
}
.note {
  color: var(--muted);
}
@media (max-width: 760px) {
  main { width: min(100% - 20px, 1120px); padding-top: 18px; }
  h1 { font-size: 1.8rem; }
  .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .audit-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mini-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .review-grid { grid-template-columns: 1fr; }
  .decision-strip { grid-template-columns: 1fr; }
  .queue-list { grid-template-columns: 1fr; }
  .review-grid article { min-height: auto; }
  .review-grid p { min-height: auto; }
  .bar-row { grid-template-columns: 1fr; gap: 5px; margin-bottom: 12px; }
  table { display: block; overflow-x: auto; }
}
@media (max-width: 480px) {
  .metrics { grid-template-columns: 1fr; }
  .metrics article { min-height: auto; }
  .metrics strong { font-size: 1.45rem; }
}
`;
}

function renderAppJs() {
  return `(function () {
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const count = document.querySelector("[data-search-count]");
  const oidBaseInput = document.querySelector("[data-oidbase-input]");
  const oidBaseResults = document.querySelector("[data-oidbase-results]");
  const oidBaseCount = document.querySelector("[data-oidbase-count]");
  const auditInput = document.querySelector("[data-audit-input]");
  const auditRun = document.querySelector("[data-audit-run]");
  const auditSample = document.querySelector("[data-audit-sample]");
  const auditClear = document.querySelector("[data-audit-clear]");
  const auditCopySummary = document.querySelector("[data-audit-copy-summary]");
  const auditDownloadMarkdown = document.querySelector("[data-audit-download-markdown]");
  const auditDownloadCsv = document.querySelector("[data-audit-download-csv]");
  const auditDownloadJson = document.querySelector("[data-audit-download-json]");
  const auditSummary = document.querySelector("[data-audit-summary]");
  const auditResults = document.querySelector("[data-audit-results]");
  const auditStatus = document.querySelector("[data-audit-status]");
  const auditHandoff = document.querySelector("[data-audit-handoff]");
  const intakePackPreview = document.querySelector("[data-intake-pack]");
  const intakeCopy = document.querySelector("[data-intake-copy]");
  const intakeDownloadMarkdown = document.querySelector("[data-intake-download-markdown]");
  const intakeDownloadCsv = document.querySelector("[data-intake-download-csv]");
  const intakeStatus = document.querySelector("[data-intake-status]");
  const index = Array.isArray(window.OID_KNOWLEDGE_INDEX) ? window.OID_KNOWLEDGE_INDEX : [];
  const oidBaseDirectory = Array.isArray(window.OID_BASE_DIRECTORY) ? window.OID_BASE_DIRECTORY : [];
  const intakePack = window.OID_CLIENT_INTAKE_PACK || null;
  const penByNumber = new Map(index.map((record) => [Number(record.number), record]));
  const oidBaseByOid = new Map(oidBaseDirectory.map((record) => [String(record.oid), record]));
  const privateEnterprisePrefix = "1.3.6.1.4.1";
  const oidPattern = /^(?:0|1|2)(?:\\.\\d+)*$/;
  let latestHandoff = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function matches(record, query) {
    if (!query) return true;
    return String(record.number).includes(query) ||
      normalize(record.oid).includes(query) ||
      normalize(record.organization).includes(query);
  }

  function matchesOidBase(record, query) {
    if (!query) return true;
    const normalizedQuery = query.replace(/^root:/, "");
    return normalize(record.oid).includes(query) ||
      normalize(record.source_url).includes(query) ||
      normalize(record.markdown_url).includes(query) ||
      normalize(record.sitemap_lastmod).includes(query) ||
      normalize(record.root_arc).includes(normalizedQuery);
  }

  function splitAuditRow(line) {
    return String(line).includes("\\t")
      ? String(line).split("\\t").map((part) => part.trim())
      : String(line).split(",").map((part) => part.trim());
  }

  function looksLikeAuditHeader(parts) {
    return parts.some((part) => ["oid", "object_identifier", "object identifier"].includes(normalize(part)));
  }

  function parseAuditRows(text) {
    const lines = String(text || "").split(/\\r?\\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    if (lines.length === 0) return [];

    let headers = null;
    let startIndex = 0;
    const firstParts = splitAuditRow(lines[0]);
    if (firstParts.length > 1 && looksLikeAuditHeader(firstParts)) {
      headers = firstParts.map((part) => normalize(part));
      startIndex = 1;
    }

    return lines.slice(startIndex).map((line, index) => {
      const parts = splitAuditRow(line);
      const oidIndex = headers ? headers.findIndex((header) => ["oid", "object_identifier", "object identifier"].includes(header)) : (parts.length > 1 ? 1 : 0);
      const labelIndex = headers ? headers.findIndex((header) => ["asset", "name", "id", "label"].includes(header)) : (parts.length > 1 ? 0 : -1);
      return {
        index: index + 1,
        label: labelIndex >= 0 ? parts[labelIndex] || "asset-" + (index + 1) : "asset-" + (index + 1),
        oid: parts[oidIndex] || line
      };
    });
  }

  function privateEnterpriseNumber(oid) {
    const prefix = privateEnterprisePrefix + ".";
    if (!String(oid).startsWith(prefix)) return null;
    const segment = String(oid).slice(prefix.length).split(".")[0];
    return /^\\d+$/.test(segment) ? Number(segment) : null;
  }

  function analyzeAuditRows(rows) {
    const findings = rows.map((row) => {
      const oid = String(row.oid || "").trim();
      const valid = oidPattern.test(oid);
      if (!valid) {
        return Object.assign({}, row, {
          oid,
          status: "invalid_value",
          risk: "high",
          enterprise: null,
          oidbase_match: null
        });
      }
      const enterpriseNumber = privateEnterpriseNumber(oid);
      const enterprise = enterpriseNumber == null ? null : penByNumber.get(enterpriseNumber) || null;
      const oidbaseMatch = oidBaseByOid.get(oid) || null;
      const status = oidbaseMatch
        ? "oidbase_directory_match"
        : enterprise
          ? "known_private_enterprise_oid"
          : enterpriseNumber == null
            ? "valid_oid_unmatched"
            : "unknown_private_enterprise_oid";
      return Object.assign({}, row, {
        oid,
        status,
        risk: status === "unknown_private_enterprise_oid" ? "medium" : "low",
        enterprise,
        oidbase_match: oidbaseMatch
      });
    });
    const invalid = findings.filter((item) => item.status === "invalid_value").length;
    const known = findings.filter((item) => item.enterprise).length;
    const oidBaseMatches = findings.filter((item) => item.oidbase_match).length;
    const unresolved = findings.filter((item) => ["invalid_value", "unknown_private_enterprise_oid", "valid_oid_unmatched"].includes(item.status)).length;
    const unknownPrivate = findings.filter((item) => item.status === "unknown_private_enterprise_oid").length;
    const validUnmatched = findings.filter((item) => item.status === "valid_oid_unmatched").length;
    const score = Math.max(0, Math.min(100, Math.round(100 - invalid * 15 - findings.filter((item) => item.status === "unknown_private_enterprise_oid").length * 10 - findings.filter((item) => item.status === "valid_oid_unmatched").length * 7)));
    return {
      generated_at: new Date().toISOString(),
      source_kind: "browser local OID asset list",
      summary: {
        total_assets: findings.length,
        valid_oids: findings.length - invalid,
        invalid_values: invalid,
        private_enterprise_oids: findings.filter((item) => privateEnterpriseNumber(item.oid) != null).length,
        known_enterprises: known,
        oidbase_directory_matches: oidBaseMatches,
        evidence_ready_assets: findings.filter((item) => item.enterprise || item.oidbase_match).length,
        unresolved_assets: unresolved,
        unknown_private_enterprise_oids: unknownPrivate,
        valid_oid_unmatched: validUnmatched,
        high_risk_findings: findings.filter((item) => item.risk === "high").length,
        medium_risk_findings: findings.filter((item) => item.risk === "medium").length,
        quality_score: score
      },
      findings
    };
  }

  function csvCell(value) {
    const text = String(value == null ? "" : value);
    return /[",\\r\\n]/.test(text) ? "\\"" + text.replace(/"/g, "\\"\\"") + "\\"" : text;
  }

  function nextActionForFinding(finding) {
    if (finding.status === "invalid_value") return "Correct the malformed OID value before using this row as evidence.";
    if (finding.status === "unknown_private_enterprise_oid") return "Identify the private enterprise owner from vendor or internal registration records.";
    if (finding.status === "valid_oid_unmatched") return "Confirm whether this valid OID is internal, deprecated, or covered by another registry.";
    return "Preserve the public registry evidence with the asset record.";
  }

  function renderAuditCsv(audit) {
    const rows = [[
      "index",
      "label",
      "oid",
      "status",
      "risk",
      "enterprise",
      "oidbase_source",
      "next_action"
    ]].concat(audit.findings.map((finding) => [
      finding.index,
      finding.label,
      finding.oid,
      finding.status,
      finding.risk,
      finding.enterprise ? finding.enterprise.organization : "",
      finding.oidbase_match ? finding.oidbase_match.source_url : "",
      nextActionForFinding(finding)
    ]));
    return rows.map((row) => row.map(csvCell).join(",")).join("\\n") + "\\n";
  }

  function buildSummaryText(audit) {
    const summary = audit.summary;
    return [
      "OID inventory assessment handoff",
      "Quality score: " + summary.quality_score + "/100",
      "Assets reviewed: " + summary.total_assets,
      "Evidence-ready assets: " + summary.evidence_ready_assets,
      "Unresolved assets: " + summary.unresolved_assets,
      "Invalid values: " + summary.invalid_values,
      "Unknown private enterprise OIDs: " + summary.unknown_private_enterprise_oids,
      "Client data boundary: derived findings only; raw inventories, credentials, private exports, and copied OID-base page bodies stay out of this package."
    ].join("\\n");
  }

  function markdownRow(values) {
    return "| " + values.map((value) => String(value == null ? "" : value).replace(/\\|/g, "\\\\|")).join(" | ") + " |";
  }

  function buildAssessmentHandoff(audit) {
    const summaryText = buildSummaryText(audit);
    const markdown = [
      "# OID Inventory Assessment Handoff",
      "",
      "Generated at: " + audit.generated_at,
      "",
      "## Decision summary",
      "",
      summaryText.split("\\n").map((line) => "- " + line).join("\\n"),
      "",
      "## Derived findings",
      "",
      "| # | Asset | OID | Status | Risk | Enterprise | OID-base source | Next action |",
      "|---|---|---|---|---|---|---|---|",
      audit.findings.map((finding) => markdownRow([
        finding.index,
        finding.label,
        finding.oid,
        finding.status,
        finding.risk,
        finding.enterprise ? finding.enterprise.organization : "",
        finding.oidbase_match ? finding.oidbase_match.source_url : "",
        nextActionForFinding(finding)
      ])).join("\\n"),
      "",
      "## Client data boundary",
      "",
      "This handoff contains derived findings only. Raw inventories, credentials, private account exports, contact-level registry records, and copied OID-base page bodies should not be published in this repository.",
      ""
    ].join("\\n");
    return {
      generated_at: audit.generated_at,
      source_kind: audit.source_kind,
      summary_text: summaryText,
      markdown,
      csv: renderAuditCsv(audit),
      summary: audit.summary,
      findings: audit.findings
    };
  }

  function setAuditStatus(message) {
    if (auditStatus) auditStatus.textContent = message || "";
  }

  function setIntakeStatus(message) {
    if (intakeStatus) intakeStatus.textContent = message || "";
  }

  function downloadText(filename, mimeType, text) {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderAudit() {
    if (!auditInput || !auditSummary || !auditResults) return;
    const rows = parseAuditRows(auditInput.value);
    if (rows.length === 0) {
      latestHandoff = null;
      auditSummary.innerHTML = "";
      auditResults.innerHTML = "";
      if (auditHandoff) {
        auditHandoff.textContent = "";
        auditHandoff.classList.remove("is-visible");
      }
      setAuditStatus("");
      return;
    }
    const audit = analyzeAuditRows(rows);
    latestHandoff = buildAssessmentHandoff(audit);
    auditSummary.innerHTML =
      "<span>Total<strong>" + audit.summary.total_assets.toLocaleString("en-US") + "</strong></span>" +
      "<span>Valid OIDs<strong>" + audit.summary.valid_oids.toLocaleString("en-US") + "</strong></span>" +
      "<span>Evidence matches<strong>" + (audit.summary.known_enterprises + audit.summary.oidbase_directory_matches).toLocaleString("en-US") + "</strong></span>" +
      "<span>Quality score<strong>" + audit.summary.quality_score + "/100</strong></span>";
    if (auditHandoff) {
      auditHandoff.textContent = latestHandoff.summary_text;
      auditHandoff.classList.add("is-visible");
    }
    setAuditStatus("Assessment handoff is ready for copy or local download.");
    const shown = audit.findings.slice(0, 50);
    auditResults.innerHTML = "<table><thead><tr><th>Asset</th><th>OID</th><th>Status</th><th>Enterprise</th><th>OID-base</th><th>Risk</th></tr></thead><tbody>" +
      shown.map((finding) => "<tr><td>" + escapeHtml(finding.label) + "</td><td><code>" + escapeHtml(finding.oid) + "</code></td><td><span class=\\"status-badge\\">" + escapeHtml(finding.status) + "</span></td><td>" + escapeHtml(finding.enterprise ? finding.enterprise.organization : "") + "</td><td>" + (finding.oidbase_match ? "<a href=\\"" + escapeHtml(finding.oidbase_match.source_url) + "\\">source</a>" : "") + "</td><td>" + escapeHtml(finding.risk) + "</td></tr>").join("") +
      "</tbody></table>";
  }

  function renderIntakePreview() {
    if (!intakePackPreview || !intakePack) return;
    intakePackPreview.textContent = intakePack.copy_text || "";
    intakePackPreview.classList.add("is-visible");
  }

  function ensureHandoff() {
    if (!latestHandoff) renderAudit();
    if (!latestHandoff) setAuditStatus("Paste or load an OID inventory before exporting.");
    return latestHandoff;
  }

  function renderPen() {
    if (!input || !results || !count) return;
    const query = normalize(input.value);
    const matchesList = index.filter((record) => matches(record, query));
    const shown = matchesList.slice(0, query ? 25 : 12);
    count.textContent = query
      ? "Showing " + shown.length.toLocaleString("en-US") + " of " + matchesList.length.toLocaleString("en-US") + " matches"
      : "Showing first " + shown.length.toLocaleString("en-US") + " of " + index.length.toLocaleString("en-US") + " searchable assignments";
    results.innerHTML = "<table><thead><tr><th>Number</th><th>OID</th><th>Organization</th></tr></thead><tbody>" +
      shown.map((record) => "<tr><td>" + Number(record.number).toLocaleString("en-US") + "</td><td><code>" + escapeHtml(record.oid) + "</code></td><td>" + escapeHtml(record.organization) + "</td></tr>").join("") +
      "</tbody></table>";
  }

  function renderOidBase() {
    if (!oidBaseInput || !oidBaseResults || !oidBaseCount) return;
    const query = normalize(oidBaseInput.value);
    const matchesList = oidBaseDirectory.filter((record) => matchesOidBase(record, query));
    const shown = matchesList.slice(0, query ? 25 : 12);
    oidBaseCount.textContent = query
      ? "Showing " + shown.length.toLocaleString("en-US") + " of " + matchesList.length.toLocaleString("en-US") + " matches"
      : "Showing first " + shown.length.toLocaleString("en-US") + " of " + oidBaseDirectory.length.toLocaleString("en-US") + " sitemap entries";
    oidBaseResults.innerHTML = "<table><thead><tr><th>OID</th><th>Depth</th><th>Last modified</th><th>Source</th></tr></thead><tbody>" +
      shown.map((record) => "<tr><td><code>" + escapeHtml(record.oid) + "</code></td><td>" + escapeHtml(record.depth) + "</td><td>" + escapeHtml(record.sitemap_lastmod || "") + "</td><td><a href=\\"" + escapeHtml(record.source_url) + "\\">source</a></td></tr>").join("") +
      "</tbody></table>";
  }

  if (input) input.addEventListener("input", renderPen);
  if (oidBaseInput) oidBaseInput.addEventListener("input", renderOidBase);
  if (auditRun) auditRun.addEventListener("click", renderAudit);
  if (intakeCopy) intakeCopy.addEventListener("click", function () {
    if (!intakePack) {
      setIntakeStatus("Intake pack is unavailable on this page.");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(intakePack.copy_text || "").then(function () {
        setIntakeStatus("Intake request copied to clipboard.");
      }).catch(function () {
        setIntakeStatus("Copy failed. The intake request remains visible for manual selection.");
      });
    } else {
      setIntakeStatus("Clipboard API unavailable. The intake request remains visible for manual selection.");
    }
  });
  if (intakeDownloadMarkdown) intakeDownloadMarkdown.addEventListener("click", function () {
    if (intakePack) {
      downloadText("oid-assessment-intake-pack.md", "text/markdown;charset=utf-8", intakePack.markdown || intakePack.copy_text || "");
      setIntakeStatus("Intake Markdown download started.");
    }
  });
  if (intakeDownloadCsv) intakeDownloadCsv.addEventListener("click", function () {
    if (intakePack) {
      downloadText("oid-assessment-sample-input.csv", "text/csv;charset=utf-8", intakePack.sample_csv || "");
      setIntakeStatus("Intake CSV download started.");
    }
  });
  if (auditCopySummary) auditCopySummary.addEventListener("click", function () {
    const handoff = ensureHandoff();
    if (!handoff) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(handoff.summary_text).then(function () {
        setAuditStatus("Summary copied to clipboard.");
      }).catch(function () {
        setAuditStatus("Copy failed. The summary remains visible for manual selection.");
      });
    } else {
      setAuditStatus("Clipboard API unavailable. The summary remains visible for manual selection.");
    }
  });
  if (auditDownloadMarkdown) auditDownloadMarkdown.addEventListener("click", function () {
    const handoff = ensureHandoff();
    if (handoff) downloadText("oid-assessment-handoff.md", "text/markdown;charset=utf-8", handoff.markdown);
  });
  if (auditDownloadCsv) auditDownloadCsv.addEventListener("click", function () {
    const handoff = ensureHandoff();
    if (handoff) downloadText("oid-assessment-findings.csv", "text/csv;charset=utf-8", handoff.csv);
  });
  if (auditDownloadJson) auditDownloadJson.addEventListener("click", function () {
    const handoff = ensureHandoff();
    if (handoff) downloadText("oid-assessment-handoff.json", "application/json;charset=utf-8", JSON.stringify(handoff, null, 2) + "\\n");
  });
  if (auditSample && auditInput) auditSample.addEventListener("click", function () {
    auditInput.value = "asset,oid\\nrouter-core,1.3.6.1.4.1.9.9.41\\nsha256-policy,2.16.840.1.101.3.4.2.1\\nunknown-enterprise,1.3.6.1.4.1.999999.1\\nbad-row,not-an-oid";
    renderAudit();
  });
  if (auditClear && auditInput) auditClear.addEventListener("click", function () {
    auditInput.value = "";
    renderAudit();
  });
  renderPen();
  renderOidBase();
  renderAudit();
  renderIntakePreview();
}());
`;
}

function readSearchIndex(indexFile, report) {
  if (indexFile && fs.existsSync(indexFile)) {
    return JSON.parse(fs.readFileSync(indexFile, "utf8"));
  }
  return (report.sample_organizations || []).map((record) => ({
    number: record.enterprise_number,
    oid: record.oid,
    organization: record.organization
  }));
}

function readOidBaseDirectory(sitemapFile) {
  if (!sitemapFile || !fs.existsSync(sitemapFile)) return [];
  const catalog = JSON.parse(fs.readFileSync(sitemapFile, "utf8"));
  return (catalog.entries || []).map((entry) => ({
    oid: entry.oid,
    source_url: entry.source_url,
    markdown_url: entry.markdown_url,
    sitemap_lastmod: entry.sitemap_lastmod,
    root_arc: entry.root_arc,
    depth: entry.depth
  }));
}

function readOptionalJson(file) {
  if (!file || !fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function buildSite({ indexFile, reportFile, sitemapFile, assetAuditFile, coverageReportFile, outDir }) {
  const report = JSON.parse(fs.readFileSync(reportFile, "utf8"));
  const searchIndex = readSearchIndex(indexFile, report);
  const oidBaseDirectory = readOidBaseDirectory(sitemapFile);
  const sampleAssessment = {
    assetAudit: readOptionalJson(assetAuditFile),
    coverageReport: readOptionalJson(coverageReportFile)
  };
  const intakePack = buildClientIntakePack({ generatedAt: report.generated_at });
  intakePack.markdown = renderClientIntakeMarkdown(intakePack);
  report.search_index_count = searchIndex.length;
  report.oid_base_directory_count = oidBaseDirectory.length;
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, "index.html"), renderDashboard(report, oidBaseDirectory.length, sampleAssessment), "utf8");
  fs.writeFileSync(path.join(outDir, "styles.css"), renderCss(), "utf8");
  fs.writeFileSync(path.join(outDir, "data.js"), `window.OID_KNOWLEDGE_REPORT = ${JSON.stringify(report, null, 2)};\n`, "utf8");
  fs.writeFileSync(path.join(outDir, "search-index.js"), `window.OID_KNOWLEDGE_INDEX = ${JSON.stringify(searchIndex)};\n`, "utf8");
  fs.writeFileSync(path.join(outDir, "oid-base-directory.js"), `window.OID_BASE_DIRECTORY = ${JSON.stringify(oidBaseDirectory)};\n`, "utf8");
  fs.writeFileSync(path.join(outDir, "intake-pack.js"), `window.OID_CLIENT_INTAKE_PACK = ${JSON.stringify(intakePack, null, 2)};\n`, "utf8");
  fs.writeFileSync(path.join(outDir, "app.js"), renderAppJs(), "utf8");
  const consultingBriefSource = path.join(__dirname, "..", "public", "consulting-brief.html");
  const consultingBriefTarget = path.join(outDir, "consulting-brief.html");
  if (path.resolve(consultingBriefSource) !== path.resolve(consultingBriefTarget)) {
    fs.copyFileSync(consultingBriefSource, consultingBriefTarget);
  }
  const outputFiles = ["index.html", "consulting-brief.html", "styles.css", "data.js", "search-index.js", "oid-base-directory.js", "intake-pack.js", "app.js"];
  if (sampleAssessment.assetAudit && sampleAssessment.coverageReport) {
    fs.writeFileSync(path.join(outDir, "sample-assessment.html"), renderSampleAssessmentPage(sampleAssessment), "utf8");
    outputFiles.push("sample-assessment.html");
  }
  return {
    output_files: outputFiles.map((file) => path.join(outDir, file)),
    record_count: report.record_count,
    search_record_count: searchIndex.length,
    oid_base_directory_count: oidBaseDirectory.length,
    source: report.source
  };
}

module.exports = {
  buildSite,
  escapeHtml,
  formatNumber,
  percent,
  renderAuditPanel,
  renderDashboard,
  renderEditorReviewPathPanel,
  renderClientReadinessPanel,
  renderVerticalUseCasePanel,
  renderScopeProposalPanel,
  renderDecisionOnePagerPanel,
  renderBuyerSignalPanel,
  renderArticleSamplesPanel,
  renderPublicProofIndexPanel,
  renderClientIntakePackPanel,
  renderAppJs,
  renderSampleAssessmentPage,
  renderOidBasePanel,
  renderSearchPanel
};
