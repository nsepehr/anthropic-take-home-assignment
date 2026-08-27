# Task: 02-api

## Goal

The server serves the validated project model so the client (and a reviewer with `curl`) can get
the whole picture from one place. When done: `GET /api/project` returns the validated seed,
`GET /api/project/gaps` returns the honesty report, `GET /api/project/related/:id` returns the
closure the hero interaction needs.

## Context

Task 01 (`docs/tasks/01-schema-and-seed.md`) defined the contract in `@app/shared`:
`validateProject(input) → { ok, project, gaps } | { ok: false, errors }`, `relatedTo(project, id)`,
and the seed at `data/project.json`. Read `shared/src/` and `data/README.md` first. The server's
job is thin: load, validate once, serve. Keep it that way — analysis/AI is a later, separate task.

## Scope

**In:**

- A `projectStore` module: loads `data/project.json` at startup (path from `PROJECT_FILE` env,
  default `../data/project.json` relative to the repo root), runs `validateProject`, caches result.
  If validation fails the server must still boot and `/api/project` returns 500 with the readable
  errors — a broken seed should be visible, not a silent crash loop.
- Routes (all JSON):
  - `GET /api/project` → the validated `Project`.
  - `GET /api/project/gaps` → `Gaps`.
  - `GET /api/project/related/:id` → `relatedTo` result; 404 with `{ error }` if id unknown.
    Validate `:id` as a slug (`/^[a-z0-9-]+$/`) at the boundary; 400 otherwise.
  - `GET /api/project/entities/:id` → the single entity + its `type` (`system` | `requirement` |
    `intent` | `edge`); 404 if unknown.
- Keep `/api/health`; extend it with `{ project: { loaded: boolean, name?: string } }`.
- Dev-only `POST /api/project/reload` re-reads the file (so editing the seed doesn't need a
  restart). Disabled when `NODE_ENV=production`.

**Out (do not do, even if tempting):**

- No mutations of the seed via API. No auth. No client changes. No AI. No caching headers/ETag.
- Do not change `shared/` unless something is genuinely missing for the routes; if so, additive
  only, and report the diff.

## Files you own

- `server/src/**` (keep `app.ts` as the composition root; put routes in `server/src/routes/`, the
  store in `server/src/projectStore.ts`).
- `.env.example` (add `PROJECT_FILE`).

## Interfaces you depend on

- `@app/shared` → `validateProject`, `relatedTo`, `Project`, `Gaps` types. Do not change semantics.
- `data/project.json` → read-only.

## Acceptance criteria

- [ ] `curl localhost:$SERVER_PORT/api/project | jq .name` prints the project name.
- [ ] `/api/project/gaps` matches `npm run validate:data` output.
- [ ] `/api/project/related/<a real intent id>` returns non-empty `systemIds`.
- [ ] Unknown id → 404 JSON; malformed id → 400 JSON; invalid seed file (point `PROJECT_FILE` at a
      broken fixture) → server boots, `/api/project` → 500 with errors, `/api/health` says
      `loaded: false`.
- [ ] `npm run check` passes.

## Tests to write (via `buildApp().inject`, fixtures under `server/test/fixtures/`)

- `routes/project.test.ts`: "GET /api/project returns validated seed"; "related/:id returns closure
  for a known id"; "related/:id → 404 for unknown, 400 for malformed"; "entities/:id returns entity
  with type".
- `projectStore.test.ts`: "invalid file → store reports errors, app still boots"; "reload picks up
  file changes".

## Seed data update (mandatory — see CLAUDE.md rule 9)

Update `sys-server-api` (or whatever 01 named it): `summary`/`detail`/`paths` reflecting the new
routes. Mark the requirement about "reviewer can evaluate with zero setup" as `partial` if it isn't
already, with `evidence` pointing at the routes. Add an intent for "server validates once at boot
and stays thin; broken seed is surfaced not hidden" (`human-verified`, from this brief). Run
`npm run validate:data`.

## Report format

As in `_TEMPLATE.md`.
