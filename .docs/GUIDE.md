# Documentation Guide

## What to look for

When scanning for documentation health, look for these in order of severity:

**Dangerous gaps:** Public APIs with no documentation. Exported functions/types that other packages consume but have no JSDoc/TSDoc. Entry points with no README explaining how to use them. Environment variables or config required to run the project but documented nowhere.

**Stale docs:** README sections that describe features or architecture that no longer exist. Code comments referencing old behavior. API docs showing parameters or return types that have changed. Setup instructions that no longer work.

**Missing context:** No architecture overview explaining how packages relate. No explanation of data flow (especially GraphQL schema → codegen → frontend types). No onboarding path for a new developer. Complex business logic with no comments explaining _why_ (not _what_). Non-obvious conventions that exist only in tribal knowledge.

**Inconsistency:** Some modules documented thoroughly, others not at all. Mixed documentation styles (JSDoc in some files, block comments in others, nothing in most). README exists for some packages but not others.

## How to prioritize

Score: `(Exposure × Staleness) ÷ Effort`

- Exposure (1–3): how many people/modules depend on understanding this (public API = 3, internal helper = 1)
- Staleness (1–3): how wrong or missing is the current documentation (actively misleading = 3, missing = 2, just thin = 1)
- Effort: S=add a few comments, M=write a section or README, L=document a whole subsystem, XL=architecture-level docs

Then apply these overrides:

1. Fix actively misleading docs first — wrong docs are worse than no docs
2. Document public interfaces before internals
3. Document the "why" before the "what" — code shows what, only docs can show why
4. Setup/onboarding docs have outsized impact — they multiply every new contributor

## Rules for documentation sessions

- **Match the existing style.** If the codebase uses JSDoc, write JSDoc. If READMEs are terse, keep them terse. Don't impose a new format.
- **Don't document generated code.** Document the source (schema, codegen config) instead.
- **Don't write docs that restate the code.** `// increment counter` above `counter++` is noise. Document intent, constraints, and non-obvious behavior.
- **Keep docs close to the code they describe.** Inline JSDoc > separate wiki page. README in the package dir > monorepo-root mega-doc.
- **If you discover code issues while documenting, log them in the refactoring backlog** (`.refactor/state.md`), don't fix them in a docs session.
- **One scope per session.** Don't mix API documentation with architecture docs with README updates.

## State format

Maintain `.docs/state.md` to bridge sessions:

```markdown
# Documentation State

## Last session: YYYY-MM-DD

What was done: <summary with file paths>
What was deferred: <issues logged but not addressed>
Next recommended: <what to pick up and why>
Open questions: <anything needing user input — e.g. "should we document the legacy auth flow or just mark it deprecated?">

## Backlog

<!-- Ordered by priority. Tag each: API, Architecture, Onboarding, Stale, Inline, README -->

- [TAG] description — scope S/M/L — area `path/`
- ...

## Coverage map

<!-- Track what's documented and what isn't. Update each session. -->

| Area                 | Status     | Notes                             |
| -------------------- | ---------- | --------------------------------- |
| `packages/shared/`   | ✅ Good    | JSDoc on all exports              |
| `packages/api/`      | ⚠️ Partial | Routes documented, middleware not |
| `packages/frontend/` | ❌ Missing | No component docs                 |
| Root README          | ⚠️ Stale   | Setup instructions outdated       |
```
