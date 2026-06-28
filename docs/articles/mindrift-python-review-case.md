# Python Review Case

This is a compact public sample for AI code-review and coding-evaluator roles.

## Task

Review a generated Python function that normalizes package names before comparing dependency inventories.

Generated implementation:

```python
def normalize_package_name(name):
    return name.strip().lower().replace("_", "-").split(".")[0]
```

## Verdict

Revise before accepting.

## Main Issues

- The function silently drops dotted package segments.
- It accepts empty names.
- It does not reject unsupported characters.
- It has no clear input contract for non-string values.

## Evidence

- `my_package.tools` becomes `my-package`, losing `.tools`.
- `"   "` returns an empty string instead of failing.
- `pkg; rm -rf /` is not rejected before normalization.
- `None` raises an unclear attribute error.

## Suggested Fix

```python
import re

_PACKAGE_RE = re.compile(r"^[a-z0-9]+(?:[._-][a-z0-9]+)*$", re.IGNORECASE)

def normalize_package_name(name):
    if not isinstance(name, str):
        raise TypeError("package name must be a string")

    candidate = name.strip()
    if not candidate:
        raise ValueError("package name cannot be empty")
    if not _PACKAGE_RE.fullmatch(candidate):
        raise ValueError("package name contains unsupported characters")

    return candidate.lower().replace("_", "-")
```

## Tests I Would Add

```python
def test_normalizes_case_and_underscores():
    assert normalize_package_name(" Requests_Toolkit ") == "requests-toolkit"

def test_preserves_dotted_segments():
    assert normalize_package_name("my_package.tools") == "my-package.tools"

def test_rejects_empty_names():
    with pytest.raises(ValueError):
        normalize_package_name("   ")

def test_rejects_unsafe_characters():
    with pytest.raises(ValueError):
        normalize_package_name("pkg; rm -rf /")

def test_rejects_non_string_input():
    with pytest.raises(TypeError):
        normalize_package_name(None)
```

## Residual Risk

If the task requires exact Python packaging semantics, compare this lightweight validator against the packaging library's normalized name rules before accepting the final implementation.

## Public Boundary

This sample uses original code and synthetic inputs. It does not include private repositories, credentials, customer data, account exports, payment information, identity documents, or copied third-party assessment content.
