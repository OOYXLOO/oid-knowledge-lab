# Evidence Log

## Generated starting point

```python
def normalize_package_name(value):
    return value.strip().lower().replace("_", "-")
```

## Behavior contract added

- Accept only strings.
- Trim surrounding whitespace.
- Lowercase ASCII letters.
- Convert underscores to hyphens.
- Collapse repeated internal whitespace to a single hyphen.
- Reject empty values after trimming.
- Reject path separators and shell-oriented characters.
- Keep the scope honest: local report labels, not a complete packaging-name validator.

## Command

```powershell
python -m unittest -v
```

## Result

```text
test_collapses_repeated_internal_whitespace ... ok
test_error_paths_do_not_leak_input_context ... ok
test_normalizes_common_package_name_variants ... ok
test_preserves_existing_hyphen_boundaries ... ok
test_rejects_empty_values ... ok
test_rejects_non_string_values ... ok
test_rejects_path_or_shell_oriented_values ... ok

Ran 7 tests

OK
```

## Accepted changes

- Added explicit `TypeError` and `ValueError` paths.
- Added whitespace normalization.
- Added unsafe-character checks.
- Added a test that verifies error messages do not echo a private-looking path.

## Known limitations

- This is a small tutorial example for local report labels.
- For published package metadata, prefer the relevant packaging standards and libraries.

## Safety boundary

- Synthetic strings only.
- No credentials.
- No private account data.
- No production paths.
- No customer data.
- No copied third-party page bodies.
