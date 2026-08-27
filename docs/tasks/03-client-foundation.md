# Task: 03-client-foundation

## Goal

Everything the client needs _under_ the UI so the visual work (arriving separately from a design
pass) can be dropped on top without touching logic: typed API access, project + selection state,
and a pure layout pipeline that turns the model into positioned React Flow nodes/edges via ELK.
**No visual components in this task** beyond a throwaway debug page that proves the pipeline works.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md` (client section — follow it exactly), `shared/src/` (the
model), `docs/tasks/02-api.md` (the endpoints you consume; the API task runs in parallel — code
against the contract, use fixtures in tests).

Hero interaction the state must support: _select any system / requirement / intent / edge →
everything connected highlights, everything else recedes._ `relatedTo` from `@app/shared` gives the
closure; your job is to hold the selection and expose derived "highlighted / dimmed" sets.

Library decision (made): `@xyflow/react` 12 + `elkjs` (layered layout, compound nodes). Known
gotchas to respect: parent nodes must precede children in the nodes array; child positions are
relative to parent; set `elk.hierarchyHandling: 'INCLUDE_CHILDREN'` so cross-group edges route;
give ELK node width/height (fixed sizes are fine now); ELK is async — expose a hook that resolves
layout and reports `status: 'idle' | 'layouting' | 'ready' | 'error'`; import
`@xyflow/react/dist/style.css` once.

## Scope

**In:**

- Install `@xyflow/react` and `elkjs`.
- `client/src/api/project.ts`: `fetchProject()`, `fetchRelated(id)` (typed with `@app/shared`,
  errors surfaced as values not thrown strings). Only place `fetch` is called.
- `client/src/state/`: `ProjectProvider` + `useProject()` (loading / error / project);
  `SelectionProvider` + `useSelection()` → `{ selectedId, select(id), clear(), related, isHighlighted(id), isDimmed(id) }`.
  `related` computed client-side with `relatedTo` (no network round-trip for selection).
- `client/src/model/toFlow.ts`: pure `toFlowElements(project) → { nodes, edges }` mapping Systems →
  React Flow nodes (with `parentId` for nesting, `type: 'system'`, data = the System + counts of
  attached requirements/intents), Edges → React Flow edges (data = the Edge).
- `client/src/layout/elk.ts`: pure-ish `layoutWithElk(nodes, edges, options?) → Promise<nodes>` that
  returns positioned nodes (+ parent sizes). `client/src/layout/useLayout.ts` hook wrapping it.
- `client/src/state/viewMode.ts`: `useViewMode()` → `'overview' | 'deepDive'` + toggle (global
  summary vs detail switch). Persist in `localStorage` (wrapped in try/catch).
- `client/src/features/debug/`: a minimal page that renders the raw React Flow canvas with default
  node styling, lists selected id + related ids as text, and has the view-mode toggle. It exists
  only to prove the pipeline; the design task will replace it. Wire it into `App.tsx` for now.
- Vite: ensure `elkjs` bundles (use `elkjs/lib/elk.bundled.js`; a Web Worker is NOT required now).

**Out (do not do, even if tempting):**

- No designed components, no styling beyond React Flow defaults, no panels/lists. No custom node
  visuals (a plain node with the name is fine).
- No server changes. No `shared/` changes (if `relatedTo` is missing something, report it).
- No routing, no persistence beyond view mode.

## Files you own

- `client/**` (including `package.json`, `vite.config.ts`).
- may also touch: root `package-lock.json` (from install).

## Interfaces you depend on

- `@app/shared` → `Project`, `System`, `Edge`, `relatedTo`, `validateProject` (use it to parse the
  API response at the boundary).
- `GET /api/project` → `Project` JSON. In dev the Vite proxy forwards `/api` to the server; use
  `data/project.json` as a test fixture, don't rely on a running server in tests.

## Acceptance criteria

- [ ] `npm run dev` (with 02-api merged or a stub) shows the debug page: nested boxes laid out by
      ELK, edges drawn, no overlaps for the seed data.
- [ ] Clicking a node selects it; the debug text shows the correct `related` ids per `relatedTo`.
- [ ] `isHighlighted` / `isDimmed` are consistent: with nothing selected, nothing is dimmed.
- [ ] View-mode toggle flips and survives reload.
- [ ] `App.tsx` contains no logic (providers + the debug feature only).
- [ ] `npm run check` passes.

## Tests to write

- `model/toFlow.test.ts`: "parents precede children"; "child position is relative / parentId set";
  "counts of attached requirements/intents are correct for the fixture".
- `layout/elk.test.ts`: "positions every node; parent size ≥ children bounds" (runs real ELK on
  the fixture; keep it small).
- `state/selection.test.ts(x)`: "select(id) → related matches relatedTo; clear() empties";
  "isDimmed false for everything when nothing selected".
- `api/project.test.ts`: "invalid payload → error value, not throw" (mock `fetch`).

## Seed data update (mandatory — see CLAUDE.md rule 9)

Update `sys-client-app` (summary/detail/paths) and add nested systems `client-state`,
`client-layout` (kind `module`) under it. Add intents (human-verified, from this brief): "selection
closure computed client-side from the shared model, not via API" (rationale: instant highlight, one
source of truth); "layout is a pure pipeline model → flow elements → ELK positions so the design
pass can restyle nodes without touching logic". Add edge `client-app → server-api` kind `calls` if
not present. Run `npm run validate:data`.

## Report format

As in `_TEMPLATE.md`, plus: the exact prop/hook signatures the design task will build against.
