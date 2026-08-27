# Task: 11-highlight-neighbors

## Goal

Selecting a system highlights the systems it is connected to (the other end of each edge), as the
design does — tinted `accent-100`, full opacity — instead of leaving them dimmed while only the
edge lights up. Same closure rule for requirements and intents: the edges _between_ their systems
light up too.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `shared/src/related.ts` (+ test), `client/src/model/selection.ts`,
`client/src/model/entities.ts` (`connectionsFor` currently patches this locally by walking edges —
that duplication goes away once `relatedTo` is right). Design reference: the `related(id)` function in
the original Claude Design file (summarized): for a **system** → its edges + both endpoints of each,
requirements listing it, intents applying to it; for a **requirement** → its systems, intents applying
to it, and every edge whose both endpoints are in the set; for an **intent** → everything in
`appliesTo` (+ the systems of any requirement it applies to), and every edge whose both endpoints
are in the set. Edge selection → its two endpoints + its intent.

## Scope

**In:**

- `shared/src/related.ts`: make `relatedTo` return that closure. Keep the `Related` shape
  `{ systemIds, requirementIds, intentIds, edgeIds }`; never include the selected id itself;
  parent/children of a selected system stay included (current behavior).
- Update `shared/src/related.test.ts` to pin: "system → neighbor systems via edges";
  "requirement → edges between its systems"; "intent → systems of its requirements + edges between".
- `client/src/model/entities.ts`: simplify `connectionsFor` to use `relatedTo` (remove the manual
  edge walk); keep its dedupe/exclude-self test green.
- Verify in the browser: select Server API → Seed data and Shared data model cards are tinted and
  not dimmed; select a requirement → its systems and the edges between them light up.

**Out:** no visual changes beyond what the corrected closure produces; no schema changes.

## Files you own

- `shared/src/related.ts`, `shared/src/related.test.ts`, `client/src/model/entities.ts` (+ test).

## Acceptance criteria

- [ ] `relatedTo(project, 'sys-server-api').systemIds` includes `sys-seed-data` and
      `sys-shared-model` (the seed has edges server→seed-data, server→shared-model).
- [ ] Browser check above passes; `npm run check` passes.

## Seed data update (mandatory — see CLAUDE.md rule 9)

Append intent `int-selection-closure-includes-neighbors`: "Selecting a thing lights up everything
one hop away — connected systems, not just the arrows" (rationale: the question is "how does this
fit together?"; a lit arrow into a dimmed box answers half of it; matches the design's related()
rule; fixed at the shared model so canvas and panel agree). human-verified, sessionRef "planning
chat 2026-08-27, review of first build", appliesTo sys-shared-model, sys-client-diagram,
req-single-focused-interaction. Append at END.

## Report format

As in `_TEMPLATE.md`, plus the `shared/` diff.
