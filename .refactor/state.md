# Refactor State

## Last session: 2026-03-06

What was done: Fixed barrel file bypass (#4). Added 4 missing exports to examination barrel (`GET_EXAMINATION_RESPONSE`, `migrateAndParseExaminationData`, `getLocalExamCompletion`, `PrintableExamination`). Updated 5 route files and 1 cross-feature import (evaluation/SummaryDiagrams) to use the barrel instead of deep paths. Zero remaining deep imports from outside examination.
What was deferred: Nothing.
Next recommended: **#5 Patient-frontend ProgressHeader × 3** — unify three near-identical progress bar implementations. S-effort, medium impact.
Open questions: None.

## Backlog

<!-- Ordered by priority. Score = (Impact × Risk) ÷ Effort -->

### Critical / Structural

1. ~~[SSOT] **Duplicated crypto module**~~ ✅ Done — types + constants extracted to `@cmdetect/config`. Implementation duplication kept intentionally (see Decisions).

2. [Coupling] **God file: patient-frontend route index** — `apps/patient-frontend/src/routes/index.tsx` is 946 lines handling 12+ responsibilities: token validation, consent flow, personal data encryption, questionnaire routing, form submission, error translation, mutation management. Contains large inline constants (`CONSENT_TEXT`, `translations`), 10+ `useState` calls, 4 mutations, and wrapper component definitions. Impact 3 × Risk 2 ÷ Effort L = **high**. — area `apps/patient-frontend/src/routes/index.tsx`

3. ~~[Coupling] **Cross-feature type dependency**~~ ✅ Done — `ProcedureFlowStep` extracted to `apps/frontend/src/types/procedure-flow.ts`. Examination re-exports for internal consumers.

4. ~~[Consistency] **Barrel file bypass**~~ ✅ Done — added 4 missing exports to barrel, updated 5 route files + 1 cross-feature import. Zero remaining deep imports from outside examination.

### Structural

5. [DRY] **Patient-frontend ProgressHeader × 3** — Three near-identical progress bar implementations: `questionnaire-engine/components/ProgressHeader.tsx` (123 lines), `sq/components/ProgressHeader.tsx` (141 lines), and inline in `PainDrawingWizard.tsx`. Same `TransitionPhase` type, identical animation timing (280ms/560ms), 95% identical logic. Only display labels differ. Impact 2 × Risk 1 ÷ Effort S = **medium**. — area `apps/patient-frontend/src/features/*/`

6. [DRY] **Patient-frontend navigation hooks** — `useLinearNavigation` (53 lines) and `useSQNavigation` (160 lines) share identical base navigation logic (historyRef, currentIndex, goNext/goBack). SQ adds section tracking + enableWhen conditionals on top. Impact 2 × Risk 1 ÷ Effort S = **medium**. — area `apps/patient-frontend/src/features/*/hooks/`

7. [DRY] **E4/E5 section structural duplication** — E4Section (689 lines) and E5Section (632 lines) share near-identical structure: same imports, same step/interview pattern, same state management, same UI flow. Duplicated `computeStepStatusFromForm()` and `getInterviewSummaryText()` functions. Impact 2 × Risk 1 ÷ Effort L = **low-medium**. — area `apps/frontend/src/features/examination/components/sections/E4Section.tsx`, `E5Section.tsx`

8. [TypeSafety] **Auth-server `InviteValidationResult` not discriminated** — Uses optional fields for success/error cases. Should use `{ valid: true; ... } | { valid: false; error_message: string }` discriminated union. Impact 1 × Risk 2 ÷ Effort S = **medium**. — area `apps/auth-server/src/database.ts:32-39`

9. [SSOT] **`ValidationResult` interface duplicated** — Defined identically in `apps/auth-server/src/validation.ts` and `packages/questionnaires/src/validation/index.ts`. Impact 1 × Risk 1 ÷ Effort S = **low**. — area `apps/auth-server/src/validation.ts`, `packages/questionnaires/`

10. [Consistency] **God file: questionnaire-tables.tsx** — 692 lines, 11 exported components/functions. Exports 6 separate questionnaire answer table components (SQ, GCPS, PHQ4, JFLS8, JFLS20, OBC) plus shared utilities. Impact 1 × Risk 1 ÷ Effort S = **low**. — area `apps/frontend/src/features/questionnaire-viewer/components/dashboard/questionnaire-tables.tsx`

11. [Consistency] **God file: Axis2ScoreCard.tsx** — 746 lines with 6 `eslint-disable` comments (react-refresh). Contains multiple score card sub-components for different questionnaires alongside exported constants. Impact 1 × Risk 1 ÷ Effort S = **low**. — area `apps/frontend/src/features/questionnaire-viewer/components/dashboard/Axis2ScoreCard.tsx`

12. [Consistency] **God file: E9Section.tsx** — 993 lines, the largest non-generated component. Complex palpation examination flow with multiple concerns mixed. Impact 1 × Risk 1 ÷ Effort M = **low**. — area `apps/frontend/src/features/examination/components/sections/E9Section.tsx`

### Cleanup

13. [TypeSafety] **`as any` casts in non-generated code** — ~10 occurrences in frontend (E6/E7/E8 summaries, form-helpers, MeasurementStep, YesNoField, calculatePainScore) + 1 in auth-server `errors.ts` (Hono status code cast). Impact 1 × Risk 1 ÷ Effort S = **low**. — area scattered

14. [DeadCode] **Unused `_token` prop in patient-frontend wizards** — `GenericWizard.tsx`, `SQWizard.tsx` accept `token?: string` but explicitly ignore it (`token: _token`). Comment: "not used after removing persistence". Impact 0 × Risk 0 ÷ Effort S = **trivial**. — area `apps/patient-frontend/src/features/*/`

15. [DRY] **Inline SVG icons in PainDrawingWizard** — 5 inline SVG icon components (`ChevronLeftIcon`, `ChevronRightIcon`, `CheckIcon`, `HelpIcon`, `CloseIcon`) that duplicate lucide-react icons already available. Impact 0 × Risk 0 ÷ Effort S = **trivial**. — area `apps/patient-frontend/src/features/pain-drawing/PainDrawingWizard.tsx`

16. [DeadCode] **Stale TODO comments in auth-server** — 4 TODO comments in `env.ts`, `database.ts`, `actions.ts` discussing future improvements (Drizzle ORM, log redaction, native Hasura queries). Feature ideas, not actionable refactoring. Impact 0 × Risk 0 ÷ Effort S = **trivial**. — area `apps/auth-server/src/`

## Decisions

<!-- Append-only log of architectural choices made during refactoring -->

### 2026-03-06 — Crypto types extracted to config, implementation stays duplicated

Context: Both frontends implement ECIES encryption independently with nearly identical code. Full analysis showed the overlap is ~150 lines of implementation + types/constants. Key generation, decryption, storage, and recovery are frontend-only.
Decision: Extract only the contract types (`EncryptedPayload`, `PatientPII`, `CryptoError`, `CRYPTO_CONSTANTS`) to `packages/config`. Keep encryption implementation duplicated — it's write-once crypto code that rarely changes, and the shared types guarantee wire format compatibility. A full `packages/crypto` would add build infrastructure overhead disproportionate to the ~150 lines of shared logic.
Alternatives considered: (a) Full `packages/crypto` package — rejected, over-engineering for stable code with different dependency needs per frontend. (b) Accept full duplication including types — rejected, `EncryptedPayload` format drift is a silent data corruption risk.

### 2026-03-06 — Re-export files are not SSOT violations

Context: `examination/model/regions.ts` is a pure re-export of `@cmdetect/dc-tmd` types. Initially flagged as potential duplication.
Decision: Re-export modules are acceptable for convenience and don't constitute SSOT violations, as long as they don't define new types or logic.
