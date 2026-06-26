# Production Integration Debug Handoff Template

This template is a companion to `production-integration-debug-handoff.md`. Use it when an API, webhook, queue consumer, SaaS sync, scheduled job, or internal automation fails and another engineer needs enough context to start debugging without asking for production secrets.

The goal is a short, safe, reproducible first-pass handoff. It should help a reviewer see the contract, the failure boundary, the observability pointers, the recent changes, and the acceptance checks.

## When To Use This Template

Use this template when the issue involves:

- API calls that return unexpected status codes,
- webhook delivery failures,
- queue consumers that retry or dead-letter messages,
- SaaS records that stop syncing,
- scheduled jobs that miss or duplicate work,
- data pipelines with malformed or partial rows,
- support escalations that need engineering review,
- or integration fixes that require logs, metrics, traces, and ownership context.

Do not use this template to share passwords, API keys, bearer tokens, cookies, payment data, private customer records, raw production exports, or private account access.

## Quick Copy Template

````markdown
# Integration Debug Handoff

## Expected behavior

<What should happen?>

- Source system:
- Target system:
- Trigger:
- Expected request, event, or job:
- Expected success response:
- Expected user or business outcome:
- Retry or timeout expectation:

## Observed behavior

<What happened instead?>

- First visible failure:
- Response code or error class:
- Sanitized error message:
- Approximate affected volume:
- Still active:
- User-visible impact:

## Time window

- First observed:
- Last observed:
- Known good before:
- Timezone:
- Related deploy, config, or vendor event:

## Correlation handles

- Environment:
- Source service:
- Target service:
- Route, topic, queue, or job name:
- Request IDs:
- Trace IDs:
- Job, event, message, or webhook IDs:
- Deployment version:
- Sanitized account or customer aliases:

## Safe evidence

Paste only the smallest useful snippets. Replace secrets and private identifiers with stable aliases.

```text
<Minimal sanitized logs. No tokens, cookies, credentials, private customer data, or full raw payloads.>
```

```json
{
  "event_type": "<example>",
  "account_alias": "account-a",
  "field_that_matters": "<sanitized value or shape>",
  "sent_at": "<timestamp>"
}
```

## Metrics and traces

- Error rate during the window:
- Latency during the window:
- Queue depth or retry count:
- Dead-letter count:
- First failing span:
- Downstream calls attempted:
- Dependency or vendor status:

## Recent changes

- Deploys:
- Feature flags:
- Schema or field mapping changes:
- Webhook subscription changes:
- Queue or retry policy changes:
- Data imports:
- Manual admin actions:

## Ownership

- Source owner:
- Target owner:
- Queue or platform owner:
- Data mapping owner:
- External vendor owner:
- Decision maker for rollback or compatibility change:

## Working hypotheses

List hypotheses as hypotheses, not facts.

1.
2.
3.

## Acceptance checks

1. <The healthy request, event, or job succeeds.>
2. <The failing case is handled with a clear retry or non-retry path.>
3. <Metrics return to the expected range for a defined period.>
4. <No duplicate side effects are created by retries.>
5. <The owner can explain the next prevention step.>

## Excluded data

The handoff intentionally excludes:

- production passwords,
- API keys or bearer tokens,
- cookies or session data,
- payment or billing data,
- private customer records,
- full raw payloads containing personal data,
- and private account access.
````

## Filled Example

````markdown
# Integration Debug Handoff

## Expected behavior

When a customer updates their billing address in CRM, the CRM should send a `customer.updated` webhook to `enrichment-api`. The enrichment service should validate the payload, update the profile record, and return `2xx` within five seconds. The CRM should not retry after a successful `2xx`.

- Source system: `crm-webhooks`
- Target system: `enrichment-api`
- Trigger: billing address update
- Expected request, event, or job: `customer.updated`
- Expected success response: `2xx`
- Expected user or business outcome: enrichment status updates on the CRM profile
- Retry or timeout expectation: retry only for retryable transport or `5xx` failures

## Observed behavior

The target service returned `400` for some `customer.updated` events. The CRM retried each failed event three times. The CRM profile kept the old enrichment status and created manual review tasks.

