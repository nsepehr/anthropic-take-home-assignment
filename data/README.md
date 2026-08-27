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

## Appending (every task — CLAUDE.md rule 9)

1. Add the `System`(s) you built or changed; set `paths` to the real files.
2. Add or update the `Requirement`(s) they serve; set `status` honestly and cite `evidence`.
3. Add an `Intent` for each non-obvious choice: statement, rationale, rejected alternatives,
   trade-offs, and `appliesTo`. Decisions stated in your brief are `human-verified`; your own
   inferences are `ai-inferred`.
4. Add `Edge`s for real dependencies only. Keep them thin; hang the "why" on `intentId`.
5. Ids are slugs prefixed by type (`sys-`, `req-`, `int-`, `edge-`) and must be unique across all
   entity types. The model stores no coordinates; layout is computed by the client.
6. Run `npm run validate:data` and `npm run check`.
