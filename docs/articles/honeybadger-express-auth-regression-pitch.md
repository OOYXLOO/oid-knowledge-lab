# Honeybadger Pitch: Catch Missing Auth in Express APIs with Regression Tests

## Proposed Title

Catch Missing Auth in Express APIs with Regression Tests

## Short Pitch

Authentication bugs often enter an API quietly: a new route is added, a router is mounted before middleware, or a file upload endpoint is left public by accident. This article shows JavaScript developers how to build small regression tests that prove anonymous requests are rejected and authenticated requests still work.

## Reader Problem

Many Express applications start with a few routes and grow into many routers: auth, users, uploads, notifications, admin, search, billing, and more. It is easy for one route to miss the authentication middleware while the rest of the app appears secure.

These bugs are painful because they are often simple, but the impact can be high:

- anonymous reads of user-scoped data
- anonymous writes to internal resources
- upload endpoints that parse files before checking identity
- routes that only fail after a real incident or manual review

## Tutorial Outcome

Readers will build a small Express API and a focused test suite using Node's built-in test runner. By the end, they will have a reusable pattern for:

1. starting the Express app on a random local port
2. sending anonymous requests with `fetch`
3. asserting 401 responses for protected routes
4. signing a test bearer credential
5. asserting authenticated success paths
6. keeping auth regression tests fast enough to run in CI

## Proposed Outline

1. Why missing-auth bugs survive code review
2. A small Express app with public and protected routers
3. Writing the first regression test for anonymous access
4. Watching the test fail for the right reason
5. Applying auth middleware at the router boundary
6. Testing the authenticated success path
7. Extending the pattern to upload, notification, and admin routes
8. CI tips: fast tests, clear failure messages, and route inventories
9. Final checklist for Express auth boundary reviews

## Honeybadger Fit

Honeybadger readers care about production failures, observability, debugging, and defensive engineering. This article is not about a specific vendor integration. It is a practical testing tutorial that helps developers catch a common class of security and reliability bugs before they become incidents.

## Proof of Capability

These links show related public work and writing style. The final article would be written fresh for Honeybadger:

- Writing samples: https://ooyxloo.github.io/oid-knowledge-lab/writing-samples.html
- API/review casebook: https://ooyxloo.github.io/oid-knowledge-lab/ai-code-review-casebook.html
- Public repository: https://github.com/OOYXLOO/oid-knowledge-lab

## Short Bio

I build verification-first engineering workflows and then turn them into practical tutorials. Recent public work includes OID Knowledge Lab, AI code review case studies, generated-media provenance demos, and reproducible JavaScript verification commands.
