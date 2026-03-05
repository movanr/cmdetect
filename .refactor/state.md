# Refactor State

## Last session: 2026-03-05

What was done: Extracted examination route navigation boilerplate into `useExaminationRouteNavigation` hook (`apps/frontend/src/features/examination/hooks/use-examination-route-navigation.ts`). Shared `examinationStepSearchSchema` replaces 5 identical Zod schemas. All 10 route files (E1–E10) refactored from ~40-65 lines to ~15-25 lines each. Net: -88 lines, single source of truth for section ordering and navigation logic.
What was deferred: All remaining backlog items.
Next recommended: [DRY] `get()` path traversal helper duplicated in criterion-data-display.ts and PrintableBefundbericht.tsx.
Open questions: None.

## Backlog

<!-- Ordered by priority. Tag each: SSOT, DRY, Coupling, Consistency, Dependency, TypeSafety, DeadCode -->

- ~~[SSOT] `GetPatientRecord` GraphQL query duplicated 7× across routes~~ — **done 2026-03-05**
- ~~[DRY] Examination route boilerplate (e1–e10): near-identical navigateToStep / handleComplete / handleBack pattern 10×~~ — **done 2026-03-05**
- [DRY] `get()` path traversal helper duplicated in criterion-data-display.ts and PrintableBefundbericht.tsx (also exists as `getValueAtPath` in dc-tmd/src/utils.ts) — scope S — `apps/frontend/src/features/evaluation/`
- [DeadCode] `apps/frontend/src/queries/queries.ts` — legacy file with prototype queries and patient-frontend mutations, only partially used by patient.tsx — scope S — `apps/frontend/src/queries/`
- [DeadCode] Debug form values panel hardcoded in ExaminationForm.tsx:99–104 — scope S — `apps/frontend/src/features/examination/components/ExaminationForm.tsx`
- [DRY] `sideLabel()` in PrintableBefundbericht.tsx reinvents `SIDES[side]` from @cmdetect/dc-tmd — scope S — `apps/frontend/src/features/evaluation/components/PrintableBefundbericht.tsx`

## Decisions

<!-- Append-only log of architectural choices made during refactoring -->
