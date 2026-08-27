# Task: 13-edge-routing

## Goal

Arrows attach to the sensible side of each card. When the target sits to the left of the source,
the edge leaves the source's left and enters the target's right; when it sits above/below, use
top/bottom. No more loops that exit right, swing around, and enter from the left. **Do not merge**
— the human inspects the result in the browser first.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `client/src/features/diagram/**`, `client/src/model/toFlow.ts`
(handles are currently fixed: source `Position.Right`, target `Position.Left`),
`client/src/layout/elk.ts`. Lanes partition ELK left→right, but edges within a lane and edges to
parent containers go in every direction.

## Research first (30 min max), then decide

Compare and write a 10-line decision note in the report:

1. **Dynamic handle sides after layout** — each card renders four handles (top/right/bottom/left,
   ids `t/r/b/l`, visually hidden). After ELK positions land, a pure function
   `chooseHandles(sourceRect, targetRect) → { sourceHandle, targetHandle }` picks sides by the
   dominant axis of the center-to-center vector (dx vs dy), and edges get those ids. Simple, pure,
   testable, keeps React Flow's bezier. (React Flow "floating edges" example is the reference —
   `reactflow.dev/examples/edges/floating-edges` — but we can stay on handles rather than computing
   rect intersections.)
2. **ELK edge routing** — ask ELK for `elk.edgeRouting: ORTHOGONAL` (or `SPLINES`) with
   `org.eclipse.elk.hierarchyHandling: INCLUDE_CHILDREN`, read each edge's `sections`
   (startPoint/bendPoints/endPoint), and draw a custom edge from those absolute points. Truest to
   the layout; more code; must transform coordinates for nested nodes.
3. Anything better you find in the React Flow 12 / ELK docs (e.g. `elk.layered.edgeRouting` + port
   constraints `FIXED_SIDE` so ELK itself decides ports).

Pick the option with the best result/complexity ratio for ~20 nodes. Default expectation: option 1,
possibly with ELK port-side hints. Whatever you choose must be a pure function + one place that
applies it (`model/` or `layout/`), no logic in components.

## Scope

**In:** the chosen approach; edges to/from parent containers attach to the container's nearest
side too; keep arrowheads, lit/dimmed styling, and the label data untouched; tests for the pure
function (all four directions + tie-break).

**Out:** no edge label rendering, no re-layout changes beyond what routing needs, no schema changes.

## Files you own

- `client/src/features/diagram/**`, `client/src/model/toFlow.ts`, `client/src/model/edgeSides.ts`
  (+ test, new), `client/src/layout/**` (only if option 2/3).

## Acceptance criteria

- [ ] In the browser, no edge leaves the right side of a card whose target is to its left; vertical
      neighbours connect top↔bottom.
- [ ] Nothing else visually changes. `npm run check` passes.
- [ ] **Leave the worktree in place with `npm run dev` running** and report the URL (client port
      from `.env.local`) so the human can inspect. Do not run finish-worktree's rebase until the
      human approves (I will tell you).

## Seed data update (mandatory — see CLAUDE.md rule 9)

Append intent `int-edges-attach-nearest-side`: "Arrows attach to the side of a card that faces the
other end" (rationale: fixed right→left handles read wrong for backward or vertical connections; the
reader should follow an arrow without tracing a loop; decided after human review of the first
build). human-verified, sessionRef "planning chat 2026-08-27, review of first build", appliesTo
sys-client-diagram (and sys-client-layout if you touched layout). Append at END.

## Report format

As in `_TEMPLATE.md`, plus the decision note, the inspection URL, and before/after screenshots
saved under the scratchpad if you can take them.
