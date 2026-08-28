# Codebase Map

**A post-IDE interface for understanding a codebase.** Open a repo you did not write and the IDE
gives you files and lines — the artifact of the old job. This gives you the new one: the **systems**
a project is made of, the **connections** between them, the **requirements** each one must satisfy,
and the **intent** behind why it was built that way — every claim tagged with provenance, so you can
see at a glance whether a human verified it or an AI inferred it. Requirements and intent are
first-class content on the canvas, not tooltips. Built for the Anthropic SWE take-home, theme
_Exploration & Understanding_ — read [`docs/RATIONALE.md`](docs/RATIONALE.md) for the reasoning
behind the design; this file is how to run and read the code.

## Live demo

**https://anthropic-take-home-assignment.vercel.app**

Try this, in order — it is the whole product in five moves:

1. **Hover** any card on the atlas. Its neighbours tint; you see what it touches before committing
   to a click.
2. **Click** it. The right panel answers three questions: what it is, what it must do
   (requirements, with evidence), why it is built this way (intents, with rationale). Every entry
   carries a provenance pill — `human-verified` or `ai-inferred`.
3. **Double-click** it (or press **Open ›** in the panel) to step into **focus**: an ego graph with
   inbound dependencies on the left and outbound on the right. Walk neighbour to neighbour; the
   header trail shows where you came from, `Esc` steps back.
4. In a system's panel, press **Show history (N)**. Superseded and withdrawn decisions appear,
   greyed, each pointing at what replaced it. Nothing is ever deleted from the model — including
   the two decisions that were reversed while building this.
5. Open **Ask Claude** in the header and type `@` — mentions resolve to real systems, requirements
   and intents, and the canvas rings the ones now in scope. Use the header **search** to jump to
   anything by name.

## The project is its own demo

`data/project.json` is the architecture model of **this repository**. It is not mock content. Rule 9
of [`CLAUDE.md`](CLAUDE.md) required every agent that built a piece to append the systems it built,
the requirements they serve and the intents behind its non-obvious choices, with honest provenance —
a brief's stated decision is `human-verified`, an agent's own inference is `ai-inferred`. The seed
grew alongside the code, so the diagram you explore is the record of how the tool was built.

The model also diagnosed itself: once the seed passed ~25 edges the flat view stopped being legible,
`computeAdvisories()` reported that the Client category had 13 internal edges against 5 external and
should be split into stages, and it was. See [`data/README.md`](data/README.md) for the append rules.

## Run locally

Node 22.x, npm workspaces. From the repo root:

```sh
npm ci
npm run dev              # allocates free ports into .env.local, starts server + client
npm run check            # typecheck + lint + format:check + tests — the definition of green
npm run validate:data    # validates data/project.json, prints gaps and modeling advisories
```

`npm run dev` prints the client URL. Ports come from `.env.local` (allocated by `npm run ports`),
never hardcoded, so several worktrees can run at once.

## Architecture

One direction of dependency, no cycles:

**`shared/` (the model)** defines the schema and the pure functions over it — validation, derived
`relatedTo` links, gaps, advisories, lifecycle. No runtime dependencies; it is the contract.
**`server/`** loads `data/project.json` once, validates it, and serves it as **one payload** on
`GET /api/project`. There are no per-entity routes: the client derives selection, highlighting and
history locally, so an entity endpoint would only duplicate client logic. **`client/`** renders it —
a deterministic column layout (one column per category, systems stacked, order stable by
construction) drawn with React Flow.

```
shared/src/      schema/ · validate · related · gaps · advisories · lifecycle · history
server/src/      app.ts (routes, testable via inject) · routes/ · stores/projectStore.ts
client/src/      features/{diagram,panel,shell,chat}  UI, one folder per feature, never cross-importing
                 model/    pure derivations (selection, scope, focusView, chatScope, …)
                 layout/   pure layout math (columns, columnOrder, egoLayout, fitViewport)
                 state/    React contexts · api/ fetch · components/ primitives · styles/ tokens
api/             [...path].ts — the same Fastify app as one Vercel serverless function
data/            project.json (this repo, modeled) + README.md
docs/            MODELING.md · ONBOARDING.md · MODULARITY.md · AGENT_WORKFLOW.md · TASKS.md · design/
.claude/skills/  capture-model/SKILL.md — the capture workflow as a runnable /capture-model
scripts/         ports.mjs · dev.mjs · new-worktree.sh · finish-worktree.sh · validate-data.mjs
```

