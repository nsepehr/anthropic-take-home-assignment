# Task: 21-chat-scope-ui

## Goal

The "Ask Claude" drawer from design revision 6 — **client UI only**. A user can open the drawer,
tag systems / requirements / intents with `@` (from the composer or from "@" buttons on cards),
see the scope as chips, see the mentioned systems (and what they connect to) light up on the
canvas, and get a scripted reply that shows the tool resolved the request to concrete parts of the
system. **No LLM call, no server, no edits to the model** — the point is to demonstrate context
capture: "the request is about _these_ parts, connected to _those_."

## Context

Read `CLAUDE.md`, `docs/MODULARITY.md`, `docs/design/landing-v6.dc.html` (exact visuals + copy),
`client/src/features/**`, `client/src/state/**`, `client/src/model/entities.ts`, `shared/src/related.ts`.
Human decisions (2026-08-27): client feature only; the mock's draft/apply flow is backlog; chips
and attention use the sage (`accent-2`) ramp so "in chat scope" reads differently from selection
(accent) and locks (accent-2-600 border — task 19, parallel; avoid identical treatment: scope ring
is 3px accent-2-500 on the card box-shadow, lock is the 1.5px border).

## Scope

**In:**

- `client/src/model/chatScope.ts` (pure, tested): `mentionables(project) → { id, kind:
'system'|'requirement'|'intent', label, dotVar }[]` (current entities only if lifecycle helpers
  exist on main by then — use `currentOnly` if exported, else all); `systemsOf(project, mention)`
  (System → itself; Requirement → `systemIds`; Intent → `appliesTo.systemIds`); `attentionSet(project,
mentions)` → system ids to ring; `filterMenu(project, query, exclude)` (substring, ≤ 7);
  `scriptedReply(project, mentions, text)` → string per the design ("Scoped to A, B. N connections
  between them and C, D; 3 requirements, 4 intents in play." / the no-mention prompt).
- `client/src/state/chat.tsx`: `ChatProvider` + `useChat()` → `{ open, toggle(), draft, setDraft,
mentions, addMention(m), removeMention(id), messages, send() }`; `send()` appends the user
  message (with chips) and the scripted assistant reply; opening from a mention button focuses the
  input.
- `client/src/features/chat/`: `ChatDrawer.tsx` (header button + body), `Thread.tsx` (empty state
  with 2 example buttons, bubbles, chips), `Composer.tsx` (input, send, scope chips, Backspace
  removes last chip, Enter sends, Esc closes menu), `MentionMenu.tsx`, `MentionButton.tsx` (the
  round "@"), `chat.css`, `index.ts`. Mount the drawer in `AppShell` below the canvas+panel row
  (own the one-line slot addition).
- Mention buttons in `DetailCard` title row (30px, before the action button), `RequirementCard`,
  `IntentCard` (24px) — minimal diffs, tokens only.
- Canvas attention: while `mentions.length > 0`, cards in `attentionSet` get `.is-in-scope` (3px
  accent-2-500 ring, opacity 1) and all others dim to `--dim-opacity`, overriding hover/selection;
  done by extending `deriveSelection`'s consumer in the atlas/focus canvases with a scope set —
  keep it to a `useChat().attention` read + one class.
- Tokens: `--chat-chip-bg/fg`, `--chat-scope-ring` in tokens.css (from ramps).
- Tests: `model/chatScope.test.ts` (systemsOf per kind, attentionSet union, filterMenu limit +
  exclusion, scriptedReply with/without mentions); `state/chat.test.tsx` (add/remove mention,
  send appends two messages, Backspace removes last); `ChatDrawer.test.tsx` renders closed/open.

**Out:** any network call, any change to `data/project.json` from the UI, proposal cards /
Apply / "Chat edit · review" pills (backlog), server changes, locks/lifecycle/layout code.

## Files you own

- `client/src/features/chat/**`, `client/src/state/chat.tsx` (+test), `client/src/model/chatScope.ts`
  (+test), `client/src/styles/tokens.css` (chat tokens), `client/src/App.tsx` (provider only),
  `client/src/features/shell/AppShell.tsx` (drawer slot, one line), and the mention-button lines in
  `features/panel/DetailCard.tsx`, `RequirementCard.tsx`, `IntentCard.tsx`, plus the `.is-in-scope`
  hook-up in `features/diagram/SystemCard.tsx` (or wherever card classes are computed). Tasks 18/19/20
  run in parallel and also touch DetailCard/SystemCard/LaneLayer — keep every change to them to the
  fewest lines possible and rebase before finishing.

## Acceptance criteria

- [ ] Drawer opens/closes from the header button; hint/scope-note text per design.
- [ ] Typing `@cli` shows a menu of matches; Enter picks; chip appears; Backspace on empty input removes it.
- [ ] "@" buttons on the panel/requirement/intent cards add to scope and open the drawer.
- [ ] With `@Client API` and `@One single, focused hero interaction` in scope, the atlas rings Client API +
      the requirement's systems and dims the rest; clearing scope restores.
- [ ] Send → user bubble with chips + scripted reply naming the resolved systems and counts.
- [ ] `npm run check` passes. Inspect-before-merge: leave dev running, `chat.jpg` in the scratchpad.

## Seed data update

Add `sys-client-chat` (kind `ui`, category Client, paths `client/src/features/chat/`,
`client/src/state/chat.tsx`, `client/src/model/chatScope.ts`); edges chat → state (reads),
shell → chat (renders) with evidence. Intent `int-chat-scope-is-context` — "The chat's job in this
phase is to prove it knows what the request is about: mentions resolve to systems, and the canvas
shows them and their connections" (rationale: the value of an AI assistant here is context, not
generation; demonstrating resolution is the honest first step; the write-side apply flow is next).
human-verified, sessionRef "planning chat 2026-08-27, AI-chat scoping", appliesTo sys-client-chat,
sys-client-diagram. Append at END. `docs/TASKS.md` row → review + changelog.

## Report format

As in `_TEMPLATE.md`, plus `useChat()` signature and the inspection URL.
