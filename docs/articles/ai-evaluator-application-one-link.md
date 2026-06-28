# AI Evaluator Application Packet

Use this packet when an AI code evaluator, coding trainer, or AI workflow review
application asks for a concise role summary, public proof links, or a short
explanation of how generated code should be reviewed.

## Short Role Summary

```text
I review AI-generated code as an untrusted draft. I define expected behavior,
write focused tests, check edge cases and unsafe inputs, revise implementations
when needed, and explain accept/revise/reject decisions with evidence logs.
```

## Strongest First Link

```text
https://oid-knowledge-lab.vercel.app/ai-evaluator-application-packet.html
```

## Public Proof Links

```text
https://oid-knowledge-lab.vercel.app/ai-code-evaluator-portfolio.html
https://oid-knowledge-lab.vercel.app/mindrift-code-reviewer-hub.html
https://oid-knowledge-lab.vercel.app/realpython-ai-reviewer-hub.html
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/ai-validation-python
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/ai-validation-python/duration_parser_review
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/ai-validation-python/duration_parser_review/evidence-log.md
```

## Review Method

1. Turn the task prompt into a behavior contract before judging the answer.
2. Check normal inputs, boundary inputs, invalid inputs, and unsafe assumptions.
3. Prefer tests and executable examples over fluent explanations.
4. Separate source facts, generated claims, reviewer findings, and residual risk.
5. Give a clear verdict: accept, revise, or reject.

## Example Verdict Frame

```text
Verdict:
Reject as written; accept after revision.

Main issue:
The generated implementation silently returns 0 for unknown duration units,
which hides invalid input.

Evidence:
The duration parser review case adds explicit errors for unknown units, empty
values, malformed amounts, negative values, and non-string input. The revised
version is covered by eight focused unit tests.

Residual risk:
The helper intentionally supports only s, m, h, and d units. More complex
duration formats should be handled by a separate parser.
```

## Best-Fit Tasks

- Python code review.
- AI-generated code evaluation.
- Model-response comparison for coding tasks.
- Bug finding and edge-case review.
- Writing corrected implementations with evidence-backed explanations.
- AI workflow validation where source boundaries and test evidence matter.

## Boundary

This public packet contains original code, reviewer samples, and neutral proof
links. It does not contain credentials, private account exports, customer data,
payment information, tax or identity records, private platform messages, or
copied third-party article bodies.
