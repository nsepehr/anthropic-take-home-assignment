# Onboarding a new repo

How a repository that has never seen this tool gets its `data/project.json`. The viewer is the read
side; **this** is the core engine: an LLM proposes the model from evidence, a human verifies it, and
`provenance` records which of the two vouched for every claim.

The runnable version of this document is the Claude Code skill
[`.claude/skills/capture-model/SKILL.md`](../.claude/skills/capture-model/SKILL.md) — run
`/capture-model` in the target repo. This file is the workflow it implements and the reasoning
behind it. The shape of every entry is [`docs/MODELING.md`](./MODELING.md); read that first.

## Inputs

Ordered by how much they are worth per token read:

| input                                         | what it yields                           |
| --------------------------------------------- | ---------------------------------------- |
| repo tree + package manifests / workspaces    | categories, system boundaries, `paths`   |
| imports and calls across those boundaries     | edges (and only edges — see "evidenced") |
| README, `docs/`, ADRs                         | requirements, mission, some intents      |
| tests and CI config                           | requirement `status` and its `evidence`  |
| git log, PR bodies, issue titles              | intents (the _why_), requirement titles  |
| code comments that say "because"/"instead of" | intents that exist nowhere else          |
| **the human's conversation**                  | everything that is `human-verified`      |

Nothing else is an input. Not your knowledge of what projects like this usually do.

## The passes

Run them in order; each one narrows what the next has to guess.

**(a) Categories = stages.** Group folders by dependency direction: what nothing imports goes left,
what imports everything goes right. Workspaces and top-level source folders are the first draft;
merge until 3–5 remain (six is the hard limit), name each a short noun for _where code lives_
(`Model`, `Server`, `Client`, `Workflow`) — never a layer of abstraction or a team. If a candidate
lane has more internal edges than crossing ones it is two stages: split it along the direction its
internal edges point (that is how `Client` became `Client UI` → `Client core` here).

**(b) Systems = module boundaries.** One system is one module with one job and real `paths`: a
package, a feature folder, a service, a script. Not a single file unless the file _is_ the module;
not a folder of unrelated things. 3–8 top-level systems per lane; past that, `nest` with `parentId`
rather than adding a ninth box. Then draw edges — **only where evidenced**: an import, a call, a
read, a write, an event, cited in the edge `summary` (`` `dev.mjs:19` spawns `npm run dev -w server` ``).
If you cannot name the file and the symbol, there is no edge. Many files importing the same package
is one representative edge that says so.

**(c) Requirements.** README feature lists, docs headings, `describe()` names and issue titles are
the raw material. Word them "A user can …" (functional / feature) or "The system must …"
(non-functional / constraint). `status` comes from evidence, not from optimism: a passing test or a
shipped route is `implemented` and the test path _is_ the `evidence`; a route with no test, or a
feature behind a flag, is `partial`; anything that only appears in a roadmap is `planned` and needs
no evidence. A README bullet is not proof that code exists — grep for it.

**(d) Intents.** The decision **and** its rationale, from commit bodies, PR descriptions, ADRs, and
comments that contain "because", "instead of", "we tried", "note:". `statement` is the decision;
`rationale` says why, what was rejected, and what it cost — at least 12 words, or it is a
description and belongs in a System's `detail`.

**(e) Everything you produce is `ai-inferred`.** Every entry from passes (a)–(d), however obvious,
gets `provenance.source: "ai-inferred"` with `capturedAt` = now and a `sessionRef` naming the
session. There is no confident-enough threshold. `human-verified` is not a quality grade — it means
a specific human said this specific thing.

**(f) The verification loop.** Write the batch, then hand it back: the tool shows each entry with an
**AI-inferred** pill and the advisories the file trips. The human confirms, edits, or deletes each
one. A confirmed entry flips to `provenance.source: "human-verified"` with a `sessionRef` naming
where they said so ("planning chat 2026-08-27, wrap-up") — and the `capturedAt` becomes the moment
they confirmed. An edited entry: apply the edit, then flip it. Nothing flips in bulk without a human
looking at it; "looks fine" on a list of twenty is not verification of twenty.

**(g) `validate:data` gates the write.** Run it before you hand anything over. Errors are a bug in
your output — a dangling `systemIds`, a broken supersede chain — and must be fixed, never
worked around by deleting the entry that exposed them. Advisories are the modeling rules
(`category-too-large`, `edge-unlabeled`, `summary-too-long`, `intent-is-description`) and should be
near zero on a fresh capture; each one you leave, you explain. Gaps — a system with no intent, a
requirement no system serves — are **not** failures. They are the honest "unexplained" signal the UI
exists to show. Fix a gap by adding intent, or leave it and say so.

**(h) Ongoing capture.** A first pass is a snapshot, and a snapshot rots. The model stays true only
if every change appends to it: the system you touched, the requirement whose status moved, the
intent behind the non-obvious choice. Rule 9 in this repo's [`CLAUDE.md`](../CLAUDE.md) is the
prototype of that — every agent finishing a task appends to `data/project.json` with honest
provenance. In a target repo the same rule goes in its `CLAUDE.md` (or the PR template): _before you
open the PR, run `/capture-model` on your own diff._ Append at the end of each array and never
reorder existing entries, so parallel branches auto-merge.

## When the repo is huge

- **Per-package passes.** Do (a) once over the whole tree to fix the lanes, then run (b)–(d) one
  package (or one lane) at a time, validating after each. Never hold the whole repo in context.
- **Cap before you start**: 5 categories, 8 top-level systems each, ~40 systems total. Hitting the
  cap is information — it means you are describing folders, not modules. Merge things that always
  change together, then nest.
- **Sample the history.** `git log --format='%s%n%b' -n 300` and the last 50 merged PRs are enough
  for intents; reading ten years of commits is not a better model, only a slower one.
- **Skip the generated.** `dist/`, `vendor/`, lockfiles, migrations, snapshots. A system whose
  `paths` are all generated is not a system.
- **Leave the tail out.** A repo with 200 modules gets its 30 that matter and an honest gap, not 200
  boxes. Compactness is the product.

## Honesty rules

1. **Never invent intent.** If no commit, PR, ADR or comment says _why_, there is no Intent. A
   plausible rationale you composed is the single worst thing this tool can contain, because it
   reads exactly like a real one and it is what a reader trusts most.
2. **Unknown is a first-class answer.** Either write it `ai-inferred` in low-confidence wording that
   names what you are missing ("`summary`: reads the cache on startup; no test or comment says
   why the TTL is 90s") or leave the gap and let the UI report it.
3. **Evidence or nothing.** Every edge cites a file. Every `implemented`/`partial` requirement cites
   a test or a path. An entry you cannot source, you do not write.
4. **Never delete, never rewrite meaning.** A changed decision is a new entry plus `lifecycle:
{ state: "superseded", supersededBy, since, reason }` on the old one. In-place edits are for
   wording, `paths` and requirement `status`. See "Lifecycle" in [`docs/MODELING.md`](./MODELING.md).
5. **Say what you skipped.** The packages you did not read and the history you did not sample belong
   in your report, not in a silence that looks like coverage.
