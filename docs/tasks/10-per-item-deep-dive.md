# Task: 10-per-item-deep-dive

## Goal

Match the updated Claude Design: **no global Overview/Deep-dive toggle**. Instead the detail card
in the right panel has a "Deep dive" / "Hide deep dive" button that reveals that entity's deep
sections, and it resets whenever the selection changes. Canvas cards and list cards always show
the one-line summary.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`. Design source (updated 2026-08-27): the detail card in
`docs/design/landing.dc.html` — but note that file's header comment still says the toggle is global;
that decision is now REVERSED by the human. Update that comment. Current code: `client/src/state/viewMode.tsx`
(+ test), `features/shell/Header.tsx` (the `.seg` control), `features/panel/DetailCard.tsx`,
`components/DeepSection.tsx`, `RequirementCard.tsx`, `IntentCard.tsx`, `features/diagram/SystemNode.tsx`,
`SystemEdge.tsx`, `cardSize.ts`.

Other deltas from the same design update, in scope:

- Right panel width 360px, margin-left 16px (`features/shell/shell.css` / `SidePanel.tsx`).
- System card tags: omit `N req` when 0 and `N why` when 0; tags `white-space: nowrap`.

## Scope

**In:**

- Remove `ViewModeProvider`/`useViewMode` and its test; remove the header `.seg` control and the
  localStorage key. Header keeps name, mission, provenance legend.
- `DetailCard.tsx`: local `expanded` state; `.btn.btn-secondary` "Deep dive" ↔ "Hide deep dive"
  (font-size 13px, margin-top 14px, self-start); when expanded show the deep sections exactly as
  now (system → "How it works"; requirement → "Evidence" + evidence list; intent → "Rationale" +
  superseded-by link). The wrapper already remounts on selection (`key={selectedId}` in SidePanel)
  so state resets for free — verify, don't duplicate.
- `RequirementCard`, `IntentCard`, `SystemNode`: always summary. `SystemEdge`: never show label
  (design shows labels only in the dead `deep` branch) — keep the label in `data` for later.
- `cardSize.ts`: single size (no deep-dive height).
- Panel width + tag rules above.
- `docs/design/landing.dc.html` header comment: drop the "global toggle" override line; note
  "per-item deep dive in the detail card".

**Out:** no other polish (edge routing, click-vs-drag threshold, lane alignment — separate task).
No `shared/` changes.

## Files you own

- `client/src/state/viewMode.tsx` (+ test — delete), `client/src/features/shell/**`,
  `client/src/features/panel/**`, `client/src/features/diagram/**`, `client/src/App.tsx`
  (remove the provider), `docs/design/landing.dc.html` (comment only).

## Acceptance criteria

- [ ] No Overview/Deep-dive control in the header; `grep -rn viewMode client/src` → nothing.
- [ ] Select Server API → detail card shows summary + "Deep dive" button; click → "How it works"
      section appears, button reads "Hide deep dive"; select another entity → collapsed again.
- [ ] Requirement → "Evidence" section with evidence list; intent → "Rationale".
- [ ] Cards with 0 requirements show no `0 req` tag; panel is 360px.
- [ ] `npm run check` passes; tests referencing view mode are updated, not deleted wholesale
      (DetailCard test covers expand/collapse).

## Tests to write

- `features/panel/DetailCard.test.tsx`: "collapsed by default; expanded shows the deep section
  label for each entity type".
- Update `SystemNode.test.tsx`: "zero counts render no tag".

## Seed data update (mandatory — see CLAUDE.md rule 9)

- Set `int-global-view-mode` → `status: "superseded"`, `supersededBy: "int-per-item-deep-dive"`.
  Do not delete it — it is the record.
- Append `int-per-item-deep-dive`: statement "Deep dive is per selection, opened from the detail
  card, not a global mode"; rationale: the human reviewed the first build and preferred the
  design's model — the canvas stays at one altitude, and depth is asked for on the thing you're
  looking at; a global switch changed the whole screen at once and made the panel harder to read.
  `status: active`, human-verified, sessionRef "planning chat 2026-08-27, design revision 2",
  appliesTo sys-client-panel, sys-client-shell, req-overview-deep-dive.
- `req-overview-deep-dive`: update summary/detail to describe per-item deep dive; keep status.
- Append at END of arrays. Run `npm run validate:data`.

## Report format

As in `_TEMPLATE.md`.
