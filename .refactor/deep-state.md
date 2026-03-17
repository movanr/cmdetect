# Deep Refactor State

## Last session: 2026-03-17

Thread traced: none yet (candidate identification session)
Diagnosis: N/A
Migration progress: N/A
Next step: User picks a thread from candidates below, then we dispatch thread-tracer

## Threads completed

(none)

## Candidate threads

### 1. EvaluationView orchestration (recommended)

**Entry point:** `apps/frontend/src/features/evaluation/components/EvaluationView.tsx`
**Stats:** 596 lines, 38 commits (top hotspot by far)
**Related files:** CriteriaChecklist.tsx (562 lines, 13 commits), evaluation route, 4 persistence hooks

**Hypothesis:** EvaluationView is a god component orchestrating three distinct concerns — localisation state management, diagnosis documentation persistence, and criterion assessment persistence — plus a manual switch-case dispatcher (`getTreeForDiagnosis`) for decision trees. Feature accretion from adding assessment persistence on top of the original documentation-only flow likely left tangled state management and unclear data ownership.

**What a trace would reveal:** Whether the three concerns can be cleanly separated, whether the tree dispatcher belongs elsewhere, and how the data flows between EvaluationView → CriteriaChecklist → persistence hooks.

### 2. Decision tree ↔ dc-tmd criteria dual encoding (recommended)

**Entry point:** `apps/frontend/src/features/decision-tree/data/*.ts` (7 tree files, ~1500 lines)
**Stats:** 12 commits each on dd-with-reduction-tree.ts, myalgia-subtypes.ts; 12 on decision-tree-view.tsx, tree-node.tsx
**Related files:** `packages/dc-tmd/src/criteria/diagnoses/*.ts`, DecisionTreeView, TreeNode

**Hypothesis:** The same diagnostic logic is encoded in two places with no sync mechanism. Tree data files are hand-crafted visual mirrors of dc-tmd criteria — each imports individual criteria from dc-tmd, then re-encodes the sequence as visual nodes with layout coordinates and transitions. Every diagnosis change requires updating both the package definition and the frontend tree. This is copy-paste-modify architecture: 7 tree files following the same pattern (import criteria → define nodes with positions → define transitions) maintained manually per diagnosis.

**What a trace would reveal:** Whether trees can be generated from DiagnosisDefinition structure, eliminating ~1500 lines of hand-maintained data. Key question: how much of the tree data is derivable from criteria structure vs. truly visual/layout-specific?

### 3. Examination route → form → persistence lifecycle

**Entry point:** `apps/frontend/src/routes/cases_.$id.examination.tsx`
**Stats:** 17 commits (2nd hotspot)
**Related files:** ExaminationPersistenceProvider, examination section components (E1–E11), form config

**Hypothesis:** The examination route acts as layout-level orchestrator combining form state, persistence, progress tracking, and navigation gating in one file. The localStorage fallback for completion state (`getLocalExamCompletion`) suggests a race condition workaround that may indicate a deeper data flow issue in how examination completion propagates.

**What a trace would reveal:** Whether the persistence provider cleanly separates concerns or if the route is doing too much orchestration. Whether the localStorage fallback is papering over an async gap.

### 4. Questionnaire dashboard data aggregation

**Entry point:** `apps/frontend/src/features/questionnaire-viewer/components/dashboard/DashboardView.tsx`
**Stats:** 17 commits; Axis2ScoreCard 746 lines (14 commits), questionnaire-tables 692 lines, SQStatusCard 10 commits
**Related files:** All dashboard/ components, questionnaire response hooks

**Hypothesis:** Each dashboard card independently transforms and scores the same raw questionnaire data with potentially inconsistent approaches. The 746-line Axis2ScoreCard and 692-line questionnaire-tables suggest components mixing data transformation, scoring logic, and presentation rather than using a shared scoring layer.

**What a trace would reveal:** Whether scoring logic is duplicated across cards, whether there's a missing shared scoring/transformation layer, and whether the fat components can be decomposed.

### 5. mapToCriteriaData boundary crossing

**Entry point:** `apps/frontend/src/features/evaluation/utils/map-to-criteria-data.ts`
**Stats:** Critical bridge between frontend examination data and dc-tmd evaluation
**Related files:** dc-tmd field references, examination FormValues type, CriteriaData type

**Hypothesis:** This transform must stay in sync with both the examination form schema and the dc-tmd field reference strings. If the contract is implicit (string-based field paths with no compile-time enforcement), it's a fragile coupling point that breaks silently when either side changes.

**What a trace would reveal:** Whether the field reference contract is enforced at compile time or is purely string-based, and how brittle the coupling actually is.

## Systemic issues

- **Dual encoding risk:** dc-tmd criteria definitions and frontend decision tree data encode the same diagnostic logic in parallel, with no automated sync (candidate 2)
- **God component pattern:** EvaluationView (596 lines) orchestrates too many concerns — may recur in other route-level components (candidate 1)
- **Fat presentation components:** Multiple 600-700+ line components in questionnaire dashboard mixing transformation and rendering (candidate 4)
