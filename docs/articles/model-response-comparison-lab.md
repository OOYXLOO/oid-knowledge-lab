# Model Response Comparison Lab

This public evaluator sample compares two generated Python answers with behavior
checks, pytest-oriented evidence, a winning answer verdict, and residual risk.
It is designed for AI code evaluator, Python workflow validation, and model
response comparison applications.

## Evaluator Task

Review two generated Python answers for a helper named `parse_duration(value)`.
The helper should accept strings like `15m`, `2h`, and `1d` and return seconds.
It should reject malformed input instead of silently returning a misleading
value.

## Candidate A

```python
def parse_duration(value):
    amount = int(value[:-1])
    unit = value[-1]
    if unit == "s":
        return amount
    if unit == "m":
        return amount * 60
    if unit == "h":
        return amount * 3600
    return 0
```

Candidate A handles common inputs, but it silently returns `0` for unknown
units. That hides invalid input and can make a failed configuration look like an
intentional zero-second duration.

## Candidate B

```python
def parse_duration(value):
    if not isinstance(value, str) or len(value) < 2:
        raise ValueError("duration must be a string like '15m'")
    unit = value[-1]
    amount_text = value[:-1]
    if not amount_text.isdigit():
        raise ValueError("duration amount must be a non-negative integer")
    factors = {"s": 1, "m": 60, "h": 3600, "d": 86400}
    if unit not in factors:
        raise ValueError(f"unsupported duration unit: {unit}")
    return int(amount_text) * factors[unit]
```

Candidate B makes the supported contract explicit and rejects unsupported
inputs. It is easier to test, easier to explain, and safer for model-evaluation
work.

## pytest Evidence

```python
import pytest

def test_common_units():
    assert parse_duration("15m") == 900
    assert parse_duration("2h") == 7200
    assert parse_duration("1d") == 86400

@pytest.mark.parametrize("value", ["", "abc", "5w", "-1m", 12, None])
def test_invalid_values_raise(value):
    with pytest.raises(ValueError):
        parse_duration(value)
```

## Winning answer

Candidate B wins.

Candidate A should be rejected as written because silent fallback behavior is
unsafe. Candidate B is acceptable for the stated contract after focused tests
are added.

## Residual risk

Residual risk: this helper intentionally supports only whole-number values and
the units `s`, `m`, `h`, and `d`. It does not parse compound durations like
`1h30m`, fractional values, ISO-8601 duration strings, or localized unit names.
Those should be handled by a separate parser and test set.

## Application Use

This sample supports evaluator applications because it shows how to:

- compare Candidate A and Candidate B against behavior rather than wording;
- add pytest checks for normal and invalid cases;
- pick a winning answer with evidence;
- reject silent failure;
- and state residual risk clearly.

## Boundary

This sample uses original toy code and public review text. It contains no
credentials, private source code, account exports, identity records, payment
data, tax records, private platform messages, customer data, or restricted
assessment content.