Key documents: [`docs/MODELING.md`](docs/MODELING.md) (what a System, Requirement, Intent and edge
may be — the write-side contract) and [`docs/ONBOARDING.md`](docs/ONBOARDING.md) (**how a repo that
has never seen this tool gets its model**: the inputs worth reading, the passes to run in order, and
what a human must verify — the product's core engine, runnable as the
[`capture-model`](.claude/skills/capture-model/SKILL.md) Claude Code skill). Then
[`docs/MODULARITY.md`](docs/MODULARITY.md) (the folder conventions above, as enforced rules),
[`docs/AGENT_WORKFLOW.md`](docs/AGENT_WORKFLOW.md) (the lifecycle every task ran through),
[`docs/DEPLOY.md`](docs/DEPLOY.md), and [`docs/design/`](docs/design/) (the Claude Design canvases
the look-and-feel came from, revisions 3–6).

## Phases and tags

Four tags mark what existed at each point of the build:

| tag        | what existed                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `hour-2`   | The full vertical slice: schema + seed, one-payload API, designed canvas with lanes, detail panel, neighbour highlighting, live on Vercel |
| `hour-2.5` | Edge routing to the nearest side, lane order derived from edge flow, layout polish                                                        |
| `hour-4`   | Modeling rules + advisories, atlas → focus drill-down with a trail, lifecycle/history, deterministic column layout (ELK dropped)          |
| `hour-4.5` | Ask Claude scope drawer, search, `feature` requirement kind, this README                                                                  |

[`docs/TASKS.md`](docs/TASKS.md) is the tracker: every task, its status, and an append-only
changelog of what each one actually landed.

## How it was built

Every line of code was written by Claude agents running in parallel git worktrees, under rules in
[`CLAUDE.md`](CLAUDE.md) and per-task briefs in [`docs/tasks/`](docs/tasks/) that state the goal,
the files the agent owns, acceptance criteria and the seed entries to record. `scripts/new-worktree.sh`
creates the branch, worktree and ports; `scripts/finish-worktree.sh` rebases, re-runs `npm run check`
and prints the merge steps. The human's work was deciding what should exist and reviewing at that
altitude — including the reversals the model records. Transcripts are submitted separately.

The same division of labour is what the product itself proposes, generalised beyond this repo:
[`docs/ONBOARDING.md`](docs/ONBOARDING.md) is the workflow for capturing any codebase into a model —
an LLM proposes systems, edges, requirements and intents **only from evidence** it can cite, a human
verifies, and `provenance` records which of the two vouched for each claim. Run
`/capture-model` ([`.claude/skills/capture-model/SKILL.md`](.claude/skills/capture-model/SKILL.md))
inside a target repo to execute it.

## Status and known limits

Time-boxed prototype: lean over complete, and honest about it.

- **The write side ships as a workflow, not a service.** Capture is specified in
  [`docs/ONBOARDING.md`](docs/ONBOARDING.md) and runnable as the `capture-model` skill, but it has
  not been run against a third-party repo and measured — "how much did the human have to correct"
  is the product's real metric and there is no number for it yet.
- **Ask Claude is client-only.** The drawer proves context capture — `@`-mentions resolve to real
  entities and light up the canvas — and a modal explains what **Apply** would do. There is no LLM
  call behind it.
- **Search is substring**, over names and summaries. Semantic search over rationale text is the goal.
- **Locks were built and parked.** Pinning a card so re-layouts leave it alone works on an unmerged
  branch; the idle lock icon made every card read as disabled, so it was cut pending a redesign.
- **The gaps report** (systems without intent, edges without a why) is printed by
  `npm run validate:data` but is not yet surfaced in the UI.
- No dark theme; no category-level drill-down for very large repos; no edge bundling.

Full reasoning, the decisions that were reversed, and what would come next:
[**`docs/RATIONALE.md`**](docs/RATIONALE.md).
