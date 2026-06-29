# Peer Code Reviewer Portfolio

This portfolio is a compact public reference for code-review, AI-code-evaluation, and peer-reviewer applications. It shows how I review generated or submitted code as an untrusted draft: define expected behavior, add focused tests, inspect edge cases, explain risk, and give a clear accept / revise / reject verdict.

## Review Method

1. Restate the expected behavior in plain language.
2. Identify the highest-risk inputs, boundaries, and failure modes.
3. Add focused tests before recommending acceptance.
4. Compare the implementation against the tests and task constraints.
5. Explain the verdict, evidence, suggested fix, and residual risk.

## Proof Links

| Artifact | Link | What it proves |
| --- | --- | --- |
| AI code review casebook | https://ooyxloo.github.io/oid-knowledge-lab/ai-code-review-casebook.html | Review answer shape, verdict framing, and evidence-backed handoff. |
| Python assessment drill | https://ooyxloo.github.io/oid-knowledge-lab/python-assessment-drill.html | Bug triage, pytest sketch, and reviewer rubric. |
| Model response comparison lab | https://ooyxloo.github.io/oid-knowledge-lab/model-response-comparison-lab.html | Comparing two generated answers and selecting the safer response. |
| AI evaluator application packet | https://ooyxloo.github.io/oid-knowledge-lab/ai-evaluator-application-packet.html | Copy-ready role summary and proof order for AI evaluator applications. |
| Runnable Python review case | https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/ai-validation-python/duration_parser_review | Corrected implementation, tests, and evidence log. |
| Evidence log | https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/ai-validation-python/duration_parser_review/evidence-log.md | Main issue, checks performed, accepted revision, and limitations. |

## Sample Verdict Shape

```text
Verdict:
The solution should be revised.

Main issue:
It silently accepts unknown duration units and returns 0, which can hide bad input.

Evidence:
The existing behavior does not distinguish "5 parsecs" from a valid zero-duration input.

Suggested fix:
Reject unknown units with an explicit error and add tests for invalid units.

Residual risk:
The parser still needs a product decision for compound durations such as "1h 30m".
```

## Boundaries

The examples are public, original review artifacts. They do not include private source code, credentials, customer data, platform-restricted assessment content, payment data, tax records, account screenshots, cookies, or private messages.
