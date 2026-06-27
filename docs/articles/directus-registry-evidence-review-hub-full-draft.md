# Build a Registry Evidence Review Hub with Directus, Generated JSON, and a Static Proof Page

Generated technical reports are useful, but they are often awkward to review. A Markdown file is easy to share but hard to triage. A JSON file is easy to process but hard for non-authors to inspect. A static dashboard is public-friendly but does not always provide an editorial workflow.

Directus can sit between those surfaces. It can turn generated reports into structured review records, give reviewers controlled fields such as `review_status` and `acceptance_note`, and still link to a public static proof page for readers who do not need admin access.

This tutorial shows how to build a small registry evidence review hub with Directus Data Studio, collection relations, the Items API, roles and permissions, and an optional Directus Flow. The example uses generated OID Knowledge Lab reports, but the pattern works for release readiness reports, migration checks, data-quality audits, catalog reviews, and compliance handoffs.

## What We Are Building

The review hub has three layers:

1. Generated JSON reports from a local workflow.
2. Directus collections for reviewable evidence records.
3. A reviewer role that can triage artifacts without changing source boundaries.
4. An optional Directus Flow for high-priority review notifications.
5. A static proof page that public reviewers can inspect without Directus access.

The hub should help answer:

- Which generated artifacts are ready for review?
- Which source records are public and safe to share?
- Which findings need remediation?
- What did a reviewer accept, reject, or mark as unresolved?
- Which public page proves the package without exposing local-only inputs?

## Data Boundary

Before modeling collections, define what Directus is allowed to store.

Allowed in this tutorial:

- generated summary counts,
- public source URLs,
- artifact paths,
- artifact hashes,
- review notes,
- remediation statuses,
- and static proof links.

Not allowed in this tutorial:

- credentials,
- API tokens,
- raw private exports,
- private customer inventories,
- payment or tax data,
- copied third-party page bodies,
- browser cookies or account-local storage.

That boundary keeps Directus as a review layer, not a dumping ground.

## Source Reports

Start with generated reports such as:

```text
reports/asset-audit.json
reports/remediation-board.json
reports/dataset-manifest.json
reports/source-policy.json
```

The static proof page can be published separately:

```text
https://oid-knowledge-lab.vercel.app/sample-assessment.html
```

The Directus hub does not need to copy every line from every report. It should import the fields reviewers need.

## Collection Design

Create three collections in Directus Data Studio. The model is intentionally small so readers can build it by hand, then automate imports later.

### Collection: `evidence_sources`

This collection explains where evidence came from.

| Field | Type | Purpose |
| --- | --- | --- |
| `title` | string | Human-readable source name. |
| `source_type` | string | Public registry, generated report, static proof page, or local workflow. |
| `public_url` | string | URL when the source is public. |
| `source_boundary` | text | What can and cannot be published. |
| `last_checked_at` | datetime | When the source was last verified. |
| `notes` | text | Reviewer context. |

Example source record:

```json
{
  "title": "OID Knowledge Lab sample assessment",
  "source_type": "static proof page",
  "public_url": "https://oid-knowledge-lab.vercel.app/sample-assessment.html",
  "source_boundary": "Derived findings only; raw inventories and copied page bodies are excluded.",
  "last_checked_at": "2026-06-27T00:00:00.000Z",
  "notes": "Public review page for a sanitized OID inventory assessment."
}
```

### Collection: `review_artifacts`

This collection stores generated outputs that need review.

| Field | Type | Purpose |
| --- | --- | --- |
| `title` | string | Artifact display name. |
| `artifact_type` | string | Markdown, JSON, CSV, dashboard, manifest, or proof page. |
| `public_url` | string | Public URL when available. |
| `sha256` | string | Hash from the dataset manifest. |
| `record_count` | integer | Number of records represented by the artifact. |
| `publishable` | boolean | Whether the artifact is safe for public review. |
| `review_status` | string | `new`, `needs_changes`, `accepted`, `blocked`, or `published`. |
| `acceptance_note` | text | What the reviewer accepted or still needs. |
| `source` | many-to-one relation | Link each artifact back to one `evidence_sources` record. |

The `review_status` field is important. It turns a generated report into a workflow item.

### Collection: `remediation_items`

This collection tracks findings that need human action.

| Field | Type | Purpose |
| --- | --- | --- |
| `title` | string | Short finding name. |
| `severity` | string | `low`, `medium`, `high`. |
| `status` | string | `open`, `in_review`, `resolved`, or `deferred`. |
| `related_artifact` | relation | Link to `review_artifacts`. |
| `safe_next_step` | text | Action that does not require secrets or private access. |
| `owner_note` | text | Optional reviewer note. |

This lets reviewers separate accepted public evidence from unresolved cleanup work.

## Roles and Permissions

Add two roles before importing data:

| Role | Permissions |
| --- | --- |
| `Evidence Reviewer` | Read `evidence_sources`, read and update `review_artifacts.review_status` and `review_artifacts.acceptance_note`, and read `remediation_items`. |
| `Public Reader` | Read only records where `publishable` is true and `review_status` is `published`. |

