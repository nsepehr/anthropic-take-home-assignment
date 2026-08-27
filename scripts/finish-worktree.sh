#!/usr/bin/env bash
# Run from inside a task worktree when the task is done: rebase on main, run the full check suite,
# print merge instructions. Does NOT merge or push.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"
branch="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$branch" == "main" ]]; then
  echo "error: run this from a task worktree, not main" >&2; exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: uncommitted changes. Commit them first." >&2
  git status --short; exit 1
fi

echo "==> Rebasing $branch onto main"
if ! git rebase main; then
  echo "Rebase conflicts. Resolve them (shared/ conflicts: prefer main unless your brief says otherwise),"
  echo "then: git rebase --continue && scripts/finish-worktree.sh" >&2
  exit 1
fi

echo "==> Running check suite (typecheck, lint, format, tests)"
npm run check

cat <<MSG

All checks passed on $branch ($(git rev-parse --short HEAD)).

Commits since main:
$(git log --oneline main..HEAD)

To merge (from the main worktree):
  git merge --ff-only $branch
  git worktree remove $root
  git branch -d $branch
MSG
