# Duration Parser Review Case

This AI Coding Evaluator case shows how to review a plausible but unsafe
AI-generated Python helper before accepting it.

The generated draft silently returns 0 for unknown units. That is the central
review issue: callers cannot tell the difference between a real zero duration
and an invalid input that was swallowed.

## Files

- `duration_parser.py` - revised implementation after review.
- `test_duration_parser.py` - behavior checks using Python `unittest`.
- `evidence-log.md` - reviewer decision, test summary, and boundaries.

## Run

From this directory:

```powershell
python -m unittest -v
```

Expected result:

```text
Ran 8 tests

OK
```

## Review Focus

- Define accepted input before trusting the implementation.
- Reject silent failure for unknown units.
- Cover empty input, malformed values, negative values, non-string input, and
  whitespace.
- Explain the decision in clear evaluator-style English.

No credentials, private platform data, customer data, or copied third-party
article bodies are used.
