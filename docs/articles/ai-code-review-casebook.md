# AI Code Review Casebook

This casebook is a compact reference for AI code evaluator, code-review, and
Python AI workflow applications. It shows how generated code is reviewed as an
untrusted draft rather than accepted because it looks plausible.

## Review Frame

```text
Verdict:
The solution should be accepted / revised / rejected.

Main issues:
- ...

Evidence:
- ...

Suggested fix:
- ...

Tests I would add:
- ...

Residual risk:
- ...
```

Use this frame to keep the review concise. The goal is not to write a long essay;
the goal is to make the accept / revise / reject decision traceable.

## Case: duration_parser_review

Public case:

```text
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/ai-validation-python/duration_parser_review
```

Evidence log:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/ai-validation-python/duration_parser_review/evidence-log.md
```

Why this case matters:

- It starts from a generated duration parser that silently returns `0` for
  unknown units.
- It rejects that behavior because silent failure hides bad input.
- It revises the parser to raise explicit errors for malformed values,
  unsupported units, negative values, and non-string inputs.
- It proves the revision with focused unit tests.

## Application Use

For a code-review or AI workflow application, this casebook supports claims
about:

- behavior-first code review;
- Python test design;
- invalid-input and edge-case analysis;
- evidence-backed decisions;
- concise reviewer handoffs.

## Boundary

The examples are public, original review artifacts. They do not include private
source code, credentials, account exports, identity documents, payment data, tax
records, private platform messages, or restricted assessment content.
