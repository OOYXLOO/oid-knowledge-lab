# Python Certificate OID Inspector

This example shows how to inspect public certificate Object Identifier metadata with Python.

It is designed as a small article/demo asset for technical writing, DevRel, and developer-tool review workflows. It does not read private keys, account consoles, cookies, tokens, payment data, or production logs.

## Install

```bash
python -m pip install cryptography
```

## Run

```bash
python certificate_oid_inspector.py path/to/public-certificate.pem --format markdown
```

## Test

```bash
python test_certificate_oid_inspector.py
```

The test creates a temporary self-signed certificate in memory, writes only the public certificate to a temp file, runs the inspector, and verifies key OID rows.

## Safe Input Boundary

Use public certificate files only.

Do not use:

- Private keys
- Customer certificates
- Account screenshots
- Raw production logs
- API keys, cookies, tokens, or `.env` values
- Payment, identity, KYC, tax, or billing data

