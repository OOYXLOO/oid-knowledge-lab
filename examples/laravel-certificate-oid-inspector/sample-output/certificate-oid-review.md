# Certificate OID Review

- File: `example.pem`
- Subject: CN=example.test
- Issuer: CN=Example Local CA
- Valid from: 2026-01-01T00:00:00+00:00
- Valid to: 2026-12-31T23:59:59+00:00

| OID | Name | Observed value |
| --- | --- | --- |
| `2.5.29.15` | Key Usage | Digital Signature, Key Encipherment |
| `2.5.29.17` | Subject Alternative Name | DNS:example.test, DNS:www.example.test |
| `2.5.29.19` | Basic Constraints | CA:FALSE |
| `2.5.29.32` | Certificate Policies | Policy: 2.23.140.1.2.1 |
| `1.3.6.1.5.5.7.1.1` | Authority Information Access | OCSP - URI:http://ocsp.example.test |

## Safe Handling Notes

- Public certificate metadata only.
- No private keys, tokens, account pages, or production logs.
- Attach this note to a deployment or vendor handoff only after review.

