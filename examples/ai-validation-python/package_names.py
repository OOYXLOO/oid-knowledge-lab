"""Small validation example for AI-generated Python code.

The starting AI-generated draft was:

    def normalize_package_name(value):
        return value.strip().lower().replace("_", "-")

The implementation below reflects the revised version after writing a behavior
contract and testing invalid input.
"""

import re


UNSAFE_PACKAGE_CHARS = re.compile(r"[\\/;|&`$<>]")
WHITESPACE = re.compile(r"\s+")


def normalize_package_name(value):
    """Normalize a package-like label for a local report.

    This helper is intentionally scoped to local evidence reports. It is not a
    complete Python package-name validator.
    """
    if not isinstance(value, str):
        raise TypeError("package name must be a string")

    normalized = value.strip().lower().replace("_", "-")
    normalized = WHITESPACE.sub("-", normalized)

    if not normalized:
        raise ValueError("package name is required")
    if UNSAFE_PACKAGE_CHARS.search(normalized):
        raise ValueError("unsafe package name")

    return normalized
