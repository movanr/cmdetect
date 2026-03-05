# Refactor State

## Last session: 2026-03-05

What was done: Removed dead `apps/frontend/src/queries/` directory (2 files) and prototype `/patient` route. The `queries/queries.ts` had 2 completely unused exports (`getOrganizations`, `getPatientRecords`) and 2 exports only consumed by the prototype `patient.tsx` route. `receptionist.ts` had 1 unused export (`getOrganizationPhysicians`). The `patient.tsx` route was a prototype superseded by `apps/patient-frontend/` — no links pointed to it. Net: -3 files, ~240 lines removed.
What was deferred: All remaining backlog items.
Next recommended: [DeadCode] Debug form values panel in ExaminationForm.tsx.
Open questions: None.

## Backlog

<!-- Ordered by priority. Tag each: SSOT, DRY, Coupling, Consistency, Dependency, TypeSafety, DeadCode -->

- ~~[SSOT] `GetPatientRecord` GraphQL query duplicated 7× across routes~~ — **done 2026-03-05**
- ~~[DRY] Examination route boilerplate (e1–e10): near-identical navigateToStep / handleComplete / handleBack pattern 10×~~ — **done 2026-03-05**
- ~~[DRY] `get()` path traversal helper duplicated in 3 files (also in anamnesis-text.ts)~~ — **done 2026-03-05**
- ~~[DeadCode] `apps/frontend/src/queries/` directory and prototype `/patient` route~~ — **done 2026-03-05**
- [DeadCode] Debug form values panel hardcoded in ExaminationForm.tsx:99–104 — scope S — `apps/frontend/src/features/examination/components/ExaminationForm.tsx`
- [DRY] `sideLabel()` in PrintableBefundbericht.tsx uses abbreviated labels ("links"/"rechts") that differ from `SIDES` — needs a new short-label map or accept divergence — scope S — `apps/frontend/src/features/evaluation/components/PrintableBefundbericht.tsx`

## Decisions

<!-- Append-only log of architectural choices made during refactoring -->

### 2026-03-05 — Export getValueAtPath from @cmdetect/dc-tmd public API

Context: `getValueAtPath` was internal to dc-tmd but needed by frontend evaluation files that had duplicated it.
Decision: Added `export { getValueAtPath } from "./utils"` to `packages/dc-tmd/src/index.ts`. Used `import { getValueAtPath as get }` alias pattern (matching existing `extract.ts` convention) for minimal call-site diff.
Alternatives considered: (1) Create a shared utility package — overkill for one function. (2) Copy into frontend utils — perpetuates duplication.

### 2026-03-05 — Delete prototype /patient route along with queries/ directory

Context: `patient.tsx` was the sole consumer of `queries/queries.ts`. Both were prototyping artifacts superseded by `apps/patient-frontend/`. Deleting one without the other would either break the build or leave dead code.
Decision: Delete all 3 files together as a single atomic change. The Hasura actions they referenced (`submitPatientConsent`, `submitQuestionnaireResponse`) remain in metadata — they're used by the real patient frontend app.
