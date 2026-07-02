# Airbyte submission rewrite worksheet

This worksheet is for adapting the OID knowledge pipeline material into a fresh Airbyte submission. It is not a final article draft and should not be submitted as-is.

## Editorial boundary

Airbyte's community writing page says AI-written drafts are not accepted. Use this worksheet only to plan, verify, and rewrite the article in the author's own words.

Do not paste credentials, account exports, private datasets, copied third-party page bodies, payment information, or unpublished client data into the final submission.

## Working title

Build an AI-ready OID knowledge pipeline with Airbyte, Postgres, and full-text search

## One-sentence promise

Show readers how to turn a public registry-style knowledge source into a refreshable, queryable Postgres knowledge layer that can support developer tools and AI context workflows.

## Reader outcome

After reading the article, a developer should be able to:

- define a safe source boundary for public registry data;
- design an Airbyte-style ingestion path for public HTTP or file-based records;
- model OID records, parent-child relationships, and source metadata in Postgres;
- detect changed records with stable keys and content hashes;
- add full-text and hierarchy queries for developer tooling;
- publish only derived examples, manifests, and safe proof artifacts.

## Rewrite checklist

Before submitting a Google Doc or form response, rewrite each section in a fresh voice:

1. Problem framing: why registry-style knowledge is useful but hard to query directly.
2. Data boundary: what is safe to fetch, store, and publish.
3. Airbyte mapping: source connector path, destination shape, and sync cadence.
4. Postgres schema: OID node table, relationship table, metadata fields, and search indexes.
5. Change tracking: URL keys, timestamps, hashes, and manifest checks.
6. Query examples: direct OID lookup, subtree lookup, and full-text search.
7. AI context use: how the data can feed an assistant or review tool without raw private data.
8. Validation: commands, generated reports, and screenshot plan.
9. Publication boundary: what stays out of the public repo and article.

## Proof links

- Final pitch page: <https://ooyxloo.github.io/oid-knowledge-lab/airbyte-oid-knowledge-pipeline-final-pitch.html>
- Reviewer hub: <https://ooyxloo.github.io/oid-knowledge-lab/airbyte-reviewer-hub.html>
- Implementation proof: <https://ooyxloo.github.io/oid-knowledge-lab/implementation-authenticity-proof.html>
- Repository: <https://github.com/OOYXLOO/oid-knowledge-lab>
- Writing samples: <https://ooyxloo.github.io/oid-knowledge-lab/writing-samples.html>

## Form-safe short pitch

```text
I would like to pitch a hands-on Airbyte tutorial about building a refreshable OID knowledge pipeline with Airbyte-style ingestion, Postgres modeling, change detection, and full-text search.

The article would use a public registry-style source and derived proof artifacts to show a safe data boundary: no credentials, private exports, or copied page-body mirrors. The goal is to help readers turn public technical registries into reliable context stores for developer tools and AI-assisted workflows.

Proof packet:
https://ooyxloo.github.io/oid-knowledge-lab/airbyte-oid-knowledge-pipeline-final-pitch.html
```

## Human rewrite questions

Answer these in the author's own words before submission:

- What Airbyte reader problem does this solve in the first two paragraphs?
- Which Airbyte product path is the best fit: Connector Builder, low-code CDK, File source, or another source path?
- What exact sample data shape will the article use?
- What screenshots or diagrams can be created without private account data?
- Which part of the implementation has been run locally?
- Which claims need editor confirmation before they appear in the final article?

