# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Node.js/TypeScript authentication server built with **Hono 4.x** + `@hono/node-server` and **Better Auth**. Integrates with Hasura GraphQL via JWT (JWKS endpoint) and handles Hasura action requests. Shared PostgreSQL 15 database with Hasura.

## Development Commands

Run from the monorepo root with pnpm filter, or directly inside this package:

- `pnpm run dev` - Start development server with nodemon + tsx
- `pnpm run build` - Compile TypeScript to `dist/`
- `pnpm start` - Start production server from compiled JavaScript
- `pnpm run migrate` - Run Better Auth database migrations
- `pnpm run seed:users` - Create test users for all roles
- `pnpm run seed:users:cleanup` - Remove test users

## Architecture

### Source Files

- **src/server.ts**: Hono app setup — `secureHeaders()`, CORS, action secret middleware, route registration, global error handler, `@hono/node-server` entry point
- **src/auth.ts**: Better Auth configuration — JWT plugin for Hasura claims, email verification
- **src/actions.ts**: `ActionHandlers` class — Hasura action request handlers (anonymous operations)
- **src/auth-endpoints.ts**: `AuthEndpoints` class — authenticated endpoints (role switching)
- **src/database.ts**: `DatabaseService` class — direct PostgreSQL queries via `pg`
- **src/validation.ts**: Zod-based request validation for action payloads
- **src/errors.ts**: Typed error classes
- **src/env.ts**: Environment variable loading and validation
- **src/jwt-utils.ts**: JWT utilities for user authorization validation
- **src/types.ts**: TypeScript interfaces for JWT payloads and branded types
- **src/email.ts**: Nodemailer email service for verification emails

### Endpoints

**Hasura Actions** (`/actions/*`) — validated by `HASURA_ACTION_SECRET` header:
- `POST /actions/validate-invite-token`
- `POST /actions/submit-patient-consent`
- `POST /actions/submit-patient-personal-data`
- `POST /actions/submit-questionnaire-response`
- `POST /actions/get-patient-progress`

**Auth Endpoints** (authenticated, registered before Better Auth wildcard):
- `POST /api/auth/switch-role` — role switching

**Better Auth** (handles all remaining `/api/auth/*`):
- `GET/POST /api/auth/*` — sign-in, sign-up, session, JWKS, token, etc.

**Health:**
- `GET /health`

### Authentication Flow

- Better Auth issues JWT tokens with RS256 (8-hour expiration)
- JWKS endpoint: `/api/auth/jwks` — consumed by Hasura for JWT verification
- Multi-tenant organization isolation via `x-hasura-organization-id` claim
- Role-based access: `org_admin`, `physician`, `receptionist`, `unverified`
- Email verification required for account activation

### Database

- PostgreSQL 15 shared with Hasura
- Database: `cmdetect`, User: `postgres`, Port: 5432
- Action handlers query PostgreSQL directly — no Hasura API calls needed

## JWT Claims Structure

- `x-hasura-user-id`: Better Auth user ID
- `x-hasura-practitioner-id`: UUID from user metadata
- `x-hasura-organization-id`: UUID for organization isolation
- `x-hasura-default-role`: First role from metadata roles array
- `x-hasura-allowed-roles`: Full roles array from metadata

## User Metadata Structure

```json
{
  "roles": ["org_admin", "physician"],
  "organizationId": "uuid",
  "practitionerId": "uuid"
}
```

Users without valid metadata get `unverified` role with limited access.

## Test Users

All test users use password: `TestPassword123!`

- `admin@test.com` (org_admin role)
- `physician@test.com` (physician role)
- `receptionist@test.com` (receptionist role)
- `unverified@test.com` (no roles)

## Environment Variables

The auth server reads from the root `.env` file (not `apps/auth-server/.env`).

**Required:**
- `POSTGRES_DB` — database name (default: `cmdetect`)
- `POSTGRES_USER` — database username (default: `postgres`)
- `POSTGRES_PASSWORD` — database password
- `POSTGRES_HOST` — database host
- `POSTGRES_PORT` — database port (default: `5432`)
- `BETTER_AUTH_SECRET` — session encryption key (32+ chars)
- `FRONTEND_URL` — practitioner frontend URL for CORS

**Optional:**
- `HASURA_ACTION_SECRET` — shared secret for Hasura action request validation; if unset, validation is skipped (warning logged)
- `PATIENT_FRONTEND_URL` — patient frontend URL for additional CORS
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — email delivery

## Development Setup

1. Start PostgreSQL and Hasura: `docker compose up -d`
2. Run migrations: `pnpm --filter @cmdetect/auth-server migrate`
3. Create test users: `pnpm --filter @cmdetect/auth-server seed:users`
4. Start development server: `pnpm --filter @cmdetect/auth-server dev`

After source changes in Docker context: `docker compose build auth-server && docker compose up -d auth-server`

## Testing Authentication

1. **Sign in to get session token:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/sign-in/email \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@test.com", "password": "TestPassword123!"}'
   ```

2. **Get JWT token from session:**
   ```bash
   curl -X GET http://localhost:3001/api/auth/token \
     -H "Authorization: Bearer YOUR_SESSION_TOKEN"
   ```

3. **Switch active role:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/switch-role \
     -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"role": "physician"}'
   ```

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
