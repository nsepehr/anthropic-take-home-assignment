# Task: 19-locks

## Goal

Users can lock a system or a whole layer in place so re-layouts don't move or re-parent it
(design revision 4). Locks are visible on cards, lanes, the detail panel and the header, and
persist in localStorage. The layout (task 18, parallel) consumes `lockedIds`.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `docs/design/landing-v4.dc.html` (section 2 — exact
visuals), `client/src/features/diagram/**`, `features/panel/DetailCard.tsx`, `features/shell/Header.tsx`,
`client/src/state/**`. Human rationale (2026-08-27): active development + LLM-generated updates
re-shuffle the diagram; sometimes that's right, sometimes the developer wants to pin what they
know. Schema `System.pinned` is the long-term home (backlog); for now client-side persistence
matches the design and the demo.

## Scope

**In:**

- `client/src/state/locks.tsx`: `LocksProvider` + `useLocks()` → `{ lockedIds: ReadonlySet<string>,
lockedLayers: ReadonlySet<string>, isLocked(id), toggleSystem(id), toggleLayer(category, memberIds) }`,
  persisted under `codebase-map:locks` in localStorage (try/catch), pure reducer in
  `client/src/model/locks.ts` (+ tests: toggle system; layer lock adds all members; layer unlock
  removes them; system unlock inside a locked layer clears the layer flag).
- `components/LockIcon.tsx` (inline Lucide lock SVG, open/closed shackle, stroke 2.75).
- Card: lock button in the title row (`margin-left: auto`), opacity 0.18 / 0.55 on hover / 1 locked,
  colour neutral-600 → accent-2-700 locked; locked card border accent-2-600; `stopPropagation` so
  it neither selects nor opens; `title` per design.
- Lane label: lock button beside the uppercase label; locked lane = 1.5px dashed accent-2-600
  border on the lane background, label accent-2-800.
- DetailCard (systems only): secondary button "Lock position" ↔ "Locked in place" (accent-2-600 bg /
  --color-bg fg when locked) next to Deep dive, plus the note text per design.
- Header: after the legend, a divider and "<n> locked · <m> layers" / "nothing locked" with the icon.
- Tokens: `--lock-idle`, `--lock-on`, `--lock-border` in tokens.css (from ramps, no hexes).
  **Out:** layout behaviour (18 consumes `lockedIds`); schema; server.

## Files you own

- `client/src/state/locks.tsx`, `client/src/model/locks.ts` (+tests), `client/src/components/LockIcon.tsx`,
  card/lane/panel/header files **only for the lock UI lines** (SystemCard/CardTags title row,
  LaneLayer label, DetailCard buttons, Header legend), `client/src/styles/tokens.css` (lock tokens),
  `client/src/App.tsx` (provider only). Task 18 owns layout files — do not touch them.

## Acceptance criteria

- [ ] Lock a card → icon solid, border sage, header counter updates, survives reload.
- [ ] Lock a layer → all its cards lock; unlock the layer → all unlock; dashed lane border.
- [ ] Panel button mirrors card state. Lock click never selects/opens.
- [ ] `npm run check` passes. Inspect-before-merge: dev running, `locks.jpg` screenshot.

## Seed data update

Append intent `int-locks-pin-layout` — "A developer can lock a box or a layer so re-layouts keep
it where it is" (rationale: LLM-driven updates re-shuffle the diagram; movement should be a
choice; client-side persistence now, `System.pinned` in the schema later). human-verified,
sessionRef "planning chat 2026-08-27, design revision 4", appliesTo sys-client-diagram,
sys-client-state, sys-client-panel. Append at END. `docs/TASKS.md` row → review + changelog.

## Report format

As in `_TEMPLATE.md`, plus the `useLocks()` signature 18 will consume.
