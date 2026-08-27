# Task: 20-lifecycle

## Goal

Every entity can be **current**, **superseded** (replaced by a newer entry) or **retired** (no
longer true), without ever deleting anything from the seed. The tool shows what the system _is
now_ by default; history is available per entity ("Supersedes …") and via a "Show retired" toggle.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `docs/MODELING.md`, `shared/src/**` (Intent already has
`status: active | superseded` + `supersededBy` — generalize it), `client/src/model/**`,
`features/panel/DetailCard.tsx`, `features/shell/Header.tsx`. Human decisions (2026-08-27):

- Generalize to the common base as an optional block; absent = current:
  `lifecycle?: { state: 'current' | 'superseded' | 'retired'; supersededBy?: string; since: ISO; reason?: string }`.
- Keep accepting `Intent.status/supersededBy` (map into `lifecycle` at validation time; emit a
  readable deprecation note in `validate:data`); migrate the seed's intents to the new block.
- Gaps and advisories count **current entities only**. `supersededBy` must resolve to the same
  entity type, to a current entry (or a chain that ends in one), no cycles. New advisory
  `requirement-orphaned` (warn): a current requirement whose systems are all retired.
- Write-side rule for `docs/MODELING.md`: never change meaning in place — append the new entry
  and mark the old one superseded with `supersededBy` + `reason`; in-place edits are for wording
  only. Retire a system when its code is removed.
- Task 17 (drill-down) owns `client/src/features/diagram/**` and most client files and is finishing;
  tasks 18/19 will own layout and lock UI. You touch only the files listed below; rebase before
  finishing.

## Scope

**In:**

- `shared/src/schema/lifecycle.ts` (+ add to `EntityBase`; edges too), `validate.ts` rules,
  `shared/src/lifecycle.ts` (pure): `isCurrent(entity)`, `currentOnly(project) → Project`
  (filters systems/requirements/intents/edges and drops edges whose endpoints aren't current),
  `historyOf(project, id) → Entity[]` (walk `supersededBy` backwards: what this entry replaced,
  oldest last). Tests for each + validator rules.
- `gaps.ts` / `advisories*.ts`: operate on `currentOnly(project)`; add `requirement-orphaned`.
- Seed: migrate `int-global-view-mode` to `lifecycle: { state: 'superseded', supersededBy:
'int-per-item-deep-dive', since: …, reason: 'Human review preferred per-item depth' }`; add
  ONE honest retired example if one exists (e.g. `sys-client-lanes` was folded into diagram —
  if it's gone from the seed, leave it; don't invent). Update `data/README.md`.
- Client (minimal, no canvas): `client/src/state/projectStore.tsx` exposes `project` (current only,
  via `currentOnly`) and `fullProject`; a `ShowRetiredProvider`/`useShowRetired()` toggle in
  `client/src/state/showRetired.tsx` (header control "Show retired", off by default) — when on,
  `project` is the full project and retired/superseded entities render greyed with a `.is-retired`
  class (opacity via token, strike on the title). `DetailCard`: a "History" disclosure listing
  `historyOf` entries ("Supersedes: <statement/title> · <since> · <reason>"), each clickable
  (select). Tests: state toggle; DetailCard shows history for `int-per-item-deep-dive`.
  **Out:** canvas/layout/lock code; a timeline view; server changes (the API serves the full file).

## Files you own

- `shared/src/**` except `advisories*.ts` internals beyond the filter + new rule, `data/project.json`
  (migration + rule-9 entries), `data/README.md`, `docs/MODELING.md` (lifecycle section),
  `scripts/validate-data.mjs` (deprecation note), `client/src/state/projectStore.tsx`,
  `client/src/state/showRetired.tsx`, `client/src/features/panel/DetailCard.tsx` (History block only),
  `client/src/features/shell/Header.tsx` (toggle only), `client/src/styles/tokens.css` (`--retired-opacity`),
  `client/src/App.tsx` (provider only).

## Acceptance criteria

- [ ] `npm run validate:data` OK; intents no longer use `status` in the seed; deprecation path tested.
- [ ] Gaps/advisories ignore non-current entities (test).
- [ ] Selecting `int-per-item-deep-dive` shows "Supersedes: Overview vs deep dive is one global switch…".
- [ ] "Show retired" toggle reveals superseded/retired entries greyed; off by default.
- [ ] `npm run check` passes; `shared/` diff reported.

## Seed data update

Append intent `int-lifecycle-never-delete` — "Nothing is deleted from the model; changed things are
superseded or retired, and the tool shows the current state by default" (rationale: requirements and
intents go stale as a system evolves; deleting loses the why; a history per entity is enough — a
timeline product is not the focus). human-verified, sessionRef "planning chat 2026-08-27, phase-2
planning", appliesTo sys-shared-model, sys-seed-data, sys-client-panel. Append at END.
`docs/TASKS.md` row → review + changelog.

## Report format

As in `_TEMPLATE.md`, plus the exact `shared/` diff and the `currentOnly`/`historyOf` signatures.
