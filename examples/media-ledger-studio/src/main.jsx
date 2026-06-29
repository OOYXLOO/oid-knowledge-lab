import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createDevpostFields,
  createSubmissionPack,
  findRunById,
  sampleRuns,
  summarizeLedger
} from "./mediaLedger.js";
import "./styles.css";

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function App() {
  const [selectedId, setSelectedId] = useState(sampleRuns[0].id);
  const [view, setView] = useState("pipeline");
  const selected = findRunById(selectedId);
  const summary = useMemo(() => summarizeLedger(sampleRuns), []);
  const pack = useMemo(() => createSubmissionPack(sampleRuns), []);
  const fields = useMemo(() => createDevpostFields(), []);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">ML</span>
          <div>
            <strong>Media Ledger</strong>
            <small>Studio</small>
          </div>
        </div>
        <nav>
          {[
            ["pipeline", "Pipeline"],
            ["submission", "Submission"],
            ["storage", "Storage"],
            ["review", "Review"],
            ["exports", "Exports"]
          ].map(([id, label]) => (
            <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </nav>
        <section className="side-note">
          <strong>Demo mode</strong>
          <span>No credentials or private media are bundled.</span>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Generated media operations ledger</h1>
            <p>Track prompts, model runs, B2 storage records, checksums, and review decisions in one auditable handoff.</p>
          </div>
          <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(pack, null, 2))}>
            Copy pack
          </button>
        </header>

        <section className="metrics" aria-label="Ledger summary">
          <Metric label="Runs" value={summary.totalRuns} />
          <Metric label="Ready" value={summary.ready} />
          <Metric label="Needs action" value={summary.needsAction} />
          <Metric label="Review score" value={`${summary.averageScore}%`} />
          <Metric label="Stored" value={`${summary.totalMegabytes} MB`} />
          <Metric label="Challenge fit" value={`${pack.challengeReadiness.score}%`} />
        </section>

        {view === "pipeline" && (
          <PipelineView selected={selected} selectedId={selectedId} setSelectedId={setSelectedId} />
        )}
        {view === "submission" && <SubmissionView fields={fields} pack={pack} />}
        {view !== "pipeline" && view !== "submission" && <PlaceholderView view={view} />}
      </section>
    </main>
  );
}

function PipelineView({ selected, selectedId, setSelectedId }) {
  return (
    <>
      <section className="content-grid">
        <div className="pipeline-panel">
          <div className="panel-heading">
            <h2>Media run queue</h2>
            <span>{sampleRuns.length} active records</span>
          </div>
          <div className="run-list">
            {sampleRuns.map((run) => (
              <button
                key={run.id}
                className={`run-card ${run.id === selectedId ? "selected" : ""}`}
                onClick={() => setSelectedId(run.id)}
              >
                <span className="thumb" style={{ background: run.thumbnail }} />
                <span className="run-copy">
                  <strong>{run.title}</strong>
                  <small>{run.status}</small>
                </span>
                <span className="score">{run.review.score}</span>
              </button>
            ))}
          </div>

          <div className="timeline">
            {["Brief", "Genblaze run", "Human review", "B2 storage", "Client handoff"].map((step, index) => (
              <div className="step" key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>

        <aside className="inspector">
          <div className="panel-heading">
            <h2>Provenance inspector</h2>
            <span>{selected.id}</span>
          </div>
          <div className="hero-thumb" style={{ background: selected.thumbnail }} />
          <dl>
            <Field label="Owner" value={selected.owner} />
            <Field label="Provider" value={selected.provider} />
            <Field label="Model" value={selected.model} />
            <Field label="Seed" value={selected.seed} />
            <Field label="Retry count" value={selected.retryCount} />
            <Field label="Bucket" value={selected.storage.bucket} />
            <Field label="Object key" value={selected.storage.objectKey} />
            <Field label="Checksum" value={selected.storage.checksumSha256} />
            <Field label="Size" value={formatBytes(selected.storage.bytes)} />
            <Field label="License" value={selected.license} />
          </dl>
        </aside>
      </section>

      <section className="detail-grid">
        <article>
          <h2>Prompt record</h2>
          <p>{selected.prompt}</p>
          <h3>Negative prompt</h3>
          <p>{selected.negativePrompt}</p>
        </article>
        <article>
          <h2>Review notes</h2>
          <p>{selected.review.notes}</p>
          <h3>Safety checklist</h3>
          <ul>
            {selected.safetyNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}

function SubmissionView({ fields, pack }) {
  return (
    <section className="submission-grid">
      <article className="submission-card wide">
        <div className="panel-heading">
          <h2>Submission readiness</h2>
          <span>{fields.projectName}</span>
        </div>
        <div className="readiness-list">
          {pack.readiness.map((item) => (
            <div className={`readiness-row ${item.status}`} key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.status}</span>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="submission-card">
        <h2>Devpost essentials</h2>
        <dl>
          <Field label="App" value={fields.appUrl} />
          <Field label="Source" value={fields.sourceRepoUrl} />
          <Field label="Video" value={fields.videoUrl} />
          <Field label="Tagline" value={fields.tagline} />
        </dl>
      </article>

      <article className="submission-card">
        <h2>Provider and model list</h2>
        <ul className="model-list">
          {fields.providerAndModels.map((entry) => (
            <li key={`${entry.provider}-${entry.model}`}>
              <strong>{entry.provider}</strong>
              <span>{entry.model}</span>
              <small>{entry.assetType}</small>
            </li>
          ))}
        </ul>
      </article>

      <article className="submission-card">
        <h2>Challenge readiness</h2>
        <div className="readiness-score">{pack.challengeReadiness.score}</div>
        <ul className="model-list compact">
          {pack.challengeReadiness.readySignals.map((signal) => (
            <li key={signal}>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="submission-card wide">
        <h2>Backblaze B2 usage</h2>
        <p>{fields.howBackblazeB2IsUsed}</p>
        <h2>Genblaze usage</h2>
        <p>{fields.howGenblazeIsUsed}</p>
      </article>

      <article className="submission-card wide">
        <h2>Storage handoff manifest</h2>
        <div className="manifest-table" role="table" aria-label="Storage handoff manifest">
          {pack.storageHandoffManifest.map((asset) => (
            <div className="manifest-row" role="row" key={asset.runId}>
              <span role="cell">{asset.runId}</span>
              <span role="cell">{asset.assetType}</span>
              <span role="cell">{asset.objectKey}</span>
              <span role="cell">{asset.checksumSha256.slice(0, 16)}...</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function PlaceholderView({ view }) {
  return (
    <section className="placeholder-panel">
      <h2>{view[0].toUpperCase() + view.slice(1)} view</h2>
      <p>This area is tracked in the submission ledger and will expand when the live adapter is connected.</p>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
