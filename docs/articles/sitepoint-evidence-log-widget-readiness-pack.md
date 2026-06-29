# SitePoint Evidence Log Widget Readiness Pack

## Fit

This packet is for a SitePoint tutorial pitch about building a small browser-only
review widget for AI-assisted documentation updates.

The tutorial angle fits SitePoint's practical web-development audience: plain
HTML, CSS, and JavaScript; no framework lock-in; useful local state; copyable
Markdown output; and a concrete AI-era editorial workflow that keeps human
review in charge.

## Proposed Tutorial

Title:

```text
Build a Browser-Only Evidence Log Widget for AI-Assisted Documentation Reviews
```

Reader:

```text
Frontend developers, technical writers who code, DevRel teams, and support
engineering teams that need a practical review surface for AI-assisted content.
```

Promise:

```text
The reader will build a small client-side widget that separates source facts,
AI-assisted claims, reviewer checks, review markers, and publication boundaries,
then exports a Markdown evidence log without uploading private inputs.
```

## Why This Fits SitePoint

- It is a practical web tutorial with a visible browser demo.
- The implementation uses plain HTML, CSS, and JavaScript, so the reader can
  understand the mechanics without a large framework.
- It treats AI as an assistant rather than an author, matching a cautious
  editorial stance around AI-generated text.
- It includes safe local-only data handling, accessibility-friendly form
  controls, and a realistic support-documentation workflow.
- The demo can be extended into React, Vue, Svelte, or a CMS workflow after the
  plain JavaScript version is understood.

## Public Proof

Interactive demo:

```text
https://ooyxloo.github.io/oid-knowledge-lab/evidence-log-playground.html
```

KnowledgeOwl-focused review hub:

```text
https://ooyxloo.github.io/oid-knowledge-lab/knowledgeowl-reviewer-hub.html
```

Writing samples:

```text
https://ooyxloo.github.io/oid-knowledge-lab/writing-samples.html
```

Implementation proof:

```text
https://ooyxloo.github.io/oid-knowledge-lab/implementation-authenticity-proof.html
```

## Short Pitch

I would like to propose a practical SitePoint tutorial:

```text
Build a Browser-Only Evidence Log Widget for AI-Assisted Documentation Reviews
```

The article would show readers how to build a small HTML/CSS/JavaScript widget
that turns an AI-assisted documentation draft into a reviewable evidence log. It
would separate source facts from generated wording, record reviewer checks, mark
publication blockers, and export a Markdown handoff, all in the browser without
uploading private inputs.

This is a web-development tutorial, not an AI-generated article. The working demo
already exists as public proof, and the final article would be freshly written
for SitePoint's editorial process.

## Outline

1. Why AI-assisted content needs a review surface, not just a prompt.
2. Create the HTML structure for reader question, source facts, draft claim, and
   review checks.
3. Add CSS for a readable two-column review workbench.
4. Parse multiline reviewer input into bullet lists.
5. Track review markers with checkboxes and derive a publication decision.
6. Generate a Markdown evidence log.
7. Copy the handoff to the clipboard and handle failure gracefully.
8. Keep private support data, tokens, screenshots, and copied third-party text
   out of the widget.

## Originality Boundary

This packet is a topic proposal and proof link set. The final tutorial should be
freshly written for SitePoint. AI may be used only as an assistant for planning
or editing, not as the bulk of the article text.

