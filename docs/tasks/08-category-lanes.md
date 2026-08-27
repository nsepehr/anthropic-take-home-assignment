# Task: 08-category-lanes

## Goal

Systems are classified into named categories (lanes) — the design's "Clients / Edge / Core
services / Data & external" columns — so the diagram reads left-to-right by role. The schema gains
`System.category`; the layout partitions by it; the canvas draws a translucent lane behind each
category with an uppercase label.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `shared/src/schema/system.ts`, `client/src/layout/elk.ts`,
`client/src/model/toFlow.ts`. Design: CATEGORY LANES in `docs/design/landing.dc.html`. Human
decision: category is a _classification_ (a lane), distinct from `parentId` which is
_containment_. A nested system inherits its top-level ancestor's category for layout.
ELK: use `org.eclipse.elk.partitioning.activate: true` on the root and
`org.eclipse.elk.partitioning.partition: <index>` on each top-level node, direction RIGHT, so
each category becomes a vertical column ordered by first appearance in `project.systems`.

## Scope

**In:**

- `shared/src/schema/system.ts`: `category: z.string().min(1).optional()`. Additive. Validation:
  none beyond shape. Document in `data/README.md`.
- `data/project.json`: set `category` on every top-level system. Use: `Model` (sys-shared-model,
  sys-seed-data), `Server` (sys-server-api), `Client` (sys-client-app), `Workflow`
  (sys-agent-workflow). Leave nested systems without one (they inherit). Keep append-only rule for
  new entries; editing existing entries in place to add a field is fine here.
- `client/src/model/lanes.ts`: pure `categoryOf(project, systemId)` (walks parentId) and
  `laneOrder(project) → string[]`; `laneBounds(nodes, categoryOf) → { category, x, y, width,
height }[]` from positioned top-level nodes with padding (top 40 for the label, 16 sides).
- `client/src/layout/elk.ts`: accept an optional `partitionOf?: (nodeId) => number` and set the
  ELK partitioning options when provided. `useLayout` passes it through.
- `client/src/features/lanes/LaneLayer.tsx`: renders lane rectangles + labels; meant to be passed
  as `overlay` to `DiagramCanvas` (task 06) via `<ViewportPortal>` so it pans/zooms with the graph
  and sits beneath nodes (z-index below nodes). Style: `color-mix(surface 55%)`, radius 26,
  label 10px uppercase neutral-600 tokens.
- Wire the overlay into `DiagramCanvas` once 06 is on main (rebase; one-line prop).

**Out:** no lane collapsing/filtering, no editing categories, no lane colors per kind.

## Files you own

- `shared/src/schema/system.ts`, `data/README.md`, `data/project.json` (category fields only +
  your rule-9 additions), `client/src/model/lanes.ts` (+ test), `client/src/layout/**`,
  `client/src/features/lanes/**`.
- may also touch: `client/src/features/diagram/DiagramCanvas.tsx` (pass `overlay` only, after
  rebasing on a main that contains 06-system-node).

## Interfaces you depend on

- `useLayout` consumers (06) keep working when `partitionOf` is omitted.

## Acceptance criteria

- [ ] `npm run validate:data` passes; every top-level system has a category.
- [ ] Layout produces columns in lane order; nested systems land inside their parent's lane.
- [ ] Lanes render behind nodes with labels; pan/zoom keeps them aligned.
- [ ] `npm run check` passes.

## Tests to write

- `model/lanes.test.ts`: "categoryOf nested system = ancestor's"; "laneOrder is first-appearance";
  "laneBounds encloses all nodes of the category".
- `layout/elk.test.ts`: add "with partitionOf, nodes of partition 0 have x < nodes of partition 1".

## Seed data update (mandatory — see CLAUDE.md rule 9)

Intent `int-category-is-classification` — "Category is a lane (classification), separate from
parentId (containment); lanes give the diagram a left-to-right reading order" (human-verified,
sessionRef "planning chat 2026-08-27, design review"), appliesTo sys-shared-model, sys-client-layout.
Add `sys-client-lanes` under sys-client-app if you create the feature folder. Append at END.

## Report format

As in `_TEMPLATE.md`, plus the exact `shared/` diff.
