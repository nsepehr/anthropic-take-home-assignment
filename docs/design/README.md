# Design → code

- `organic.css` / `organic-readme.md` / `landing.dc.html` are the human's Claude Design source ("Project Atlas"). Read-only reference.
- The ported, live tokens are `client/src/styles/tokens.css` (`:root` variables verbatim, plus app semantic tokens: `--kind-*`, `--status-*`, `--prov-*`, `--dim-opacity`, `--canvas-*`).
- Base rules and classes (`.btn*`, `.tag*`, `.card*`, `.hr`, `.text-muted`) live in `client/src/styles/base.css`; `index.css` wires fonts, xyflow css, tokens, base and the `.sb` scrollbar utility. `main.tsx` imports only `index.css`.
- Shared presentational components (`Tag`, `Button`, `KindDot`, `StatusDot`, `ProvenanceDot`) are in `client/src/components/`.
- **Rule: never hard-code a color, font, radius, shadow or spacing in client code.** Use `var(--…)` or a base class. `grep -rn "#[0-9a-f]\{6\}" client/src --include=*.tsx` must stay empty.
- New semantic meanings (a new kind, status, or badge) get a new token in `tokens.css` derived from an existing ramp step — not a new hex.
- To restyle the app, edit `tokens.css` only. Dark theme: backlog.
