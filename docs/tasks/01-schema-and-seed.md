# Task: 01-schema-and-seed

## Goal

Define the data model in `shared/` — the single source of truth every other task builds on — and
produce a validated seed file that describes **this project itself**. When done, `@app/shared`
exports Zod schemas + inferred types + a `validateProject()` function, and `data/project.json`
loads, validates, and honestly describes the tool as it stands today.

## Context

Product thesis: humans no longer read code line by line; they need to understand **systems, how
they connect, the requirements they serve, and the human intent behind them**. The model has three
first-class entity types — System, Requirement, Intent — plus Edges. Intent is deliberately its own
entity (not a field on System) because one decision typically explains several systems and edges.

Decisions already made by the human (do not relitigate):

- Every entity carries `summary` (plain language, one sentence) **and** `detail` (deep dive). The
  UI will toggle "overview / deep dive" globally; the schema bakes it in.
- Every entity carries `provenance` so the UI can show trust: whether a human verified the claim or
  an AI inferred it, when, and from what source.
- The seed data is **not a mock** — it is the real record of this project, captured from the
  development conversation. Be honest: mark what a human actually verified vs. what you inferred.
- Zod for schemas (runtime validation + `z.infer` types, one definition). This is the one allowed
  dependency for `shared/`.

## Scope

**In:**

- Zod schemas + exported TS types for: `Project`, `System`, `Requirement`, `Intent`, `Edge`,
  `Provenance`, and a `Gaps` report type.
- `validateProject(input: unknown)` → `{ ok: true, project, gaps } | { ok: false, errors }`.
- `data/project.json` seed for this project.
- Basic tests (see below).

**Out (do not do, even if tempting):**

- No server routes, no client code, no React Flow/ELK layout data (positions are computed later by
  the client; the model stores no coordinates).
- No AI/LLM calls. No file-system analysis of the repo. Seed is hand-written JSON.
- No versioning/migration machinery. No "chat" or "change request" entities.

## Data model (implement this; refine names only if clearly better, and say so)

Common to every entity:

```ts
id: string            // stable slug, e.g. "sys-shared-model", "req-self-contained-demo", "int-intent-first-class"
summary: string       // one plain-language sentence
detail: string        // the deep dive (markdown allowed)
provenance: {
  source: 'human-verified' | 'ai-inferred'
  capturedAt: string          // ISO 8601
  sessionRef?: string         // pointer to the conversation/session/commit it came from
}
```

`System` — `name`, `kind: 'ui' | 'service' | 'module' | 'store' | 'external' | 'workflow'`,
`parentId?` (nesting), `paths: string[]` (repo paths = evidence), `requirementIds: string[]`,
`intentIds: string[]`.

`Requirement` — `title`, `kind: 'functional' | 'non-functional' | 'constraint'`,
`status: 'planned' | 'partial' | 'implemented'`, `systemIds: string[]`, `intentIds: string[]`,
`evidence: string[]` (paths/commits/doc refs that prove status).

`Intent` — `statement` (the decision, one line), `rationale`, `alternativesRejected: string[]`,
`tradeoffs: string`, `appliesTo: { systemIds: string[]; requirementIds: string[]; edgeIds: string[] }`.

`Edge` — `id`, `from` (system id), `to` (system id), `kind: 'calls' | 'reads' | 'writes' | 'emits' |
'depends'`, `label?`, `intentId?`, plus `summary`/`detail`/`provenance` optional-or-short (your
call; keep edges lightweight — explain choice in report).

`Project` — `name`, `mission` (one-liner), `systems[]`, `requirements[]`, `intents[]`, `edges[]`.

`Gaps` — computed, not stored: `systemsWithoutIntent: string[]`, `requirementsWithoutSystem:
string[]`, `edgesWithoutIntent: string[]`, `intentsWithoutTarget: string[]`. This powers the trust
layer's "unexplained" signal; the tool should be honest about what it can't explain.

`validateProject` must check, beyond shape: every referenced id resolves to the right entity type;
no cycles in `parentId`; edge endpoints exist; ids unique across all entities. Errors should be
readable (path + message), not raw Zod dumps.

