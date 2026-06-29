# Real Python Application Packet

## Topic

```text
Validate AI-Generated Python Code with Tests, Edge Cases, and a Lightweight Evidence Log
```

## Short fit statement

I write practical Python and AI-assisted development tutorials that treat generated code as a draft, not as something to trust blindly. This packet shows a proposed Real Python-style article about validating AI-generated Python code with a behavior contract, focused tests, edge cases, safe input boundaries, and a lightweight evidence log.

## Best first links

1. Reviewer hub:  
   <https://ooyxloo.github.io/oid-knowledge-lab/realpython-ai-reviewer-hub.html>

2. Runnable Python mini lab:  
   <https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/ai-validation-python>

3. Mini lab evidence log:  
   <https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/ai-validation-python/evidence-log.md>

4. Duration parser review case:
   <https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/ai-validation-python/duration_parser_review>

5. Duration parser evidence log:
   <https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/examples/ai-validation-python/duration_parser_review/evidence-log.md>

6. Article mini sample:
   <https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/realpython-ai-validation-mini-sample.md>

7. Tutorial outline:
   <https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/realpython-ai-validation-tutorial-outline.md>

8. Paid pilot readiness pack:
   <https://raw.githubusercontent.com/OOYXLOO/oid-knowledge-lab/main/docs/articles/realpython-paid-pilot-readiness-pack.md>

## Reader promise

By the end of the proposed article, a Python reader should know how to:

- Turn an AI-generated helper into a clear behavior contract.
- Write focused tests before trusting the generated implementation.
- Add edge-case and invalid-input checks.
- Review unsafe string handling and data-boundary assumptions.
- Revise generated code instead of accepting it blindly.
- Keep a compact evidence log of commands, results, accepted changes, and known limitations.

## Copy-Ready Application Responses

```text
Why this role?
I want to teach Python developers the practical middle ground of AI-assisted
development: use assistants for speed, but keep behavior contracts, tests,
edge-case review, and human judgment in the loop.
```

```text
First article idea:
Validate AI-Generated Python Code With Pytest, Edge Cases, and Evidence Logs.
The tutorial would start from a plausible generated helper, define expected
behavior, add focused tests, revise unsafe behavior, and finish with a compact
evidence log.
```

```text
Reader outcome:
Readers should leave with a repeatable workflow for deciding when to accept,
revise, or reject generated Python code, instead of treating fluent output as
correct.
```

```text
Editorial fit:
The material is practical, Python-specific, implementation-backed, and focused
on quality rather than AI hype or model-building theory.
```

## Paid Pilot Shape

The first paid pilot can stay narrow:

1. Start with a compact generated helper function that looks plausible but has
   hidden edge-case issues.
2. Translate the intended behavior into explicit examples before trusting the
   code.
3. Add normal, boundary, invalid-input, and unsafe-string tests the reader can
   run locally.
4. End with a short evidence log of commands, failures, accepted fixes, rejected
   assumptions, and limitations.

## Runnable proof

The mini lab is intentionally dependency-free so it can be reviewed quickly:

```powershell
cd examples/ai-validation-python
python -m unittest -v
```

Expected result:

```text
Ran 7 tests

OK
```

The lab includes:

- `package_names.py` - revised implementation after treating generated code as an untrusted draft.
- `test_package_names.py` - focused behavior checks using Python's standard `unittest`.
- `evidence-log.md` - verification log, accepted changes, limitations, and safety boundary.

The duration parser review case adds a second small reviewer sample. It rejects
a generated implementation that silently returns `0` for unknown duration units,
then replaces it with explicit errors and eight unit tests.

## Editorial boundary

These materials are a public review packet and implementation proof. If an assignment is accepted, the final article should be written freshly for Real Python's accepted topic, style guide, editor feedback, and originality requirements.

No credentials, private account exports, private customer inventories, payment data, identity data, or copied full third-party page bodies are included.
