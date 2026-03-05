# Documentation State

## Last session: 2026-03-05

What was done: Added `packages/dc-tmd/README.md` — covers criteria DSL, three-value evaluation, field-ref template system, evaluation pipeline, all 12 diagnoses, and public API overview. Also resolves the "dc-tmd field-ref template system" architecture backlog item since the README documents it in the "Field Reference Templates" section.
What was deferred: All remaining backlog items.
Next recommended: Add README to `apps/patient-frontend/` — public-facing app with crypto, invite tokens, Konva, no docs at all — scope M.
Open questions: None.

## Backlog

<!-- Ordered by priority. Tag each: API, Architecture, Onboarding, Stale, Inline, README -->

- [README] `apps/patient-frontend/` has no README — public-facing app with crypto, invite tokens, Konva — scope M — area `apps/patient-frontend/`
- [Inline] `apps/frontend/src/crypto/` — security-critical ECIES implementation with almost no JSDoc (5 lines, all in `fileRecovery.ts`); `encryption.ts`, `keyGeneration.ts`, `storage.ts` undocumented — scope M — area `apps/frontend/src/crypto/`
- [README] `packages/questionnaires/` has no README — shared across auth-server + both frontends — scope S — area `packages/questionnaires/`
- [Architecture] Auth + Hasura data flow — no doc showing JWT claims → Hasura permissions → RBAC chain — scope L — area root
- [Inline] `apps/auth-server/src/types.ts` branded types `ValidatedRole`/`OrganizationUserId` have no explanation of why they exist — scope S — area `apps/auth-server/src/`
- [README] `packages/config/` and `packages/test-utils/` have no READMEs — low priority, tiny packages — scope S — area `packages/`

## Coverage map

| Area                              | Status      | Notes                                                          |
| --------------------------------- | ----------- | -------------------------------------------------------------- |
| `packages/dc-tmd/`               | ✅ Good     | README added; JSDoc on all types and exports                   |
| `packages/questionnaires/src/`    | ✅ Good     | Good module-level doc in index.ts                              |
| `packages/config/src/`            | ✅ Good     | Module-level doc present                                       |
| `apps/frontend/src/features/*/`   | ✅ Partial  | Most index.ts files have brief module-level JSDoc              |
| `apps/auth-server/src/`           | ⚠️ Partial  | Some JSDoc on action handlers; types.ts thin; server.ts none   |
| `apps/auth-server/CLAUDE.md`      | ✅ Fixed    | Updated to reflect Hono migration (commit 1db5a62)             |
| `apps/frontend/README.md`         | ✅ Fixed    | Replaced boilerplate with accurate project overview            |
| `apps/frontend/src/crypto/`       | ❌ Missing  | Security-critical; almost no JSDoc                             |
| `apps/patient-frontend/`          | ❌ Missing  | No README                                                      |
| `packages/questionnaires/`        | ❌ Missing  | No README                                                      |
| `packages/test-utils/`            | ❌ Missing  | No README                                                      |
| `packages/config/`                | ❌ Missing  | No README (low priority)                                       |
