# Deep Refactoring Guide

General refactoring fixes code. Deep refactoring fixes **design**. This guide is for finding structural erosion — the problems that only become visible when you trace how data and control actually flow through the system.

## How it works

Every session follows one **thread**: a single path through the system that exercises real behavior. A thread might be:

- An API request from HTTP handler → service → database → response
- A user action from click → state update → side effects → UI re-render
- An entity lifecycle from creation → mutations → deletion
- An event from emission → propagation → all handlers

The thread-tracer subagent traces the thread read-only and returns a structured Thread Map. You use that map to diagnose and plan.

## Session types

### Trace session (new thread)

1. **Pick a thread** — suggest candidates from git hotspots, fat files, and boundary crossings. Let the user pick, or accept a direct specification.
2. **Dispatch thread-tracer** — give it the entry point and what to follow. Receive the Thread Map.
3. **Diagnose** — using the Thread Map and the diagnostic lens below, produce a Thread Diagnosis.
4. **Present and discuss** — this is the most important checkpoint. The user may know context that changes the diagnosis entirely.
5. **Initialize state** — write the diagnosis and migration plan to `.refactor/deep-state.md`. No code changes.

### Migration session (continuing a diagnosed thread)

1. **Read state** — pick up from `.refactor/deep-state.md`.
2. **Confirm next step** — show the user what's next and get approval.
3. **Execute one step** — smallest self-contained, behavior-preserving change.
4. **Update state** — record progress, update next step.

## Diagnostic lens

### Primary: data flow analysis

The thread-tracer flags these. When diagnosing, focus on:

- **Unnecessary transformations** — data reshaped without adding value. Ask: is this compensating for an earlier design mistake?
- **Excessive hops** — count files/functions data passes through. Shortest path with clean separation is the goal.
- **Redundant fetching** — same data retrieved multiple times because it wasn't threaded through.
- **Lossy handoffs** — information available early, discarded, then re-derived later. Hallmark of organic growth.
- **Implicit contracts** — module A produces data in a shape module B expects, nothing enforces it.
- **Serialization churn** — encode/decode cycles beyond what the architecture requires.
- **Data plumbing files** — modules existing only to forward and reshape data. Symptom of a missing abstraction or wrong boundary.

### Primary: ad-hoc pattern detection

- **Feature accretion** — original simple implementation with features bolted on. Signs: deeply nested conditionals, boolean flags, growing optional parameters, switch statements that expand with each feature.
- **Inconsistent parallel implementations** — the same kind of problem (CRUD, form validation, API integration, event handling) solved differently across the codebase. Catalog: "entity X does it this way, Y another way, Z a third way."
- **Implicit patterns** — ad-hoc implementations that follow a pattern never extracted and named. If three features do roughly the same dance differently, describe the shared pattern.
- **Pattern exhaustion** — an abstraction tortured beyond its original design. Signs: excessive config objects, escape hatches, "special case" branches, wrappers that undo what the abstraction does.
- **Copy-paste-modify architecture** — not duplicated code (the refactor command handles that), but duplicated _structure_: the same architectural approach copied and tweaked per feature.

### Secondary: note when encountered, don't hunt

- Misplaced logic — business rules in UI, presentation logic in services
- God modules — one file orchestrating too many concerns
- Missing boundaries — distinct domains tangled in one module
- Layering violations — deep layers reaching into higher layers
- Circular or tangled dependencies

## Diagnosis format

```
## Thread: [name]

### Path summary
[Sequential: file → file → file, one-line note per step]

### Data flow map
[entry → transform → module → transform → output.
At each arrow: data shape, whether transform is necessary,
what contract (if any) enforces the shape.]

### Ad-hoc patterns found
[For each: what it probably started as, what it became, what common
pattern it should follow. If similar ad-hoc implementations exist
elsewhere, list them — candidates for shared abstraction.]

### Cross-thread patterns
[Issues the thread-tracer's memory flagged as recurring across
multiple traces. These are systemic — highest-leverage fixes.]

### Other issues
[Secondary findings: misplaced responsibilities, boundary violations, etc.]

### Root cause
[The deepest underlying cause. Usually: missing domain concept,
wrong boundary, missing shared pattern, or unnecessary data
transformation layers accumulated over time.]

### Proposed redesign
[What this thread *should* look like. Name the modules, describe the
simplified data flow, define the pattern that replaces ad-hoc implementations.]

### Migration path
[Steps from current → proposed. Each step independently committable
and behavior-preserving. Separate data flow simplification from
pattern extraction. Flag risky steps.]
```

## How to prioritize migration steps

1. Simplify data flow first — remove unnecessary hops and transforms before restructuring
2. Extract shared patterns only after tracing them in at least 3 places
3. Move responsibilities to their correct home before refining interfaces
4. Consolidate parallel implementations last — they need the pattern to exist first

## Rules

- **Trace first, change never.** A new thread always starts with diagnosis only. Changes come in follow-up sessions.
- **One migration step per session.** If it pulls in more than expected, stop and re-scope.
- **Behavior-preserving unless explicitly approved.** Deep refactors are high-risk. Every step must be verifiable.
- **Don't introduce patterns preemptively.** Only when the trace demonstrates the need.
- **Don't gold-plate.** Clear and proportional, not architecturally impressive.
- **Flag uncertainty.** If you can't confidently say a change is safe, say so and suggest how to verify.
- **Feed the regular backlog.** Mechanical cleanup (renames, dead code, DRY) found during traces goes to `.refactor/state.md`.

## State format

Maintain `.refactor/deep-state.md` to bridge sessions:

```markdown
# Deep Refactor State

## Last session: YYYY-MM-DD

Thread traced: <name and one-line description>
Diagnosis: <one-paragraph summary>
Migration progress: <which steps are done, which remain>
Next step: <exactly what to do next, with file paths>

## Threads completed

- YYYY-MM-DD — <thread name>: <outcome summary>

## Threads to explore

<!-- Promising candidates discovered during traces -->

- <candidate>: <hypothesis of what it might reveal>

## Systemic issues

<!-- Same problem appearing across multiple threads — highest-leverage fixes -->

- <issue>: seen in <thread A>, <thread B>, ...
```
