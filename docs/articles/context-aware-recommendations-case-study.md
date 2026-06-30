# Context-aware contributor recommendations

This case study shows a small ranking change for a contributor recommendation workflow. The original ranking used semantic similarity only, which can overvalue a highly similar issue from an unrelated organization over a slightly less similar issue from the same repository.

## Problem

Contributor recommendations are only useful when they reflect practical project context. A developer who completed a similar task in the same repository is often more relevant than a developer who completed a semantically similar task in a different organization.

## Change

The ranking layer now adjusts matched issue scores by repository context:

- Same repository: keep the full similarity score.
- Same owner or organization: keep 75% of the score.
- Different owner or organization: keep 50% of the score.

This keeps the embedding search broad while making the final contributor list more project-aware.

## Verification

The regression test constructs two matches:

- A cross-organization issue with 98% raw similarity.
- A same-repository issue with 82% raw similarity.

After context weighting, the same-repository contributor ranks first at 82%, while the cross-organization contributor drops to 49%.

Verification commands used:

```bash
npx --yes bun run build
npx --yes bun test tests/main.test.ts --test-name-pattern "same repository context"
git diff --check
npx --yes prettier --check src/handlers/issue-matching.ts tests/main.test.ts
```

## Takeaway

Semantic search should not be the final ranking signal by itself. A lightweight business-context multiplier can make recommendations more useful without adding a heavy model, changing the database schema, or narrowing the search too early.

