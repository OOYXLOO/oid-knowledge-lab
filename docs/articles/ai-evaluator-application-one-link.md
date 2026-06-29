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
https://ooyxloo.github.io/oid-knowledge-lab/ai-evaluator-application-packet.html
```

## Public Proof Links

```text
https://ooyxloo.github.io/oid-knowledge-lab/ai-code-evaluator-portfolio.html
https://ooyxloo.github.io/oid-knowledge-lab/mindrift-code-reviewer-hub.html
https://ooyxloo.github.io/oid-knowledge-lab/realpython-ai-reviewer-hub.html
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

## Copy-Ready Application Answers

```text
What kind of coding tasks fit you best?
Python and JavaScript code review, debugging, edge-case analysis, test design,
and clear explanations of why a generated answer should be accepted, revised,
or rejected.
```

```text
How do you evaluate AI-generated code?
I first define the expected behavior, then check normal cases, boundary cases,
invalid inputs, unsafe assumptions, and missing error handling. I prefer
runnable tests and concise evidence logs over surface-level explanations.
```

```text
What makes your feedback useful?
I separate the main issue, concrete evidence, suggested revision, and residual
risk so another reviewer or model trainer can see exactly what changed and why.
```

```text
Example project description:
My public OID Knowledge Lab includes small review cases that treat generated
code as an untrusted draft, add focused tests, revise unsafe behavior, and
publish a clear evidence log.
```

## Assessment Readiness

- Find the failure mode before rewriting code.
- Add focused checks for normal, boundary, invalid, and unsafe inputs.
- Patch narrowly without rewriting unrelated structure.
- Explain residual risk and unsupported cases.

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
