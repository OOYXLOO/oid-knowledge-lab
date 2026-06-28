# Python Assessment Drill

This drill is a compact public sample for Python AI evaluator and generated-code review roles. It shows how to turn an ambiguous model answer into a behavior contract, focused `pytest` checks, a concise verdict, and a safe reviewer handoff.

## Bug triage prompt

An AI-generated function parses a duration string such as `15m`, `2h`, or `1d` and returns seconds. The implementation silently returns `0` when the unit is unknown.

Review the answer as if it were submitted for a production utility.

## Expected reviewer response

```text
Verdict: revise before acceptance.

Main issue: the implementation silently accepts unknown units, so invalid input can look like a valid zero-second duration.

Evidence: add tests for known units, whitespace, malformed values, and unsupported units.

Suggested fix: keep a strict unit map and raise ValueError for unsupported or malformed input.

Residual risk: callers still need to decide whether fractional durations, signed values, and localized units are in scope.
```

## Model answer rubric

Strong answers should:

- restate the expected behavior before proposing code,
- reject silent fallback behavior for invalid input,
- include `pytest` checks for normal, boundary, malformed, and unsupported inputs,
- keep the fix narrow instead of rewriting unrelated behavior,
- explain residual risk without overclaiming correctness,
- and avoid credentials, private data, copied assessment text, or platform-private examples.

## Minimal pytest sketch

```python
import pytest

from duration_parser import parse_duration


def test_parses_supported_units():
    assert parse_duration("15m") == 900
    assert parse_duration("2h") == 7200
    assert parse_duration("1d") == 86400


def test_rejects_unknown_unit():
    with pytest.raises(ValueError, match="unsupported unit"):
        parse_duration("3w")


def test_rejects_malformed_input():
    with pytest.raises(ValueError, match="duration"):
        parse_duration("soon")
```

## Public proof links

- Runnable case: `examples/ai-validation-python/duration_parser_review`
- Evidence log: `examples/ai-validation-python/duration_parser_review/evidence-log.md`
- Application packet: `public/ai-evaluator-application-packet.html`
- Casebook: `public/ai-code-review-casebook.html`

## Boundary

No credentials, private account exports, identity documents, payment data, tax records, private platform messages, copied private assessment prompts, or restricted customer source code are included.
