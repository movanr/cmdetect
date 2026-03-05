# Documentation State

## Last session: 2026-03-05

What was done: Initial codebase scan. Coverage map built. No documentation written yet.
What was deferred: All actual documentation work.
Next recommended: Fix `apps/auth-server/CLAUDE.md` — actively misleading (describes Express, references deleted files, wrong DB name/user). S effort, high priority.
Open questions: None.

## Backlog

<!-- Ordered by priority. Tag each: API, Architecture, Onboarding, Stale, Inline, README -->

- [Stale] `apps/auth-server/CLAUDE.md` describes Express (now Hono), references deleted `admin-routes.ts`, wrong DB name (`cmdetect_auth`), wrong DB user (`auth_user`), uses `npm` (project uses `pnpm`) — scope S — area `apps/auth-server/`
- [Stale] `apps/frontend/README.md` is boilerplate TanStack scaffold — says `npm install`/`npm run start`, "This project uses CSS for styling", no mention of CMDetect/shadcn/Tailwind — scope S — area `apps/frontend/`
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
| `apps/auth-server/CLAUDE.md`      | ❌ Stale    | Describes wrong framework, wrong files, wrong DB               |
| `apps/frontend/README.md`         | ❌ Stale    | Boilerplate scaffold, not CMDetect-specific                    |
| `apps/frontend/src/crypto/`       | ❌ Missing  | Security-critical; almost no JSDoc                             |
| `apps/patient-frontend/`          | ❌ Missing  | No README                                                      |
| `packages/dc-tmd/`                | ❌ Missing  | No README (good inline docs but no entry-point explanation)    |
| `packages/questionnaires/`        | ❌ Missing  | No README                                                      |
| `packages/test-utils/`            | ❌ Missing  | No README                                                      |
| `packages/config/`                | ❌ Missing  | No README (low priority)                                       |
