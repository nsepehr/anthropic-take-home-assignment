# Task: 09-deploy-vercel

## Goal

`git push` deploys the whole prototype to Vercel: the Vite client as static assets and the existing
Fastify app as ONE serverless function under `/api/*`. No second server implementation; dev
workflow unchanged. A reviewer opens one URL and it works with zero setup.

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `server/src/app.ts` (`buildApp()` composition root),
`server/src/config.ts`, `server/src/stores/projectStore.ts`, `client/vite.config.ts`, root
`package.json` (workspaces + `build` script that builds `shared` first). Human decisions: Vercel
(not Fly). Vercel CLI 59 is installed globally; the human is logging in / linking separately — do
NOT run `vercel login`, `vercel link`, or `vercel deploy`. You may run `vercel build` only if
`.vercel/project.json` exists in the repo root at the time (it will after the human links); if it
doesn't, skip and say so.

## Scope

**In:**

- `api/[...path].ts` (repo root, Vercel's convention) — imports `buildApp` from `server/src/app.ts`
  (source, not dist), builds once per lambda instance (module-level singleton), `await app.ready()`,
  then `app.server.emit('request', req, res)`. Set `PROJECT_FILE` so the store reads the bundled
  `data/project.json` (resolve relative to the function file with `import.meta.url` / `__dirname`
  fallback; do not rely on cwd). `NODE_ENV=production` disables the reload route automatically via
  config. Keep it under 40 lines.
- `vercel.json`: `buildCommand: "npm run build -w shared && npm run build -w client"` (or the root
  script if it only builds those), `outputDirectory: "client/dist"`, `installCommand: "npm ci"`,
  `functions: { "api/[...path].ts": { includeFiles: "data/project.json", runtime/maxDuration as
needed } }`, `rewrites: [{ source: "/api/(.*)", destination: "/api/$1" }]` only if required
  (test whether the file-system route already handles it), and SPA fallback
  `{ source: "/((?!api/).*)", destination: "/index.html" }`.
- Make sure the function's TypeScript compiles under Vercel's Node builder: `@app/shared` must
  resolve. Prefer a `tsconfig.json` `paths` entry at the root (Vercel's builder honors it) over a
  build step; if it doesn't, fall back to importing `../shared/src/index.ts` relatively and note it.
- A local smoke test that does NOT need Vercel: `api/handler.test.ts` (Vitest, Node) that imports
  the handler and calls it with a minimal `http.IncomingMessage`/`ServerResponse` pair (or use
  `node:http` `createServer(handler)` + `fetch`) for `/api/project` and `/api/health`, asserting
  200 + project name. Put the test where the root vitest workspace picks it up (add an `api`
  workspace entry if needed).
- `.vercelignore` if needed (exclude `docs/`, `scripts/`, worktrees, tests) — keep minimal.
- `docs/DEPLOY.md`: 20 lines — first deploy (`vercel deploy --prod`), continuous deploy via GitHub
  integration, env vars (none required), how to verify (`curl <url>/api/health`), rollback.
- `.gitignore`: `.vercel/`.

**Out:** no custom domain, no analytics, no edge runtime, no changes to server routes or client
code. Don't rewrite the dev proxy.

## Files you own

- `api/**`, `vercel.json`, `.vercelignore`, `docs/DEPLOY.md`, `.gitignore` (one line), root
  `tsconfig.json` (paths only, if needed), root `package.json` (a `vercel-build` or `build:vercel`
  script only if needed), root `vitest.workspace.ts` (add the api workspace only).

## Interfaces you depend on

- `buildApp({ config })` from `server/src/app.ts`; `loadConfig()` reading `PROJECT_FILE`.

## Acceptance criteria

- [ ] `npm run check` passes, including the new handler smoke test.
- [ ] `npm run build` still works locally.
- [ ] If linked: `vercel build` succeeds and `.vercel/output` contains `static/index.html` and
      `functions/api/[...path].func`. Report the exact output.
- [ ] `docs/DEPLOY.md` is enough for the human to deploy with two commands.

## Tests to write

- `api/handler.test.ts`: "GET /api/project via the Vercel handler → 200 and the project name";
  "GET /api/health → loaded:true".

## Seed data update (mandatory — see CLAUDE.md rule 9)

Add `sys-deploy-vercel` (kind `workflow`, paths `api/`, `vercel.json`, `docs/DEPLOY.md`). Intent
`int-one-function-same-app` — "Deploy wraps the same Fastify app in one serverless function instead
of maintaining a second server; static client on the CDN" (human-verified, sessionRef "planning
chat 2026-08-27, deployment discussion"), appliesTo sys-deploy-vercel, sys-server-api,
req-deployed-prototype (or whatever 01 named the 'deployed prototype' requirement — set its status
to `partial` until the human confirms the live URL). Append at END of arrays.

## Report format

As in `_TEMPLATE.md`, plus: the exact commands the human should run next, in order.
