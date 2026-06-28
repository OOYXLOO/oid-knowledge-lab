# AI Code Evaluator Portfolio Pack

Use this packet when a coding evaluator, AI trainer, or AI workflow review application asks for public examples of code-review judgment, testing discipline, and written explanations.

## Positioning

AI code evaluator focused on reviewing generated code as an untrusted draft: expected behavior first, focused tests second, edge cases and unsafe inputs third, evidence-backed decision last.

## Short Bio

I review AI-generated code as an untrusted draft. I define expected behavior, write focused tests, check edge cases and unsafe inputs, compare model responses, and explain whether a solution should be accepted, revised, or rejected.

## Best First Link

AI Code Evaluator Portfolio:

```text
https://oid-knowledge-lab.vercel.app/ai-code-evaluator-portfolio.html
```

## Public Proof Links

```text
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/ai-validation-python
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/ai-validation-python/duration_parser_review
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/ai-validation-python/duration_parser_review/evidence-log.md
https://oid-knowledge-lab.vercel.app/realpython-ai-reviewer-hub.html
https://oid-knowledge-lab.vercel.app/review-log-agent-hub.html
https://oid-knowledge-lab.vercel.app/review-log-agent-playground.html
https://oid-knowledge-lab.vercel.app/technical-rigor-proof.html
```

## Evaluation Approach

1. Define the expected behavior before accepting generated code.
2. Write focused tests for normal cases and edge cases.
3. Check unsafe inputs, source boundaries, private-data handling, and hidden assumptions.
4. Compare model outputs against the behavior contract rather than preferring fluent explanations.
5. Keep a compact evidence log with checks, failures, revisions, and residual limitations.

## Sample Case: Duration parser review

The duration parser case reviews a plausible generated helper that silently returns
`0` for unknown units. The evaluator decision rejects the draft because swallowed
invalid input can hide scheduling and timeout bugs. The revised implementation
raises explicit errors for unknown units, empty values, malformed amounts,
negative values, and non-string input, then proves the behavior with eight
focused `unittest` checks.

## Assessment Notes

- Do not invent runtime results. If a command was not run, say so.
- Prefer concrete examples over broad claims.
- Separate source facts from draft claims.
- Explain why a solution should be accepted, revised, or rejected.
- Keep private data, credentials, payment details, tax/KYC material, and private workspace exports out of public samples.
