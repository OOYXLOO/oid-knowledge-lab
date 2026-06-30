# TypeORM 12578 Contribution Notes

This folder preserves a review-ready summary for a proposed TypeORM fix around
default `invalidWhereValuesBehavior` handling in `OrmUtils.normalizeWhereCriteria`.

## Problem

`OrmUtils.normalizeWhereCriteria` returned the input criteria unchanged when no
`invalidWhereValuesBehavior` options object was passed. That short-circuited the
function before its default null and undefined handling could run.

The proposed fix removes that early return so the existing default branches apply
consistently to top-level and nested where criteria.

## Local Branch

```text
fix-12578-normalize-where-defaults
```

## Proposed Change

```diff
diff --git a/src/util/OrmUtils.ts b/src/util/OrmUtils.ts
index 29b564a..15eb16b 100644
--- a/src/util/OrmUtils.ts
+++ b/src/util/OrmUtils.ts
@@ -662,10 +662,6 @@ export class OrmUtils {
         options?: InvalidFindOptionsWhereBehavior,
         path?: string,
     ): ObjectLiteral | ObjectLiteral[] {
-        if (!options) {
-            return criteria
-        }
-
         // multiple criteria are possible at the top level
         if (!path && Array.isArray(criteria)) {
             return criteria.map(
```

## Test Coverage Added

The local patch adds unit coverage for:

- undefined values throwing by default;
- null values throwing by default;
- nested where criteria applying the default behavior recursively;
- explicit `{ undefined: "ignore" }` still skipping undefined values.

## Verification Notes

The local worktree passed the targeted unit test after compilation:

```text
node_modules\.bin\mocha.cmd --no-config build/compiled/test/unit/util/orm-utils.test.js
18 passing
```

The following checks were also used locally while preparing the branch:

```text
pnpm exec tsc --noEmit --pretty false
pnpm run compile
pnpm exec prettier --check src/util/OrmUtils.ts test/unit/util/orm-utils.test.ts
git diff --check
```

## PR Description Draft

See [pr-description.md](pr-description.md).
