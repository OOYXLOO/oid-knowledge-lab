# Directus editor one-pager: registry evidence review hub

This one-pager is for reviewing a Directus guest-author idea before assigning a tutorial. It is not a finished publication draft.

## Working title

Build a Registry Evidence Review Hub with Directus Data Studio, Generated JSON, and a Static Proof Page

## One-sentence pitch

Show Directus readers how to turn generated technical evidence into reviewable collections, statuses, source links, and safe public proof pages without exposing private inputs.

## Why this fits Directus readers

Directus is a natural fit when structured evidence, editorial review, permissions, and publication decisions need to sit on top of data. This tutorial uses generated OID evidence as a safe example dataset, but the pattern applies to many internal review workflows: generated reports, compliance handoffs, asset inventories, API review records, and documentation QA.

## Proposed reader outcome

After reading the tutorial, a developer should be able to:

1. Model generated evidence as Directus collections.
2. Relate evidence sources to review artifacts and remediation items.
3. Add reviewer statuses, acceptance notes, hashes, and public proof links.
4. Import safe generated JSON through CSV, the Items API, or the Directus SDK.
5. Use roles and permissions to separate private review records from public proof pages.
6. Add an optional Flow for high-priority review notifications.
7. Keep raw private inputs and local-only artifacts outside the published package.

## Proposed model

- `evidence_sources`: title, source type, public URL, source boundary, last checked time.
- `review_artifacts`: title, artifact type, hash, record count, source relation, publishable flag, review status.
- `remediation_items`: title, severity, related artifact, owner note, safe next step.

## Proof links

- Directus submission brief: <https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/directus-submission-brief.md>
- Writing samples: <https://oid-knowledge-lab.vercel.app/writing-samples.html>
- Implementation proof: <https://oid-knowledge-lab.vercel.app/implementation-authenticity-proof.html>
- Public dashboard: <https://oid-knowledge-lab.vercel.app/>
- Sample assessment: <https://oid-knowledge-lab.vercel.app/sample-assessment.html>

## Publication boundary

The public sample contains derived reports, public pointers, safe generated examples, and review artifacts. It does not publish credentials, account exports, payment data, private customer records, contact-level exports, API tokens, cookies, raw third-party page-body mirrors, or local-only crawl output.

If accepted, the final tutorial should foreground Directus modeling, API/SDK import, permissions, review status design, and safe publishing boundaries.
