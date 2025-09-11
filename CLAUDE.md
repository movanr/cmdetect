# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CMDetect is a healthcare application monorepo built with TypeScript, featuring a React 19 frontend with end-to-end encryption, Better Auth v1.3.4 authentication server, and Hasura GraphQL backend. The system implements multi-tenant organization isolation with role-based access control and patient data encryption for medical practice management.

## Monorepo Structure

This is a **pnpm workspace** with **Turbo** for build orchestration:

- **apps/auth-server**: Better Auth v1.3.4 authentication service with JWT integration and action handlers
- **apps/frontend**: React 19 + TanStack Router v1.131 + TanStack Query v5.83 + Vite 6.1 + Tailwind CSS v4.1
- **apps/hasura**: Hasura GraphQL Engine v2.46.0 with PostgreSQL, metadata, and migrations
- **packages/config**: Shared configuration and validation schemas
- **packages/database**: Database utilities and shared database logic
- **tests/**: Integration tests focusing on Hasura permissions and organization isolation

## Development Commands

### Getting Started

- `pnpm install` - Install all dependencies across workspace
- `./scripts/setup-dev.sh` - Initial development setup (generates JWT keys, creates .env)
- `pnpm dev` - Start all services in parallel (frontend, auth server)

### Development Workflows

- `pnpm auth:dev` - Start auth server only
- `pnpm frontend:dev` - Start frontend only
- `pnpm hasura:console` - Open Hasura console for metadata/migration management

### Building and Testing

- `pnpm build` - Build all packages through Turbo pipeline
- `pnpm build:deps` - Build only shared packages (run before first dev)
- `pnpm type-check` - Type check all packages
- `pnpm lint` - Run linting across all packages
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

The system consists of three main services that must run together:

1. **Hasura GraphQL Engine** (port 8080)
   - PostgreSQL backend for patient/practice data
   - JWT authentication integration
   - Role-based permissions and organization isolation
2. **Authentication Server** (port 3001)
   - Better Auth with JWT tokens
   - Email verification workflow
   - Hasura action handlers for anonymous operations
3. **React Frontend** (port 3000)
   - TanStack Router for routing with type safety
   - TanStack Query for GraphQL data fetching
   - GraphQL Code Generator for type-safe operations
   - End-to-end encryption for patient PII using WebCrypto API

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

- `pnpm --filter @cmdetect/frontend codegen` - Generate types from Hasura schema
- GraphQL schema auto-downloaded from running Hasura instance
- Generated types in `apps/frontend/src/graphql/`

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

## Environment Configuration

### Required Environment Variables

**Root .env** (created by setup-dev.sh):

- `DATABASE_URL` - PostgreSQL connection for Better Auth
- `HASURA_DATABASE_URL` - Application database connection
- `BETTER_AUTH_SECRET` - Session encryption key (32+ characters)
- `HASURA_GRAPHQL_ADMIN_SECRET` - Admin access to Hasura
- `AUTH_SERVER_URL` - Service discovery URL for JWT keys
- `HASURA_GRAPHQL_JWT_SECRET` - JWT verification configuration

**Hasura .env** (apps/hasura/.env):

- `DB_URL` - PostgreSQL connection string
- `HASURA_ADMIN_SECRET` - Must match root .env
- `AUTH_SERVER_URL` - Must match auth server URL

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

### Database Connection Details

- **Auth Database**: Better Auth uses separate PostgreSQL database
- **Application Database**: Hasura connects to main PostgreSQL instance
- Both databases can run in same PostgreSQL container but are separate schemas

### Key File Locations

- **JWT Keys**: Generated in `.keys/` directory by setup script
- **Hasura Metadata**: `apps/hasura/metadata/` directory
- **Hasura Migrations**: `apps/hasura/migrations/cmdetect-postgres/`
- **GraphQL Generated Types**: `apps/frontend/src/graphql/`
- **Crypto Module**: `apps/frontend/src/lib/crypto/` (encryption utilities)
- **Action Handlers**: `apps/auth-server/src/routes/actions/` (Hasura action endpoints)

## Best practices

when implementing a solution, explicitly verify reasonableness of your solution as you implement pieces of the solution
