# Task: 02-api

## Goal

The server serves the validated project model so the client (and a reviewer with `curl`) can get
the whole picture from one place. When done: `GET /api/project` returns the validated seed as one
payload; the client derives selection closures and gaps locally with `@app/shared`.

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
  - `GET /api/project` → the validated `Project` (same shape as `data/project.json`).
  - No per-entity routes (`/gaps`, `/related/:id`, `/entities/:id`) — see Revision below.
- Keep `/api/health`; extend it with `{ project: { loaded: boolean, name?: string } }`.
- Dev-only `POST /api/project/reload` re-reads the file (so editing the seed doesn't need a
  restart). Disabled when `NODE_ENV=production`.

**Out (do not do, even if tempting):**

- No mutations of the seed via API. No auth. No client changes. No AI. No caching headers/ETag.
- Do not change `shared/` unless something is genuinely missing for the routes; if so, additive
  only, and report the diff.

## Files you own

- `server/src/**` (keep `app.ts` as the composition root; put routes in `server/src/routes/`, the
  store in `server/src/stores/projectStore.ts`, per `docs/MODULARITY.md`).
- `.env.example` (add `PROJECT_FILE`).

## Interfaces you depend on

- `@app/shared` → `validateProject`, `Project` type. Do not change semantics.
- `data/project.json` → read-only.

## Acceptance criteria

- [ ] `curl localhost:$SERVER_PORT/api/project | jq .name` prints the project name.
- [ ] `/api/project` is byte-identical in shape to `data/project.json` (passes `validateProject`).
- [ ] Invalid seed file (point `PROJECT_FILE` at a broken fixture) → server boots, `/api/project`
      → 500 with errors, `/api/health` says `loaded: false`.
- [ ] `npm run check` passes.

## Tests to write (via `buildApp().inject`, fixtures under `server/test/fixtures/`)

- `routes/project.test.ts`: "GET /api/project returns validated seed"; "GET /api/health reports the
  loaded project name".
- `stores/projectStore.test.ts`: "invalid file → store reports errors, app still boots"; "reload picks up
  file changes".

## Seed data update (mandatory — see CLAUDE.md rule 9)

Update `sys-server-api` (or whatever 01 named it): `summary`/`detail`/`paths` reflecting the new
routes. Mark the requirement about "reviewer can evaluate with zero setup" as `partial` if it isn't
already, with `evidence` pointing at the routes. Add an intent for "server validates once at boot
and stays thin; broken seed is surfaced not hidden" (`human-verified`, from this brief). Run
`npm run validate:data`.

## Report format

As in `_TEMPLATE.md`.

## Revision (2026-08-27, after review)

Human review found the route surface over-designed: the client loads the whole model with one
`GET /api/project` and computes selection closures and gaps locally from `@app/shared`, so
`/related/:id`, `/entities/:id` and `/gaps` duplicated client logic for a hypothetical curl user.
Decision: **remove them**. Keep `GET /api/project`, `GET /api/health`, dev-only `POST /api/project/reload`.
Also move the store to `server/src/stores/projectStore.ts` to match `docs/MODULARITY.md` (the
original brief contradicted it). Record this as an intent in the seed: "API is one payload —
the whole model in one call; the client derives everything else" (human-verified, planning chat).
