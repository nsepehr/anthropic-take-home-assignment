# Task: 17-drill-down

## Goal

Progressive disclosure. The canvas shows one level at a time: **L0 Overview** = one node per
category with aggregated edges; click a category → **L1** = that category's systems (today's
view, scoped); click a system with children → **L2** = its children. Breadcrumb to go up. The
right panel keeps working at every level. **Do not merge — the human inspects first.**

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `client/src/**` (state/, model/, layout/, features/diagram,
features/panel, features/shell), `shared/src/**`, `docs/design/landing.dc.html`,
`docs/TASKS.md` "Backlog (product — next phase)". Human decisions (2026-08-27):

- Levels use existing fields: `category` (L0→L1) and `parentId` (L1→L2). No new hierarchy field.
- Add an optional, additive `Project.categories?: Array<{ id, name, summary, detail, provenance }>`
  so category nodes and the panel have real content. `System.category` values are category ids
  (strings stay valid without the list; when the list exists, validate references).
- L0 aggregated edges carry a count label ("3 connections"); direction = net flow.
- Selection semantics: at L0 a click on a category node **drills** (no select); at L1/L2 a click on
  a leaf system **selects** (panel), a click on a system with children shows the panel AND a
  "Open ›" affordance (or double-click) that drills. Breadcrumb `Overview › Client › Diagram
canvas` in the canvas frame's top-left; Esc goes up one level; browser back not required.
- Cross-scope edges at L1/L2: show the external endpoint as a small ghost stub node (name only,
  dimmed, click → navigates to its scope) so arrows don't dangle.
- Lanes (task 14) apply at L0 only if useful; at L1 the scope is one lane so plain ELK layered
  layout is fine. Keep `attachEdgeSides` last.
- Task 16 runs in parallel in `shared/` (advisories) and `data/` — you own `shared/src/schema/project.ts`
  (+ category schema) and may append `categories` to `data/project.json`; expect a rebase.

## Scope

**In:**

- `shared/src/schema/category.ts` (+ `project.ts` optional `categories`), validation of
  `System.category` against the list when present (readable error). `data/project.json`: add
  `categories` for Workflow / Client / Server / Model with real summaries (human-verified where
  taken from the planning chat, else ai-inferred).
- `client/src/model/scope.ts` (pure, tested): `type Scope = { level: 'root' } | { level:
'category', id } | { level: 'system', id }`; `viewFor(project, scope) → { nodes, edges,
ghosts }` producing the entities for that level, with L0 aggregation (counts, net direction) and
  ghost stubs for cross-scope edges; `scopeOf(project, entityId)` (which scope shows this entity);
  `parentScope(scope)`.
- `client/src/state/navigation.tsx`: `NavigationProvider` + `useNavigation()` → `{ scope, drillInto(id),
up(), goTo(scope), breadcrumb: [{label, scope}] }`; selection clears on scope change; Esc handler.
- `features/diagram`: `DiagramCanvas` renders `viewFor(project, scope)`; `CategoryNode` (card:
  name, summary, "N systems · N req · N why", provenance, click → drill); `GhostNode`;
  aggregated-edge label; `Breadcrumb` component inside the canvas frame; "Open ›" on system cards
  with children.
- `features/panel`: `CategoryDetail` (summary/detail, its systems as chips, requirements and
  intents aggregated from its systems); `ProjectOverview` at root unchanged.
- Panel chip / connected-chip clicks that target an entity outside the current scope call
  `goTo(scopeOf(id))` then select.
- Tests: `model/scope.test.ts` (L0 aggregation counts and direction; L1 ghosts; L2 children;
  scopeOf), `state/navigation.test.tsx`, `CategoryNode`/`Breadcrumb` render tests.

**Out:** no animation between levels beyond a fade; no URL routing; no lane changes at L1; no
search. Don't touch `shared/advisories.ts` (task 16).

## Files you own

- `shared/src/schema/category.ts`, `shared/src/schema/project.ts`, `shared/src/schema/index.ts`
  (export), `shared/src/validate.ts` (category reference check only), `data/project.json`
  (`categories` + rule-9 entries only), `client/src/**`.

## Acceptance criteria

- [ ] Load → L0 shows 4 category cards with aggregated edges and counts; panel shows the project.
- [ ] Click Client → L1 shows the 7 client systems + ghost stubs for Server API / Shared model;
      breadcrumb `Overview › Client`; Esc returns to L0.
- [ ] Click Diagram canvas at L1 → selects; panel as before. Any system with children shows
      "Open ›" and drills to L2.
- [ ] Selecting a chip for an entity in another category navigates there and selects it.
- [ ] `npm run check` passes; `npm run validate:data` passes with the categories list.
- [ ] **Leave `npm run dev` running and report the URL**; screenshots of L0, L1, L2 in the scratchpad.

## Seed data update

`categories` as above; append intent `int-drill-down-by-category` — "The canvas shows one level
at a time: categories, then a category's systems, then a system's parts" (rationale: the flat view
stopped being legible past ~25 edges; hiding edges ad hoc would lie; disclosure by the same
fields that already classify and contain systems keeps one model). human-verified, sessionRef
"planning chat 2026-08-27, phase-2 planning", appliesTo sys-client-diagram, sys-client-state,
sys-shared-model. Append at END. `docs/TASKS.md` row → review + changelog.

## Report format

As in `_TEMPLATE.md`, plus `shared/` diff, the hook/prop signatures, inspection URL, screenshots.

## Revision (2026-08-27, design revision 3) — SUPERSEDES the levels above

Human reviewed a new Claude Design revision (`docs/design/landing-v3.dc.html`) and chose its
navigation model over category levels:

- **Atlas** (root): all systems in lanes, **no right panel**, hover → neighbours light, click →
  open the system. Subline = mission.
- **System focus** (scope = system id): ego graph — focused system centered as a large accent
  card, inbound neighbours stacked left, outbound stacked right, accent edges labelled by kind;
  click a neighbour to walk. Pure `egoLayout`, no ELK. Panel (380px) = EntityDetail with **Back**.
  Subline = "N systems · M connections · you are inside one of them".
- **Trail breadcrumb in the header**: `Architecture / hop / hop / current`; click to jump;
  Esc = Back.
- Keep `Project.categories` (schema + seed). Do not build category nodes/CategoryDetail now —
  category collapsing stays in the backlog for large projects.
- Rationale: the ego graph scales by edges-per-system, not total edges, and walking neighbour to
  neighbour answers "how is this connected?" directly. Category levels solved the atlas's scale,
  which is not the problem at 16 systems.
