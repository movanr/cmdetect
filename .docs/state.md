# Documentation State

## Last session: 2026-03-05

What was done: Added JSDoc to all exported functions and types in `apps/frontend/src/crypto/` — `types.ts` (5 interfaces/constants), `keyGeneration.ts` (8 functions), `encryption.ts` (2 functions), `storage.ts` (4 functions), `fileRecovery.ts` (1 previously undocumented function). Coverage went from 4/19 to 19/19 exported symbols documented. Documented cryptographic algorithms (ECIES, ECDH P-256, AES-256-GCM, HKDF, BIP39), security properties (ephemeral keys, deterministic recovery), and non-obvious behavior (simplified PEM format, unencrypted IndexedDB storage).
What was deferred: All remaining backlog items.
Next recommended: Add README to `packages/questionnaires/` — shared across auth-server + both frontends, no entry-point documentation, scope S.
Open questions: None.

## Backlog

<!-- Ordered by priority. Tag each: API, Architecture, Onboarding, Stale, Inline, README -->

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
| `apps/frontend/README.md`         | ✅ Fixed    | Replaced boilerplate with accurate project overview            |
| `apps/patient-frontend/`          | ✅ Fixed    | README added with patient flow and feature overview            |
| `apps/auth-server/src/`           | ⚠️ Partial  | Some JSDoc on action handlers; types.ts thin; server.ts none   |
| `apps/auth-server/CLAUDE.md`      | ✅ Fixed    | Updated to reflect Hono migration (commit 1db5a62)             |
| `apps/frontend/src/crypto/`       | ✅ Good     | JSDoc on all 19 exported symbols; crypto algorithms documented |
| `packages/questionnaires/`        | ❌ Missing  | No README                                                      |
| `packages/test-utils/`            | ❌ Missing  | No README                                                      |
| `packages/config/`                | ❌ Missing  | No README (low priority)                                       |
