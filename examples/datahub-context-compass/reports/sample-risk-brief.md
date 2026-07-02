# DataHub Context Compass Brief

Workspace: sanitized-retail-demo
Generated: 2026-07-03T05:30:00+08:00

## Summary

- Total proposed changes: 2
- Blocked: 1
- Needs review: 1
- Ready: 0

## CHG-1001: Remove coupon_code after marketing migration

- Dataset: analytics.customer_orders
- Domain: Revenue Analytics
- Status: review
- Risk score: 40
- Evidence:
  - Owner: data-platform@example.com
  - Schema removal requires downstream compatibility review.
  - High-criticality downstream assets: finance.daily_revenue

## CHG-1002: Generate daily support theme summaries from ticket body

- Dataset: raw.support_tickets
- Domain: Support
- Status: blocked
- Risk score: 105
- Evidence:
  - High-criticality downstream assets: support.exec_dashboard
- Blockers:
  - No dataset owner is listed
  - Sensitive fields touched: requester_email:pii, body:sensitive
  - Open incidents: INC-2041
  - Freshness is stale at 38 hours
