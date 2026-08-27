# Task: 15-polish

## Goal

Small cleanups left by parallel work. No behavior changes except the click-vs-drag threshold.

## Scope (all small; skip anything that turns out non-trivial and say so)

- `client/src/styles/base.css`: remove the unreferenced `.seg*` rules (header toggle is gone);
  verify with grep nothing uses `.seg`.
- `client/src/layout/useLanes.ts`: delete if unused after task 14 (grep); otherwise leave.
- Root `package.json`: `engines.node` → `"22.x"` (Vercel picked 24 with `>=20`); `.nvmrc` → 22.
- `client/src/features/diagram/DiagramCanvas.tsx`: React Flow props so a tiny mouse movement
  during a click still selects (e.g. `nodeDragThreshold` / `paneClickDistance` in @xyflow/react 12 —
  check the docs for the exact prop names in the installed version) — one or two props, no logic.
- `docs/design/README.md` / `docs/DEPLOY.md`: fix any stale statements you notice (e.g. panel
  400px → 360px). Keep edits minimal.

**Out:** anything in `features/panel`, `model/`, `shared/`, `data/` (tasks 16/17 own those);
no refactors.

## Files you own

- `client/src/styles/base.css`, `client/src/layout/useLanes.ts`, root `package.json`, `.nvmrc`,
  `client/src/features/diagram/DiagramCanvas.tsx` (props only), `docs/design/README.md`, `docs/DEPLOY.md`.

## Acceptance criteria

- [ ] `npm run check` passes; `grep -rn "\.seg" client/src` → nothing; a slightly-moved click still
      selects a card in the browser.

## Seed data update

None (report "none — cleanup only"). `docs/TASKS.md` row → review + changelog line.

## Report format

As in `_TEMPLATE.md`.
