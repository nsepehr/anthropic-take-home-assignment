# Task: 12-seed-client-graph

## Goal

The Client lane reads as a connected system, not one column of unrelated boxes. Model the real
client architecture in `data/project.json`: separate systems for the real modules, with the edges
that actually exist between them, evidenced by imports.

## Context

Read `CLAUDE.md`, `data/README.md`, `client/src/**` (the truth — derive edges from imports), and
`docs/MODULARITY.md` client section. Today every client system is nested under `sys-client-app`
with **no edges between them**, so ELK stacks them. Human review: "Client app isn't interesting —
it needs separate sections that are connected to each other."

## Scope (data only — no code changes)

**In:**

- **Flatten**: remove `sys-client-app` as a container. Every client system becomes top-level with
  `category: "Client"`, no `parentId`. Keep existing ids where they exist (append-only rule allows
  editing fields in place, not reordering). Reassign anything that pointed at `sys-client-app`
  (edges, intents' `appliesTo`, requirements' `systemIds`) to the concrete system it really means.
- **Systems** (create the missing ones; keep/rename existing to these names):
  `sys-client-shell` (App shell — header, canvas frame, side panel), `sys-client-diagram`
  (Diagram canvas — cards, edges, lanes overlay), `sys-client-panel` (Detail panel + project
  overview), `sys-client-state` (Project + selection state; `deriveSelection`), `sys-client-api`
  (NEW: `client/src/api/project.ts` — the only fetch call site; validates the payload with the
  shared schema), `sys-client-layout` (ELK pipeline: `toFlow`, `elk.ts`, `lanes.ts`),
  `sys-client-styles` (tokens + base components). Fold `sys-client-lanes` into `sys-client-diagram`
  (mark it superseded? No — systems have no status; instead delete it and move its paths into
  diagram; update any references).
- **Edges** (only ones evidenced by imports; check with grep before adding):
  shell → diagram (renders), shell → panel (renders), diagram → state (reads selection),
  panel → state (reads selection), diagram → layout (calls), state → api (calls; `ProjectProvider`
  fetches), api → server-api (calls `GET /api/project`, replace the existing client-app→server
  edge), api → shared-model (depends: validateProject), state → shared-model (depends: relatedTo),
  layout → shared-model (depends), panel → styles / diagram → styles / shell → styles (depends —
  include only if it doesn't make the lane a hairball; if noisy, keep just one "depends" edge from
  shell → styles and explain in the styles system's detail that every feature uses it).
  Each edge: `kind`, short `label`, and `intentId` where an existing intent explains it
  (`int-selection-client-side` for state edges, `int-layout-pure-pipeline` for layout,
  `int-api-single-payload` for api→server, `int-design-tokens-single-source` for styles).
- **Provenance**: systems/edges derived from reading code are `ai-inferred` (that's honest); the
  restructuring decision itself is recorded as a human-verified intent (below).
- `npm run validate:data` must pass with **no new gaps**; if an edge has no intent, either find
  the right existing one or leave it as a gap and say so.
- Verify in the browser (`npm run dev`) that the Client lane now shows a connected graph with
  no overlaps. If ELK stacks or overlaps badly, adjust edge count, not code — report what you saw.

**Out:** no code changes anywhere. No new intents beyond the one below. Don't touch other lanes.

## Files you own

- `data/project.json`, `data/README.md` (if the structure note needs updating).

## Acceptance criteria

- [ ] No system has `parentId: "sys-client-app"`; `sys-client-app` is gone or is a plain system
      only if something genuinely maps to it (prefer gone).
- [ ] ≥ 7 client systems, ≥ 8 client edges, all evidenced by imports (report the grep).
- [ ] `npm run validate:data` OK; gaps unchanged or fewer.
- [ ] Browser: Client lane shows a connected graph.

## Seed data update (mandatory — see CLAUDE.md rule 9)

Append intent `int-client-is-a-graph`: "The client is modeled as its real modules with the edges
between them, not one container" (rationale: a stack of boxes answers nothing; the interesting
question is how shell, diagram, panel, state, api and layout depend on each other; edges are
derived from imports so the picture is evidence, not decoration). human-verified, sessionRef
"planning chat 2026-08-27, review of first build", appliesTo every client system id.
Append at END; run `npm run validate:data`.

## Report format

As in `_TEMPLATE.md`, plus the final list of client systems and edges.
