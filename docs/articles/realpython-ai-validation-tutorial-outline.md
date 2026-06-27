# Validate AI-Generated Python Code: Tutorial Outline

## Working title

Validate AI-Generated Python Code with Tests, Edge Cases, and a Lightweight Evidence Log

## Target reader

A working Python developer who uses coding assistants but wants a disciplined way to decide whether generated code is correct, maintainable, and safe enough to keep.

## Learning goals

By the end, the reader can:

- Turn an AI-generated implementation into a testable hypothesis.
- Write focused tests before trusting the generated code.
- Check edge cases that assistants often miss.
- Review basic security and data-handling assumptions.
- Keep a compact evidence log that explains why the code was accepted or revised.

## Tutorial shape

1. Start with a small Python task and an AI-generated first draft.
2. Define expected behavior in plain language.
3. Add `pytest` tests for normal, boundary, and invalid inputs.
4. Run the tests and inspect failures.
5. Refactor the implementation while preserving the behavior contract.
6. Add a short review checklist:
   - Correctness
   - Edge cases
   - Input validation
   - Error handling
   - Security assumptions
   - Performance assumptions
7. Save a lightweight evidence log with commands, results, and known limitations.
8. Close with when to accept, when to revise, and when not to use AI.

## Suggested demo task

Build a Python helper that normalizes user-supplied identifiers and classifies them as valid, malformed, or unsupported. The data can be synthetic and intentionally small so the tutorial stays focused on validation workflow rather than domain complexity.

## Code assets to prepare

- `src/validator.py`
- `tests/test_validator.py`
- `examples/sample_inputs.csv`
- `reports/evidence-log.md`

## Editorial boundary

No private prompts, account exports, credentials, payment data, production logs, personal data, or copied proprietary datasets should appear in the article or sample repository.

