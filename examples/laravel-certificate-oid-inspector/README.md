# Laravel Certificate OID Inspector Example

This folder contains copyable article sample code for a Laravel tutorial about inspecting certificate Object Identifiers during deployment and integration reviews.

It is intentionally a small example, not a packaged Laravel app. Copy the command into a Laravel project, add the test fixture files locally, and run the test in that project.

## Safe Input Boundary

Use only public certificate files. Do not use:

- Private keys
- Production customer certificates
- Account console screenshots
- Raw production logs
- Payment, identity, KYC, tax, or billing data
- Secrets, cookies, tokens, or `.env` values

## Files

- `app/Console/Commands/InspectCertificateOid.php` - Artisan command sample.
- `tests/Feature/CertificateOidInspectorTest.php` - Pest/PHPUnit-style test sample.
- `sample-output/certificate-oid-review.md` - expected Markdown report shape.

## Example Command

```bash
php artisan cert:oid-inspect storage/app/samples/example.pem --format=markdown
```

## Article Use

The final article can walk through how the command:

1. Reads a local PEM certificate.
2. Uses OpenSSL metadata instead of private key material.
3. Maps certificate extensions and policy identifiers into reviewer-friendly rows.
4. Emits a Markdown note that a PHP team can attach to a deployment or vendor handoff.

