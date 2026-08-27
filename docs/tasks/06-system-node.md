# Task: 06-system-node

## Goal

The canvas shows the designed system card for every system, with edges styled per the design and
the selection states (selected / related / dimmed) driven by `useSelection()`. This replaces the
debug canvas as the real diagram feature.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`. Design: `docs/design/landing.dc.html` (SYSTEM CARD and
EDGES sections), `docs/design/organic-readme.md`. Tokens/components from task 04 (`client/src/styles/`,
`client/src/components/` — `Tag`, `KindDot`, `ProvenanceDot`) may or may not be merged when you
start; if not, code against the names in `docs/tasks/04-design-tokens.md` and rebase before
finishing. Foundation contract: `toFlowElements`, `useLayout`, `SystemNodeData { label, system,
requirementCount, intentCount }`, `useSelection().isHighlighted/isDimmed/select/clear`,
`useViewMode().mode` (see `client/src/model/toFlow.ts`, `client/src/state/`).

## Scope

**In:**

- `client/src/features/diagram/` → `DiagramCanvas.tsx` (React Flow with `nodeTypes={{ system:
SystemNode }}`, `edgeTypes={{ system: SystemEdge }}`, uses `useLayout`, `fitView` after layout,
  pane click → `clear()`, node click → `select(id)`, edge click → `select(edge.id)`; accepts an
  optional `overlay?: ReactNode` rendered inside the viewport via `<ViewportPortal>` for a later
  lanes layer; `nodesDraggable={false}`, `zoomOnScroll`, `panOnDrag`, `minZoom 0.4`), `SystemNode.tsx`
  (the card: kind dot + name, summary or detail per view mode, tags `kind · N req · N why ·
Verified/AI`; states: selected ring + accent-200 bg, related accent-100 bg, dimmed
  `--dim-opacity`; width 210, min-height 112; handles hidden visually), `SystemEdge.tsx` (bezier,
  arrowhead marker, stroke accent when related else neutral-500, width 2.2/1.4, opacity 0.75 when
  nothing selected, dimmed otherwise; label only in deep-dive mode), `diagram.css`, `index.ts`.
- Update `NODE_SIZE` in `model/toFlow.ts` to the card size (210 × 112) — that file is foundation
  code; this is the one permitted edit and must be called out.
- Parent (nested) systems render as a lighter container card with the label top-left (design has
  no explicit spec — keep it minimal: translucent surface bg, radius 26, uppercase 10px label).
- Replace `DebugCanvas` with `DiagramCanvas` in `App.tsx` once 05-app-shell is on main (rebase);
  delete `features/debug/`.

**Out:** no panel, no lanes/categories (task 08 supplies the overlay), no minimap/controls, no
animation beyond the .18s transitions in the design.

## Files you own

- `client/src/features/diagram/**`; delete `client/src/features/debug/**`.
- may also touch: `client/src/model/toFlow.ts` (NODE_SIZE only), `client/src/App.tsx` (swap the
  canvas slot only, after rebasing on a main that contains 05-app-shell).

## Interfaces you depend on

- Foundation hooks/types above (unchanged). Tokens/components from 04. `AppShell` canvas slot from 05.

## Acceptance criteria

- [ ] Seed renders as designed cards, ELK-laid out, no overlaps; edges with arrowheads.
- [ ] Click a card → ring + related tint + others dim to 0.22; click pane → all restored.
- [ ] Toggle deep dive → cards show `detail` and edges show labels.
- [ ] No hex colors in `features/diagram`; all via tokens/classes.
- [ ] `npm run check` passes.

## Tests to write

- `SystemNode.test.tsx`: "renders name, counts, provenance tag; dimmed → opacity var; selected → ring class".
- `SystemEdge.test.tsx` or `DiagramCanvas.test.tsx` (renderToString): "edge label appears only in deepDive".

## Seed data update (mandatory — see CLAUDE.md rule 9)

Add `sys-client-diagram` (kind `ui`, parent `sys-client-app`, paths `client/src/features/diagram/`).
Intent `int-node-is-a-card` — "A system on the canvas is a rich card (summary, counts of
requirements and intents, provenance), not a labeled box" (human-verified, sessionRef "Claude
Design 'Project Atlas' + planning chat 2026-08-27"), appliesTo sys-client-diagram, req-single-focused-interaction.
Mark `req-single-focused-interaction` evidence with the diagram feature. Append at END of arrays.

## Report format

As in `_TEMPLATE.md`.
