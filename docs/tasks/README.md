# Task briefs

One file per task: `docs/tasks/<slug>.md`, copied from `_TEMPLATE.md`. `<slug>` is lowercase with
dashes and becomes the branch (`agent/<slug>`) and worktree (`../worktrees/<slug>`).

A good brief is small enough to finish in one sitting, names the files the agent owns, and states
the interfaces it depends on so parallel tasks don't collide. If two briefs need the same file, one
of them owns it and the other declares a dependency.

Agents: read `CLAUDE.md` first, then your brief, then `docs/AGENT_WORKFLOW.md` if you need detail.

Status of every task (and the phase it belongs to) lives in `docs/TASKS.md` — update your row there.
