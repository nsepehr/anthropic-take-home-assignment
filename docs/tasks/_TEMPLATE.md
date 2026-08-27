# Task: <slug>

## Goal

One or two sentences: what exists when this is done, and why it matters to the product thesis
(intent/features front and center, exploration & understanding).

## Context

What the agent needs to know that isn't in `CLAUDE.md`: relevant prior decisions, links to files to
read first, the user-facing scenario this serves.

## Scope

**In:**

- …

**Out (do not do, even if tempting):**

- …

## Files you own

Paths you may create/edit freely. Anything else is off-limits unless listed under "may also touch".

- `client/src/…`
- may also touch: `shared/src/index.ts` (additive only — explain in report)

## Interfaces you depend on

Types/endpoints/components from other tasks or from `main` that you consume but must not change.
Say what you assume about them.

- `@app/shared` → `…`
- `GET /api/…` → returns `…`

## Acceptance criteria

Concrete, checkable statements. Prefer "when X, then Y".

- [ ] …
- [ ] `npm run check` passes

## Tests to write

The intent each test pins (one line each). Keep it to what another agent could break.

- `…test.ts`: "given …, returns …"

## Seed data update (mandatory — see CLAUDE.md rule 9)

Which systems / requirements / intents this task adds or updates in `data/project.json`.

## Report format

When done, reply with:

1. **Built** — bullets, with file paths.
2. **Skipped / deferred** — and why.
3. **Verify** — exact commands (and URL/route to look at).
4. **`shared/` changes** — diff or "none".
5. **Dependencies added** — name + one-line reason, or "none".
6. **Decisions / assumptions** the human should know about.
