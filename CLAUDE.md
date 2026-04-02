# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Hard Rules

- Never apply locally modified database schema, migrations, or Hasura metadata.

## Project Overview

CMDetect is a healthcare application monorepo for TMD (temporomandibular disorder) diagnostics. Built with TypeScript, it features a React 19 practitioner frontend, a React 19 patient questionnaire frontend, a Better Auth authentication server with Hono, and a Hasura GraphQL backend. The system implements multi-tenant organization isolation with role-based access control, end-to-end encryption for patient PII, and DC/TMD diagnostic criteria evaluation.

The application language is primarily German (medical UI), with English used for code and technical documentation.

## Architecture

This is a **pnpm workspace** with **Turbo v2** for build orchestration.

### Services

- **apps/auth-server** (port 3001): Better Auth + Hono authentication service. JWT tokens via JWKS (`/api/auth/jwks`), Hasura action handlers for anonymous operations (questionnaire submission, token validation), role switching endpoint. Branded types (`ValidatedRole`, `OrganizationUserId`) for type-safe authorization. Runs in Docker (Node 22 Alpine). Uses ESM with `NodeNext` module resolution — all imports require `.js` extensions.

- **apps/frontend** (port 3000): Practitioner frontend — React 19 + Vite 7 + TanStack Router + TanStack Query + shadcn/ui. Authenticated app for doctors, assistants, reception, admins. Key features: DC/TMD examination (dual-mode: form sheet + guided wizard), diagnostic evaluation with decision trees, diagnosis documentation, DOCX/PDF export, pain drawing evaluation, questionnaire viewer, encryption key management. Debounced auto-save (3s). i18n (EN/DE) via `src/config/i18n.ts`. Path aliases: `@` → `src/`, `@docs` → `docs/`.

- **apps/patient-frontend** (port 3002): Public patient questionnaire app — React 19 + Vite 7. No auth (Hasura public role). Client-side ECIES encryption of PII before submission. Flow: token validation → personal data → questionnaires → complete.

- **apps/hasura** (port 8080): Hasura GraphQL Engine v2 config — metadata, migrations, seeds. PostgreSQL 15 backend. JWT auth via JWKS, role-based permissions, organization isolation. Data connector agent on port 8081.

### Shared Packages

- **packages/config**: Shared role constants (`src/index.ts`)
- **packages/questionnaires**: Questionnaire definitions (GCPS-1M, JFLS-20, JFLS-8, OBC, PHQ-4, SQ) and Zod validation schemas
- **packages/dc-tmd**: DC/TMD diagnostic criteria evaluation engine, examination protocol IDs, German label maps
- **packages/test-utils**: Shared test utilities for integration tests

### Authentication & Multi-tenancy

- JWT tokens with Better Auth, organization isolation via `x-hasura-organization-id` claim
- Roles: `org_admin`, `physician`, `assistant`, `receptionist`, `unverified` with active role switching
- `x-hasura-user-id` contains user ID; email verification required for activation
- All tables require `organization_id` foreign key; all queries automatically scoped by organization

### End-to-End Encryption

Hybrid encryption (ECDSA P-256 + ECIES with AES-256-GCM). Public keys stored in database, private keys via BIP39 12-word mnemonic. Crypto module in `apps/frontend/src/crypto/`. Patient data encrypted client-side in patient frontend, decrypted by practitioners using organization private key.

### Database Tables

**Auth tables** (Better Auth): `user`, `account`, `session`, `verification`, `jwks`

**Application tables** (Hasura migrations): `organization`, `patient_record` (encrypted PII + invite tokens), `patient_consent`, `questionnaire_response`, `examination_response` (E1-E11, `examined_by`), `diagnosis_result`, `documented_diagnosis`, `criteria_assessment`

### Hasura Actions (auth-server handlers)

- `validateInviteToken` — token validation returning organization public key
- `submitPatientPersonalData` — encrypted PII submission
- `submitQuestionnaireResponse` — questionnaire answer submission
- `getPatientProgress` (query) — patient's completion status

