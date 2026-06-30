# JavaScript and TypeScript Reviewer Application Pack

## Positioning

JavaScript, TypeScript, and Node.js reviewer focused on correctness, edge cases, maintainability, tests, and clear written feedback.

## Short Profile

I review developer-facing JavaScript, TypeScript, and Node.js work with attention to behavior contracts, boundary cases, implementation clarity, maintainability, and whether the final feedback is useful to another engineer. My public samples show how I separate expected behavior from likely risk, propose focused tests, and write concise revision guidance.

## Review Strengths

- Correctness: compare implementation behavior against the stated contract.
- Edge cases: check null, undefined, empty input, invalid state, coercion, async failure, partial parsing, and surprising defaults.
- Maintainability: prefer small, locally consistent changes over broad rewrites.
- Testing: suggest cases that prove the risky behavior, not only happy-path coverage.
- Written feedback: make severity, impact, evidence, and next action easy to understand.

## Public Samples

- JavaScript review sample: https://ooyxloo.github.io/oid-knowledge-lab/js-review-sample.html
- Reviewer readiness: https://ooyxloo.github.io/oid-knowledge-lab/geektastic-reviewer-readiness.html
- Code reviewer portfolio: https://ooyxloo.github.io/oid-knowledge-lab/code-reviewer-portfolio.html
- Technical rigor proof: https://ooyxloo.github.io/oid-knowledge-lab/technical-rigor-proof.html

## Sample Review Style

```text
Verdict:
Revise before acceptance.

Main issue:
The implementation silently accepts invalid input and can return NaN.

Evidence:
parseInt("abc", 10) returns NaN, and the current comparison checks do not catch it.

Impact:
The caller may treat an invalid retry-limit configuration as valid, which can affect backoff and failure behavior.

Suggested fix:
Use full-string numeric validation, reject non-integer input, and add tests for empty input, "0", invalid strings, partial numeric strings, and out-of-range values.

Residual risk:
The product should still decide whether user-facing forms should clamp values or reject them with validation errors.
```

## Private Assessment Boundary

This public packet does not include private assessment prompts, candidate code, platform screenshots, credentials, account data, payment details, private messages, cookies, or copied third-party material. Private review work should stay inside the platform that owns it.
