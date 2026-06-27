# Directus submission brief: registry evidence review hub

This brief is a submission-ready review note for a Directus guest-author application. It is not a final article draft. Its purpose is to show how an existing implementation-backed sample can be adapted into a Directus tutorial with clear reader value, realistic data boundaries, and public proof links.

## Working title

Build a Registry Evidence Review Hub with Directus Data Studio, Generated JSON, and a Static Proof Page

## Reader

The reader is a developer, DevRel reviewer, technical writer, documentation engineer, or internal tools builder who wants to turn generated technical evidence into a reviewable knowledge hub without exposing private inputs.

Good-fit teams include:

- platform teams reviewing generated reports,
- DevRel teams building public proof pages,
- documentation teams maintaining evidence-backed guides,
- data-quality teams reviewing registry or catalog metadata,
- and internal tools teams that need an admin-friendly review layer before publishing.

## Tutorial promise

The tutorial would teach readers how to:

1. Start with generated JSON reports from a local workflow.
2. Model reviewable evidence in Directus collections using Data Studio.
3. Connect `review_artifacts` back to `evidence_sources` with a many-to-one relation.
4. Separate public records from local-only inputs with roles and permissions.
5. Import safe fields through CSV, the Items API, or the Directus SDK.
6. Add review statuses, source links, artifact hashes, and acceptance notes.
7. Optionally add a Directus Flow that notifies reviewers when a high-priority artifact is created.
8. Use Directus as the editorial and reviewer surface.
9. Export or link a public static proof page for readers who do not need admin access.
10. Add a release guard before publishing generated artifacts.

## Why this fits Directus readers

Directus is strong when structured content, data review, and editorial workflows need to sit on top of a database. This article uses OID Knowledge Lab as a safe source example:

- generated reports become content records,
- public source references become relation-friendly fields,
- reviewer decisions become controlled statuses,
- roles and permissions keep draft review records separate from public proof links,
- the Items API or Directus SDK can import generated evidence without manual copy-paste,
- a Directus Flow can create lightweight review notifications,
- derived artifacts remain publishable,
- and raw private/local crawl outputs remain outside the public repository.

The tutorial is practical because it starts from small generated files and turns them into a content workflow. It does not require a reader to crawl private systems or publish sensitive records.

## Proposed Directus model

### Collection: `evidence_sources`

Fields:

- `title`
- `source_type`
- `public_url`
- `source_boundary`
- `last_checked_at`
- `notes`

### Collection: `review_artifacts`

Fields:

- `title`
- `artifact_type`
- `public_url`
- `sha256`
- `record_count`
- `source` as a many-to-one relation to `evidence_sources`
- `publishable`
- `review_status`
- `acceptance_note`

### Collection: `remediation_items`

Fields:

- `title`
- `status`
- `severity`
- `related_artifact`
- `owner_note`
- `safe_next_step`

## Proposed outline

1. Why generated evidence needs a review hub.
2. The boundary: local inputs, generated reports, public proof links.
3. Directus collection design for evidence sources and artifacts.
4. Configure roles and permissions for reviewers and public readers.
5. Import generated JSON reports into reviewable records through CSV, the Items API, or the Directus SDK.
6. Add review statuses and acceptance notes.
7. Add an optional Directus Flow for high-priority review notifications.
8. Link a static proof page for public reviewers.
9. Add release guards before publishing.
10. What not to publish: raw mirrors, credentials, customer inventories, and local-only crawl output.
11. Verification checklist and next steps.

## Public proof links

Directus editor one-pager:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/directus-editor-one-pager.md
```

Writing sample page:

```text
https://oid-knowledge-lab.vercel.app/writing-samples.html
```

Static evidence dashboard sample:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/static-evidence-dashboard-github-pages.md
```

Full Directus tutorial draft:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/directus-registry-evidence-review-hub-full-draft.md
```

OID assessment sample:

```text
https://oid-knowledge-lab.vercel.app/sample-assessment.html
```

Public proof index:

```text
https://oid-knowledge-lab.vercel.app/
```

Repository:

```text
https://github.com/OOYXLOO/oid-knowledge-lab
```

## Implementation depth

The full article can include:

- example JSON input,
- Directus collection definitions,
- roles and permissions notes,
- Items API or SDK import examples,
- an optional Directus Flow example,
- import mapping notes,
- review-status workflow,
- safe publication boundary checks,
- static proof page links,
- and verification commands for the source repository.

Suggested source-project verification commands:

```bash
npm run check
npm test
npm run build:site
npm run guard:publishable
git diff --check
```

## Safety and originality boundary

The article should be written as original developer education based on a working public sample. The public repository contains derived reports, public pointers, and safe examples only. It does not include credentials, account exports, payment data, private customer records, contact-level exports, API tokens, cookies, raw third-party page-body mirrors, or local-only crawl output.

## Editor decision note

This is strongest as a practical Directus tutorial if the editor wants a data-and-content workflow, not a pure OID article. The final article should foreground Directus modeling, review workflows, and safe publishing boundaries; OID Knowledge Lab should appear as the example dataset and proof surface.
