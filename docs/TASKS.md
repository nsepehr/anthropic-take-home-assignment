# Tasks

Single source of truth for what's in flight. Plain markdown, edited by hand and by agents — no tooling.

**Conventions**

- Status: `todo` → `in-progress` → `review` → `done`; `cut` = deliberately dropped.
- Priority: `P0` must ship · `P1` should ship · `P2` nice to have.
- One row per task. Rows ordered by priority, then sequence number.
- `Slug` matches the brief `docs/tasks/<slug>.md` and branch `agent/<slug>` when a brief exists.
- Agents: set your row to `in-progress` when you start and `review` when you finish, and append a
  changelog line each time. The human marks `done` after merge.

## Phases

1. **Foundation** — repo, agent workflow, task tracking
2. **Model** — schema, seed data, validation (the contract)
3. **API** — server serves the validated project as one payload
4. **Diagram core** — React Flow + ELK rendering from the model (look-and-feel from human's Claude Design work)
5. **Hero interaction** — select any entity → connected entities highlight; detail panel; overview/deep-dive toggle
6. **Trust layer** — provenance badges, evidence links, gaps/"unexplained" view
7. **Ship** — Vercel deploy, full seed data, README
8. **Phase 2** — modeling rules + advisories, drill-down by category
9. **Stretch** — AI chat that can @-tag systems/requirements/intents
10. **Submission** — 5-min video, written rationale, transcript export (human)

## Tasks

| #   | Slug / Title             | Phase | Priority | Status | Owner                    | Depends on | Notes                                                                                          |
| --- | ------------------------ | ----- | -------- | ------ | ------------------------ | ---------- | ---------------------------------------------------------------------------------------------- |
| 0   | `repo-setup`             | 1     | P0       | done   | agent: repo-setup        | —          | Bootstrap monorepo + worktree/ports scripts + CLAUDE.md                                        |
| 0   | `task-tracker`           | 1     | P0       | done   | agent: task-tracker      | —          | This file                                                                                      |
| 1   | `01-schema-and-seed`     | 2     | P0       | done   | agent: schema-and-seed   | —          | Zod model in shared/, validateProject, relatedTo, data/project.json; brief exists              |
| 2   | `02-api`                 | 3     | P0       | done   | agent: api               | 01         | GET /api/project (validated), /api/health, dev-only reload                                     |
| 2b  | `02b-api-trim`           | 3     | P0       | done   | agent: api-trim          | 02         | Trim API to single payload; move store to stores/; record intent                               |
| 3   | `03-client-foundation`   | 4     | P0       | done   | agent: client-foundation | 01, 02     | React Flow + ELK renders systems/edges/nesting                                                 |
| 3a  | `04-design-tokens`       | 4     | P0       | done   | agent: design-tokens     | 03         | Organic tokens/classes → client/src/styles; base components; brief exists                      |
| 3b  | `05-app-shell`           | 4     | P0       | done   | agent: app-shell         | 03         | Header + canvas frame + always-visible right panel with overview/detail slots                  |
| 3c  | `06-system-node`         | 4     | P0       | done   | agent: system-node       | 03, 04, 05 | Designed system card + edges on the canvas; replaces debug canvas                              |
| 3d  | `07-detail-panel`        | 4     | P0       | done   | agent: detail-panel      | 03, 04, 05 | Entity detail + project overview panel content                                                 |
| 3e  | `08-category-lanes`      | 4     | P0       | done   | agent: category-lanes    | 03, 04, 05 | System.category in schema; ELK partitions; lane overlay                                        |
| 3f  | `10-per-item-deep-dive`  | 4     | P0       | done   | agent: deep-dive         | 05, 06, 07 | Remove global toggle; per-selection Deep dive button; panel 360px; hide zero-count tags        |
| 3g  | `11-highlight-neighbors` | 4     | P0       | done   | agent: highlight         | 06, 07     | relatedTo includes edge-neighbor systems; connected cards tinted, not dimmed                   |
| 3h  | `12-seed-client-graph`   | 7     | P0       | done   | agent: seed-client       | 08         | Flatten client + workflow into real modules with evidenced edges                               |
| 3i  | `13-edge-routing`        | 4     | P1       | done   | agent: edges             | 06         | Edges attach to the nearest side; human inspects before merge                                  |
| 3j  | `14-layout-lanes`        | 4     | P0       | done   | agent: layout            | 08, 13     | Lane order from edges; top-aligned compact lanes; fit; human inspects before merge             |
| 4a  | `15-polish`              | 4     | P1       | done   | agent: polish            | 14         | Dead CSS/hooks, engines pin, click threshold                                                   |
| 5a  | `16-modeling-rules`      | 5     | P0       | done   | agent: modeling          | 01         | docs/MODELING.md + computeAdvisories in shared; applied to seed                                |
| 5b  | `17-drill-down`          | 5     | P0       | done   | agent: drilldown         | 14         | Atlas → system focus (ego graph) with header trail; categories in schema; inspect before merge |
| 5c  | `18-column-layout`       | 5     | P0       | done   | agent: columns (opus)    | 17         | Stage columns, stable vertical order, side arcs; drop ELK; inspect before merge                |
| 5d  | `19-locks`               | 5     | P1       | cut    | agent: locks (opus)      | 17         | Lock a box / a layer; persisted; header counter; feeds 18                                      |
| 5e  | `20-lifecycle`           | 5     | P0       | done   | agent: lifecycle         | 16         | lifecycle {superseded,withdrawn} on every entity; current-only views; per-system history panel |
| 5f  | `21-chat-scope-ui`       | 5     | P1       | done   | agent: chat (opus)       | 17         | Ask Claude drawer: @-mentions, scope chips, canvas attention, scripted reply; client-only      |
| 5g  | `22-search`              | 5     | P1       | done   | agent: search (opus)     | 17         | Client-side substring search; semantic is the goal                                             |
| 5h  | `24-feature-kind`        | 5     | P1       | done   | agent: feature (opus)    | 16         | Requirement.kind gains feature; seed retag; pill                                               |
| 5i  | `25-model-generator`     | 5     | P0       | done   | agent: generator (opus)  | 16         | ONBOARDING.md + capture-model Claude Code skill                                                |
| 5j  | `23-chat-apply-demo`     | 5     | P2       | done   | agent                    | 21         | Modal explaining what Apply would do                                                           |
| 4   | `04-selection-linking`   | 5     | P0       | done   | —                        | 03         | Delivered by 11-highlight-neighbors + 17                                                       |
| 11  | `11-video-and-rationale` | 9     | P0       | todo   | human                    | —          | Submission artifacts: 5-min video, rationale, transcript export                                |
| 5   | `05-detail-panels`       | 5     | P1       | done   | —                        | 03         | Delivered by 07 + 10-per-item-deep-dive                                                        |
| 6   | `06-trust-layer`         | 6     | P1       | done   | —                        | 04         | Provenance pills (15), advisories (16), history (20); gaps view not surfaced in UI             |
| 7   | `09-deploy-vercel`       | 7     | P1       | done   | agent: deploy-vercel     | 02, 03     | Live: https://anthropic-take-home-assignment.vercel.app (vercel.json, api/, DEPLOY.md)         |
| 8   | `08-seed-complete`       | 7     | P1       | todo   | —                        | 01         | Seed describes the finished project, honest provenance                                         |
| 9   | `09-readme`              | 7     | P1       | done   | agent: readme            | —          | How to run, architecture, links                                                                |
| 10  | `10-chat`                | 8     | P2       | done   | —                        | 04         | Client-only scope UI delivered by 21; write-side in backlog                                    |

## Backlog (client)

- dark theme tokens — a `[data-theme="dark"]` override block in `client/src/styles/tokens.css`

## Backlog (product — next phase)

- **Progressive disclosure / drill-down** — the core scaling problem surfaced on 2026-08-27 when the seed
  grew to ~25 edges: the overview should show categories as collapsed nodes with the edges between
  them aggregated; clicking a category drills into its modules; a breadcrumb backs out. Phase 1 stays
  flat and demo-clean instead of hiding edges ad hoc.
- **Locks — parked 2026-08-27.** Built on branch `agent/19-locks` (not merged): the idle lock icon on every card read as "this component is inactive", which is worse than no lock. Needs a rethink in design (e.g. lock only in the panel / on hover / on a context menu) before any of it lands.
- **Layout stability + locks** (2026-08-27): (a) column layout must be stable by default — barycenter
  order tie-broken by seed order, new systems append at the bottom of their column, categories only
  reorder when edge flow actually flips (goes into 18-column-layout); (b) explicit lock: additive
  `System.pinned?: { category, rank }` honoured first by the layout and never reassigned by the
  write side; lock icon on the card toggles it (human-verified provenance).
- **Chat write-side** (design rev 6 mock): rule-based/LLM drafting of changes → proposal card → Apply writes to the seed as ai-inferred → "Chat edit · review" pill until a human verifies. Server-side `POST /api/chat` with the project JSON as a cached system prompt.
- Edge bundling / aggregated cross-lane edges in the overview.
- Search / filter by requirement or intent.

## Backlog (schema)

Cut from the phase-1 model on 2026-08-27 to keep it minimal. Each is re-addable as an optional
field or enum value without a breaking change.

- ~~Feature entity~~ — replaced by `Requirement.kind: 'feature'` (task 24); grouping requirements by feature (a feature and the requirements under it, as one view) is still open
- `alternativesRejected` / `tradeoffs` on Intent (currently folded into `rationale` prose)
- Explicit Requirement → Intent links (currently only Intent.appliesTo.requirementIds)
- Edge provenance
- Computed/derived fields exposed in the model beyond `relatedTo` / `gaps`

## Changelog

Append-only. Format: `YYYY-MM-DD — <slug> → <status> (<who>)`.

- 2026-08-27 — repo-setup → done (agent: repo-setup)
- 2026-08-27 — 01-schema-and-seed → in-progress (agent: schema-and-seed)
- 2026-08-27 — task-tracker → in-progress (agent: task-tracker)
- 2026-08-27 — task-tracker → done (human)
- 2026-08-27 — 01-schema-and-seed → done (human)
- 2026-08-27 — 02-api → in-progress (agent: api)
- 2026-08-27 — 03-client-foundation → in-progress (agent: client-foundation)
- 2026-08-27 — 02-api → review (agent: api)
- 2026-08-27 — 02-api → done (human)
- 2026-08-27 — 03-client-foundation → review (agent: client-foundation)
- 2026-08-27 — 03-client-foundation → done (human)
- 2026-08-27 — 02b-api-trim → review (agent: api-trim)
- 2026-08-27 — 02b-api-trim → done (human)
- 2026-08-27 — 04-design-tokens → in-progress (agent: design-tokens)
- 2026-08-27 — 05-app-shell → in-progress (agent: app-shell)
- 2026-08-27 — 06-system-node → in-progress (agent: system-node)
- 2026-08-27 — 07-detail-panel → in-progress (agent: detail-panel)
- 2026-08-27 — 08-category-lanes → in-progress (agent: category-lanes)
- 2026-08-27 — 04-design-tokens → review (agent: design-tokens)
- 2026-08-27 — 04-design-tokens → done (human)
- 2026-08-27 — 09-deploy-vercel → in-progress (agent: deploy-vercel); Fly.io dropped for Vercel (human)
- 2026-08-27 — 08-category-lanes → review (agent: category-lanes)
- 2026-08-27 — 08-category-lanes → done (human); overlay wiring into DiagramCanvas deferred to 06
- 2026-08-27 — 05-app-shell → review (agent: app-shell)
- 2026-08-27 — 05-app-shell → done (human)
- 2026-08-27 — 07-detail-panel → review (agent: detail-panel)
- 2026-08-27 — 07-detail-panel → done (human)
- 2026-08-27 — 06-system-node → review (agent: system-node)
- 2026-08-27 — 06-system-node → done (human); phase-1 UI complete
- 2026-08-27 — 10-per-item-deep-dive → in-progress (agent: deep-dive); design revision 2
- 2026-08-27 — 11-highlight-neighbors → in-progress (agent: highlight)
- 2026-08-27 — 09-deploy-vercel → review (agent: deploy-vercel)
- 2026-08-27 — 12-seed-client-graph → in-progress (agent: seed-client)
- 2026-08-27 — 11-highlight-neighbors → review (agent: highlight); relatedTo returns one-hop closure, connectionsFor edge walk removed
- 2026-08-27 — 11-highlight-neighbors → done (human)
- 2026-08-27 — 13-edge-routing → in-progress (agent: edges)
- 2026-08-27 — 10-per-item-deep-dive → review (agent: deep-dive); global toggle removed, per-item Deep dive in detail card
- 2026-08-27 — 10-per-item-deep-dive → done (human)
- 2026-08-27 — 12-seed-client-graph → review (agent: seed-client); tests re-pinned sys-client-app → sys-client-api
- 2026-08-27 — 12-seed-client-graph → review (agent: seed-client); scope extended to the Workflow lane (sys-agent-rules, 7 edges, dev-runner gap closed)
- 2026-08-27 — 12-seed-client-graph → done (human); client + workflow lanes are connected graphs
- 2026-08-27 — 13-edge-routing → review (agent: edges): four hidden handles per card + pure `chooseHandles`; worktree left running for inspection
- 2026-08-27 — 13-edge-routing → done (human, visually approved)
- 2026-08-27 — 14-layout-lanes → in-progress (agent: layout)
- 2026-08-27 — 09-deploy-vercel → done (human deployed); production https://anthropic-take-home-assignment.vercel.app; recorded by agent: deployer (15-record-deploy)
- 2026-08-27 — 14-layout-lanes → review (agent: layout): lane order from edges, top-aligned uniform band, ELK NETWORK_SIMPLEX + 40/20, fit padding 0.08; awaiting human inspection
- 2026-08-27 — 14-layout-lanes → done (human, visually approved)
- 2026-08-27 — 15-polish, 16-modeling-rules, 17-drill-down → in-progress (phase 2 kickoff)
- 2026-08-27 — 15-polish → review: removed dead `.seg*` CSS, engines.node `22.x` + `.nvmrc` 22, `nodeClickDistance`/`paneClickDistance` on the canvas, docs/design README updated; `useLanes.ts` kept (still used by DiagramCanvas); EntityList collapses after 5 items ("Show N more" / "Show less", `collapseAfter` + `defaultExpanded` props)
- 2026-08-27 — 15-polish → done (human): cleanup, show-more lists, rev-3 pills
- 2026-08-27 — 16-modeling-rules → review (agent: modeling): docs/MODELING.md, computeAdvisories (10 rules) printed by validate:data, seed trimmed to one honest advisory (sys-deploy-vercel isolated)
- 2026-08-27 — 16-modeling-rules → done (human); seed advisories: Client should split into stages
- 2026-08-27 — design revision 4 recorded; briefs 18-column-layout and 19-locks queued behind 17
- 2026-08-27 — 20-lifecycle → in-progress (agent: lifecycle, Opus)
- 2026-08-27 — 17-drill-down → review (agent: drilldown): atlas (hover previews neighbours, click selects, double-click / Open › enters focus) → system focus (pure `egoLayout` ego graph, labelled accent edges, 380px panel with Close/Clear/Back) → walk neighbours; header trail `Architecture / hop / current`, Esc = Back; first-time coach-mark; rev-4 tag/legend pills; `Project.categories` schema + validation + seed kept; `int-drill-down-by-category` superseded by `int-focus-ego-graph`; worktree left running for inspection
- 2026-08-27 — 17-drill-down → done (human, visually approved): atlas → focus view, trail, helper, rev-4 tags
- 2026-08-27 — 18-column-layout, 19-locks → in-progress (Opus agents)
- 2026-08-27 — 21-chat-scope-ui → in-progress (agent: chat, Opus); design revision 6 recorded
- 2026-08-27 — 20-lifecycle → review (agent: lifecycle): optional `lifecycle {state: superseded | withdrawn, supersededBy, since, reason}` on every entity and edge (absent = current); `currentOnly`/`historyOf`/`isCurrent` plus `historyFor(project, systemId)` in shared; gaps + advisories run on current entries only, new `requirement-orphaned` advisory; `Intent.status` deprecated but still accepted (mapped at validation time, `validate:data` prints a Deprecated note). Design revision 5: no global "Show retired" toggle and nothing non-current in the main lists or on the canvas — instead `HistorySection` in a system's panel ("Show history (N)" after "Why it is built this way") lists its superseded and withdrawn requirements and intents, greyed, struck through and pilled. Seed: intents migrated off `status`, `int-global-view-mode` superseded, plus the two decisions this revision replaced (`int-global-retired-toggle` superseded by `int-history-per-system`, `int-retired-inline-greyed` withdrawn) and `req-current-by-default`.
- 2026-08-27 — 20-lifecycle → done (human): superseded/withdrawn lifecycle, current-only views, per-system history
- 2026-08-27 — 19-locks → cut (human): idle lock icon makes cards look inactive; branch kept unmerged for a redesign
- 2026-08-27 — 18-column-layout → review (agent: columns): atlas laid out by one rule — one column per category in `laneOrder` flow order, systems stacked inside, ordered by neighbour barycenter with seed order as the tie-break so a new system appends instead of shuffling; intra-column edges drawn as quiet side arcs (`ArcEdge`), cross-column edges keep the bezier + nearest-side handles; `lockedIds` + `previous` accepted so task 19 can pin a row; viewport fitted from the layout's own bounds (React Flow's `fitView` never fires for pre-sized nodes); atlas cards pinned to 124px with a 2-line summary, legible at 1440×900 (fit scale 0.65 ≥ 0.6); `elkjs` removed — the 1.44 MB `elk.bundled` chunk is gone; `int-columns-are-stages` appended and the stale ELK text in sys-client-layout / sys-client-diagram refreshed; worktree left running for inspection
- 2026-08-27 — 18-column-layout → done (human, visually approved): stage columns, ELK removed
- 2026-08-27 — tracker reconciled after hour-4: stale phase-1 rows marked done/superseded
- 2026-08-27 — 21-chat-scope-ui → review (agent: chat, Opus): Ask Claude drawer (header button, thread, composer), `@` menu over systems/requirements/intents, scope chips (Backspace unchips), round `@` buttons on DetailCard/RequirementCard/IntentCard, canvas attention (sage ring on the resolved systems, everything else dimmed), scripted reply naming resolved systems + connections + requirement/intent counts; pure `model/chatScope.ts` / `chatReply.ts` / `chatThread.ts`; no network, no writes to the model; worktree left running on :5177 for inspection
- 2026-08-27 — wrap-up sprint: 22-search, 24-feature-kind, 25-model-generator launched (Opus); locks dropped for good
- 2026-08-27 — 21-chat-scope-ui → done (human, visually approved); Client split into UI/core stages
- 2026-08-27 — 25-model-generator: docs/ONBOARDING.md + `.claude/skills/capture-model/SKILL.md` (the capture workflow: LLM proposes, human verifies); seed gains sys-capture-workflow + int-capture-is-the-product
- 2026-08-27 — 25-model-generator → done (human): ONBOARDING.md + capture-model skill
- 2026-08-27 — 09-readme → review (agent: readme): root README — thesis, live demo + 5-step walkthrough, self-demo seed, run locally, architecture + folder map, phase tags, how it was built, known limits; links docs/RATIONALE.md
- 2026-08-27 — 09-readme → done (human)
- 2026-08-27 — 22-search → review: header search box, pure `searchProject`, match ring + dim, filtered panel lists
- 2026-08-27 — 22-search → done (human)
- 2026-08-27 — 24-feature-kind → review (agent: feature): `RequirementKind` gains `feature` (additive, 4th member); five seed requirements retagged as user capabilities (`req-single-focused-interaction`, `req-one-view-understanding`, `req-overview-deep-dive`, `req-category-lanes`, `req-system-focus`); accent `.tag-kind-feature` pill (`--pill-kind-feature-bg/fg`) and `featuresFirst()` in `client/src/model/entities.ts` sorting features to the top of ProjectOverview and EntityDetail; `int-feature-is-a-requirement-kind` appended; MODELING.md paragraph on feature vs functional; schema backlog line replaced
- 2026-08-27 — 24-feature-kind → done (human); duplicate tracker rows removed
- 2026-08-27 — 23-chat-apply-demo → review (agent): the write side is shown, not built — a ghost "See what Apply would do ›" under any assistant reply whose turn had a mention opens a five-step walkthrough (draft → proposal card → write to `data/project.json` tagged AI-inferred → dashed `Chat edit · review` pill until a human verifies → `validate:data` + advisories gate), footed with "Not built in this prototype — the read side is"; new shared `components/Modal.tsx` on `.dialog-backdrop`/`.dialog` (added to `base.css`), Esc and backdrop close, open state local to `features/chat/ApplyDemo.tsx` so `useChat` is untouched; seed intent `int-apply-demo-not-built` Scope addition (chat → capture loop): `int-apply-demo-not-built` now applies to `sys-capture-workflow` too and says why the hop is _not_ drawn — `docs/MODELING.md` admits only evidenced edges, and nothing writes through it yet; an `edge-chat-proposes-capture` was tried and dropped because a single back-edge (Client UI → Workflow) flips the atlas column order to Client UI-first via the lane-flow tie-break.
- 2026-08-27 — 23-chat-apply-demo → done (human); hour-4.5 tagged
