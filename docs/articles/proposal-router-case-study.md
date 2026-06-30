# Proposal Router prototype

This case study shows a static routing prototype for turning a free-form project proposal into ranked repository targets.

## Problem

Large organizations often have many repositories. A contributor can describe the right work but still file it in the wrong place, which slows triage and makes automation harder.

## Prototype

The prototype provides a compact proposal workspace:

- a proposal editor
- live ranked repository matches
- confidence bars
- match reasons
- parsed priority, time, price, and target organization hints
- public repository discovery across multiple GitHub organizations

The first version is dependency-free and testable with Node. It can load public repositories from GitHub organization APIs, merge discovered metadata with curated high-signal aliases, and fall back to the curated catalog if discovery is unavailable. It uses repository profiles, aliases, phrase matches, keyword overlap, and domain boosts. The scoring module can later be replaced by a vector backend without changing the UI contract.

## Verification

The routing test suite covers:

- cash-out interface proposals
- Telegram voice transcription proposals
- plugin installer configuration proposals
- urgent proposal hint extraction
- token normalization and deduplication
- GitHub repository metadata conversion
- discovered and curated profile merging
- catalog fallback behavior

Verification commands:

```bash
npm run check
git diff --check
```

Browser smoke testing covered desktop and mobile layouts through a locally served static page. During the latest smoke run, the page loaded 96 public repositories from GitHub and ranked 97 profiles after merging the curated catalog.

## Takeaway

A lightweight deterministic router is a useful first step before introducing embeddings. It creates a clear product surface, a stable test contract, and a baseline for comparing future semantic routing behavior.
