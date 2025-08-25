# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CMDetect is a healthcare application monorepo built with TypeScript, featuring a React frontend, Node.js authentication server, and Hasura GraphQL backend. The system implements multi-tenant organization isolation with role-based access control for medical practice management.

## Monorepo Structure

This is a **pnpm workspace** with **Turbo** for build orchestration:

- **apps/auth-server**: Better Auth-based authentication service with JWT integration for Hasura
- **apps/frontend**: React + TanStack Router + TanStack Query frontend with GraphQL codegen
- **apps/hasura**: Hasura GraphQL Engine with PostgreSQL, metadata, and migrations
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

### Authentication Flow

- JWT tokens with Better Auth (8-hour expiration)
- Multi-tenant organization isolation via `x-hasura-organization-id` claim
- Role-based access: `org_admin`, `physician`, `receptionist`, `unverified`
- `x-hasura-user-id` contains `app_uuid`
- Email verification required for account activation

### Database Architecture

**Two PostgreSQL databases:**

1. **Auth Database** (Better Auth): User accounts, sessions, email verification
2. **Application Database** (Hasura): Patients, patient records, questionnaire responses

**Key Tables:**

- `patient`, `user`, `organization` (multi-tenant base entities)
- `patient_record` (patient cases with workflow status and invite tokens)
- `questionnaire_response` (patient anamnesis data with multiple questionnaires per record)
- `patient_consent` (consent tracking with audit trail)

## GraphQL Integration

### Code Generation

- `pnpm --filter @cmdetect/frontend codegen` - Generate types from Hasura schema
- GraphQL schema auto-downloaded from running Hasura instance
- Generated types in `apps/frontend/src/graphql/`

### Key GraphQL Patterns

- **Organization isolation**: All queries automatically filtered by `x-hasura-organization-id`
- **Role permissions**: Different CRUD access per role (org_admin, physician, receptionist)
- **Anonymous operations**: Hasura actions for secure patient form submission

## Testing Strategy

### Permission Testing (tests/)

- **Organization isolation**: Verifies multi-tenant data separation
- **Role-based access**: Tests role-specific operation restrictions
- **Sequential execution**: Tests run with `maxWorkers: 1` to avoid database conflicts
- **Clean state**: Each test starts with a fresh database state

### Test Environment Setup

```bash
# Ensure Hasura/PostgreSQL running
cd apps/hasura && docker-compose up -d

# Run permission tests
pnpm test:permissions
```

## Environment Configuration

### Required Environment Variables

**Root .env** (created by setup-dev.sh):

- `POSTGRES_PASSWORD` - Database password for Docker
- `BETTER_AUTH_SECRET` - Session secret (32+ characters)
- `HASURA_ADMIN_SECRET` - Admin access to Hasura
- `AUTH_SERVER_URL` - URL for JWT key discovery
- `HASURA_GRAPHQL_JWT_SECRET` - JWT configuration for Hasura

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

## Best practices

when implementing a solution, explicitly verify reasonableness of your solution as you implement pieces of the solution
