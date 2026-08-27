# Task: 05-app-shell

## Goal

The single-screen layout from the design exists as real components with empty slots: header
(project name, mission, provenance legend, overview/deep-dive toggle), the canvas region, and the
400px right panel that switches between **ProjectOverview** (nothing selected) and **EntityDetail**
(something selected). Later tasks fill the slots; this task owns the frame.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md` (client section — features never import each other).
The design reference is `docs/design/landing.dc.html` (read the template markup at the top; ignore
the `<script>` data/logic — it is a mock, our data comes from `useProject()`), and
`docs/design/organic-readme.md` for the visual rules. Human decisions that override the design:

- The right panel is ALWAYS visible. With nothing selected it shows the whole project (overview);
  with a selection it shows that entity's detail. (Design hid it; we don't.)
- The overview/deep-dive toggle is GLOBAL, lives in the header, and uses `useViewMode()`. (Design
  had a per-item button; we don't.)

Token names come from task 04 (`client/src/styles/tokens.css`) which runs in parallel — use the
Organic variable names from `docs/design/organic.css` (`--color-bg`, `--color-surface`,
`--color-neutral-*`, `--font-heading`, `--radius-lg`, …) and the semantic ones 04 defines
(`--canvas-bg`, `--canvas-dot`, `--canvas-dot-size`, `--prov-human`, `--prov-ai`). If 04 hasn't
merged when you finish, that's fine — the names are the contract.

## Scope

**In:**

- `client/src/features/shell/` → `AppShell.tsx` (the flex column: header, then row of canvas +
  panel; 100vh, no page scroll; panel scrolls with `.sb`), `Header.tsx` (name + mission from
  `useProject()`, legend "● Verified human-checked / ○ AI inferred", a `.seg` control for
  Overview / Deep dive bound to `useViewMode()`), `CanvasFrame.tsx` (the rounded dotted-grid
  container, `position: relative`, renders `children`; shows the hint text "Click a system to read
  what it does, what it must do, and why it was built this way." bottom-left when nothing is
  selected via `useSelection()`), `SidePanel.tsx` (400px, switches on `useSelection().selectedId`:
  null → `<ProjectOverview/>` slot, else `<EntityDetail/>` slot — both accepted as props/slots so
  the panel doesn't import feature components), `index.ts`.
- Loading / error states from `useProject()` rendered inside the shell (simple text, tokens).
- `App.tsx`: providers + `<AppShell canvas={<DebugCanvas/>} overview={<Placeholder/>} detail={<Placeholder/>}/>`
  — keep the debug canvas as the canvas slot for now so the page still works end to end.
- Placeholders live in `features/shell/Placeholder.tsx` and just print "overview" / "detail: <id>".

**Out:** no node card, no panel content, no diagram changes, no category lanes, no responsive/mobile.

## Files you own

- `client/src/features/shell/**`, `client/src/App.tsx`, `client/src/App.test.tsx`.

## Interfaces you depend on

- `useProject()`, `useSelection()`, `useViewMode()` from `client/src/state/` (do not change).
- `DebugCanvas` from `features/debug` (unchanged, used as the canvas slot).
- Token names as above.

## Acceptance criteria

- [ ] Page shows header with real project name/mission, canvas with the debug diagram, right panel
      with "overview"; clicking a node switches the panel to "detail: <id>"; clicking the pane clears.
- [ ] Toggle flips `useViewMode()` and persists on reload.
- [ ] No page-level scrollbar at 1440×900; panel scrolls independently.
- [ ] `App.tsx` contains no logic.
- [ ] `npm run check` passes.

## Tests to write

- `features/shell/SidePanel.test.tsx`: "no selection → overview slot; selection → detail slot".
- `features/shell/Header.test.tsx`: "renders name + mission; toggle reflects mode".

## Seed data update (mandatory — see CLAUDE.md rule 9)

Add system `sys-client-shell` (kind `ui`, parent `sys-client-app`). Add intents (human-verified,
sessionRef "planning chat 2026-08-27, design review"): `int-panel-always-visible` — "The right
panel always shows something: the whole project when nothing is selected, the entity when
something is" (rationale: newcomers need the overview before they click; no empty states);
`int-global-view-mode` — "Overview vs deep dive is one global switch, not per card" (rationale:
summary/detail is baked into the schema for every entity; one switch keeps the whole screen at one
altitude). Append at END of arrays.

## Report format

As in `_TEMPLATE.md`, plus the slot/prop signatures of `AppShell`.
