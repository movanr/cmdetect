---
description: Run an incremental refactoring session. Analyzes code health, scopes a change, executes it, and updates state for the next session.
allowed-tools: Bash(git *), Bash(pnpm *), Bash(npm *), Bash(cat *), Bash(find *), Bash(grep *), Bash(wc *)
---

You are doing an incremental refactoring session. ultrathink about the codebase before making changes.

Read the refactoring methodology: @.refactor/GUIDE.md

## Current state

Git log (last 15 commits):
!`git log --oneline -15 2>/dev/null || echo "No git history"`

Refactor state from previous sessions:
!`cat .refactor/state.md 2>/dev/null || echo "No previous sessions — this is a fresh start."`

## Your task

$ARGUMENTS

If no focus area was given and this is a fresh start: scan the codebase, identify the highest-value refactoring opportunities using the guide's diagnostic lens, present your findings, and ask what to focus on. Do not make changes in the first session — analysis and state initialization only. Create `.refactor/state.md` with initial backlog.

If no focus area was given but state exists: pick up the highest-priority item from the backlog, or the "next recommended" item. Confirm with the user before proceeding.

When executing a refactoring change:

1. State what will change and what behavior must remain unchanged
2. Confirm scope with the user before editing files
3. Make changes incrementally — commit after each logical unit
4. Run lint and tests after each change
5. Update `.refactor/state.md` at the end with what was done, what was deferred, and what to do next
6. Commit the state update
