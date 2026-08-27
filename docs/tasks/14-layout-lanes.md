# Task: 14-layout-lanes

## Goal

The diagram reads left-to-right along the dependency flow with compact, top-aligned lanes and
short arrows. Current state (human review, screenshot in the planning chat): lanes are ordered
by seed order (Model → Server → Client → Workflow) while edges mostly point the other way, so
arrows loop backwards across the canvas; lanes have wildly different heights and float at
different vertical offsets; the fit zoom ends up tiny. **Do not merge** — the human inspects first.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `client/src/model/lanes.ts` (lane order = first
appearance), `client/src/layout/elk.ts` (+ `useLayout.ts`), `client/src/features/diagram/DiagramCanvas.tsx`,
`client/src/model/edgeSides.ts` (handles are chosen from final positions — keep it last in the
pipeline). Design reference: `docs/design/landing.dc.html` — four lanes of similar height, equal
spacing, cards flowing left → right (Clients → Edge → Core → Data), top-aligned.

## Research first (≤30 min), then decide; write a 10-line decision note

1. **Lane order from edges** (pure): build the category graph (edge count from lane A to lane B),
   topologically order it by net flow (Kahn/greedy on out-minus-in weight; cycles broken by
   dropping the lightest back-edge), tie-break by seed order. Expected result for the seed:
   Workflow → Client → Server → Model (or Client → Server → Model with Workflow first/last —
   whichever the edges support). Provide `laneOrder(project)` returning that; keep the old
   first-appearance behaviour as the tie-break only.
2. **ELK options for partitions**: evaluate `elk.layered.nodePlacement.strategy`
   (`SIMPLE` / `LINEAR_SEGMENTS` / `NETWORK_SIMPLEX` / `BRANDES_KOEPF` + `bk.fixedAlignment`),
   `elk.layered.spacing.nodeNodeBetweenLayers`, `elk.spacing.nodeNode`,
   `elk.layered.compaction.postCompaction.strategy`, `elk.layered.considerModelOrder.strategy`,
   `elk.layered.crossingMinimization.strategy`, `elk.partitioning.*`. Pick the set that keeps
   lanes compact and reduces edge length/crossings for ~16 nodes / ~25 edges. Test them on the
   real seed and compare bounding-box height, total edge length, and crossings (a tiny script or
   test is fine).
3. **Top-align + equalize lanes** as a pure post-process on positioned nodes: shift each lane's
   nodes so every lane starts at the same top (padding for the label), and, if a lane is much
   shorter than the tallest, leave it — do NOT stretch cards. Lane backgrounds (`laneBounds`)
   should then be equal-top and only differ in height. Option: give lanes a uniform minimum height
   equal to the tallest so the band reads as one row (design does this) — implement behind a
   constant and show both in the report screenshots.
4. **Fit**: after layout, `fitView` with padding ~0.08 and `minZoom` allowing the whole graph;
   cards should not fall below ~0.6 scale at 1440×900 for the seed. If they do, prefer reducing
   inter-layer spacing over shrinking.

## Scope

**In:** `laneOrder` from edges (+ tests: expected order for the seed; cycle handling; tie-break);
ELK option set (+ a test asserting no overlaps and lanes in the computed order); lane top-align
post-process (+ test); fit tuning; keep `attachEdgeSides` as the last step.
**Out:** no card/panel changes, no schema changes, no edge style changes, no manual positions.

## Files you own

- `client/src/model/lanes.ts` (+ test), `client/src/layout/**`, `client/src/features/diagram/DiagramCanvas.tsx`
  (wiring only), `client/src/features/diagram/components/LaneLayer.tsx` (only if lane visuals need it).

## Acceptance criteria

- [ ] Lanes render in dependency order; the majority of edges point right; no edge loops back
      across more than one lane unless the data truly requires it (report any).
- [ ] Lanes share a top edge; the tallest lane sets the band height; no overlaps.
- [ ] Fit shows the whole graph with cards legible at 1440×900.
- [ ] `npm run check` passes (new tests included). Nothing else visually changes.
- [ ] **Leave `npm run dev` running in the worktree and report the URL**; do not run
      finish-worktree until told.

## Seed data update (mandatory — see CLAUDE.md rule 9)

Append intent `int-lane-order-from-edges`: "Lanes are ordered by the direction of the edges, so
the diagram reads along the dependency flow" (rationale: order by seed position produced backward
arrows; deriving order from the data keeps the picture honest as the project grows; ties fall back
to seed order). human-verified, sessionRef "planning chat 2026-08-27, layout review", appliesTo
sys-client-layout, sys-client-diagram. Append at END.

## Report format

As in `_TEMPLATE.md`, plus decision note, before/after screenshots in the scratchpad, the
inspection URL, and the measured numbers (bbox height, edge length, crossings) for the options
you compared.
