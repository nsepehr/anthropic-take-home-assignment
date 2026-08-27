#!/usr/bin/env bash
# Creates branch agent/<slug> + worktree at ../worktrees/<slug>, installs deps, allocates ports.
set -euo pipefail

slug="${1:-}"
if [[ -z "$slug" || ! "$slug" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "usage: scripts/new-worktree.sh <task-slug>   (lowercase, digits, dashes)" >&2
  exit 1
fi

root="$(git rev-parse --show-toplevel)"
main_root="$(git -C "$root" worktree list --porcelain | head -1 | sed 's/^worktree //')"
dest="$(cd "$main_root/.." && pwd)/worktrees/$slug"
branch="agent/$slug"

if [[ -e "$dest" ]]; then echo "error: $dest already exists" >&2; exit 1; fi
mkdir -p "$(dirname "$dest")"

if git -C "$root" show-ref --quiet "refs/heads/$branch"; then
  git -C "$root" worktree add "$dest" "$branch"
else
  git -C "$root" worktree add -b "$branch" "$dest" main
fi

cd "$dest"
npm install --no-audit --no-fund --loglevel=error
node scripts/ports.mjs

echo
echo "Worktree ready: $dest  (branch $branch)"
echo "Next: cd \"$dest\" && npm run dev   # then build, test, and run scripts/finish-worktree.sh when done"
