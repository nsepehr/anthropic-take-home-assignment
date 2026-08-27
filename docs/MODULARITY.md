# Modularity rules

Modularity is the #1 code principle in this repo. Many agents work in parallel; the only way that
stays clean is if every piece has one job, a small public surface, and a clear place to live. When
in doubt: **make it a module, give it a test, keep its exports few.**

## Universal rules (client, server, shared)

1. **One module = one responsibility.** A file's name says what it does (`projectStore.ts`,
   `layoutWithElk.ts`, `useSelection.ts`). If you need "and" to describe it, split it.
2. **Small public surface.** Export only what others need. Helpers stay unexported. Every module's
   exports are its contract; changing a contract is a reportable event.
3. **Dependencies point inward.** `client` → `shared` ← `server`. Nothing imports "up" or across.
   Inside a package: `routes/`/`components/` (edges) → `services`/`hooks` (logic) → `lib`/`utils`
   (pure). Never the reverse.
4. **Pure core, effectful edges.** Logic is pure functions over the model (`@app/shared` types in,
   plain data out). File I/O, HTTP, DOM, timers live only in designated edge modules. This is what
   makes tests cheap.
5. **No god files.** Soft limit ~150 lines. `App.tsx`, `app.ts` are composition roots that wire
   modules — they contain no logic of their own.
6. **Colocate tests** as `<module>.test.ts(x)` next to the module. A module with logic and no test
   is not done.
7. **No cross-task file sharing.** If two tasks need the same file, one owns it and the other
   declares a dependency in its brief. Add new modules rather than growing someone else's.
8. **Types come from `@app/shared`.** Never redeclare model types locally; never define a second
   "view model" that duplicates the model — derive with a pure `to*` function instead.

## Server (`server/src/`)

```
index.ts            listen only (reads env, calls buildApp, starts server)
app.ts              composition root: buildApp() registers plugins + routes; no logic
config.ts           env parsing → typed config object (the only place process.env is read)
routes/<area>.ts    one Fastify plugin per URL area; parse/validate input, call a service, shape output
services/<name>.ts  business logic; pure where possible; no Fastify types inside
stores/<name>.ts    data access edges (fs, later db/network); returns model types
lib/                pure helpers with no domain knowledge
test/fixtures/      sample inputs for tests
```

- Routes never read files or hold state; services never know about HTTP.
- Validate at the boundary (route), trust the types inside.
- Every store exposes an interface so a service can be tested with an in-memory fake.

## Client (`client/src/`)

```
main.tsx                  mount only
App.tsx                   composition root: providers + layout; no logic
api/<area>.ts             fetch wrappers → typed model results (the only place `fetch` is called)
model/                    pure functions over @app/shared data: selectors, derivations, toFlowNodes…
state/                    app state (context/store) + hooks that expose it (useSelection, useProject)
features/<feature>/       one folder per user-facing feature: its components, hooks, tests, index.ts
  components/…            feature-private components
  index.ts                the feature's public surface (usually one component + one hook)
components/               truly shared, presentational, model-agnostic UI (Button, Panel, Badge)
layout/                   diagram layout adapters (elk) — pure: model in, positioned nodes out
styles/                   tokens/theme (visual design lands here from the Claude Design work)
```

- Components render; hooks decide; `model/` computes. A component with a `useEffect` doing data
  logic is a smell — move it to a hook or `model/`.
- Features import from `state/`, `model/`, `components/`, `api/` — never from each other. If two
  features need the same thing, it moves down to `model/` or `components/`.
- Diagram specifics (React Flow node types, ELK options) stay inside `features/diagram/` and
  `layout/`; the rest of the app only knows about the model and the selection.
- Styling: presentational components accept the design tokens; don't hardcode colors/spacing in
  feature code so the design pass can restyle without touching logic.

## Shared (`shared/src/`)

```
schema/<entity>.ts   one Zod schema + type per entity; index re-exports
validate.ts          validateProject + readable errors
gaps.ts              gap detection (pure)
related.ts           relatedTo and other graph queries (pure)
index.ts             public surface only
```

- Zero runtime dependencies other than `zod`. No fs, no fetch, no React.

## Checklist before you report

- [ ] Every new file has one job and a name that says it.
- [ ] No import goes "up" or across a feature boundary.
- [ ] `process.env`, `fetch`, `fs`, and DOM APIs appear only in their designated edge modules.
- [ ] Each module with logic has a colocated test pinning its intent.
- [ ] Composition roots (`App.tsx`, `app.ts`) still contain no logic.
