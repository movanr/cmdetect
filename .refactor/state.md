# Refactor State

## Last session: 2026-03-05

What was done: Consolidated 3 duplicate `get()` path traversal helpers into imports of the canonical `getValueAtPath` from `packages/dc-tmd/src/utils.ts`. Removed local implementations from `anamnesis-text.ts`, `criterion-data-display.ts`, and `PrintableBefundbericht.tsx`. Exported `getValueAtPath` from the `@cmdetect/dc-tmd` package public API. All use `import { getValueAtPath as get }` to preserve short call-site names. Net: -24 lines, single source of truth for path traversal.
What was deferred: `sideLabel()` duplication noted but not addressed — the abbreviated labels ("links"/"rechts") differ from `SIDES` ("Linke Seite"/"Rechte Seite"), so it's not a direct replacement.
Next recommended: [DeadCode] `apps/frontend/src/queries/queries.ts` — legacy file with prototype queries, only partially used.
Open questions: None.

## Backlog

<!-- Ordered by priority. Tag each: SSOT, DRY, Coupling, Consistency, Dependency, TypeSafety, DeadCode -->

- ~~[SSOT] `GetPatientRecord` GraphQL query duplicated 7× across routes~~ — **done 2026-03-05**
- ~~[DRY] Examination route boilerplate (e1–e10): near-identical navigateToStep / handleComplete / handleBack pattern 10×~~ — **done 2026-03-05**
- ~~[DRY] `get()` path traversal helper duplicated in 3 files (also in anamnesis-text.ts)~~ — **done 2026-03-05**
- [DeadCode] `apps/frontend/src/queries/queries.ts` — legacy file with prototype queries and patient-frontend mutations, only partially used by patient.tsx — scope S — `apps/frontend/src/queries/`
- [DeadCode] Debug form values panel hardcoded in ExaminationForm.tsx:99–104 — scope S — `apps/frontend/src/features/examination/components/ExaminationForm.tsx`
- [DRY] `sideLabel()` in PrintableBefundbericht.tsx uses abbreviated labels ("links"/"rechts") that differ from `SIDES` — needs a new short-label map or accept divergence — scope S — `apps/frontend/src/features/evaluation/components/PrintableBefundbericht.tsx`

## Decisions

<!-- Append-only log of architectural choices made during refactoring -->

### 2026-03-05 — Export getValueAtPath from @cmdetect/dc-tmd public API

Context: `getValueAtPath` was internal to dc-tmd but needed by frontend evaluation files that had duplicated it.
Decision: Added `export { getValueAtPath } from "./utils"` to `packages/dc-tmd/src/index.ts`. Used `import { getValueAtPath as get }` alias pattern (matching existing `extract.ts` convention) for minimal call-site diff.
Alternatives considered: (1) Create a shared utility package — overkill for one function. (2) Copy into frontend utils — perpetuates duplication.