The goal is not to make Directus the public proof page. The goal is to use Directus as the review surface while keeping public readers on a narrow, already-approved view.

For fields that may hold reviewer-only context, keep public read permissions disabled. This is especially important for `owner_note`, draft acceptance notes, and any field that might mention local-only inputs.

## Import Mapping with the Items API

A generated JSON report can be mapped into Directus records with CSV import, the Items API, or the Directus SDK. The mapping should be explicit:

A generated JSON report can be mapped into Directus records with a small import script or a CSV import. The mapping should be explicit:

```json
{
  "artifact.title": "OID asset audit",
  "artifact.artifact_type": "json",
  "artifact.public_url": "https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/asset-audit.json",
  "artifact.publishable": true,
  "artifact.review_status": "new",
  "artifact.acceptance_note": "Derived report; safe for public review after manifest check."
}
```

Avoid importing entire raw payloads into long text fields. Import only the fields that support review.

For example, an Items API request can create a review artifact from safe fields:

```bash
curl \
  -X POST "https://directus.example.com/items/review_artifacts" \
  -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "OID asset audit",
    "artifact_type": "json",
    "public_url": "https://github.com/OOYXLOO/oid-knowledge-lab/blob/main/reports/asset-audit.json",
    "publishable": true,
    "review_status": "new",
    "acceptance_note": "Derived report; safe for public review after manifest check."
  }'
```

Do not hard-code this token in the repository or paste it into a public tutorial sample. Use an environment variable, local secret manager, or Directus-provided token handling in your own project.

## Review Workflow

A simple workflow can use these statuses:

| Status | Meaning |
| --- | --- |
| `new` | Imported and waiting for review. |
| `needs_changes` | Reviewer found a missing boundary, stale link, or unclear evidence. |
| `accepted` | Reviewer accepts the artifact as safe and useful. |
| `blocked` | Artifact cannot be published until an external issue is resolved. |
| `published` | Artifact is visible through the static proof page or public repository. |

The `acceptance_note` should be concrete:

```text
Accepted because the manifest lists only derived reports, public source links, hashes, counts, and static proof pages. No private inventory rows or credentials are present.
```

This makes the review decision reusable.

## Optional Directus Flow

If the team wants a lightweight automation layer, create a Directus Flow:

1. Trigger: item created in `review_artifacts`.
2. Condition: `publishable` is true and `record_count` is greater than zero.
3. Operation: send an internal notification or create a `remediation_items` record when `review_status` is `needs_changes`.

Keep the Flow small. It should route review attention, not publish artifacts automatically. Publication still happens after the release guard passes and a reviewer accepts the artifact.

## Static Proof Page

Not every reviewer needs Directus access. The public proof page should show the accepted outputs:

- summary metrics,
- public source links,
- generated timestamp,
- artifact links,
- excluded-data notes,
- and verification commands.

For the sample project, the proof page is:

```text
https://oid-knowledge-lab.vercel.app/
```

The sample assessment is:

```text
https://oid-knowledge-lab.vercel.app/sample-assessment.html
```

Directus is the internal review layer. The static page is the public evidence layer.

## Release Guard

Before publishing artifacts, run a release guard in the source repository:

```bash
npm run check
npm test
npm run build:site
npm run guard:publishable
git diff --check
```

The guard should fail if public artifacts contain secrets, raw private exports, copied page-body mirrors, or local-only paths.

Directus can store the guard result as a `review_artifacts` record:

```json
{
  "title": "Publish guard result",
  "artifact_type": "verification",
  "publishable": true,
  "review_status": "accepted",
  "acceptance_note": "Guard passed with no blockers."
}
```

## Implementation Checklist

1. Generate JSON and Markdown reports locally.
2. Generate a dataset manifest with hashes and publication boundaries.
3. Build a static proof page.
4. Create Directus collections for sources, artifacts, and remediation items.
5. Add roles and permissions for reviewers and public readers.
6. Import only review-safe fields through CSV, the Items API, or the Directus SDK.
7. Assign `review_status` values.
8. Add a Directus Flow only if it helps route review work.
9. Link accepted artifacts to the static proof page.
10. Run the release guard before publishing.
11. Re-check public links after deployment.

## Common Mistakes

Avoid these shortcuts:

- importing raw private exports into Directus,
- storing copied third-party page bodies as evidence records,
- giving public readers access to draft review notes,
- turning a Directus Flow into an automatic publisher,
- using `review_status` as a vague label instead of a decision,
- publishing a static page that does not match the reviewed artifacts,
- skipping the manifest,
- and letting proof links go stale.

The review hub should make evidence easier to trust. It should not hide the source boundary.

## Conclusion

Directus is a good fit for generated evidence workflows because it gives structured data an editorial surface. Generated JSON can become review records, public sources can become linked evidence, remediation items can become a queue, and accepted artifacts can be published through a static proof page.

The pattern is small:

1. generate reports,
2. model review records in Directus,
3. import safe fields,
4. review with explicit statuses,
5. publish a static proof page,
6. and verify the boundary before sharing.

That gives technical teams a practical review hub without exposing the private inputs that produced the evidence.
