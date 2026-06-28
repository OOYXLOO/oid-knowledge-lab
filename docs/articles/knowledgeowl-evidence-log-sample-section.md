# Sample Section: Treat the AI Draft as a Review Object

AI-assisted documentation becomes risky when a draft looks finished before the
team has agreed on what it proves. A fluent help article can still mix source
facts, guessed details, unsupported policy claims, and reviewer assumptions in a
single paragraph. The practical fix is not to ban AI drafting; it is to make the
draft reviewable before it reaches the knowledge base.

A small evidence log gives the team a place to separate those concerns. Start
with the reader question: what was the customer or internal user trying to do?
Then record the source facts that are allowed to support the answer. These might
come from a product release note, an internal SME comment, an existing approved
article, or a support macro. After that, list the AI-assisted draft claims that
still need review. The difference matters: a source fact is something the team
can point to; a draft claim is something the article is currently saying.

Reviewer checks can stay lightweight. For example:

```text
Reader question:
How do I rotate an integration token without breaking existing jobs?

Source facts:
- Token rotation is available from the integration settings page.
- Existing jobs keep using the old token until the new token is saved.
- The old token should be revoked after dependent jobs are confirmed.

Draft claims to review:
- "Rotation is instant and never affects running jobs."
- "Admins can recover a revoked token."

Reviewer checks:
- Confirm whether running jobs can fail during rotation.
- Confirm whether revoked tokens are recoverable.
- Add a warning if customers need to update scheduled jobs manually.
```

The log does not need to become a heavyweight workflow. Its job is to make the
handoff visible: what question the article answers, what facts support it, what
claims still need judgment, and what must not be published yet. That structure
helps a technical writer, support lead, or subject-matter expert review the same
draft without guessing which parts came from a source and which parts came from
the model.

The final article can still be concise. The evidence log is not meant to appear
in the customer-facing article; it is the internal bridge between "the AI wrote a
plausible draft" and "a human reviewer can safely approve this update."
