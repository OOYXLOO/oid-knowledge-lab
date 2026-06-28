# PHP Deployment Evidence Checklist

This sample shows how a small PHP team can make each deployment easier to review without turning the release process into a heavy compliance program.

The checklist is designed for PHP, Laravel, Symfony, and CMS-style applications hosted on a managed platform or a small VPS. It focuses on evidence that a developer or reviewer can collect before and after a release:

- the intended change
- the exact environment being updated
- configuration values that must exist
- database migration status
- log and health-check signals
- rollback notes
- sensitive data that must stay out of screenshots, tickets, and public examples

## Why Evidence Matters

Many PHP releases fail in ordinary ways: an environment variable is missing, a queue worker is still running old code, a migration was applied to the wrong database, or a cache layer keeps serving stale routes.

A lightweight evidence log reduces the guessing. It does not need to be a ticketing system. A Markdown note, pull request comment, or deployment form can work if it captures the right fields.

## Pre-Deployment Checks

Before the release, record the expected scope:

```text
Application:
Environment:
Change summary:
Release owner:
Expected user-visible behavior:
Expected database changes:
Expected background-worker changes:
Expected configuration changes:
Rollback owner:
```

Then verify the inputs:

```bash
php -v
composer validate --strict
composer install --no-dev --prefer-dist --no-interaction
php artisan config:cache
php artisan route:cache
php artisan migrate --pretend
```

For non-Laravel projects, use equivalent checks:

```bash
composer validate --strict
composer install --no-dev --prefer-dist --no-interaction
php -l public/index.php
php bin/console lint:container
php bin/console doctrine:migrations:migrate --dry-run
```

Do not paste secrets into the evidence log. Record whether a value exists and which deployment surface owns it, not the value itself.

## Deployment Evidence

During the release, record the smallest evidence that proves the expected action happened:

```text
Git revision:
Build command:
Deploy target:
Migration command:
Migration result:
Queue restart:
Cache clear:
Health-check URL:
```

For example:

```bash
git rev-parse --short HEAD
php artisan migrate --force
php artisan queue:restart
php artisan optimize:clear
curl -fsS https://example.com/health
```

If the application uses background workers, make worker restart visible. A successful web request does not prove that workers, scheduled jobs, or webhooks are running the new code.

## Post-Deployment Checks

After release, check both the user path and operational signals:

```text
Smoke test passed:
Critical route:
Login or anonymous flow:
Webhook or worker flow:
Error log window:
Slow request check:
Rollback decision:
```

Useful commands include:

```bash
curl -I https://example.com/
curl -fsS https://example.com/health
tail -n 100 storage/logs/laravel.log
php artisan queue:failed
```

For Symfony:

```bash
curl -I https://example.com/
tail -n 100 var/log/prod.log
php bin/console messenger:failed:show
```

## Rollback Evidence

A rollback plan should be written before the deploy begins:

```text
Previous revision:
Database rollback safe:
Config rollback needed:
Queue rollback needed:
Cache action:
Decision deadline:
```

If a migration is not safely reversible, mark it clearly. The release can still proceed, but reviewers should know that rollback means a forward fix rather than a simple revert.

## Privacy Boundary

Deployment evidence should not include:

- production passwords
- API keys
- session cookies
- full customer records
- private support messages
- payment, identity, tax, or account screenshots
- copied proprietary source files from clients

Use summaries such as `payment webhook smoke test passed with sanitized test event` instead of copying the event payload.

## Copyable Template

```text
# Deployment Evidence Log

Application:
Environment:
Git revision:
Change summary:
Release owner:

## Pre-checks
- Composer validation:
- Dependency install:
- Config/cache command:
- Migration dry run:
- Required env keys present:

## Deployment
- Deploy target:
- Migration result:
- Worker restart:
- Cache clear:
- Health check:

## Post-checks
- Critical route:
- Background worker / webhook:
- Error log window:
- Failed jobs:

## Rollback
- Previous revision:
- Database rollback:
- Config rollback:
- Decision:

## Boundary
- Secrets excluded:
- Customer data excluded:
- Private screenshots excluded:
```

## Final Review

The goal is not to create more paperwork. The goal is to make deployment decisions reviewable. If the log answers what changed, where it changed, how it was checked, and what must stay private, the next release review starts from evidence instead of memory.
