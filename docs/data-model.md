# Data Model

## Record

```json
{
  "oid": "2.16.840.1.101.3.4.2.1",
  "source_url": "https://oid-base.com/get/2.16.840.1.101.3.4.2.1",
  "markdown_url": "https://oid-base.com/get-md/2.16.840.1.101.3.4.2.1",
  "last_modified": "2021-07-27",
  "asn1_notation": "{joint-iso-itu-t(2) country(16) us(840) ...}",
  "description": "Secure Hash Algorithm that uses a 256 bit key (SHA256)",
  "tags": ["oid-repository"],
  "child_oids": [],
  "sections_present": ["Description", "Supplementary information", "Child OIDs", "Terms of Use"],
  "body_hash": "sha256:...",
  "fetched_at": "2026-06-24T00:00:00.000Z"
}
```

## Report

Reports summarize:

- record count
- top root arcs
- entries with child OIDs
- entries with supplementary information
- last-modified year distribution
- duplicate descriptions
- sample source URLs

## IANA PEN Record

```json
{
  "source": "iana-pen",
  "enterprise_number": 9,
  "oid": "1.3.6.1.4.1.9",
  "organization": "ciscoSystems",
  "contact": "Dave Jones",
  "email_obfuscated": "davej&cisco.com"
}
```

Generated IANA JSONL is ignored by Git. Aggregate reports omit contact names and email values.

## Dataset Manifest

`reports/dataset-manifest.json` records the publishable data package:

```json
{
  "name": "OID Knowledge Lab publishable data manifest",
  "publishable": true,
  "oid_base": {
    "sitemap_entries": 7492,
    "copied_page_bodies": false
  },
  "iana_pen": {
    "record_count": 66101,
    "public_index_records": 65959,
    "contact_fields_published": false
  },
  "artifacts": [
    {
      "path": "reports/oid-base-sitemap-index.json",
      "bytes": 2288780,
      "sha256": "sha256:..."
    }
  ]
}
```

The manifest is intentionally publishable: it uses repository-relative paths and records excluded data categories instead of storing restricted source material.
