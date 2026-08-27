# Codebase Map

**A post-IDE interface for understanding a codebase.** A standalone web app that renders a software
project as an interactive architecture diagram (systems as boxes, edges as arrows) where **human
intent, features, and product requirements are first-class, front-and-center content** — not
tooltips. Time-boxed take-home prototype; theme: Exploration & Understanding. Lean over complete.

## Stack

Node 20+ · TypeScript everywhere · npm workspaces · **client/** Vite + React 18 + `@xyflow/react` 12

- `elkjs` · **server/** Fastify · **shared/** the data-model types · Vitest · ESLint (flat) + Prettier.
  Deploy target: Vercel (static client + one serverless function wrapping the Fastify app).

## Layout

```
shared/src/     data model = THE CONTRACT between server and client (import as @app/shared)
server/src/     Fastify app. app.ts builds routes (testable via app.inject); index.ts listens
client/src/     React app. main.tsx → App.tsx
scripts/        ports.mjs, dev.mjs, new-worktree.sh, finish-worktree.sh
docs/           AGENT_WORKFLOW.md (full lifecycle), TASKS.md (tracker), tasks/ (briefs; _TEMPLATE.md)
```

## Commands (run from repo/worktree root)

| command                                                              | what                                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `scripts/new-worktree.sh <slug>`                                     | branch `agent/<slug>` + worktree `../worktrees/<slug>` + install + ports |
| `npm run ports`                                                      | allocate free ports → `.env.local` (idempotent; `--force` to redo)       |
| `npm run dev`                                                        | both dev servers using `.env.local`; client proxies `/api` → server      |
| `npm test` / `npm run typecheck` / `npm run lint` / `npm run format` | what they say                                                            |
| `npm run check`                                                      | typecheck + lint + format:check + tests (the definition of green)        |
| `scripts/finish-worktree.sh`                                         | rebase on main, run `check`, print merge instructions                    |

Ports: `CLIENT_PORT` (default 5173) and `SERVER_PORT` (default 3001) come from `.env.local`.

## Non-negotiable rules

1. **Every task runs in its own worktree** created by `scripts/new-worktree.sh`. Never commit on
   `main` directly. Never work in another task's worktree.
2. **Allocate ports via the script before starting servers.** Never assume 5173/3001 — other agents
   are running their own servers. Read ports from `.env.local`, never hardcode.
3. **Scope = the task brief.** Don't expand it. If the brief is ambiguous, make the _smaller_ choice
   and note it in your report. Touch files outside "Files you own" only when the brief says so.
4. **`shared/` is the contract.** Changes must be minimal, additive where possible, and called out
   explicitly (with the diff) in your report. Conflicts in `shared/` resolve in favor of `main`
   unless your brief says otherwise.
5. **Code principles**
   - Maintainability: small, focused modules with one job; clear names; no clever indirection.
   - **Modularity is the #1 principle — read `docs/MODULARITY.md` and follow its folder
     conventions exactly.** Hard boundaries: `shared` (model, no runtime deps) ← `server` (API) and
     ← `client` (rendering). One job per module, small exports, pure core / effectful edges,
     composition roots contain no logic, features never import each other, no file over ~150 lines.
   - Security basics: no secrets in the repo (`.env*` is gitignored; `.env.example` documents keys);
     validate/parse inputs at the API boundary; no `dangerouslySetInnerHTML` (lint-enforced), no
     `eval`, no shelling out with user input; serve on `127.0.0.1` in dev.
   - Testability: pure functions for logic; side effects (fs, network, DOM) at the edges.
6. **Tests: lightweight but real.** Every new module gets a basic test that pins its _intent_ — what
   it must do — so parallel agents can't silently break each other. Test behavior, not
   implementation. Don't chase coverage. Vitest; server routes via `buildApp().inject`;
   components via `renderToString` unless you truly need a DOM.
7. **Definition of done**
   - `npm run check` passes (typecheck + lint + format + tests).
   - Run `/simplify` on your diff and apply what makes sense.
   - Commit with a clear message (`feat: …`, `fix: …`, `chore: …`); one logical change per commit.
   - Run `scripts/finish-worktree.sh` (rebases on main, re-runs checks, prints merge steps).
   - Report: what was built, what was skipped/deferred and why, how to verify (exact commands),
     any `shared/` changes, any decisions the human should know about.
8. **Dependencies:** prefer none. Adding one requires a one-line justification in the report.
9. **Dogfood the model.** This project is its own demo. When you finish a task, append to
   `data/project.json`: the System(s) you built or changed, the Requirement(s) they serve (update
   `status`), and the Intent(s) behind non-obvious choices — with honest `provenance` (your brief's
   stated decisions are `human-verified`; your own inferences are `ai-inferred`). Follow the
   modeling rules in `docs/MODELING.md` and run `npm run validate:data`. **Append new entries at the END of each array and never reorder or reformat
   existing entries** — several tasks edit this file in parallel and that keeps git auto-merging.

**Tracker:** `docs/TASKS.md`. Set your row to `in-progress` when you start and `review` when you
finish, and append a changelog line. The human marks `done` after merge.

See `docs/AGENT_WORKFLOW.md` for the full lifecycle and merge/conflict guidance.
