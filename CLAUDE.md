# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CMDetect is a healthcare application monorepo for TMD (temporomandibular disorder) diagnostics. Built with TypeScript, it features a React 19 practitioner frontend, a React 19 patient questionnaire frontend, a Better Auth authentication server with Express 5, and a Hasura GraphQL backend. The system implements multi-tenant organization isolation with role-based access control, end-to-end encryption for patient PII, and DC/TMD diagnostic criteria evaluation.

## Monorepo Structure

This is a **pnpm workspace** with **Turbo v2** for build orchestration:

**Applications:**
- **apps/auth-server**: Better Auth authentication service with Express 5, JWT integration, and Hasura action handlers (port 3001)
- **apps/frontend**: Practitioner frontend - React 19 + Vite 7 + TanStack Router + TanStack Query (port 3000)
- **apps/patient-frontend**: Patient questionnaire frontend - React 19 + Vite 7 + TanStack Router (port 3002)
- **apps/hasura**: Hasura GraphQL Engine v2.46.0 configuration - metadata, migrations, and seeds

**Shared Packages:**
- **packages/config**: Shared role constants (single file: `src/index.ts`)
- **packages/questionnaires**: Questionnaire definitions (GCPS-1M, JFLS-20, JFLS-8, OBC, PHQ-4, SQ) and Zod validation schemas
- **packages/dc-tmd**: DC/TMD diagnostic criteria evaluation engine with decision tree logic
- **packages/test-utils**: Shared test utilities and helpers for integration tests

