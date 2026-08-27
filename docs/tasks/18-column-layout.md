# Task: 18-column-layout

## Goal

The atlas follows the design's rule: **categories are stages laid out left → right, one column
each; systems stack vertically inside a column; edges run column to column.** Replace ELK on the
atlas with a pure, deterministic, **stable** column layout. Cards become legible at 1440×900
without zoom tricks. If ELK is then unused anywhere, remove the dependency.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `docs/MODELING.md` ("Categories are stages"),
`client/src/model/laneOrder.ts` (lane order from edges — keep), `client/src/layout/**` (ELK,
alignLanes, useLanes), `client/src/features/diagram/**` (after task 17 — the atlas view),
`client/src/model/edgeSides.ts` (keep last). Design: `docs/design/landing-v4.dc.html` +
`landing-v3.dc.html` (atlas: 250px lanes at 280px pitch; cards 210 wide, 112 min-height; vertical
stack; lane heights hug content with a 26px label band). Human decisions (2026-08-27):

- One column per category. Column order = `orderLanesByFlow` (existing).
- Vertical order inside a column: neighbour barycenter (average row index of connected systems in
  the previous column), **tie-broken by seed order**; systems with no cross-column neighbours keep
  seed order at the bottom. New systems therefore append at the bottom; nothing reorders unless
  the graph actually changes. This is the "stable by default" rule.
- Intra-column edges are drawn as short side arcs on the right of the column (source above target →
  arc down; else arc up), at reduced emphasis (`--edge-idle-opacity`). Cross-column edges keep the
  bezier + nearest-side handles.
- Nested systems (`parentId`) are not shown on the atlas (they live in the focus/L2 views); a
  card with children shows the "Open ›" affordance only. (Check with `git log` whether 17 already
  handles this; don't duplicate.)
- Locks (task 19, parallel): accept `lockedIds: ReadonlySet<string>` as an input; a locked system
  keeps its column and its current row index across re-layouts (compute unlocked ones around it).
  Until 19 lands, pass an empty set.

## Scope

**In:** `client/src/layout/columns.ts` (pure: `columnLayout(project, { order, lockedIds,
previous? }) → positioned nodes + lane bounds`), tests (order stability, barycenter, tie-break,
locked rows stay, intra vs cross edges classification), wiring in the atlas canvas, fit/zoom
(fitView padding 0.08; at 1440×900 the four-column seed must render cards ≥ 0.6 scale), removal
of ELK + `elk.ts`/`alignLanes.ts`/`useLanes.ts` if no longer imported (report bundle size before/after).
**Out:** focus view (already pure), panel, locks UI, schema.

## Files you own

- `client/src/layout/**`, `client/src/model/laneOrder.ts`, `client/src/model/lanes.ts`,
  `client/src/features/diagram/**` (atlas canvas wiring + LaneLayer only; coordinate with 19 which
  owns card/lane lock UI — do not touch lock code), `client/package.json` (remove elkjs).

## Acceptance criteria

- [ ] Four columns in flow order; every system in exactly one column; vertical stacks; no overlaps.
- [ ] Adding a system to the seed (test fixture) does not move any existing card that isn't its
      neighbour.
- [ ] Cards legible at 1440×900 (≥ 0.6 scale) — screenshot.
- [ ] `npm run check` passes; `grep -rn elkjs client/src` → nothing (if removed).
- [ ] Inspect-before-merge: leave dev running, report URL + `columns-after.jpg`.

## Seed data update

Append intent `int-columns-are-stages` — "The atlas is a left-to-right flow of stage columns with
systems stacked inside; a general layout engine was replaced by this one rule" (rationale: the
design's simplification; width becomes columns × card, so the diagram stays legible; deterministic
and stable so developers see movement only when the model changes; ELK removed). human-verified,
sessionRef "planning chat 2026-08-27, design revision 4", appliesTo sys-client-layout,
sys-client-diagram. Append at END. `docs/TASKS.md` row → review + changelog.

## Report format

As in `_TEMPLATE.md`, plus before/after bundle size and the inspection URL.
