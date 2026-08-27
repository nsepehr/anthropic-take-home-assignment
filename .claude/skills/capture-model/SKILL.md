---
name: capture-model
description: Generate or update data/project.json for this repo following docs/MODELING.md
---

# capture-model

Capture this repository into `data/project.json`: you propose from evidence, the human verifies,
`provenance` records which of you vouched for each claim. Works on a fresh repo — see **Bootstrap**.

**Two modes.** No `data/project.json` → _first capture_, run every pass. It exists → _update_: read
it, work only on what the current diff or the human's ask touched, and **append**.

## Bootstrap (target repo is not the codebase-map repo)

You need the schema and the validator. From the codebase-map repo, copy into the target:

```
shared/            → tools/codebase-map/shared/      # @app/shared, zod only, no other runtime deps
scripts/validate-data.mjs → tools/codebase-map/validate-data.mjs
docs/MODELING.md   → docs/MODELING.md                # the rules; quote them, don't restate them
```

Then in the target's `package.json`: `"validate:data": "npm run build -w tools/codebase-map/shared && node tools/codebase-map/validate-data.mjs"`,
and add `tools/codebase-map/shared` to `workspaces`. Fix the `data/project.json` path at the top of
`validate-data.mjs` if the file does not live at `<root>/data/project.json`. Verify with a
one-entity file before you capture anything. If you cannot make it run, stop and say so — an
unvalidated model is not a deliverable.

## Rules that bind every entry

Verbatim from `docs/MODELING.md`; do not soften them.

- **3–6 categories**, each with **3–8 top-level systems**. Beyond that, **nest** with `parentId` —
  never add a seventh lane or a ninth box. Aim for **3–5 stages**; six is the hard limit.
- Categories are the **stages of a left-to-right flow**, ordered by dependency; a lane with more
  internal than crossing edges is two stages — split it.
- A **System is one module boundary** with its own `paths`. Not a single file (unless the file _is_
  the module), not a folder of unrelated things, not a layer name.
- An edge exists **only when evidenced**: an import, a call, a read, a write, or an event. Cite the
  evidence in `summary`. No "conceptually depends on". One edge per pair and direction.
- `summary` ≤ 20 words, one plain sentence. `detail` = **how it works**, always longer than
  `summary`; if it is not, you wrote a second summary.
- Requirements: "A user can …" (functional / feature) or "The system must …" (non-functional /
  constraint). `implemented`/`partial` needs `evidence` — file paths, tests, URLs.
- Intent `rationale` says _why_, including what was rejected and the trade-off, **in at least 12
  words**. If it restates what the code does, it is a description — move it to a System `detail`.
- Ids: `sys-` / `req-` / `int-` / `edge-` + slug, unique across all types.
- **Append at the end of each array; never reorder or reformat existing entries.** Never delete: a
  changed decision is a new entry plus `lifecycle: {state:"superseded", supersededBy, since, reason}`
  on the old one; something simply gone is `{state:"withdrawn", since, reason}`.

## Shape

```jsonc
{
  "name": "...",
  "mission": "...",
  "categories": [
    { "id": "Model", "name": "Model", "summary": "...", "detail": "...", "provenance": {} },
  ],
  "systems": [
    {
      "id": "sys-x",
      "name": "X",
      "kind": "ui|service|module|store|external|workflow",
      "category": "Model",
      "parentId": "sys-parent?",
      "paths": ["src/x/"],
      "summary": "...",
      "detail": "...",
      "provenance": {},
    },
  ],
  "requirements": [
    {
      "id": "req-x",
      "title": "A user can …",
      "kind": "functional|non-functional|constraint",
      "status": "planned|partial|implemented",
      "systemIds": ["sys-x"],
      "evidence": ["src/x/x.test.ts"],
      "summary": "...",
      "detail": "...",
      "provenance": {},
    },
  ],
  "intents": [
    {
      "id": "int-x",
      "statement": "the decision",
      "rationale": "why, ≥12 words, incl. rejected option",
      "appliesTo": { "systemIds": [], "requirementIds": [], "edgeIds": [] },
      "summary": "...",
      "detail": "...",
      "provenance": {},
    },
  ],
  "edges": [
    {
      "id": "edge-x-y",
      "from": "sys-x",
      "to": "sys-y",
      "kind": "calls|reads|writes|emits|depends",
      "label": "≤3 words",
      "summary": "cites the file",
      "intentId": "int-x?",
    },
  ],
}
```

