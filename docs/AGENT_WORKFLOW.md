# Agent workflow

How multiple AI coding agents work on this repo in parallel without stepping on each other.
`CLAUDE.md` has the short rules; this is the long form.

## Lifecycle of a task

1. **Receive the brief.** It lives in `docs/tasks/<slug>.md` (see `docs/tasks/_TEMPLATE.md`).
   Read it fully. Note "Files you own" and "Interfaces you depend on". If anything is ambiguous,
   pick the smaller interpretation and write it down for your report — don't block, don't expand.
2. **Create your worktree** (from the main checkout):
   ```
   scripts/new-worktree.sh <slug>
   ```
   This creates branch `agent/<slug>`, a worktree at `../worktrees/<slug>`, installs deps, and
   allocates ports. From then on, work only inside that worktree.
3. **Ports.** `new-worktree.sh` already ran `npm run ports`, which wrote `.env.local` with a free
   `CLIENT_PORT` / `SERVER_PORT`. The allocator avoids ports claimed by any other worktree's
   `.env.local` and probes the OS, so distinct worktrees get distinct ports. It is idempotent —
   rerunning keeps your ports. `npm run dev` loads `.env.local` automatically. Never hardcode
   5173/3001 in code or in commands; read the values from `.env.local`.
4. **Build.** Stay inside "Files you own". Keep modules small. Put logic in pure functions;
   keep fs/network/DOM at the edges so tests stay simple.
5. **Test.** Each new module gets a test that pins its intent (the behavior another agent must not
   break). Run `npm test` often; `npm run check` before finishing.
6. **Simplify.** Run `/simplify` on your diff. Remove dead code, needless abstraction, duplicated
   helpers. Keep what makes the code clearer; don't churn.
7. **Commit.** Clear message, conventional prefix (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
   Commit only your task's changes; never commit `.env.local` (it's gitignored).
8. **Finish.**
   ```
   scripts/finish-worktree.sh
   ```
   It refuses to run with uncommitted changes, rebases your branch onto `main`, runs
   `npm run check`, and prints the merge commands. It does **not** merge or push — the human does.
9. **Report** in the format the brief asks for: what was built, what was skipped and why, exact
   verification commands, any `shared/` changes (with diff), any dependencies added (with reason),
   decisions/assumptions the human should know about.

## Staying out of each other's way

- **Own worktree, own branch.** Never `cd` into another task's worktree or check out its branch.
- **Own ports.** Always via the script. If a server fails with `EADDRINUSE`, run
  `npm run ports -- --force` and restart — don't pick a number by hand.
- **Own files.** The brief lists the files/directories you own. Creating new files inside your
  owned directories is fine. Editing a file you don't own is a scope change — only if the brief
  explicitly allows it, and call it out in the report.
- **Shared files** (`shared/src/*`, root configs, `package.json`, `CLAUDE.md`) are hot spots.
  Touch them only when the brief says so, keep edits additive and minimal, and put them in their
  own commit so they're easy to review and cherry-pick.
- **Don't reformat files you didn't otherwise change.** Prettier is configured; run it on your
  files, not the tree.

## Merge order and conflicts

- Merges happen on `main` by the human, fast-forward only (`git merge --ff-only agent/<slug>`),
  in the order tasks finish unless the briefs specify dependencies.
- **Rebase on `main` before finishing** — `finish-worktree.sh` does this. If `main` moved after
  you finished, run the script again.
- Conflict resolution:
  - `shared/` conflicts: **prefer `main`**, then re-apply the minimal addition your task needs.
    If your brief explicitly says you own a `shared/` change, prefer yours and note it.
  - `package.json` / lockfile: keep both sets of deps, re-run `npm install`, commit the lockfile.
  - Anything else: the file's owner (per the briefs) wins; otherwise prefer `main`.
- After resolving: `git rebase --continue`, then `scripts/finish-worktree.sh` again so the checks
  run on the rebased code.

## Cleanup (human, after merging)

```
git worktree remove ../worktrees/<slug>
git branch -d agent/<slug>
```
