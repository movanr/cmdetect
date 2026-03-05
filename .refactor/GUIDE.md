# Refactoring Guide

## What to look for

When scanning code, look for these in order of severity:

**Critical:** Multiple sources of truth for the same concept. Circular dependencies. Wrong-direction imports (app packages importing from shared). Schema types duplicated in frontend instead of using generated types.

**Structural:** Tight coupling between modules. God files doing too many things. Leaky abstractions. Business logic entangled with I/O or framework code. Mixed data-fetching patterns (e.g. three different ways to load data).

**Cleanup:** Dead code, unused exports, unreachable branches. Naming inconsistencies. `any` casts. Magic literals. Overly complex expressions.

## How to prioritize

Score: `(Impact × Risk) ÷ Effort`

- Impact (1–3): how many modules depend on this area
- Risk (1–3): how exposed is it (no tests + critical path = 3)
- Effort: S=1 file, M=few files, L=cross-package, XL=architectural

Then apply these overrides in order:

1. Fix what's broken or dangerous first
2. Consolidate sources of truth (SSOT violations compound)
3. Reduce coupling before improving cohesion
4. Delete before refactoring
5. Extract shared patterns only after the third occurrence

## Rules for refactoring sessions

- **Never create a third pattern.** Follow the existing convention or refactor it everywhere.
- **Smallest diff that achieves the goal.** Rename before restructure. Restructure before rewrite.
- **One concern per session.** Don't mix naming fixes with structural refactors.
- **If a refactor pulls in more files than expected, stop and re-scope.** Log the discovered work instead of pushing through.
- If touching logic with no tests, write a characterization test first (records current behavior, marked `// characterization test`).
- If a schema inconsistency is found, log it as requiring a Hasura migration — do not attempt to fix it.

## State format

Maintain `.refactor/state.md` to bridge sessions:

```markdown
# Refactor State

## Last session: YYYY-MM-DD

What was done: <summary with file paths>
What was deferred: <issues logged but not addressed>
Next recommended: <what to pick up and why>
Open questions: <anything needing user/architecture decisions>

## Backlog

<!-- Ordered by priority. Tag each: SSOT, DRY, Coupling, Consistency, Dependency, TypeSafety, DeadCode -->

- [TAG] description — scope S/M/L — area `path/`
- ...

## Decisions

<!-- Append-only log of architectural choices made during refactoring -->

### YYYY-MM-DD — Title

Context: ...
Decision: ...
Alternatives considered: ...
```