`provenance` = `{ "source": "ai-inferred" | "human-verified", "capturedAt": "<ISO-8601 with offset>",
"sessionRef": "<session or commit>" }`. `category` on top-level systems only — nested ones inherit.
Check `shared/src/schema/*.ts` for the authoritative shape; the schema wins over this block.

## The passes

Run in order. After each, **stop and show the human the batch** (see Verify).

**(a) Categories.** Read the tree, workspaces and manifests. Group by dependency direction — what
nothing imports goes left. Merge to 3–5 lanes, short nouns for _where code lives_.

**(b) Systems + edges.** Module boundaries with real `paths`, 3–8 per lane. Then grep imports/calls
across boundaries and write one edge per evidenced pair, each `summary` naming the file and symbol.
No file, no edge.

**(c) Requirements.** From README, docs headings, `describe()` names, issue titles. `status` from
tests and CI, `evidence` = the test path. Roadmap items are `planned`.

**(d) Intents.** From commit bodies, PR descriptions, ADRs, and comments saying "because" /
"instead of". `git log --format='%s%n%b' -n 300` is enough history; do not read more.

**(e) Provenance.** Everything you wrote is `ai-inferred`, however obvious. `human-verified` is not a
confidence grade — it means a named human said this thing, in the brief or in this conversation.

## Verify (do not skip)

After each pass, print the batch as a numbered list — **id · one-line summary · the evidence you
used** — and ask: _confirm / edit / drop, per number._

- Confirmed → rewrite that entry's provenance to `{"source":"human-verified","capturedAt":"<now>",
"sessionRef":"<where they said it>"}`.
- Edited → apply the edit, then flip it.
- Dropped → remove it before the first write (it was never in the file), or, if already written,
  `lifecycle: {state:"withdrawn", since, reason}`.
- Silence, "looks fine", or a blanket yes on a long list is **not** verification. Ask per number, or
  leave the batch `ai-inferred` and say so.

## Write and validate

Write only after the batch is settled: read the file, append to the end of each array, write it
back. Then run:

```
npm run validate:data
```

- **Errors** → your output is wrong (dangling id, broken supersede chain). Fix it. Never delete the
  entry that exposed the error.
- **Advisories** → the modeling rules. Should be near zero on a fresh capture; explain each one you
  leave.
- **Gaps** → systems with no intent, requirements no system serves. These are **not** failures; they
  are the honest "unexplained" signal the tool exists to show. Report them, do not paper over them.

## Honesty

1. **Never invent intent.** No commit, PR, ADR or comment saying _why_ → no Intent. A rationale you
   composed reads exactly like a real one, and that is what a reader trusts most.
2. Unknown is an answer: write it `ai-inferred` in wording that names what is missing, or leave the
   gap.
3. Evidence or nothing — every edge cites a file, every `implemented`/`partial` cites a test.
4. Say what you skipped: packages unread, history unsampled. Silence looks like coverage.

## Huge repos

Do (a) once over the whole tree, then (b)–(d) one package at a time, validating after each. Cap at
5 categories × 8 systems (~40 total) — hitting it means you are describing folders, not modules.
Skip `dist/`, `vendor/`, lockfiles, migrations, snapshots. Thirty systems that matter plus an honest
gap beats two hundred boxes.

## Report

Close with: entries added per type, what is still `ai-inferred`, the gaps and advisories left with a
reason each, and what you did not read. Then remind the human of the ongoing half — every future
change appends (this repo's `CLAUDE.md` rule 9), or the model rots into a snapshot.

Full workflow and reasoning: `docs/ONBOARDING.md`. Modeling rules: `docs/MODELING.md`.
