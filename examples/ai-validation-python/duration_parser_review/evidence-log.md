# Evidence Log: Duration Parser Review

## Decision

Reject the generated implementation as written, then accept the revised version
after explicit error handling and tests are added.

## Reader Question

How should a reviewer evaluate an AI-generated helper that parses compact
duration strings such as `10s`, `5m`, `2h`, and `1d`?

## Source Facts

- The generated implementation returned `0` for unknown units.
- Returning `0` silently can hide invalid input.
- The accepted behavior should be explicit about valid units and invalid input.

## Review Checks

- Valid units: `s`, `m`, `h`, `d`.
- Surrounding whitespace is trimmed.
- Uppercase units are accepted by normalizing to lowercase.
- Empty input raises `ValueError`.
- Unknown units raise `ValueError`.
- Negative and decimal amounts raise `ValueError`.
- Non-string input raises `TypeError`.

## Verification

Command:

```text
python -m unittest -v
```

Expected summary:

```text
Ran 8 tests

OK
```

## Evaluator Summary

I would reject the generated implementation as written because it silently
returns `0` for unknown units. That can hide invalid input and create downstream
scheduling or timeout bugs. I would require explicit errors for unknown units,
empty values, negative values, malformed amounts, and non-string values. After
that, I would accept the revised implementation because the behavior contract is
small, documented, and covered by focused tests.

## Boundary

This is a compact evaluator portfolio case. It does not use private platform
data, credentials, account exports, customer records, payment data, or copied
third-party article bodies.
