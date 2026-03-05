---
description: Run an incremental documentation health session. Scans for gaps, stale docs, and missing context, then fixes them one scope at a time.
allowed-tools: Bash(git *), Bash(pnpm *), Bash(npm *), Bash(cat *), Bash(find *), Bash(grep *), Bash(wc *)
---

You are doing an incremental documentation health session. ultrathink about what's documented, what's missing, and what's wrong.

Read the documentation methodology: @.docs/GUIDE.md

## Current state

Git log (last 15 commits):
!`git log --oneline -15 2>/dev/null || echo "No git history"`

Documentation state from previous sessions:
!`cat .docs/state.md 2>/dev/null || echo "No previous sessions — this is a fresh start."`

## Your task

$ARGUMENTS

If no focus area was given and this is a fresh start: scan the codebase for documentation health — public APIs without docs, missing READMEs, stale instructions, undocumented architecture. Build a coverage map. Present your findings and ask what to focus on. Do not write any documentation in the first session — analysis only. Create `.docs/state.md` and `.docs/GUIDE.md` (copy from the guide above).

If no focus area was given but state exists: pick up the highest-priority item from the backlog or the "next recommended" item. Confirm with the user before proceeding.

When writing documentation:
1. State what you'll document and where it will live
2. Confirm scope with the user before writing
3. Match the existing documentation style in the codebase
4. Commit after each logical unit of documentation
5. Update `.docs/state.md` at the end with what was done, what was deferred, and what to do next
6. Commit the state update

If you find code issues while documenting, log them in `.refactor/state.md` if it exists, otherwise note them in `.docs/state.md` under open questions. Don't fix code in a documentation session.