Also export a small set of pure helpers (`getSystem(project, id)`, `relatedTo(project, id)` →
`{ systemIds, requirementIds, intentIds, edgeIds }` of everything linked to an entity in either
direction). `relatedTo` is what the UI's "select one thing → highlight everything connected" hero
interaction will use; make it correct and tested.

## Seed content (`data/project.json`)

Describe the project **as it exists after the bootstrap commit** plus this task. Read `CLAUDE.md`,
`docs/AGENT_WORKFLOW.md`, `scripts/`, and `git log` for evidence. Cover at least:

- Systems: `shared-model` (this task), `server-api` (Fastify, `/api/health` only so far), `client-app`
  (Vite/React hello page; diagram not yet built — say so in `detail`), `agent-workflow` (kind
  `workflow`: worktree + port scripts + CLAUDE.md rules), `seed-data` (kind `store`). Nest where
  natural (e.g. `ports-allocator` inside `agent-workflow`).
- Requirements from the assignment: self-contained evaluation / demo mode; deployed prototype;
  single focused interaction; written + video rationale; AI transcripts submitted. Plus the
  product's own: "user can understand architecture, features, and intent from one view";
  "overview and deep-dive language for every entity"; "every claim shows provenance"; "parallel
  agents can't silently break each other" (served by tests + worktrees). Set `status` honestly.
- Intents (all `human-verified`, `sessionRef` = "claude-code session 2026-08-27, planning chat"):
  - Intent is a first-class entity, not a field on System (cross-cutting; front-and-center in UI).
  - Every entity has summary + detail (simple vs. deep language baked into the schema).
  - The project is its own demo; seed data is captured from the build process, not mocked.
  - React Flow + elkjs chosen over LikeC4/Cytoscape/Mermaid (control over rich React nodes;
    LikeC4 too opinionated for intent-first UI; Cytoscape canvas-only; Mermaid static).
  - Parallel agents each get an isolated worktree with allocated ports.
  - Trust: provenance on every claim; the tool reports gaps instead of hiding them.
  - Chat/AI features are deliberately last; the core question is understanding, not generation.
  - Backend/model first, UI look-and-feel designed separately (Claude Design).
- Edges: real dependencies (client → server calls; server → seed-data reads; server/client →
  shared-model depends; agent-workflow → everything, kind `depends`, or omit if noisy — your call).
- Anything you inferred rather than found stated: mark `ai-inferred`. Include at least two such
  entries so the badge visibly matters in the demo, and make at least one gap exist naturally
  (don't force it, but don't paper over one either).

Add a short `data/README.md`: what the file is, how it's validated, how future tasks append to it.

## Files you own

- `shared/src/**` (replace the placeholder; keep `HealthStatus` export so existing code compiles)
- `shared/package.json` (add `zod`)
- `data/project.json`, `data/README.md`
- may also touch: root `package.json` only if needed for a `validate:data` script (say so).

## Interfaces you depend on

- Nothing yet. Others will depend on you: `server` will serve `data/project.json` through
  `validateProject`; `client` will call `relatedTo`.

## Acceptance criteria

- [ ] `import { ProjectSchema, validateProject, relatedTo } from '@app/shared'` works in both
      server and client (typecheck).
- [ ] `validateProject(JSON.parse(readFileSync('data/project.json')))` returns `ok: true`.
- [ ] A `npm run validate:data` script (root) runs that check and prints the gaps report.
- [ ] Dangling reference, duplicate id, and parent cycle each produce a readable error.
- [ ] `relatedTo` returns the correct closure for a system, a requirement, and an intent.
- [ ] Seed contains ≥5 systems, ≥8 requirements, ≥7 intents, ≥4 edges, both provenance kinds.
- [ ] `npm run check` passes.

## Tests to write

- `shared/src/schema.test.ts`: "seed file validates"; "dangling systemId in a requirement → error
  naming the path"; "duplicate id across entity types → error"; "parentId cycle → error".
- `shared/src/gaps.test.ts`: "system with no intent appears in systemsWithoutIntent"; "fully linked
  project → all gap arrays empty".
- `shared/src/related.test.ts`: "relatedTo(intent) includes systems, requirements, and edges it
  applies to and nothing else"; "relatedTo(system) includes its parent/children, edges, requirements,
  intents".

## Report format

As in `_TEMPLATE.md`. Additionally list every seed entry you marked `ai-inferred` and why, and any
naming changes to the model above.
