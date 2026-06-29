# Airbyte-friendly registry evidence pipeline

Data teams often need to answer a deceptively small question:

> Can we trust this local inventory against public registry evidence?

The inventory might contain enterprise OIDs, certificate policy identifiers, MIB references, integration names, internal owner labels, or other registry-backed identifiers. The public evidence might live in an open registry, a sitemap-level directory, a CSV export, or a vendor-maintained catalog. The hard part is not only joining the data. The hard part is building a repeatable pipeline that keeps private input local, publishes only safe derived evidence, and gives reviewers an action queue.

This sample shows an Airbyte-friendly way to think about that workflow. It uses OID Knowledge Lab as the public proof surface, but the pattern applies to any registry-style dataset.

## Pipeline goal

The pipeline should produce a reviewable evidence package from two source classes:

- a public registry source, such as an open assignment list or sitemap-level catalog,
- a sanitized local inventory, such as a CSV with an `oid` column and safe asset labels.

The output should not be a raw mirror of either source. It should be a derived review package:

- normalized public index,
- sanitized local inventory assessment,
- matched evidence rows,
- unresolved rows,
- invalid values,
- remediation board,
- buyer or reviewer summary,
- and a static dashboard.

## Source boundary

The most important design choice is the source boundary.

Public sources can usually be summarized, indexed, and linked when their license and terms allow it. Private local inventories should stay local unless the owner explicitly approves publication. Third-party sites may expose metadata that is safe to reference while still disallowing broad page-body copying.

In OID Knowledge Lab, the publishable package uses:

- IANA Private Enterprise Number aggregate/public fields,
- OID-base sitemap metadata,
- generated summaries,
- checksums,
- and public proof links.

It deliberately excludes:

- raw client inventories,
- credentials,
- account exports,
- payment or tax data,
- contact-level registry fields,
- and full third-party page-body mirrors.

This boundary is what makes the resulting dashboard safe to show to editors, reviewers, or technical buyers.

## Airbyte-friendly shape

An Airbyte implementation would usually split the workflow into source, normalization, destination, and validation stages.

```text
Public registry source
  -> normalize public fields
  -> publishable registry index

Sanitized local inventory source
  -> normalize local rows
  -> classify against public index
  -> generate remediation board
  -> build static dashboard and manifest
```

The same shape works whether the public source is pulled through an HTTP connector, a file source, a database table, object storage, or a custom connector.

## Minimal data model

A local inventory row only needs a few safe fields for the first review:

```csv
asset,oid,owner_hint,source_note
router-core,1.3.6.1.4.1.9.9.41,network,known SNMP trap family
sha256-policy,2.16.840.1.101.3.4.2.1,pki,certificate policy sample
unknown-enterprise,1.3.6.1.4.1.999999.1,platform,needs owner review
bad-row,not-an-oid,unknown,malformed sample
```

Do not include passwords, API keys, full customer exports, raw certificate private keys, account cookies, or billing data. If a real asset name is sensitive, use a stable alias.

## Classification rules

The classification step should produce explicit statuses:

| Status | Meaning | Next action |
| --- | --- | --- |
| `invalid_value` | The value is not a syntactically valid OID. | Correct the source row and re-run. |
| `known_private_enterprise_oid` | The OID belongs under a known IANA PEN enterprise root. | Preserve owner evidence. |
| `oidbase_directory_match` | The OID appears in the public sitemap-level directory. | Link the public evidence. |
| `unknown_private_enterprise_oid` | The OID is under the PEN arc but owner evidence is missing. | Ask the inventory owner or vendor. |
| `valid_oid_unmatched` | The OID is syntactically valid but not matched by current public evidence. | Check internal registry or deprecated documentation. |

These statuses are small enough for a spreadsheet, issue tracker, or reviewer dashboard.

## Destination package

The destination should be more than a table dump. A useful package includes:

- `asset-audit.md` for the assessment summary,
- `remediation-board.csv` for owner action,
- `coverage-report.md` for public registry coverage context,
- `buyer-signal-pack.md` for a compact reviewer summary,
- `dataset-manifest.json` for artifact hashes and source boundaries,
- and a static dashboard for browsing the evidence.

OID Knowledge Lab publishes examples of those artifacts:

```text
https://ooyxloo.github.io/oid-knowledge-lab/
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/reports/buyer-signal-pack.md
https://ooyxloo.github.io/oid-knowledge-lab/sample-assessment.html
```

## Validation checks

Before publishing, run checks that prove the public package does not contain unsafe material:

```bash
npm run check
npm test
npm run build:site
npm run audit:dataset
npm run guard:publishable
```

The publish guard should fail if raw page-body mirrors, local crawl outputs, contact-level exports, or private inventories are tracked.

## How this maps to a real Airbyte workflow

For a production Airbyte version:

1. Use a source connector for the public registry data.
2. Use a file or object-storage source for the sanitized local inventory.
3. Normalize both sources into stable tables.
4. Run a dbt or post-sync transform to classify rows.
5. Write derived outputs to a safe destination.
6. Publish only the review package, not the raw private input.
7. Keep hashes, source URLs, and generated timestamps in a manifest.

The key is to make the private data boundary part of the pipeline design, not an afterthought at publication time.

## Acceptance checks

A reviewer should be able to confirm:

- every local row is classified,
- every unresolved row has an owner action,
- malformed values are visible and re-runnable,
- public evidence links are preserved,
- private inventory fields are excluded from public artifacts,
- and the dashboard can be rebuilt from committed scripts and public-safe inputs.

## Conclusion

An evidence dashboard is useful only if people can trust how it was built. A good registry pipeline does not simply copy data from one place to another. It separates public evidence from private inventory, produces derived findings, records source boundaries, and gives reviewers a concrete queue.

That pattern is a strong fit for Airbyte-style data integration work: connect the sources, normalize the rows, classify the evidence, publish the safe outputs, and make the whole process repeatable.
