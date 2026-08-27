# Modeling rules

How to capture a codebase into `data/project.json` so the diagram stays compact and legible. Written
for whoever does the capturing — a human or an LLM (the future Claude Code extension). The schema is
`@app/shared` (`ProjectSchema`); `computeAdvisories()` checks these rules and `npm run validate:data`
prints the result as **warnings** (the file still validates). Gaps are different: they are missing
links, and stay visible in the UI.

## Systems

- A **System is one module boundary** with its own `paths`: a package, a feature folder, a service,
  a script with one job. Not a single file (unless the file _is_ the module), not a folder of
  unrelated things, not a layer name.
- **3–6 categories**, each a lane on the diagram, each with **3–8 top-level systems**. Beyond that,
  **nest** with `parentId` — never add a seventh lane or a ninth box. Nested systems inherit their
  ancestor's category, so leave `category` off them.
- Category names are short nouns for _where code lives_ (`Model`, `Server`, `Client`, `Workflow`),
  not layers of abstraction or team names.
- **Split** a system when its `paths` serve two unrelated jobs, or when it has more than 6 edges
  (it is really two things). **Merge** systems when they always change together and no edge
  between them means anything to a reader.
- `kind` is what it is (`ui`, `service`, `module`, `store`, `external`, `workflow`), not where.

## Categories are stages

- Categories are the **stages of a left-to-right flow**: one column each, systems stacked
  vertically, and edges mostly crossing from one stage to the next. Order them by dependency flow
  (here: Workflow → Client → Server → Model).
- A category with many internal edges is not one stage. **Split it into two stages** along the
  direction its internal edges point (e.g. `Client UI` → `Client state`).
- Aim for **3–5 stages**; six is the hard limit.

## Edges

- An edge exists **only when evidenced**: an import, a call, a read, a write, or an event. Cite the
  evidence in `summary` (`` `dev.mjs:19` spawns `npm run dev -w server` ``). No "conceptually
  depends on".
- One short `label` per edge, three words or a symbol name (`GET /api/project`, `validateProject`).
- One edge per pair and direction. If many files import the same package, draw one representative
  edge and say so in `summary`.
- The **why** is not on the edge: point `intentId` at the Intent that explains it.

## Language

- `summary` ≤ 20 words, plain language, one sentence: what the reader sees at a glance.
- `detail` = **how it works**, for the deep dive. It is always longer than `summary`; if it is not,
  you wrote a second summary.
- **Requirement** wording: "A user can …" (feature / functional), "The system must …"
  (non-functional / constraint). `status` `implemented` or `partial` needs `evidence` — file paths,
  tests, URLs. `planned` needs none.
- **Intent** = a decision **and** its rationale. `statement` is the decision; `rationale` says
  _why_, including what was rejected and the trade-off, in at least 12 words. If the rationale only
  restates what the code does, it is a description — put that in a System's `detail` instead.

