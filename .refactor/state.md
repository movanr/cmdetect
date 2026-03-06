# Refactor State

## Last session: 2026-03-06

What was done: Removed debug form values panel from ExaminationForm.tsx (lines 45–47 and 98–104: `allValues = form.watch()` and `<details>` JSON dump). Accepted divergence for `sideLabel()` in PrintableBefundbericht.tsx — lowercase labels ("links"/"rechts") are intentionally different from `SIDES` ("Linke Seite"/"Rechte Seite") for grammatical correctness in German compound phrases.
What was deferred: Nothing — backlog is now empty.
Next recommended: No refactor items remain. Run `pnpm type-check && pnpm lint` to confirm clean state.
Open questions: None.

## Backlog

<!-- Ordered by priority. Tag each: SSOT, DRY, Coupling, Consistency, Dependency, TypeSafety, DeadCode -->

- ~~[SSOT] `GetPatientRecord` GraphQL query duplicated 7× across routes~~ — **done 2026-03-05**
- ~~[DRY] Examination route boilerplate (e1–e10): near-identical navigateToStep / handleComplete / handleBack pattern 10×~~ — **done 2026-03-05**
- ~~[DRY] `get()` path traversal helper duplicated in 3 files (also in anamnesis-text.ts)~~ — **done 2026-03-05**
- ~~[DeadCode] `apps/frontend/src/queries/` directory and prototype `/patient` route~~ — **done 2026-03-05**
- ~~[DeadCode] Debug form values panel hardcoded in ExaminationForm.tsx~~ — **done 2026-03-06**
- ~~[DRY] `sideLabel()` in PrintableBefundbericht.tsx diverges from `SIDES`~~ — **accepted divergence 2026-03-06** (grammatically correct in German; no code change needed)

## Decisions

<!-- Append-only log of architectural choices made during refactoring -->

### 2026-03-05 — Export getValueAtPath from @cmdetect/dc-tmd public API

Context: `getValueAtPath` was internal to dc-tmd but needed by frontend evaluation files that had duplicated it.
Decision: Added `export { getValueAtPath } from "./utils"` to `packages/dc-tmd/src/index.ts`. Used `import { getValueAtPath as get }` alias pattern (matching existing `extract.ts` convention) for minimal call-site diff.
Alternatives considered: (1) Create a shared utility package — overkill for one function. (2) Copy into frontend utils — perpetuates duplication.

### 2026-03-06 — Accept sideLabel() divergence from SIDES

Context: `sideLabel()` in PrintableBefundbericht.tsx returns "links"/"rechts" while `SIDES` from `@cmdetect/dc-tmd` returns "Linke Seite"/"Rechte Seite".
Decision: Accept divergence. Using `SIDES` values would produce "Kiefergelenk Linke Seite" — grammatically wrong in German. `sideLabel()` is intentionally lowercase for use in compound phrases and is only used in this one file. No code change.

### 2026-03-05 — Delete prototype /patient route along with queries/ directory

Context: `patient.tsx` was the sole consumer of `queries/queries.ts`. Both were prototyping artifacts superseded by `apps/patient-frontend/`. Deleting one without the other would either break the build or leave dead code.
Decision: Delete all 3 files together as a single atomic change. The Hasura actions they referenced (`submitPatientConsent`, `submitQuestionnaireResponse`) remain in metadata — they're used by the real patient frontend app.
