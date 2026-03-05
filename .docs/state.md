# Documentation State

## Last session: 2026-03-05

What was done: Fixed stale `apps/frontend/README.md` — replaced 291-line TanStack boilerplate with accurate project overview (correct commands, structure, patterns). Previous session fixed `apps/auth-server/CLAUDE.md` (commit 1db5a62).
What was deferred: All remaining backlog items.
Next recommended: Add README to `packages/dc-tmd/` — core diagnostic engine with no entry-point docs, scope M.
Open questions: None.

## Backlog

<!-- Ordered by priority. Tag each: API, Architecture, Onboarding, Stale, Inline, README -->

- [README] `packages/dc-tmd/` has no README — core diagnostic engine, imported by evaluation feature — scope M — area `packages/dc-tmd/`
- [README] `apps/patient-frontend/` has no README — public-facing app with crypto, invite tokens, Konva — scope M — area `apps/patient-frontend/`
- [Inline] `apps/frontend/src/crypto/` — security-critical ECIES implementation with almost no JSDoc (5 lines, all in `fileRecovery.ts`); `encryption.ts`, `keyGeneration.ts`, `storage.ts` undocumented — scope M — area `apps/frontend/src/crypto/`
- [README] `packages/questionnaires/` has no README — shared across auth-server + both frontends — scope S — area `packages/questionnaires/`
- [Architecture] dc-tmd field-ref template system (`${side}`, `${region}`, `${site}`) — non-obvious, no prose explanation anywhere — scope M — area `packages/dc-tmd/`
- [Architecture] Auth + Hasura data flow — no doc showing JWT claims → Hasura permissions → RBAC chain — scope L — area root
- [Inline] `apps/auth-server/src/types.ts` branded types `ValidatedRole`/`OrganizationUserId` have no explanation of why they exist — scope S — area `apps/auth-server/src/`
- [README] `packages/config/` and `packages/test-utils/` have no READMEs — low priority, tiny packages — scope S — area `packages/`

## Coverage map

| Area                              | Status      | Notes                                                          |
| --------------------------------- | ----------- | -------------------------------------------------------------- |
| `packages/dc-tmd/src/criteria/`   | ✅ Good     | JSDoc on all types, evaluate.ts well documented                |
| `packages/dc-tmd/src/index.ts`    | ✅ Good     | Good module-level doc                                          |
| `packages/questionnaires/src/`    | ✅ Good     | Good module-level doc in index.ts                              |
| `packages/config/src/`            | ✅ Good     | Module-level doc present                                       |
| `apps/frontend/src/features/*/`   | ✅ Partial  | Most index.ts files have brief module-level JSDoc              |
| `apps/auth-server/src/`           | ⚠️ Partial  | Some JSDoc on action handlers; types.ts thin; server.ts none   |
| `apps/auth-server/CLAUDE.md`      | ✅ Fixed    | Updated to reflect Hono migration (commit 1db5a62)             |
| `apps/frontend/README.md`         | ✅ Fixed    | Replaced boilerplate with accurate project overview            |
| `apps/frontend/src/crypto/`       | ❌ Missing  | Security-critical; almost no JSDoc                             |
| `apps/patient-frontend/`          | ❌ Missing  | No README                                                      |
| `packages/dc-tmd/`                | ❌ Missing  | No README (good inline docs but no entry-point explanation)    |
| `packages/questionnaires/`        | ❌ Missing  | No README                                                      |
| `packages/test-utils/`            | ❌ Missing  | No README                                                      |
| `packages/config/`                | ❌ Missing  | No README (low priority)                                       |
