# PR Description Draft

## Summary

- remove the early return in `OrmUtils.normalizeWhereCriteria` when no
  `invalidWhereValuesBehavior` options are passed;
- let the existing default null and undefined behavior run for default calls;
- add unit coverage for default null/undefined behavior and recursive nested
  where criteria handling.

## Motivation

`normalizeWhereCriteria` already contains default branches for invalid `null` and
`undefined` values, but the function returned the original criteria immediately
when `options` was omitted. This meant default callers could bypass the same
validation path that configured callers use.

Removing the early return keeps configured behavior intact while allowing the
existing defaults to apply consistently.

## Tests

```text
pnpm run compile
node_modules\.bin\mocha.cmd --no-config build/compiled/test/unit/util/orm-utils.test.js
```

Targeted result:

```text
18 passing
```

## Notes

The broader repository test command may load unrelated compiled functional tests
from the full test tree. The targeted command above runs the affected unit test
file directly after compilation.
