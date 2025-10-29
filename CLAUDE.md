# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CMDetect is a healthcare application monorepo built with TypeScript, featuring a React 19 frontend with end-to-end encryption, Better Auth v1.3.4 authentication server, and Hasura GraphQL backend. The system implements multi-tenant organization isolation with role-based access control and patient data encryption for medical practice management.

## Monorepo Structure

This is a **pnpm workspace** with **Turbo** for build orchestration:

- **apps/auth-server**: Better Auth v1.3.4 authentication service with JWT integration and action handlers
- **apps/frontend**: Practitioner frontend - React 19 + TanStack Router + TanStack Query (port 3000)
- **apps/patient-frontend**: Patient questionnaire frontend - React 19 + TanStack Router (port 3002)
- **apps/hasura**: Hasura GraphQL Engine v2.46.0 with PostgreSQL, metadata, and migrations
- **packages/config**: Shared configuration, role constants, and Zod environment validation (TypeScript)
- **tests/**: Integration tests focusing on Hasura permissions and organization isolation

## Development Commands

### Getting Started

1. **Install dependencies**: `pnpm install`
2. **Create .env file**: Copy `.env.example` to `.env` and configure environment variables
3. **Start PostgreSQL and Hasura**: `cd apps/hasura && docker-compose up -d`
4. **Run Better Auth migrations**: `pnpm --filter @cmdetect/auth-server migrate`
5. **Build shared packages**: `pnpm build:deps`
6. **Start development servers**: `pnpm dev` (starts all services in parallel)

### Development Workflows

- `pnpm auth:dev` - Start auth server only (port 3001)
- `pnpm frontend:dev` - Start practitioner frontend only (port 3000)
- `pnpm --filter @cmdetect/patient-frontend dev` - Start patient frontend only (port 3002)
- `pnpm hasura:console` - Open Hasura console for metadata/migration management

### Building and Testing

- `pnpm build` - Build all packages through Turbo pipeline
- `pnpm build:deps` - Build only shared packages (run before first dev)
- `pnpm type-check` - Type check all packages
- `pnpm lint` - Run linting across all packages
- `pnpm codegen` - Generate GraphQL types from Hasura schema (both frontends)
- `pnpm test` - Run integration tests (requires running Hasura/PostgreSQL)
- `pnpm test:permissions` - Run specific permission tests
- `pnpm test:watch` - Run tests in watch mode

### Database Operations

- `pnpm --filter @cmdetect/auth-server migrate` - Run Better Auth migrations
- `pnpm --filter @cmdetect/auth-server seed:users` - Create test users for all roles
- `pnpm --filter @cmdetect/auth-server seed:users:cleanup` - Remove test users
- `cd apps/hasura && docker-compose up -d` - Start PostgreSQL and Hasura services
- `cd apps/hasura && docker-compose down` - Stop all services

## Architecture

### Multi-Service Architecture

The system consists of four main services:

1. **Hasura GraphQL Engine** (port 8080)
   - PostgreSQL backend for patient/practice data
   - JWT authentication integration
   - Role-based permissions and organization isolation
   - Public role for anonymous patient questionnaire access

2. **Authentication Server** (port 3001)
   - Better Auth with JWT tokens
   - Email verification workflow
   - Hasura action handlers for anonymous operations
   - CORS configured for both frontends

3. **Practitioner Frontend** (port 3000) - `apps/frontend`
   - Authenticated application for doctors, reception, and admins
   - TanStack Router for routing with type safety
   - TanStack Query for GraphQL data fetching
   - GraphQL Code Generator for type-safe operations
   - Organization key management and patient data decryption
   - Requires authentication via Better Auth

4. **Patient Frontend** (port 3002) - `apps/patient-frontend`
   - Public-facing patient questionnaire application
   - No authentication required (uses public role)
   - Accesses Hasura via anonymous actions with invite tokens
   - Client-side encryption of patient PII before submission
   - Validates invite tokens to get organization public keys

### Authentication Flow

- JWT tokens with Better Auth (8-hour expiration)
- Multi-tenant organization isolation via `x-hasura-organization-id` claim
- Role-based access: `org_admin`, `physician`, `receptionist`, `unverified` with active role switching
- `x-hasura-user-id` contains `user_ui` for user identification
- Email verification required for account activation
- Anonymous access for patient questionnaire submission via invite tokens

### Database Architecture

**Two PostgreSQL databases:**

1. **Auth Database** (Better Auth): User accounts, sessions, email verification
2. **Application Database** (Hasura): Patients, patient records, questionnaire responses

**Key Tables:**

- `organization` (multi-tenant root with encryption keys: `public_key_pem`, `key_fingerprint`)
- `user` (Better Auth users with roles array and `organizationId`)
- `patient_record` (cases with encrypted PII: `first_name_encrypted`, `last_name_encrypted`, etc.)
- `patient_consent` (GDPR-compliant consent with version tracking)
- `questionnaire_response` (FHIR-compatible medical responses with unique constraints)
- `account`, `session`, `verification`, `jwks` (Better Auth tables)

## GraphQL Integration

### Code Generation

GraphQL types are automatically generated from the Hasura schema using GraphQL Code Generator:

- `pnpm codegen` - Generate types for all frontends (practitioner + patient)
- `pnpm --filter @cmdetect/frontend codegen` - Generate types for practitioner frontend only
- `pnpm --filter @cmdetect/patient-frontend codegen` - Generate types for patient frontend only

**When to run codegen:**
- After adding/modifying GraphQL queries or mutations in frontend code
- After changing Hasura schema (tables, permissions, relationships)
- After pulling changes that include Hasura metadata updates
- Requires running Hasura instance (schema is fetched from `http://localhost:8080/v1/graphql`)

**Generated files (NOT tracked in git):**
- `apps/frontend/src/graphql/gql.ts` - Generated query map
- `apps/frontend/src/graphql/graphql.ts` - Generated TypeScript types (121KB)
- `apps/frontend/src/graphql/fragment-masking.ts` - Generated fragment utilities
- `apps/patient-frontend/src/graphql/gql.ts` - Generated query map
- `apps/patient-frontend/src/graphql/graphql.ts` - Generated TypeScript types (114KB)
- `apps/patient-frontend/src/graphql/fragment-masking.ts` - Generated fragment utilities

**Custom files (tracked in git):**
- `apps/frontend/src/graphql/execute.ts` - Custom GraphQL execution with JWT auth
- `apps/frontend/src/graphql/index.ts` - Custom exports
- `apps/patient-frontend/src/graphql/execute.ts` - Custom GraphQL execution (no auth)
- `apps/patient-frontend/src/graphql/index.ts` - Custom exports

**Note:** Auth-server does NOT need codegen because it only receives HTTP requests from Hasura actions and doesn't make GraphQL queries.

### Key GraphQL Patterns

- **Organization isolation**: All queries automatically filtered by `x-hasura-organization-id`
- **Role permissions**: Different CRUD access per role (org_admin, physician, receptionist)
- **Anonymous operations**: Hasura actions for secure patient form submission with encryption
  - `submitPatientConsent`: Anonymous consent capture
  - `submitQuestionnaireResponse`: FHIR questionnaire submission
  - `submitPatientPersonalData`: Encrypted PII submission (NEW)
  - `validateInviteToken`: Token validation with organization public key (NEW)

## Testing Strategy

### Permission Testing (tests/)

- **Organization isolation**: Verifies multi-tenant data separation (`tests/permissions/`)
- **Role-based access**: Tests role-specific operation restrictions
- **Hasura actions**: Tests anonymous operations and encryption flow (`tests/actions/`)
- **Auth endpoints**: Tests role switching and JWT claims (`tests/auth-endpoints/`)
- **Sequential execution**: Tests run with `maxWorkers: 1` to avoid database conflicts
- **Clean state**: Each test starts with a fresh database state

### Test Environment Setup

```bash
# Ensure Hasura/PostgreSQL running
cd apps/hasura && docker-compose up -d

# Run permission tests
pnpm test:permissions

# Run single test file
pnpm test tests/permissions/specific-test.test.ts

# Tests use maxWorkers: 1 for sequential execution
# Each test starts with clean database state
```

## Local Development Port Configuration

**Port Assignment:**
- **3000** - Practitioner Frontend (`apps/frontend`) - Authenticated users
- **3001** - Auth Server (`apps/auth-server`) - Better Auth + Action handlers
- **3002** - Patient Frontend (`apps/patient-frontend`) - Public access
- **8080** - Hasura GraphQL Engine - Database API

**CORS Configuration:**
- **Auth Server**: Only needs CORS for practitioner frontend (port 3000)
  - Patient frontend doesn't call auth server directly
- **Hasura**: Needs CORS for BOTH frontends (ports 3000 and 3002)
  - Already configured in `docker-compose.yml`

**Important Notes:**
- Patient frontend uses **public role** (no authentication)
- Patient frontend accesses Hasura via **anonymous actions** only
- Practitioner frontend requires **JWT authentication**
- In production, use subdomains: `app.domain.com`, `patient.domain.com`, `api.domain.com`

## Environment Configuration

### Required Environment Variables

**Root .env** (copy from `.env.example`):

**Database Configuration (Shared by Better Auth + Hasura):**
- `POSTGRES_DB` - PostgreSQL database name (default: cmdetect)
- `POSTGRES_USER` - PostgreSQL username (default: postgres)
- `POSTGRES_PASSWORD` - PostgreSQL password (required)
- `POSTGRES_PORT` - PostgreSQL port (default: 5432)

**Hasura Configuration:**
- `HASURA_PORT` - Hasura GraphQL Engine port (default: 8080)
- `HASURA_GRAPHQL_ADMIN_SECRET` - Admin access to Hasura (required, 32+ chars)
- `HASURA_GRAPHQL_JWT_SECRET` - JWT verification config: `{"jwk_url":"http://host.docker.internal:3001/api/auth/jwks"}`
- `HASURA_GRAPHQL_UNAUTHORIZED_ROLE` - Default role for unauthenticated requests (default: public)
- `HASURA_GRAPHQL_ENABLE_CONSOLE` - Enable Hasura Console (true for dev, false for production)
- `HASURA_GRAPHQL_DEV_MODE` - Enable dev mode (true for dev, false for production)
- `HASURA_GRAPHQL_CORS_DOMAIN` - CORS domains (dev: *, prod: https://*.yourdomain.com)

**Auth Server Configuration (PM2 on Host):**
- `BETTER_AUTH_SECRET` - Better Auth session encryption key (required, 32+ chars)
- `FRONTEND_URL` - Practitioner frontend URL for CORS (dev: http://localhost:3000, prod: https://app.yourdomain.com)
- `PATIENT_FRONTEND_URL` - Patient frontend URL for CORS (dev: http://localhost:3002, prod: https://patient.yourdomain.com)

**SMTP Configuration (Optional - for Email Verification):**
- `SMTP_HOST` - SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP port (587 for TLS, 465 for SSL)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASS` - SMTP password/app password
- `SMTP_FROM` - From email address (optional, defaults to SMTP_USER)

**Frontend Environment Variables** (Vite apps):

- Frontends use `VITE_HASURA_GRAPHQL_URL` instead of direct database URLs
- For local dev with Caddy: `VITE_HASURA_GRAPHQL_URL=http://api.cmdetect.local/v1/graphql`
- For direct access: `VITE_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql`
- For production: `VITE_HASURA_GRAPHQL_URL=https://api.yourdomain.com/v1/graphql`
- Note: Frontend .env files are separate from root .env (Vite-specific requirement)
- Both practitioner and patient frontends use the same variable

**Important Notes:**

- **Shared Database**: Better Auth and Hasura use the same PostgreSQL database (cmdetect)
- **Auth Server Access**: Hasura accesses Auth Server via `host.docker.internal:3001` (Docker → Host)
- **Direct DB Access**: Auth Server action handlers query PostgreSQL directly (not through Hasura)
- **JWKS Authentication**: Better Auth generates JWT keys automatically, exposed at `/api/auth/jwks`

## Development Patterns

### Adding New Features

1. **Database changes**: Create Hasura migrations via console
2. **Permissions**: Add role-based permissions in Hasura metadata
3. **GraphQL operations**: Add queries/mutations to frontend
4. **Type generation**: Run `pnpm --filter @cmdetect/frontend codegen`
5. **Permission tests**: Add tests to verify access control

### Multi-tenant Considerations

- All new tables need `organization_id` foreign key
- All GraphQL operations automatically scoped by organization
- Test cross-organization access denial for new entities
- User metadata must contain valid `organizationId`

## Production Deployment

### Docker Services (apps/hasura/docker-compose.yml)

- PostgreSQL 15 with persistent volumes
- Hasura GraphQL Engine v2.46.0
- Data connector agent for extended database support
- Health checks and proper networking

### Security Notes

- Email verification required for all accounts
- CORS configured for specific development origins
- Admin secrets required for Hasura access
- Organization isolation enforced at database level
- End-to-end encryption for patient PII using ECDSA P-256 + ECIES

## End-to-End Encryption System

### Crypto Architecture (NEW)

**Hybrid Encryption Strategy:**

- **Organization Level**: ECDSA P-256 key pairs for each organization
- **Data Level**: ECIES (ECDH + AES-256-GCM) for encrypting patient PII
- **Key Storage**: Organization public keys in database, private keys via BIP39 mnemonic
- **Browser Implementation**: Noble Curves library (@noble/curves, @scure/bip39)

**Key Components:**

- **Crypto Module** (`apps/frontend/src/lib/crypto/`): Complete encryption/decryption utilities
- **BIP39 Integration**: 12-word mnemonic phrases for key backup and recovery
- **IndexedDB Storage**: Secure client-side storage for private keys
- **Invite Token Flow**: Organization public key discovery for patient data encryption

**Patient Data Flow:**

1. Patient visits invite URL with token
2. Frontend fetches organization public key via `validateInviteToken` action
3. Patient data encrypted client-side before submission
4. Encrypted data stored in `patient_record` table (`*_encrypted` fields)
5. Healthcare providers decrypt using organization private key

## Important Development Notes

### Test User Credentials

All test users use password: `TestPassword123!`

- `admin@test.com` (org_admin role)
- `physician@test.com` (physician role)
- `receptionist@test.com` (receptionist role)
- `unverified@test.com` (no roles)

### Package Manager Requirements

- This project uses **pnpm** workspaces, not npm or yarn
- Node.js >= 18.0.0 required
- pnpm >= 8.15.0 required (for latest workspace features)
- Turbo v1.13.4+ for build orchestration

## Module System Configuration

**Intentional Mix of CommonJS and ESM:**

- **Auth Server** (`apps/auth-server`): CommonJS (`"type": "commonjs"`)
  - Better Auth and Node.js backend work best with CommonJS
  - Compiles TypeScript to CommonJS for production
  - Uses `tsx` for development with TypeScript support

- **Frontends** (`apps/frontend`, `apps/patient-frontend`): ESM (`"type": "module"`)
  - Required by Vite bundler
  - Modern React with ESM imports
  - Browser-native module system

- **Shared Packages** (`packages/config`): ESM (`"type": "module"`)
  - Uses ESM but consumable by both CommonJS and ESM packages
  - TypeScript compiles to ESM with proper extensions

This configuration is intentional and allows each package to use the optimal module system for its runtime environment.

### Database Connection Details

- **Auth Database**: Better Auth uses separate PostgreSQL database
- **Application Database**: Hasura connects to main PostgreSQL instance
- Both databases can run in same PostgreSQL container but are separate schemas

### Key File Locations

- **JWT Keys**: Better Auth generates JWKS keys automatically (exposed at `/api/auth/jwks`)
- **Hasura Metadata**: `apps/hasura/metadata/` directory
- **Hasura Migrations**: `apps/hasura/migrations/cmdetect-postgres/`
- **GraphQL Generated Types**: `apps/frontend/src/graphql/`
- **Crypto Module**: `apps/frontend/src/lib/crypto/` (encryption utilities)
- **Action Handlers**: `apps/auth-server/src/routes/actions/` (Hasura action endpoints)
- **Shared Config Package**: `packages/config/src/index.ts` (role constants, env schemas, shared types)

## Best practices

- when implementing a solution, explicitly verify reasonableness of your solution as you implement pieces of the solution
