---
description: Run a deep refactoring session. Traces a single thread through the system end-to-end to find structural design problems — opaque data flows, ad-hoc patterns, misplaced responsibilities — then proposes and executes a targeted redesign.
allowed-tools: Bash(git *), Bash(pnpm *), Bash(npm *), Bash(cat *), Bash(find *), Bash(grep *), Bash(wc *)
---

You are doing a deep refactoring session. This is design-level work, not code-level cleanup. ultrathink about architecture before making changes.

Read the deep refactoring methodology: @.refactor/DEEP-GUIDE.md

## Current state

Git hotspots (most-changed files, last 200 commits):
!`git log --format=format: --name-only -200 2>/dev/null | grep -v '^$' | sort | uniq -c | sort -rn | head -20 || echo "No git history"`

Largest files by line count:
!`find . -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v node_modules | grep -v dist | xargs wc -l 2>/dev/null | sort -rn | head -15 || echo "No source files found"`

Deep refactor state from previous sessions:
!`cat .refactor/deep-state.md 2>/dev/null || echo "No previous deep-refactor sessions."`

## Subagent: thread-tracer

You have access to the `thread-tracer` subagent. Use it for all read-only exploration and thread tracing. It:

- Operates in its own context window (won't pollute yours)
- Is restricted to read-only tools
- Accumulates codebase knowledge in its memory across sessions
- Returns a structured Thread Map you use for diagnosis

**Delegate tracing, keep diagnosis and execution in your own context.**

When you need to trace a thread:

1. Dispatch the thread-tracer with a clear description of the entry point and what to follow
2. Receive the Thread Map back
3. Use it as input for your diagnosis (Phase 3 in the guide)

If the thread-tracer's memory contains observations from previous traces, factor those into your diagnosis — cross-thread patterns are the highest-leverage findings.

## Your task

$ARGUMENTS

If a thread was specified: dispatch the thread-tracer on that thread. Then diagnose using the guide's methodology. Do not make code changes in the same session as a new trace — diagnosis only.

If "continue" or no argument and state exists with a migration in progress: pick up from `deep-state.md`. Show remaining steps, confirm which one to execute.

If no argument and no state: suggest 3–5 candidate threads using the hotspots and fat files above, plus boundary crossings you discover by scanning route handlers, API clients, and entry points. For each candidate, give a one-line hypothesis of what design issue the trace might reveal. Ask the user to pick one.

When executing a migration step (follow-up sessions only):

1. State what will change and what behavior must remain unchanged
2. Confirm scope with the user before editing files
3. Make changes incrementally — commit after each logical unit
4. Run lint and tests after each change
5. Log mechanical cleanup discovered along the way to `.refactor/state.md` backlog (for the regular refactor command)
6. Update `.refactor/deep-state.md` with diagnosis, progress, and next step
7. Commit the state update
