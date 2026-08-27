# data/

`project.json` is the architecture model of **this repository**, in the shape defined by
`@app/shared` (`ProjectSchema`). It is the tool's own demo content and is not a mock: every
entry describes the repo as it actually is, with `provenance` saying whether a human verified the
claim (`human-verified`) or an agent inferred it (`ai-inferred`), when, and from what session or
commit.

## Validate

```
npm run validate:data
```

Builds `shared/`, runs `validateProject()` over the file and prints either readable errors
(`path: message`) or the gaps report — systems without an intent, requirements without a system,
edges without an intent, intents that apply to nothing. Gaps are not errors; they are the honest
"unexplained" signal the UI shows. Fix them by adding intent, not by deleting the entry.

After the gaps it prints **advisories**: where the file breaks the modeling rules in
[`docs/MODELING.md`](../docs/MODELING.md) (too many systems in a lane, unlabeled edges, summaries
over 20 words, intents that describe instead of decide, …). Warnings only; the exit code stays 0.

## Appending (every task — CLAUDE.md rule 9)

Read [`docs/MODELING.md`](../docs/MODELING.md) first: what counts as a System, when to nest, when
an edge is evidenced, how to word requirements and intents.

1. Add the `System`(s) you built or changed; set `paths` to the real files. Give every
   **top-level** system a `category` (the lane it sits in on the diagram: `Model`, `Server`,
   `Client`, `Workflow`); nested systems inherit their ancestor's category, so leave it off them.
   `category` is classification; `parentId` is containment — they are independent.
2. Add or update the `Requirement`(s) they serve; set `status` honestly and cite `evidence`.
3. Add an `Intent` for each non-obvious choice: statement, rationale (fold rejected alternatives
   and trade-offs into the prose), `status: active` (or `superseded` + `supersededBy`), and
   `appliesTo`. Links are stored **once**: a system's
   requirements live on `Requirement.systemIds`, its intents on `Intent.appliesTo`; `relatedTo`
   derives the reverse. Decisions stated in your brief are `human-verified`; your own inferences
   are `ai-inferred`.
4. Add `Edge`s for real dependencies only. Keep them thin; hang the "why" on `intentId`.
5. Ids are slugs prefixed by type (`sys-`, `req-`, `int-`, `edge-`) and must be unique across all
   entity types. The model stores no coordinates; layout is computed by the client.
6. Run `npm run validate:data` and `npm run check`.
