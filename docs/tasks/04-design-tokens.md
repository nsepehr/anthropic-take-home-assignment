# Task: 04-design-tokens

## Goal

The client has one source of visual truth: the "Organic" design-system tokens and base classes from
the human's Claude Design work, ported to `client/src/styles/`. Every later UI task uses these
variables/classes and never hard-codes a color, font, radius or shadow.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md` (client section). The design source is
`docs/design/organic.css` and `docs/design/organic-readme.md` (checked in by the human — read
both; the readme explains how the system wants to be used: pills, over-rounded containers, warm
palette, Caprasimo headings / Figtree body, Lucide icons at stroke 2.75, themed focus/hover states).

## Scope

**In:**

- `client/src/styles/tokens.css` — the `:root` variables from `organic.css` verbatim (colors, ramps,
  fonts, space, radius, shadows). Add app-specific semantic tokens on top, derived from ramps (not new
  hexes): `--kind-ui`, `--kind-service`, `--kind-module`, `--kind-store`, `--kind-external`,
  `--kind-workflow` (use the KIND_COLOR mapping from the design: ui → accent-500, service →
  neutral-500, module → neutral-600, store → accent-2-500, external → accent-2-300, workflow →
  accent-700); `--status-implemented` (accent-2-600), `--status-partial` (accent-500),
  `--status-planned` (neutral-400); `--prov-human` (accent-2-600), `--prov-ai` (accent-500);
  `--dim-opacity: 0.22`; `--canvas-bg` (neutral-100), `--canvas-dot` (neutral-300), `--canvas-dot-size: 22px`.
- `client/src/styles/base.css` — the base rules + `.btn*`, `.tag*`, `.card*`, `.text-muted`,
  `.hr`, `.seg*` classes from `organic.css`, plus the rounded-frame overrides at the bottom of that
  file. Skip forms/table/dialog/nav/washed (not needed).
- `client/src/styles/index.css` — imports tokens, base, Google Fonts (`Caprasimo`, `Figtree`
  400/600/700) and `@xyflow/react/dist/style.css`; a `.sb` thin-scrollbar utility. `main.tsx`
  imports only `./styles/index.css` (move the existing xyflow css import there).
- `client/src/components/Tag.tsx`, `Button.tsx`, `ProvenanceDot.tsx` (9px circle: filled
  `--prov-human` for human-verified, outlined `--prov-ai` for ai-inferred, with `title`),
  `KindDot.tsx` (9px filled circle from `--kind-*`), `StatusDot.tsx`. Presentational only, typed
  props from `@app/shared` enums where applicable. One small test each (renderToString: correct
  class/var for each variant).
- `docs/design/README.md`: 10 lines on where tokens live and the rule "never hard-code".

**Out:** no layout, no diagram node, no panel, no dark theme (add a `docs/TASKS.md` backlog line
"dark theme tokens"), no Lucide dependency (icons come later if needed).

## Files you own

- `client/src/styles/**`, `client/src/components/**`, `client/src/main.tsx` (import line only),
  `docs/design/README.md`.

## Interfaces you depend on

- `@app/shared` → `SystemKind`, `RequirementStatus`, `Provenance['source']` enums/types.

## Acceptance criteria

- [ ] Debug page still renders; body shows the cream ground and Figtree; headings Caprasimo.
- [ ] `grep -rn "#[0-9a-f]\{6\}" client/src --include=*.tsx` finds nothing (no hex in components).
- [ ] Components render correct variants (tests).
- [ ] `npm run check` passes.

## Tests to write

- `components/*.test.tsx`: one per component: "variant X renders class/var Y".

## Seed data update (mandatory — see CLAUDE.md rule 9)

Add system `sys-client-styles` (kind `module`, parent `sys-client-app`, paths `client/src/styles/`,
`client/src/components/`). Add intent `int-design-tokens-single-source` — "All visual values come
from the Organic token sheet designed in Claude Design; components never hard-code colors or fonts,
so restyling never touches logic" (human-verified, sessionRef "Claude Design project 'Project Atlas'

- planning chat 2026-08-27"), appliesTo sys-client-styles. Append at END of arrays.

## Report format

As in `_TEMPLATE.md`, plus the list of semantic token names you defined.
