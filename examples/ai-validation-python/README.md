# AI Validation Python Mini Lab

This mini lab supports the Real Python-oriented sample:

```text
Validate AI-Generated Python Code with Tests, Edge Cases, and a Lightweight Evidence Log
```

It is intentionally small and dependency-free so an editor can review and run it quickly. The article version can translate the same checks into `pytest`; this lab uses the Python standard library so the public repository does not need an extra Python dependency.

## Files

- `package_names.py` - revised implementation after treating generated code as an untrusted draft.
- `test_package_names.py` - focused behavior checks using `unittest`.
- `evidence-log.md` - short verification log and editorial boundary.

## Run

From this directory:

```powershell
python -m unittest -v
```

Expected result:

```text
Ran 7 tests

OK
```

## Boundary

This is a local report-label normalizer, not a full Python packaging-name validator. For published package metadata, prefer the relevant packaging standards and libraries.

No credentials, private data, account exports, customer inventories, or copied third-party page bodies are used.