A **feature is not a fourth entity** — it is a `Requirement` whose `kind` is `feature`: something a
user can do with the product ("A user can open a system and walk its neighbours"). `functional` is
what the system must do internally to make features work and is not itself a user capability ("the
seed data stays current"); `non-functional` and `constraint` are unchanged — qualities the system
must hold ("every claim shows its provenance") and conditions imposed on it ("no external services").
When both readings fit, ask whether a user would name it when describing the product: if yes it is a
feature. Features carry their own pill in the panel and sort to the top of every requirement list.

## Lifecycle

**Nothing is ever deleted from the model.** Requirements and intents go stale as the system evolves;
deleting them loses the _why_, and rewriting them in place quietly makes the record lie about what
was once true. Instead, every entity and edge may carry an optional `lifecycle` block — **absent
means current**, so untouched entries need no annotation:

```json
"lifecycle": { "state": "superseded", "supersededBy": "int-per-item-deep-dive",
               "since": "2026-08-27T16:04:03+08:00", "reason": "Human review preferred per-item depth" }
```

- **Never change meaning in place.** A changed decision is a _new_ entry: append it, then mark the
  old one `superseded` with `supersededBy` pointing at the new id and a one-line `reason`. In-place
  edits are for **wording, `paths` and requirement `status`** only — the same entry, said better.
- **Withdraw an entry that is simply gone** (`state: "withdrawn"`, no `supersededBy`, and a one-line
  `reason` — required) rather than deleting it: a system whose code was removed, a requirement no
  longer wanted, an edge that no longer exists.
- `supersededBy` must name another entry of the **same type**, and the chain of replacements must
  end at a current entry: no loops, no dead ends in something no longer current. `validateProject()`
  enforces this; a broken chain is an error, not a warning.
- **Gaps and advisories count current entries only.** A superseded decision must not keep explaining
  live code, and a withdrawn box must not be reported as missing an intent.
- **The tool shows only what is true now.** Superseded and withdrawn entries appear nowhere in the
  main lists or on the canvas. History is per system, on demand: a system's detail panel offers
  **Show history (N)** after "Why it is built this way", listing the requirements and intents it
  used to have, greyed and struck through. There is deliberately no global toggle and no timeline
  view (design revision 5).
- `Intent.status` / `Intent.supersededBy` are **deprecated** in favour of `lifecycle`. Files still
  using them validate; `npm run validate:data` prints a "Deprecated" note per intent to migrate.

## Provenance

- `human-verified` only when a human said so: the decision is in your brief, or a human confirmed
  it in review. Your own reading of the code is `ai-inferred`, however confident.
- `capturedAt` is when the claim was made. `ai-inferred` entries older than 7 days are flagged
  `info` so a human reviews them.

## Editing the file

- **Append at the end** of each array; never reorder or reformat existing entries. Several tasks
  edit the file in parallel and this keeps git auto-merging.
- Fix a wrong entry in place (it is the same entry); supersede a changed decision with a new entry
  and a `lifecycle` block on the old one (it is a new decision). See "Lifecycle" above.
- Ids: `sys-`, `req-`, `int-`, `edge-` + slug, unique across all types.

## Advisories

| code                      | fires when                                           | severity |
| ------------------------- | ---------------------------------------------------- | -------- |
| `category-too-large`      | > 8 top-level systems in one category                | warn     |
| `too-many-categories`     | > 6 categories                                       | warn     |
| `category-internal-edges` | ≥ 3 internal edges and ≥ its cross-stage edges       | warn     |
| `system-too-connected`    | > 6 edges touch one system                           | warn     |
| `system-isolated`         | top-level system with 0 edges and no children        | warn     |
| `edge-unlabeled`          | edge without a `label`                               | warn     |
| `summary-too-long`        | `summary` > 20 words (entities and edges)            | warn     |
| `detail-missing-how`      | `detail` shorter than `summary`                      | warn     |
| `intent-is-description`   | `rationale` < 12 words                               | warn     |
| `requirement-no-evidence` | `implemented`/`partial` with empty `evidence`        | warn     |
| `requirement-orphaned`    | current requirement, every system serving it is gone | warn     |
| `ai-inferred-unreviewed`  | `ai-inferred` and `capturedAt` older than 7 days     | info     |

## Worked examples from the seed

**Good system** — `sys-ports-allocator`: one script, one job, real `paths`
(`scripts/ports.mjs`), two evidenced edges (`dev.mjs` and `new-worktree.sh` call it).

**Good edge** — `edge-server-reads-seed`: `sys-server-api` → `sys-seed-data`, kind `reads`, label
`PROJECT_FILE`, summary names the config key and the store that reads it, `intentId` explains why
the server loads the file once.

**Good intent** — `int-per-item-deep-dive`: statement is a decision (per-item button, no global
switch), rationale says what the global toggle did wrong and what was traded away.

**Bad: summary that was a paragraph** — `int-lane-order-from-edges` originally carried the whole
algorithm in `summary` (46 words) while `detail` held the measurements. Fixed by moving the
algorithm into `detail` and leaving a one-sentence summary.

**Bad: stale detail** — `int-panel-answers-three-questions.detail` still described the global
overview / deep-dive switch after task 10 removed it. A superseded decision must be reflected
wherever it is described, not only in the new Intent.

**Bad: isolated system** — before `edge-vercel-calls-server` was added, `sys-deploy-vercel` had no
edges although its `detail` said it imports `buildApp` from `server/src/app.ts`. The evidence
existed; the edge was missing — that is what `system-isolated` points at.
