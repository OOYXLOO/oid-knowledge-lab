# A Practical Triage Checklist Before Implementing Public GitHub Bounty Issues

Public GitHub bounty issues can look deceptively simple. A title may include a clear amount, a familiar stack, and an implementation request that fits neatly into an afternoon. The real question is not "Can I build this?" It is "Is this the right issue to build before someone else is already at the finish line?"

This article describes a practical triage workflow for deciding whether to implement a public bounty issue, wait for clearer maintainer direction, or skip it.

The examples are deliberately generalized. The process is useful for open-source contributors, maintainers, and engineering teams that want to avoid noisy pull request queues, duplicate work, and ambiguous reward expectations.

## The Decision Should Happen Before Cloning

A good triage pass happens before the local checkout. It should answer five questions:

1. Is the reward real and specific?
2. Is the issue still available for a new contributor?
3. Is the acceptance path public and testable?
4. Can the implementation stand out on quality, not just timing?
5. Are there account, wallet, private-data, or platform gates that change the risk?

If any answer is unclear, the right action may be to record the issue and keep scanning rather than start coding.

## 1. Check the Reward Contract, Not Just the Amount

The amount is only one part of the reward signal. A reliable bounty issue should explain:

- what earns the reward,
- who decides acceptance,
- whether assignment is required,
- whether multiple competing pull requests are allowed,
- how payment happens after merge,
- and what information the contributor must provide.

A label such as `bounty` or a comment that names a dollar amount is useful, but it is not enough by itself. The issue body or maintainer comments should describe the actual acceptance process.

Red flags:

- the issue says "bounty" but has no acceptance criteria,
- the payment path depends on a private chat before work starts,
- the issue requires a wallet or payout address in the public PR body before acceptance,
- the amount is in a volatile token but the issue never defines timing or conversion,
- or the reward is attached to "best effort" work rather than a mergeable change.

## 2. Measure Queue Saturation

The fastest way to avoid wasted work is to check whether the issue is already saturated.

Look at:

- comments containing `/attempt`, `/claim`, "I am working on this", or "PR submitted",
- open pull requests that reference the issue number,
- closed pull requests that attempted the same scope,
- maintainer comments assigning the issue to someone,
- and recent bot comments that show the project prefers one assignee.

The most important signal is not the number of comments. It is whether there are already serious pull requests covering the same acceptance criteria.

If five similar PRs are already open, a sixth implementation has to be dramatically better. If it only meets the same checklist, it is unlikely to be worth the queue position.

## 3. Prefer Testable Acceptance Criteria

A high-quality bounty should say exactly how the change will be verified.

Good signs:

- a named file or module to change,
- a command such as `pnpm test`, `go test ./...`, or a focused Playwright spec,
- a requested test file path,
- clear happy-path and failure-path expectations,
- and no dependency on private production data.

Weak signs:

- "make a good website",
- "improve the dashboard",
- "add support for this integration",
- "make it production ready",
- or "we will know it when we see it".

Creative tasks can still be legitimate, but they need stronger differentiation. If a creative issue has a large reward and no selection criteria, it often attracts many quick submissions. In that case, design quality alone may not overcome review noise.

## 4. Identify the Real Gate

Some issues look public but depend on a gate that is not visible in the issue.

Common gates:

- external program application,
- Discord assignment,
- maintainer-only review queue,
- platform account verification,
- KYC or tax setup,
- wallet setup,
- private test data,
- CAPTCHA,
- or a third-party dashboard that only maintainers can access.

The gate does not always make the issue bad. It does change the plan. If assignment is required, the correct next step is usually not to code. It is to wait for assignment or prepare a short technical intent message.

## 5. Estimate Differentiation Before Implementation

Before writing code, ask what would make the pull request clearly better than the queue.

Possible quality advantages:

- better tests than competing PRs,
- smaller and more maintainable scope,
- safer handling of credentials or private data,
- cross-platform behavior,
- rollback behavior,
- deterministic output,
- clear documentation,
- or a focused reproduction path.

If the only advantage is "I can also implement this," skip it.

## A Fast Scoring Model

Use this lightweight score before cloning:

| Check | Good | Risk |
|---|---|---|
| Reward | Amount and payment path are explicit | Amount appears only in title or comment |
| Availability | No assignee, no serious PR, no required external application | Existing PRs or assignment gate |
| Acceptance | Concrete tests and file paths | Subjective output |
| Local proof | Can test without private data | Requires account secrets or hidden dashboards |
| Differentiation | Clear way to exceed queue quality | Same implementation as existing PRs |
| Public safety | No sensitive data needed | Wallet, KYC, private messages, or credentials involved |

One high-risk column does not automatically disqualify an issue. Three high-risk columns usually should.

## What to Do With Skipped Issues

Skipping should still produce useful output. Record:

- the issue URL,
- reward signal,
- queue state,
- competing PRs,
- maintainer assignment model,
- acceptance criteria,
- and the trigger that would make it worth revisiting.

This turns a skipped issue into future decision data. It also prevents repeating the same search later.

## What a Good "Wait" State Looks Like

Do not keep a candidate in an undefined maybe-state. Assign it one of these statuses:

- `implement now`: clear reward, low competition, testable acceptance, no hidden gate.
- `watch`: good technical fit but waiting on assignment, maintainer clarification, or PR queue movement.
- `skip`: reward unclear, queue saturated, hidden gates dominate, or payment path is weak.
- `prepare only`: write a short intent note or local analysis, but do not submit public work yet.

The status should include a revisit trigger. For example: "Revisit if all competing PRs close and the maintainer restates the acceptance criteria."

## The Practical Rule

Do not start with "Can I build this?"

Start with:

```text
Can this issue still reward a high-quality new implementation?
```

If the answer is yes, code carefully and verify hard. If the answer is no, record the evidence and move on. Good triage is not hesitation. It is how contributors protect their best engineering hours for issues where quality can still change the outcome.