- First visible failure: CRM profile did not update enrichment status
- Response code or error class: `400 validation_failed`
- Sanitized error message: `missing external_profile_id`
- Approximate affected volume: 18 events
- Still active: no
- User-visible impact: operations team saw manual review tasks for affected accounts

## Time window

- First observed: 2026-06-26 09:12 UTC
- Last observed: 2026-06-26 09:18 UTC
- Known good before: 2026-06-26 08:55 UTC
- Timezone: UTC
- Related deploy, config, or vendor event: `enrichment-api@2026.06.26.3` deployed at 08:50 UTC

## Correlation handles

- Environment: production
- Source service: `crm-webhooks`
- Target service: `enrichment-api`
- Route, topic, queue, or job name: `/webhooks/crm`
- Request IDs: `req_sanitized_01`, `req_sanitized_02`
- Trace IDs: `trc_7c2b_sanitized`, `trc_8aa4_sanitized`
- Job, event, message, or webhook IDs: `wh_82f1`, `wh_82f2`
- Deployment version: `enrichment-api@2026.06.26.3`
- Sanitized account or customer aliases: `customer-a`, `customer-b`

## Safe evidence

```text
2026-06-26T09:12:44Z enrichment-api warn validation_failed
request_id=req_sanitized_01 event_type=customer.updated
field=external_profile_id reason=missing

2026-06-26T09:12:45Z crm-webhooks info retry_scheduled
delivery_id=wh_82f1 attempt=2 delay_seconds=30
```

```json
{
  "event_type": "customer.updated",
  "customer_alias": "customer-a",
  "external_profile_id": null,
  "changed_fields": ["billing_address"],
  "sent_at": "2026-06-26T09:12:43Z"
}
```

## Metrics and traces

- Error rate during the window: `/webhooks/crm` 4xx rose from 0.2% to 7.8%
- Latency during the window: p95 stayed normal
- Queue depth or retry count: retries increased for failed deliveries only
- Dead-letter count: 0
- First failing span: validation step inside `enrichment-api`
- Downstream calls attempted: none after validation failure
- Dependency or vendor status: no known vendor incident

## Recent changes

- Deploys: `enrichment-api@2026.06.26.3` at 08:50 UTC
- Feature flags: none known
- Schema or field mapping changes: CRM field mapping import at 09:00 UTC
- Webhook subscription changes: none known
- Queue or retry policy changes: none known
- Data imports: field mapping import
- Manual admin actions: none known

## Ownership

- Source owner: CRM platform team
- Target owner: enrichment team
- Queue or platform owner: platform reliability team
- Data mapping owner: operations systems team
- External vendor owner: not involved in this path
- Decision maker for rollback or compatibility change: enrichment team lead

## Working hypotheses

1. The CRM field mapping import stopped sending `external_profile_id` for a subset of records.
2. The target validation cleanup made the missing field non-retryable but the CRM still treated the response as retryable.
3. The expected fallback behavior for legacy records is not documented.

## Acceptance checks

1. A `customer.updated` event with `external_profile_id` returns `2xx`.
2. A missing `external_profile_id` is either accepted with documented fallback behavior or rejected with a clear non-retryable error.
3. CRM does not retry non-retryable validation failures.
4. Operations no longer receives manual review tasks for this field mapping issue.
5. `validation_failed{field="external_profile_id"}` returns to normal for one hour.

## Excluded data

This handoff does not include production credentials, tokens, cookies, payment data, private customer records, or full raw payloads.
````

## Reviewer Checklist

Before sending the handoff, check:

- Did the note state expected and observed behavior?
- Is the time window narrow enough to search logs and traces?
- Are trace IDs, request IDs, job IDs, or delivery IDs included?
- Are logs and payload shapes sanitized?
- Are recent deploys or field mapping changes named?
- Are owners and acceptance checks clear?
- Does the note avoid secrets and private customer data?

If any answer is no, improve the handoff before asking another engineer to debug it.

## Why This Helps

Observability data becomes useful when the surrounding handoff is precise. A trace ID without expected behavior is only a clue. A log line without a time window is only a fragment. A hypothesis without acceptance checks is hard to verify.

This template turns scattered evidence into a compact debugging packet. It is intentionally narrow so teams can use it in issues, support escalations, incident notes, or paid integration diagnosis work without exposing unsafe production context.
