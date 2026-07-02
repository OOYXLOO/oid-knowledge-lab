# Kubernetes Certificate OID CronJob Example

This example shows a Civo-style tutorial direction: run a small Python certificate OID inspector as a Kubernetes CronJob and store the review output in a mounted volume.

It is sample material for an article pitch, not a production chart.

## What It Demonstrates

- A `ConfigMap` with a public sample certificate.
- A `CronJob` that runs a Python certificate OID inspector on a schedule.
- A safe output path for Markdown review notes.
- A no-secret boundary: no private keys, no account exports, no production logs.

## Files

- `sample-public-certificate.configmap.yaml` - placeholder public certificate fixture.
- `certificate-oid-cronjob.yaml` - Kubernetes CronJob skeleton.

## Safety Boundary

Use only public certificates or purpose-built test certificates. Do not mount private keys, customer certificates, `.env` files, API tokens, payment data, identity data, or raw production logs into this job.

