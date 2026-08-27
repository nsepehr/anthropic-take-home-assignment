# Task: 16-modeling-rules

## Goal

Rules that make the model compact and legible, written for whoever (human or LLM) captures a
codebase into `data/project.json` — and a pure `computeAdvisories(project)` that enforces them as
warnings. This is the "write side" contract for the future Claude Code extension, and the source of
the "this part may have a problem" signal the human already spots by eye.

## Context

Read `CLAUDE.md`, `data/README.md`, `shared/src/**` (schema, validate, gaps), `data/project.json`,
`docs/TASKS.md` "Backlog (product — next phase)". Human observation (2026-08-27): once the seed
grew to ~25 edges the flat view got hard to read; the fix is (a) rules for compact modeling and
(b) drill-down (task 17, parallel — do not touch client/). Advisories are _warnings_ (the file
still validates); gaps stay what they are (missing links).

## Scope

**In:**

- `docs/MODELING.md` (≤ 120 lines, for an LLM as much as a human): what a System is (one module
  boundary with its own `paths`; not a file, not a folder of unrelated things); 3–6 categories, 3–8
  systems per category, nest with `parentId` beyond that; edges only when evidenced (import / call /
  read / write / event) — cite the evidence in `summary`; one short `label` per edge; `summary` ≤ 20
  words, plain language; `detail` = how it works, for the deep dive; Requirement wording ("A user
  can…", "The system must…") + `evidence`; Intent = decision + rationale, never a description;
  when to split/merge systems; category naming; provenance honesty (`human-verified` only when a
  human said so); append-only rule; worked examples from the seed (good and bad).
- `shared/src/advisories.ts` (+ test): `computeAdvisories(project) → Advisory[]` with
  `{ code, severity: 'warn' | 'info', targetId, message }`. Rules (pure, each tested):
  `category-too-large` (> 8 systems), `too-many-categories` (> 6), `system-too-connected`
  (> 6 edges), `system-isolated` (0 edges, not nested), `edge-unlabeled`, `summary-too-long`
  (> 20 words), `detail-missing-how` (detail shorter than summary), `intent-is-description`
  (rationale < 12 words), `requirement-no-evidence` (status implemented/partial with empty
  evidence), `ai-inferred-unreviewed` (info: ai-inferred entries older than 7 days — use
  `capturedAt`; take `now` as a parameter for testability). Export from `shared/src/index.ts`.
- `scripts/validate-data.mjs`: print advisories after gaps (grouped by code, counts + first 3
  targets each). Exit code stays 0 for warnings.
- `data/project.json`: apply the rules where cheap and honest — add missing edge labels, trim
  summaries over 20 words, fix the stale sentence in `int-panel-answers-three-questions.detail`
  ("no per-item deep-dive button" → per-item deep dive exists). Do not restructure. Append intent
  `int-rules-make-compact-models` — "Compactness is enforced by written modeling rules and
  advisories, so the diagram stays legible as the project grows" (human-verified, sessionRef
  "planning chat 2026-08-27, phase-2 planning", appliesTo sys-shared-model, sys-seed-data,
  sys-agent-rules) and `int-phase1-flat-drilldown-next` — "Phase 1 stays a flat view; the
  scaling answer is drill-down by category, not hiding edges" (human-verified, same sessionRef,
  appliesTo sys-client-diagram). Append at END.

**Out:** no client code; no schema changes (advisories are computed, not stored); no new gaps.

## Files you own

- `shared/src/advisories.ts` (+test), `shared/src/index.ts` (export line), `scripts/validate-data.mjs`,
  `docs/MODELING.md`, `data/README.md` (link the rules), `data/project.json`.

## Acceptance criteria

- [ ] `npm run validate:data` prints gaps then advisories; seed yields a small, honest list
      (report it) and no errors.
- [ ] Every rule has a passing/failing test case.
- [ ] `npm run check` passes. Link `docs/MODELING.md` from `CLAUDE.md` rule 9 (one clause).

## Seed data update

As above. Also `docs/TASKS.md` row → review + changelog line.

## Report format

As in `_TEMPLATE.md`, plus the advisories the seed currently triggers.
