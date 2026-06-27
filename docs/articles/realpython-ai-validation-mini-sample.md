# Validate AI-Generated Python Code with Tests, Edge Cases, and a Lightweight Evidence Log

This mini sample shows the core teaching style for a Python + AI tutorial: start with generated code, treat it as untrusted, and accept it only after a small behavior contract, focused tests, edge-case review, and an evidence log.

The example is intentionally small. A full article would expand the workflow, but the important lesson is already visible: an AI assistant can draft code, but a Python developer still owns the contract and the verification.

## Scenario

Suppose an assistant proposes this helper for normalizing user-provided package names before writing them into a local report:

```python
def normalize_package_name(value):
    return value.strip().lower().replace("_", "-")
```

It looks plausible. It handles whitespace, casing, and underscores. But before accepting it, write the behavior contract in plain language.

## Behavior Contract

The helper should:

1. Accept only strings.
2. Trim surrounding whitespace.
3. Lowercase ASCII letters.
4. Convert underscores to hyphens.
5. Collapse repeated internal whitespace to a single hyphen.
6. Reject empty values after trimming.
7. Reject values with path separators or shell-oriented characters.

That contract is already more precise than the generated implementation.

## Focused Pytest Cases

```python
import pytest

from package_names import normalize_package_name


def test_normalizes_common_package_name_variants():
    assert normalize_package_name("  My_Package Name  ") == "my-package-name"


@pytest.mark.parametrize("value", ["", "   ", "\t\n"])
def test_rejects_empty_values(value):
    with pytest.raises(ValueError, match="package name is required"):
        normalize_package_name(value)


@pytest.mark.parametrize("value", ["../secret", "pkg;rm -rf", "pkg|cat"])
def test_rejects_path_or_shell_oriented_values(value):
    with pytest.raises(ValueError, match="unsafe package name"):
        normalize_package_name(value)


def test_rejects_non_string_values():
    with pytest.raises(TypeError, match="package name must be a string"):
        normalize_package_name(None)
```

Those tests reveal the first generated version is incomplete: it accepts empty strings, does not collapse spaces, does not reject unsafe characters, and crashes unclearly on non-strings.

## Revised Implementation

```python
import re

UNSAFE_PACKAGE_CHARS = re.compile(r"[\\/;|&`$<>]")
WHITESPACE = re.compile(r"\s+")


def normalize_package_name(value):
    if not isinstance(value, str):
        raise TypeError("package name must be a string")

    normalized = value.strip().lower().replace("_", "-")
    normalized = WHITESPACE.sub("-", normalized)

    if not normalized:
        raise ValueError("package name is required")
    if UNSAFE_PACKAGE_CHARS.search(normalized):
        raise ValueError("unsafe package name")

    return normalized
```

This still is not a full packaging-name validator. That is acceptable if the article says so. The goal is to teach a validation loop, not to claim this tiny helper replaces a mature packaging library.

## Evidence log

Keep the evidence short enough that a future reviewer can read it:

```text
Generated starting point:
- normalize_package_name(value): strip, lower, replace underscores.

Behavior contract added:
- type check, empty rejection, whitespace collapse, unsafe character rejection.

Commands run:
- python -m pytest tests/test_package_names.py

Result:
- 4 tests passed.

Accepted changes:
- Added explicit TypeError / ValueError paths.
- Added whitespace and unsafe-character checks.

Known limitations:
- This is a local report label normalizer, not a complete Python packaging name validator.
- For published package metadata, prefer the relevant packaging/specification library.

No secrets:
- Tests use synthetic package-name strings only.
- No credentials, private account data, production paths, or customer data are included.
```

## When to reject the generated code

Reject or rewrite the assistant's output when:

- You cannot state the behavior contract.
- The tests mostly encode the generated implementation instead of the intended behavior.
- The code handles happy paths but fails basic invalid inputs.
- The answer touches credentials, file paths, account data, or network calls without a clear safety boundary.
- The model invents an API or library behavior you have not verified.

The practical takeaway for Python developers is simple: AI-generated code is a draft. Tests, edge cases, and evidence make it engineering.
