# CI Storage Check Case Study

## Context

A storage-layout workflow was checking every changed Solidity contract and library. That is useful for existing upgradeable code, but it also sent brand-new files into the storage comparison action. New files do not have baseline artifacts, so the workflow could fail before it reached the meaningful storage-safety question.

## Diagnosis

The workflow matrix was built from all changed files. The important distinction was file status:

- modified existing files should continue through storage-layout checks
- newly added files should not require a previous storage artifact
- unchanged paths should not create matrix entries

## Patch Shape

The workflow matrix should be built from modified files only:

```yaml
if: steps.changed-contracts.outputs.contracts_modified_files != ''
env:
  CHANGED_CONTRACTS: ${{ steps.changed-contracts.outputs.contracts_modified_files }}
```

The same pattern applies to library storage checks:

```yaml
if: steps.changed-libraries.outputs.libraries_modified_files != ''
env:
  CHANGED_LIBS: ${{ steps.changed-libraries.outputs.libraries_modified_files }}
```

## QA Matrix

| Scenario | Expected behavior |
| --- | --- |
| No storage updates | No matching modified files, so no storage-check matrix is created. |
| Existing contract updated with no collision | The modified contract remains in the matrix and is checked. |
| Existing contract updated with collision | The modified contract remains in the matrix and the existing storage action can fail the workflow. |
| New contract or library added | The new file is not in the modified-file matrix, so the workflow does not look for a missing baseline artifact. |

## Review Notes

This is a narrow CI fix. It does not weaken storage checks for existing upgradeable contracts or libraries; it only prevents false failures for new files that cannot have prior storage artifacts yet.

