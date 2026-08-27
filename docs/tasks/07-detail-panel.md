# Task: 07-detail-panel

## Goal

The right panel delivers the product's core promise. With a system selected it shows: what it is,
how it works, **the requirements it serves and the intents behind it** (each with evidence /
rationale), provenance, code paths, and clickable connections. With a requirement or intent
selected, the same panel re-centers on that entity. With nothing selected it shows the whole
project: mission, all requirements, all intents.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`. Design: `docs/design/landing.dc.html` (RIGHT PANEL
sections), `docs/design/organic-readme.md`. Human decisions: panel always visible; overview when
nothing selected; the global view mode (`useViewMode().mode`) decides whether cards show
summary or detail/rationale; **no per-item deep-dive button**. Tokens/components from task 04
(`Tag`, `ProvenanceDot`, `StatusDot`, `KindDot`, `Button`); shell slots from task 05
(`AppShell overview={…} detail={…}`) — both may still be in flight; code against the names and
rebase before finishing. Data: `useProject().project`, `useSelection()` (`selectedId`, `related`
= `Related { systemIds, requirementIds, intentIds, edgeIds }`, `select`, `clear`), and
`relatedTo` / entity lookups from `@app/shared`.

## Scope

**In:**

- `client/src/model/entities.ts` — pure helpers: `findEntity(project, id) → { type, entity } | null`,
  `requirementsFor(project, id)`, `intentsFor(project, id)`, `connectionsFor(project, id)` (the
  systems/requirements/intents to list as chips, deduped, excluding self). Tested.
- `client/src/features/panel/` → `EntityDetail.tsx` (dispatches on entity type), `DetailCard.tsx`
  (kicker `System · kind` / `Requirement · kind · status` / `Intent · decision`, title, summary,
  divider, deep section: system → "How it works" = detail; requirement → "Evidence" = detail +
  evidence list; intent → "Rationale" = rationale (+ "Superseded by" link when status is
  superseded); provenance line "Human-verified · date"; path chips; Close button → `clear()`),
  `RequirementCard.tsx` (status dot, title, provenance dot, summary|detail per mode, status + kind
  tags; click → `select`), `IntentCard.tsx` (accent surface, statement, provenance dot,
  summary|rationale per mode; click → `select`), `EntityList.tsx` (heading + count + cards +
  "Nothing recorded yet."), `ConnectedChips.tsx`, `ProjectOverview.tsx` (mission paragraph;
  "Requirements" list of all; "Intents" list of all; small counts line "N systems · N requirements
  · N intents"), `panel.css`, `index.ts`.
- Headings: for a system → "Requirements" and "Why it is built this way"; for an intent →
  "Requirements it serves"; for a requirement → "Intents". Cards in lists also dim/ring per
  `isDimmed/isHighlighted` so selecting a card in the panel highlights across the app.
- Wire into `App.tsx` slots once 05 is on main (rebase): `overview={<ProjectOverview/>}
detail={<EntityDetail/>}`.

**Out:** no gaps/"unexplained" view (later), no editing, no markdown rendering beyond plain
paragraphs (split `detail` on blank lines into `<p>`s), no search/filter.

## Files you own

- `client/src/features/panel/**`, `client/src/model/entities.ts` (+ test).
- may also touch: `client/src/App.tsx` (fill the two slots only, after rebasing on a main that
  contains 05-app-shell).

## Interfaces you depend on

- `useProject`, `useSelection`, `useViewMode` (unchanged). Tokens/components from 04. Slots from 05.

## Acceptance criteria

- [ ] Nothing selected → overview with mission, all requirements, all intents.
- [ ] Select `sys-server-api` → its detail, its requirements (with evidence in deep dive), its
      intents (with rationale in deep dive), connected chips; clicking a chip re-centers.
- [ ] Select an intent → "Requirements it serves" lists exactly `appliesTo.requirementIds` +
      the systems appear as chips.
- [ ] Toggle view mode flips every card's text between summary and detail/rationale.
- [ ] No hex colors; tokens/classes only. `npm run check` passes.

## Tests to write

- `model/entities.test.ts`: "requirementsFor(system) = requirements whose systemIds include it";
  "intentsFor(requirement) = intents whose appliesTo.requirementIds include it"; "connectionsFor
  excludes self and dedupes".
- `features/panel/EntityDetail.test.tsx` (renderToString with seed): "system → both headings and
  correct counts"; "intent → 'Requirements it serves'".
- `features/panel/ProjectOverview.test.tsx`: "lists all requirements and intents".

## Seed data update (mandatory — see CLAUDE.md rule 9)

Add `sys-client-panel` (kind `ui`, parent `sys-client-app`, paths `client/src/features/panel/`).
Intent `int-panel-answers-three-questions` — "Selecting a system answers, in one panel: what it
is, what it must do (requirements + evidence), and why it is built this way (intents + rationale)"
(human-verified, sessionRef "planning chat 2026-08-27, design review"), appliesTo sys-client-panel,
req-single-focused-interaction, req-overview-deep-dive. Update `req-single-focused-interaction`
status to `implemented` only if the diagram feature (task 06) is also on main when you finish;
otherwise leave `partial` and say so. Append at END of arrays.

## Report format

As in `_TEMPLATE.md`.