**Other Directories:**
- **tests/**: Integration tests for Hasura permissions, actions, and auth endpoints
- **scripts/**: Deployment and setup scripts (`deploy-app.sh`, `generate-envs.sh`, `backup.sh`, `initial-setup/`)
- **docs/**: DC/TMD reference documentation (diagnostic criteria, examination forms, pain drawing, questionnaires, scoring manual)

## Development Commands

### Getting Started

1. **Install dependencies**: `pnpm install`
2. **Create .env files**: Create root `.env` and frontend `.env` files with required variables (see Environment Configuration)
3. **Start PostgreSQL and Hasura**: `docker compose up -d` (from project root)
4. **Run Better Auth migrations**: `pnpm --filter @cmdetect/auth-server migrate`
5. **Build shared packages**: `pnpm build:deps`
6. **Start development servers**: `pnpm dev` (starts all services in parallel via Turbo)

### Development Workflows

- `pnpm dev` - Start all services in parallel (auth-server, frontend, patient-frontend)
- `pnpm auth:dev` - Start auth server only (port 3001)
- `pnpm frontend:dev` - Start practitioner frontend only (port 3000)
- `pnpm --filter @cmdetect/patient-frontend dev` - Start patient frontend only (port 3002)

### Building and Testing

- `pnpm build` - Build all packages through Turbo pipeline
- `pnpm build:deps` - Build shared config package (run before first dev)
- `pnpm type-check` - Type check all packages
- `pnpm lint` - Run ESLint across all packages (flat config, `eslint.config.js`)
- `pnpm codegen` - Generate GraphQL types from Hasura schema (both frontends)
- `pnpm test` - Run integration tests with Jest (requires running Hasura/PostgreSQL)
- `pnpm test:permissions` - Run Hasura permission tests only
- `pnpm test:watch` - Run integration tests in watch mode
- `pnpm --filter @cmdetect/dc-tmd test` - Run DC/TMD unit tests (Vitest)
- `pnpm --filter @cmdetect/frontend test` - Run frontend unit tests (Vitest)

### Database Operations

- `pnpm --filter @cmdetect/auth-server migrate` - Run Better Auth migrations
- `pnpm --filter @cmdetect/auth-server seed:users` - Create test users for all roles
- `pnpm --filter @cmdetect/auth-server seed:users:cleanup` - Remove test users
- `docker compose up -d` - Start PostgreSQL, Hasura, data connector, and auth-server
- `docker compose down` - Stop all Docker services

## Architecture

### Multi-Service Architecture

1. **Hasura GraphQL Engine** (port 8080)
   - PostgreSQL backend for patient/practice data
   - JWT authentication integration via JWKS
   - Role-based permissions and organization isolation
   - Public role for anonymous patient questionnaire access
   - Custom actions forwarded to auth-server

2. **Authentication Server** (port 3001) - `apps/auth-server`
   - Express 5 with Better Auth for JWT tokens
   - Email verification workflow (optional SMTP)
   - Hasura action handlers for anonymous operations (consent, questionnaire submission, token validation)
   - Custom auth endpoints (role switching, user listing)
   - CORS configured for practitioner frontend
   - Runs in Docker (Node 22 Alpine, multi-stage build)

3. **Practitioner Frontend** (port 3000) - `apps/frontend`
   - Authenticated application for doctors, reception, and admins
   - TanStack Router with type-safe routing and auto code-splitting
   - TanStack Query for GraphQL data fetching
   - GraphQL Code Generator for type-safe operations
   - shadcn/ui components with Tailwind CSS v4 and Radix UI primitives
   - Organization key management and patient data decryption
   - DC/TMD examination workflow (sections E1-E11)
   - Diagnostic evaluation with decision tree visualization
   - Pain drawing evaluation and scoring
   - Questionnaire viewer with anamnesis dashboard
   - Print-optimized report generation
   - Internationalization (EN/DE) via `src/config/i18n.ts`
   - Path aliases: `@` -> `src/`, `@docs` -> `docs/`

4. **Patient Frontend** (port 3002) - `apps/patient-frontend`
   - Public-facing patient questionnaire application
   - No authentication required (uses Hasura public role)
   - Accesses Hasura via anonymous actions with invite tokens
   - Client-side encryption of patient PII before submission
   - Pain drawing capture with Konva/react-konva
   - Step-based questionnaire engine with progress tracking
   - Framer Motion for animations

### Authentication Flow

- JWT tokens with Better Auth (exposed at `/api/auth/jwks`)
- Multi-tenant organization isolation via `x-hasura-organization-id` claim
- Role-based access: `org_admin`, `physician`, `receptionist`, `unverified` with active role switching
- `x-hasura-user-id` contains user ID for identification
- Email verification required for account activation
- Anonymous access for patient questionnaire submission via invite tokens

### Database Architecture

**Single PostgreSQL 15 database shared by Better Auth and Hasura:**

**Auth Tables** (managed by Better Auth):
- `user`, `account`, `session`, `verification`, `jwks`

**Application Tables** (managed by Hasura migrations):
- `organization` - Multi-tenant root with encryption keys (`public_key_pem`, `key_fingerprint`)
- `patient_record` - Cases with encrypted PII (`first_name_encrypted`, `last_name_encrypted`, `date_of_birth_encrypted`), invite tokens, submission tracking
- `patient_consent` - GDPR-compliant consent with version tracking
- `questionnaire_response` - Questionnaire answers with unique constraints per patient record
- `examination_response` - Clinical examination data (E1-E11 sections)
- `diagnosis_result` - DC/TMD diagnosis evaluation results

**Hasura Migrations:** `apps/hasura/migrations/default/`

## GraphQL Integration

### Code Generation

GraphQL types are generated from the Hasura schema using GraphQL Code Generator:

- `pnpm codegen` - Generate types for all frontends
- `pnpm --filter @cmdetect/frontend codegen` - Practitioner frontend only
- `pnpm --filter @cmdetect/patient-frontend codegen` - Patient frontend only

**When to run codegen:**
- After adding/modifying GraphQL queries or mutations in frontend code
- After changing Hasura schema (tables, permissions, relationships)
- After pulling changes that include Hasura metadata updates
- Requires running Hasura instance (schema fetched from `http://localhost:8080/v1/graphql`)

**Generated files (NOT tracked in git):**
- `apps/frontend/src/graphql/gql.ts`, `graphql.ts`, `fragment-masking.ts`
- `apps/patient-frontend/src/graphql/gql.ts`, `graphql.ts`, `fragment-masking.ts`

**Custom files (tracked in git):**
- `apps/frontend/src/graphql/execute.ts` - GraphQL execution with JWT auth
- `apps/frontend/src/graphql/index.ts` - Custom exports
- `apps/patient-frontend/src/graphql/execute.ts` - GraphQL execution (no auth)
- `apps/patient-frontend/src/graphql/index.ts` - Custom exports

**Note:** Auth-server does NOT need codegen - it receives HTTP requests from Hasura actions and queries PostgreSQL directly.

### Hasura Actions

All actions use the `public` role (anonymous access) and are handled by the auth-server:

- `validateInviteToken` - Token validation returning organization public key
- `submitPatientConsent` - Anonymous consent capture
- `submitPatientPersonalData` - Encrypted PII submission
- `submitQuestionnaireResponse` - Questionnaire answer submission
- `getPatientProgress` (query) - Patient's completion status (consent, personal data, questionnaires)

### Key GraphQL Patterns

- **Organization isolation**: All queries automatically filtered by `x-hasura-organization-id`
- **Role permissions**: Different CRUD access per role (org_admin, physician, receptionist)
- **Frontend queries**: Located in feature-specific `queries.ts` files and `src/queries/`

## Practitioner Frontend Features

The frontend is organized by feature modules in `apps/frontend/src/features/`:

- **case-workflow**: Patient case management, navigation, and status tracking
- **examination**: DC/TMD clinical examination (sections E1-E11) with form validation, version migration, edit mode, and completion workflow
- **evaluation**: Diagnostic evaluation with interactive decision trees, criteria checklists, and region-based findings
- **decision-tree**: Visual decision tree rendering for DC/TMD diagnostic criteria
- **pain-drawing-evaluation**: Pain area scoring and anatomical region analysis
- **patient-records**: Patient record CRUD, invite management, encrypted data display
- **questionnaire-viewer**: Anamnesis dashboard with questionnaire score visualization
- **protocol**: Examination protocol display
- **team**: Team member management
- **key-setup**: Organization encryption key generation and BIP39 mnemonic backup

## Testing Strategy

### Integration Tests (tests/ - Jest)

- **Permission tests** (`tests/permissions/`): Organization isolation and role-based access
- **Action tests** (`tests/actions/`): Anonymous Hasura action handlers
- **Auth endpoint tests** (`tests/auth-endpoints/`): Role switching and JWT claims
- **Configuration**: `jest.config.js` at root, `maxWorkers: 1` for sequential execution, 30s timeout
- **Setup**: `tests/setup/jest.setup.ts` for test environment initialization
- **Path mapping**: `@cmdetect/config` and `@cmdetect/test-utils` resolved via `moduleNameMapper`

### Unit Tests (Vitest)

- **DC/TMD package**: `pnpm --filter @cmdetect/dc-tmd test` - Diagnostic criteria logic tests
- **Frontend**: `pnpm --filter @cmdetect/frontend test` - Component and crypto tests
- **Patient frontend**: `pnpm --filter @cmdetect/patient-frontend test`

### Test Environment

```bash
# Start database services
docker compose up -d

# Run all integration tests
pnpm test

# Run specific test file
pnpm test tests/permissions/specific-test.test.ts

# Run DC/TMD unit tests
pnpm --filter @cmdetect/dc-tmd test
pnpm --filter @cmdetect/dc-tmd test:watch
```

### Test User Credentials

All test users use password: `TestPassword123!`

- `admin@test.com` (org_admin role)
- `physician@test.com` (physician role)
- `receptionist@test.com` (receptionist role)
- `unverified@test.com` (no roles)

## Docker Configuration

Three Docker Compose files at project root:

- **`docker-compose.yml`** - Development: PostgreSQL, Hasura, data connector, auth-server with open ports
- **`docker-compose.prod.yml`** - Production: Same services with localhost-only port bindings, stricter security, internal network isolation
- **`docker-compose.bootstrap.yml`** - Initial setup: PostgreSQL, Hasura, and data connector only (no auth-server, no JWT requirement) for running migrations before auth-server is built

**Auth Server Dockerfile** (`apps/auth-server/Dockerfile`):
- Multi-stage build (deps -> builder -> runner)
- Node 22 Alpine base
- Non-root user (`authserver`)
- Health check on `/health` endpoint

## Local Development Port Configuration

| Port | Service | Notes |
|------|---------|-------|
| 3000 | Practitioner Frontend | Authenticated users |
| 3001 | Auth Server | Better Auth + action handlers |
| 3002 | Patient Frontend | Public access, no auth |
| 5432 | PostgreSQL | Shared database |
| 8080 | Hasura GraphQL Engine | Database API |
| 8081 | Data Connector Agent | Hasura data connector |

## Environment Configuration

**Environment files use `.env.template` pattern** (not `.env.example`). Templates are tracked in git; generated `.env` files are gitignored.

### Root `.env`

**Database (Shared by Better Auth + Hasura):**
- `POSTGRES_DB` - Database name (default: cmdetect)
- `POSTGRES_USER` - Username (default: postgres)
- `POSTGRES_PASSWORD` - Password (required)
- `POSTGRES_PORT` - Port (default: 5432)

**Hasura:**
- `HASURA_PORT` - Hasura port (default: 8080)
- `HASURA_GRAPHQL_ADMIN_SECRET` - Admin access (required, 32+ chars)
- `HASURA_GRAPHQL_JWT_SECRET` - JWT config: `{"jwk_url":"http://auth-server:3001/api/auth/jwks"}`
- `HASURA_GRAPHQL_UNAUTHORIZED_ROLE` - Default unauthenticated role (default: public)
- `HASURA_GRAPHQL_ENABLE_CONSOLE` - Enable console (true for dev)
- `HASURA_GRAPHQL_DEV_MODE` - Dev mode (true for dev)
- `HASURA_GRAPHQL_CORS_DOMAIN` - CORS domains (dev: *, prod: https://*.domain)

**Auth Server:**
- `BETTER_AUTH_SECRET` - Session encryption key (required, 32+ chars)
- `FRONTEND_URL` - Practitioner frontend URL for CORS
- `PATIENT_FRONTEND_URL` - Patient frontend URL

**SMTP (Optional):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### Frontend `.env` Files

Both frontends use Vite environment variables:
- `VITE_HASURA_GRAPHQL_URL` - Hasura GraphQL endpoint
- `VITE_AUTH_SERVER_URL` - Auth server URL (practitioner frontend only)

For local development:
- `VITE_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql`
- `VITE_AUTH_SERVER_URL=http://localhost:3001`

### Production Deployment

Uses `scripts/deploy-app.sh` which:
1. Sources environment from `/var/www/cmdetect/server.env` and `secrets.env`
2. Generates `.env` files from templates via `scripts/generate-envs.sh`
3. Installs dependencies, runs bootstrap containers for migrations
4. Applies Hasura migrations and metadata via Hasura CLI
5. Generates GraphQL types and builds frontends
6. Starts production Docker containers

Production uses subdomain routing: `app.DOMAIN`, `patient.DOMAIN`, `api.DOMAIN`, `auth.DOMAIN`

## Module System Configuration

**Intentional Mix of CommonJS and ESM:**

- **Auth Server** (`apps/auth-server`): CommonJS (`"type": "commonjs"`)
  - Better Auth and Express 5 backend
  - Compiles TypeScript to CommonJS via `tsc`
  - Uses `tsx` for development with `nodemon`

- **Frontends** (`apps/frontend`, `apps/patient-frontend`): ESM (`"type": "module"`)
  - Required by Vite bundler
  - Modern React 19 with ESM imports

- **Shared Packages**: ESM (`"type": "module"`) for `config` and `questionnaires`
  - `packages/questionnaires` and `packages/dc-tmd`: Dual ESM/CJS output via `tsup` with conditional exports
  - `packages/config`: ESM only via `tsc`
  - `packages/test-utils`: No `"type"` field (implicitly CommonJS)

### ESM/CJS Bridge (questionnaires and dc-tmd packages)

These packages are consumed by both ESM (frontends) and CommonJS (auth-server) consumers:

1. **Dual format build** via `tsup`:
   ```typescript
   format: ["esm", "cjs"]  // Outputs both .js and .cjs
   ```

2. **Conditional exports** in `package.json`:
   ```json
   "exports": {
     ".": {
       "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
       "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
     }
   }
   ```

## End-to-End Encryption System

**Hybrid Encryption (ECDSA P-256 + ECIES):**

- **Organization Level**: ECDSA P-256 key pairs per organization
- **Data Level**: ECIES (ECDH + AES-256-GCM) for encrypting patient PII
- **Key Storage**: Public keys in database, private keys via BIP39 12-word mnemonic
- **Browser Implementation**: Noble Curves library (@noble/curves, @noble/ciphers, @noble/hashes, @scure/bip39)

**Crypto Module** (`apps/frontend/src/crypto/`):
- `keyGeneration.ts` - Key pair generation and BIP39 mnemonic
- `encryption.ts` - ECIES encrypt/decrypt utilities
- `storage.ts` - IndexedDB storage for private keys
- `fileRecovery.ts` - Key recovery from mnemonic
- `types.ts` - Crypto type definitions

**Patient Data Flow:**
1. Patient visits invite URL with token
2. Patient frontend validates token via `validateInviteToken` action, receives organization public key
3. Patient data encrypted client-side using ECIES before submission
4. Encrypted data stored in `patient_record` table (`*_encrypted` fields)
5. Healthcare providers decrypt using organization private key (recovered from mnemonic)

## DC/TMD Diagnostic System

### Packages

**`packages/dc-tmd`** - Diagnostic criteria evaluation engine:
- `src/criteria/diagnoses/` - Diagnosis definitions: arthralgia, degenerative joint disease, disc displacement, headache, myalgia, myalgia subtypes, subluxation
- `src/criteria/evaluate.ts` - Main evaluation entry point
- `src/categorization/` - Result categorization and anamnesis text generation
- Uses field references to extract data from examination and questionnaire responses

**`packages/questionnaires`** - Questionnaire definitions:
- `src/sq/` - Screening Questionnaire
- `src/gcps-1m/` - Graded Chronic Pain Scale (1 month)
- `src/jfls20/` - Jaw Functional Limitation Scale (20 items)
- `src/jfls8/` - Jaw Functional Limitation Scale (8 items)
- `src/obc/` - Oral Behaviors Checklist
- `src/phq4/` - Patient Health Questionnaire-4
- `src/schemas/` - Shared Zod schemas
- `src/validation/` - Validation utilities

### Examination Sections (E1-E11)

Clinical examination workflow in `apps/frontend/src/features/examination/sections/`:
- **E1**: Pain location regions
- **E2**: Incisal measurements (opening, overbite, overjet)
- **E3**: Opening pattern assessment
- **E4**: TMJ palpation (lateral pole)
- **E5**: TMJ palpation (around lateral pole)
- **E6**: Jaw movement pain assessment
- **E7**: Joint sounds during movement
- **E8**: Joint locking assessment
- **E9**: Muscle palpation
- **E10**: Additional findings
- **E11**: Comments and notes

## Development Patterns

### Adding New Features

1. **Database changes**: Create Hasura migrations via console or CLI
2. **Permissions**: Add role-based permissions in Hasura metadata
3. **GraphQL operations**: Add queries/mutations to frontend `queries.ts` files
4. **Type generation**: Run `pnpm codegen`
5. **Permission tests**: Add tests to `tests/` to verify access control

### Frontend Feature Module Convention

Each feature in `apps/frontend/src/features/` follows this structure:
- `index.ts` - Public exports
- `queries.ts` - GraphQL queries/mutations
- `types.ts` - TypeScript type definitions
- `hooks/` - React hooks
- `components/` - React components
- `utils/` - Utility functions

### Multi-tenant Considerations

- All new tables need `organization_id` foreign key
- All GraphQL operations automatically scoped by organization
- Test cross-organization access denial for new entities
- User metadata must contain valid `organizationId`

### UI Components

- shadcn/ui components in `apps/frontend/src/components/ui/` (generated, not linted)
- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Radix UI primitives for accessible components
- Lucide React for icons
- Sonner for toast notifications

## Key File Locations

- **Auth Server Source**: `apps/auth-server/src/` (flat structure: `server.ts`, `actions.ts`, `database.ts`, `auth.ts`, `validation.ts`, etc.)
- **Hasura Metadata**: `apps/hasura/metadata/`
- **Hasura Migrations**: `apps/hasura/migrations/default/`
- **Hasura Actions**: `apps/hasura/metadata/actions.yaml` and `actions.graphql`
- **GraphQL Generated Types**: `apps/frontend/src/graphql/` and `apps/patient-frontend/src/graphql/`
- **Crypto Module**: `apps/frontend/src/crypto/`
- **Frontend Features**: `apps/frontend/src/features/`
- **Frontend Routes**: `apps/frontend/src/routes/` (TanStack Router file-based routing)
- **i18n Strings**: `apps/frontend/src/config/i18n.ts`
- **Shared Config**: `packages/config/src/index.ts`
- **DC/TMD Criteria**: `packages/dc-tmd/src/criteria/`
- **Questionnaire Definitions**: `packages/questionnaires/src/`
- **DC/TMD Reference Docs**: `docs/dc-tmd/`
- **Deploy Scripts**: `scripts/deploy-app.sh`, `scripts/generate-envs.sh`
- **Docker Compose**: `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod), `docker-compose.bootstrap.yml` (setup)

## TypeScript Configuration

- **Base config** (`tsconfig.base.json`): ES2022 target, ESNext modules, bundler resolution, strict mode, React JSX
- **Root config** (`tsconfig.json`): Extends base, includes `tests/` with path aliases for `@cmdetect/config` and `@cmdetect/test-utils`
- **TypeScript 5.9+** across all packages

## Linting and Formatting

- **ESLint 9** with flat config (`eslint.config.js` at root)
- TypeScript plugin with `no-explicit-any: warn`, `no-unused-vars: warn` (with `_` prefix ignore)
- React plugin for frontend apps (hooks rules, refresh plugin)
- `apps/hasura/` and `components/ui/` (shadcn) excluded from linting
- Test files have relaxed rules (any allowed, require imports allowed)
- **Prettier** (`.prettierrc`): double quotes, semicolons, 100 char width, 2-space indent, ES5 trailing commas, LF line endings

## Package Manager Requirements

- **pnpm** workspaces (not npm or yarn)
- Node.js >= 18.0.0 (Node 22 in Docker)
- pnpm >= 8.0.0
- Turbo v2 for build orchestration

## Best Practices

- When implementing a solution, explicitly verify reasonableness of your solution as you implement pieces of it
- Run `pnpm type-check` after making changes across multiple packages
- Run `pnpm codegen` after modifying GraphQL operations or Hasura schema
- Build shared packages (`pnpm build:deps`) before running frontends for the first time
- Integration tests require running Docker services (`docker compose up -d`)
- The application language is primarily German (medical UI), with English used for code and technical documentation
