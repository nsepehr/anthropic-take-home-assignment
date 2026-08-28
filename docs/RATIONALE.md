# Codebase Map — design rationale

_Submission for the Anthropic SWE take-home. Theme 1: Exploration & Understanding._
_Live: https://anthropic-take-home-assignment.vercel.app · Repo: github.com/nsepehr/anthropic-take-home-assignment_
_Time spent: **~4.5 hours** of build (tags `hour-2`, `hour-2.5`, `hour-4`, `hour-4.5` mark what existed at each point), plus this doc and the video._

## Why this theme, why this approach

Almost all of my code is now written by agents. What I do all day is decide what should exist,
why, and how the pieces fit — and then review at that altitude. The IDE was designed for the old
job (reading and typing lines). Nothing was designed for the new one.

So I built the interface I actually want when I open a repo I did not write: an **architecture
map where the human intent is first-class**. Every box on the canvas carries three things — what
it is, what it must do (requirements, with evidence), and why it was built this way (intents,
with rationale) — and every claim says whether a human verified it or an AI inferred it.

The read side is the prototype. The write side — an LLM proposing the model from a repo and its
history, a human verifying — is the product's core engine; it is documented as a workflow and a
runnable Claude Code skill (`docs/ONBOARDING.md`, `.claude/skills/capture-model`), not built as a
service.

## What is non-obvious about it

1. **Intent is a first-class entity**, not a comment field. One decision usually explains several
   boxes and arrows, so it gets its own record with `appliesTo`, its own provenance, and its own
   lifecycle (a decision can be superseded — and the tool shows you what it replaced).
2. **The project is its own demo.** `data/project.json` describes this tool. It was not mocked:
   every agent that built a piece appended the systems it built, the requirements it served, and
   the intents behind its choices, with honest provenance. The seed grew with the code, and the
   diagram you see is the record of how it was built — including two decisions I reversed.
3. **The tool diagnosed its own model.** Once the seed reached ~25 edges the flat view stopped
   being legible. Rather than hide edges, I wrote modeling rules (`docs/MODELING.md`) and
   `computeAdvisories`; the advisories said "Client has 13 internal vs 5 external connections —
   split it into stages," and a legibility regression test in the layout agreed. Splitting the
   Client category into _UI_ and _core_ fixed both. The rules are the write-side contract.
4. **Layout follows a domain rule, not a general engine.** I started with ELK. The design pass
   showed that architecture reads best as _stages left→right, systems stacked, arrows crossing
   stages_. A pure, deterministic column layout replaced ELK (−1.44 MB of JS), and it is stable by
   construction: new systems append; nothing moves unless the graph changes.

## Key decisions and tradeoffs

- **Minimal schema, extensible by optional fields.** I cut `alternativesRejected`, `tradeoffs`,
  bidirectional links and a Feature entity from phase 1. Links are stored once (Requirement →
  systems, Intent → appliesTo) and the reverse is derived, because parallel agents drift
  duplicated links. Everything cut is re-addable without a breaking change; `feature` came back
  as a requirement kind, `lifecycle` as an optional block on every entity.
- **One-payload API.** The server loads and validates `data/project.json` once and serves it
  whole; the client derives selection, highlighting and gaps locally. I had briefed per-entity
  routes and removed them on review — they duplicated client logic for a hypothetical curl user.
- **Navigation: atlas → system focus → trail.** Hover previews neighbours; click selects (the
  panel answers the three questions); double-click or "Open ›" steps into an ego graph (inbound
  left, outbound right) and you walk neighbour to neighbour with a breadcrumb trail. This scales
  by edges-per-system rather than total edges. A first-time coach-mark teaches click vs.
  double-click because double-click alone is undiscoverable.
- **Current by default, history on demand.** Superseded and withdrawn requirements/intents never
  appear in main lists or on the canvas; each system's panel has "Show history (N)" with the old
  entries greyed and "Replaced by …". Nothing is ever deleted from the model.
- **What I deliberately did not build.** Locks (pin a box so re-layouts leave it): built, then
  parked — the idle lock icon made every card look disabled. The chat write-side: the drawer
  proves context capture (@-mentions resolve to systems and light up the canvas) and a modal
  explains what "Apply" would do; a real LLM loop is out of scope for the time box.
- **Deployment.** Vercel, one serverless function wrapping the same Fastify app; static client on
  the CDN. The only deploy-time surprise was Vercel's deployment protection walling the alias.

## How I used AI (and where I overrode it)

Every line of code was written by Claude agents running in parallel worktrees under a set of rules
I wrote (`CLAUDE.md`, `docs/MODULARITY.md`, `docs/AGENT_WORKFLOW.md`) and task briefs
(`docs/tasks/*.md`) that state goals, owned files, acceptance criteria and the seed entries to
record. The transcript shows the judgment calls: choosing React Flow over LikeC4, cutting the
schema to the minimum, trimming the API, reversing the global deep-dive toggle after seeing it,
rejecting locks, pivoting the navigation model twice as the design matured, and deciding to split
a category when the tool's own advisories asked for it. Agents also pushed back well — one refused
to loosen another task's legibility test to make its own data fit, and escalated the decision.

## With more time

- The write side: `POST /api/chat` with the model as a cached system prompt, proposals as
  structured output, Apply writes `ai-inferred`, human review flips it to `human-verified`.
- Semantic search (embeddings over summary/detail/rationale) — today's search is substring.
- Category drill-down for very large repos; edge bundling; a redesigned lock.
- The capture skill run against a real third-party repo, with a measured "how much did the human
  have to correct" number — that is the product's real metric.

## How to run

`npm ci && npm run dev` (ports allocated per worktree), `npm run check` for the full gate,
`npm run validate:data` for the seed's gaps and advisories. See `README.md`.