## Commands

### Development

```bash
pnpm install                    # Install dependencies
pnpm build:deps                 # Build shared packages (required before first dev)
docker compose up -d            # Start PostgreSQL, Hasura, data connector, auth-server
pnpm --filter @cmdetect/auth-server migrate  # Run Better Auth migrations
pnpm dev                        # Start all services (auth-server, frontend, patient-frontend)
pnpm auth:dev                   # Start auth server only
pnpm frontend:dev               # Start practitioner frontend only
pnpm --filter @cmdetect/patient-frontend dev  # Start patient frontend only
```

### Build & Check

```bash
pnpm build                      # Build all packages (Turbo pipeline)
pnpm type-check                 # Type check all packages
pnpm lint                       # ESLint across all packages
pnpm codegen                    # Generate GraphQL types (requires running Hasura)
```

Run `pnpm codegen` after modifying GraphQL operations, Hasura schema, or pulling metadata changes. Generated files are not tracked in git. Auth-server does NOT need codegen.

### Testing

```bash
pnpm test                       # Integration tests (Jest, requires Docker services)
pnpm test:permissions           # Hasura permission tests only
pnpm test tests/path/to/test.ts # Specific test file
pnpm --filter @cmdetect/dc-tmd test       # DC/TMD unit tests (Vitest)
pnpm --filter @cmdetect/frontend test     # Frontend unit tests (Vitest)
```

**Test users** (password: `TestPassword123!`): `admin@test.com` (org_admin), `physician@test.com` (physician), `receptionist@test.com` (receptionist), `unverified@test.com` (no roles)

### Database

```bash
pnpm --filter @cmdetect/auth-server seed:users          # Create test users
pnpm --filter @cmdetect/auth-server seed:users:cleanup   # Remove test users
```

## Development Patterns

### Adding New Features

1. Create Hasura migrations for database changes
2. Add role-based permissions in Hasura metadata
3. Add queries/mutations to frontend `queries.ts` files
4. Run `pnpm codegen`
5. Add permission tests to `tests/` to verify access control

### Frontend Feature Module Convention

Each feature in `apps/frontend/src/features/` follows: `index.ts` (exports), `queries.ts` (GraphQL), `types.ts`, `hooks/`, `components/`, `utils/`.

Features: case-workflow, examination, evaluation, decision-tree, pain-drawing-evaluation, patient-records, questionnaire-viewer, protocol, team, key-setup.

### Multi-tenant Considerations

- All new tables need `organization_id` foreign key
- Test cross-organization access denial for new entities
- User metadata must contain valid `organizationId`

### UI Stack

shadcn/ui + Tailwind CSS v4 + Radix UI primitives + Lucide React icons + Sonner toasts. shadcn components in `components/ui/` are generated and excluded from linting.

## Environment Configuration

Environment files use `.env.template` pattern (not `.env.example`). Templates are tracked in git; `.env` files are gitignored. See the template files for required variables.

Frontend `.env` files need `VITE_HASURA_GRAPHQL_URL` and `VITE_AUTH_SERVER_URL` (practitioner only). For local dev: `http://localhost:8080/v1/graphql` and `http://localhost:3001`.

### Docker

Three compose files: `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod, localhost-only ports), `docker-compose.bootstrap.yml` (initial setup without auth-server).

### Production Deployment

`scripts/deploy-app.sh` sources env from `/var/www/cmdetect/server.env` + `secrets.env`, generates `.env` files via `scripts/generate-envs.sh`, runs migrations, builds, and starts containers. Subdomain routing: `app.DOMAIN`, `patient.DOMAIN`, `api.DOMAIN`, `auth.DOMAIN`.

## Best Practices

- Verify reasonableness of your solution as you implement pieces of it
- Run `pnpm type-check` after changes across multiple packages
- Run `pnpm codegen` after modifying GraphQL operations or Hasura schema
