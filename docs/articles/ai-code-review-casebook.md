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

Additional comparison sample:

```text
https://ooyxloo.github.io/oid-knowledge-lab/model-response-comparison-lab.html
```

Raw Markdown:

```text
https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/model-response-comparison-lab.md
```

## Case: typeorm_normalize_where_defaults

Public issue:

```text
https://github.com/typeorm/typeorm/issues/12578
```

Why this case matters:

- It starts from a framework utility where a guard clause skipped documented
  default behavior for invalid `where` values.
- It traces the root cause to `OrmUtils.normalizeWhereCriteria` returning early
  when no explicit behavior object was provided.
- It removes the early return so the existing default `?? "throw"` behavior can
  run for `null` and `undefined` values.
- It adds focused unit coverage for default `undefined`, default `null`,
  recursive nested criteria, and the explicit `{ undefined: "ignore" }` path.

Validation performed:

```text
node --check src\util\OrmUtils.ts
node --check test\unit\util\orm-utils.test.ts
pnpm exec tsc --noEmit --pretty false
pnpm run compile
pnpm exec prettier --check src/util/OrmUtils.ts test/unit/util/orm-utils.test.ts
git diff --check
node_modules\.bin\mocha.cmd --no-config build/compiled/test/unit/util/orm-utils.test.js
```

Targeted unit test result:

```text
18 passing
```

## Boundary

The examples are public, original review artifacts. They do not include private
source code, credentials, account exports, identity documents, payment data, tax
records, private platform messages, or restricted assessment content.
