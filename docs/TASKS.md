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
3. **API** — server serves validated project + gaps + related-entities
4. **Diagram core** — React Flow + ELK rendering from the model (look-and-feel from human's Claude Design work)
5. **Hero interaction** — select any entity → connected entities highlight; detail panel; overview/deep-dive toggle
6. **Trust layer** — provenance badges, evidence links, gaps/"unexplained" view
7. **Ship** — Fly.io deploy, full seed data, README
8. **Stretch** — AI chat that can @-tag systems/requirements/intents
9. **Submission** — 5-min video, written rationale, transcript export (human)

## Tasks

| #   | Slug / Title             | Phase | Priority | Status      | Owner                  | Depends on | Notes                                                                             |
| --- | ------------------------ | ----- | -------- | ----------- | ---------------------- | ---------- | --------------------------------------------------------------------------------- |
| 0   | `repo-setup`             | 1     | P0       | done        | agent: repo-setup      | —          | Bootstrap monorepo + worktree/ports scripts + CLAUDE.md                           |
| 0   | `task-tracker`           | 1     | P0       | done        | agent: task-tracker    | —          | This file                                                                         |
| 1   | `01-schema-and-seed`     | 2     | P0       | in-progress | agent: schema-and-seed | —          | Zod model in shared/, validateProject, relatedTo, data/project.json; brief exists |
| 2   | `02-api`                 | 3     | P0       | todo        | —                      | 01         | GET /api/project (validated), /api/project/gaps, /api/project/related/:id         |
| 3   | `03-diagram-core`        | 4     | P0       | todo        | —                      | 01, 02     | React Flow + ELK renders systems/edges/nesting                                    |
| 4   | `04-selection-linking`   | 5     | P0       | todo        | —                      | 03         | Hero interaction: select entity → connected entities highlight                    |
| 11  | `11-video-and-rationale` | 9     | P0       | todo        | human                  | —          | Submission artifacts: 5-min video, rationale, transcript export                   |
| 5   | `05-detail-panels`       | 5     | P1       | todo        | —                      | 03         | Requirement list, intent panel, overview/deep-dive toggle                         |
| 6   | `06-trust-layer`         | 6     | P1       | todo        | —                      | 04         | Provenance badges, evidence links, gaps view                                      |
| 7   | `07-deploy-fly`          | 7     | P1       | todo        | —                      | 02, 03     | Dockerfile + fly.toml + deploy                                                    |
| 8   | `08-seed-complete`       | 7     | P1       | todo        | —                      | 01         | Seed describes the finished project, honest provenance                            |
| 9   | `09-readme`              | 7     | P1       | todo        | —                      | —          | How to run, architecture, links                                                   |
| 10  | `10-chat`                | 8     | P2       | todo        | —                      | 04         | Stretch: AI chat that @-tags systems/requirements/intents                         |

## Backlog (schema)

Cut from the phase-1 model on 2026-08-27 to keep it minimal. Each is re-addable as an optional
field or enum value without a breaking change.

- Feature entity (or a `feature` requirement kind) — to be discussed next
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
