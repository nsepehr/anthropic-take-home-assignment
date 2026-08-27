# Task: 22-search

Goal: a search box in the header (right of the trail) that filters the model live. Client only.

- `client/src/model/search.ts` (pure, tested): `searchProject(project, query) → { systemIds, requirementIds, intentIds }` — case-insensitive substring over name/title/statement, summary, detail, paths; empty query → empty sets.
- `client/src/state/search.tsx`: `SearchProvider` + `useSearch()` → `{ query, setQuery, results, active }`.
- `features/search/SearchBox.tsx`: `.input` pill, placeholder "Search systems, requirements, intents…", Esc clears, "N matches" hint. Mount in Header (one line).
- While `active`: matching cards on the canvas get `.is-match` (accent ring), non-matches dim (`--dim-opacity`); panel lists show only matches when open; the ProjectOverview lists filter too. Reuse the existing dim/ring classes — no new colours.
- Seed: append intent `int-search-should-be-semantic` — "Search is substring today; the right version is semantic (embeddings over summary/detail/rationale), so 'why is layout pure?' finds the intent, not just the word" (human-verified, sessionRef "planning chat 2026-08-27, wrap-up"), appliesTo sys-client-panel, sys-client-diagram. Add `sys-client-search`? No — fold paths into sys-client-shell's paths. Append at END.
  Own: `client/src/model/search.ts(.test)`, `client/src/state/search.tsx(.test)`, `client/src/features/search/**`, one line each in Header.tsx / App.tsx / SystemCard.tsx (class) / EntityList or ProjectOverview (filter). Tests: search model (3), state (1). Inspect-before-merge NOT required — merge on green report with a screenshot `search.jpg`.
