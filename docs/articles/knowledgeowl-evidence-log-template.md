# Knowledge Base Evidence Log Template

This template supports a documentation review workflow for AI-assisted help-center updates. It is intentionally small: the log should help a reviewer decide whether a draft is ready, not become a second article.

## When to Use It

Use this evidence log when a team is updating a customer-facing or internal knowledge base article from a draft, support case, release note, SME comment, or AI-assisted rewrite.

It is most useful when the draft contains statements that sound plausible but still need a visible review trail before publication.

## Copyable Template

```md
## Evidence Log

Reader question:

Audience:

Article status:
- [ ] New article
- [ ] Existing article update
- [ ] Internal support note

Source facts:
- 
- 
- 

Draft claims to verify:
- 
- 
- 

Reviewer checks:
- 
- 
- 

Publication blockers:
- [ ] Unconfirmed product behavior
- [ ] Missing role, plan, region, or feature-flag boundary
- [ ] Irreversible customer action lacks a warning
- [ ] Private customer data, screenshots, tokens, logs, or identifiers included
- [ ] Copied third-party text needs removal or rewriting

Privacy boundary:

Decision:
- [ ] Publish
- [ ] Revise
- [ ] Hold for SME review
- [ ] Do not publish

Decision note:
```

## Filled Example

```md
## Evidence Log

Reader question:
Can a workspace admin change the billing contact without changing the account owner?

Audience:
Support agents and workspace admins.

Article status:
- [x] Existing article update

Source facts:
- The billing contact receives invoice emails.
- Changing the billing contact does not transfer workspace ownership.
- Payment method changes require an owner role.

Draft claims to verify:
- "Any admin can update billing information."
- "Changing the billing contact also changes account ownership."

Reviewer checks:
- Confirm which roles can edit the billing contact field.
- Confirm whether payment method access is separate from billing contact access.
- Add a warning if the behavior differs by plan or region.

Publication blockers:
- [x] Unconfirmed product behavior
- [x] Missing role, plan, region, or feature-flag boundary
- [ ] Irreversible customer action lacks a warning
- [ ] Private customer data, screenshots, tokens, logs, or identifiers included
- [ ] Copied third-party text needs removal or rewriting

Privacy boundary:
Do not paste customer account screenshots, invoice identifiers, payment details, tokens, or support-thread excerpts into this review note. Summarize the scenario and link to approved internal references when private context is needed.

Decision:
- [ ] Publish
- [x] Revise
- [ ] Hold for SME review
- [ ] Do not publish

Decision note:
Revise the role and ownership language before publication. The draft can proceed after the owner-only payment-method boundary is stated clearly.
```

## Reviewer Use

A reviewer should be able to read the log and answer three questions quickly:

1. What customer or support question is the article trying to answer?
2. Which claims are supported by known facts, and which still need judgment?
3. What would block publication today?

If the evidence log cannot answer those questions, the draft is probably moving faster than the review context.

## Publication Boundary

The evidence log is an internal review artifact. It should not appear in the final customer article. The final article should be concise and reader-focused; the log exists to help the team decide whether that article is ready.

Do not use this template to collect private customer data, credentials, account-local screenshots, raw logs, one-time codes, copied third-party text, or payment details. When sensitive context is required, summarize the boundary and link to approved internal systems instead.
