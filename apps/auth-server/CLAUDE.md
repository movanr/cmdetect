# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js/TypeScript authentication server built with Better Auth, designed to integrate with Hasura GraphQL. The server provides JWT-based authentication with PostgreSQL as the backend database, email verification, and multi-tenant organization isolation with role-based access control.

## Development Commands

- `npm run dev` - Start development server with auto-reload using nodemon and tsx
- `npm run build` - Compile TypeScript to JavaScript in dist/ directory  
- `npm start` - Start production server from compiled JavaScript
- `npm run migrate` - Run Better Auth database migrations
- `npm run seed:users` - Create test users for all roles
- `npm run seed:users:cleanup` - Remove test users
- `npm run seed:single` - Create a single test user
- `npm run seed:single:cleanup` - Remove single test user

## Architecture

### Core Components

- **src/server.ts**: Express server setup with CORS, Helmet security, and Better Auth integration
- **src/auth.ts**: Better Auth configuration with JWT plugin for Hasura integration and email verification
- **src/email.ts**: Email service using Nodemailer for verification emails
- **src/admin-routes.ts**: Admin endpoints placeholder for future admin functionality
- **src/jwt-utils.ts**: JWT utilities for user authorization validation
- **src/types.ts**: TypeScript interfaces for JWT payloads

### Authentication Flow

The server uses Better Auth with:
- JWT tokens with RS256 asymmetric encryption (8-hour expiration)
- Multi-tenant organization isolation via `x-hasura-organization-id` claim
- Multi-role system stored in user metadata (roles array)
- Custom Hasura claims including `x-hasura-practitioner-id` for user linkage
- Email verification workflow (required for account activation)
- Metadata-driven role assignment

### Database Setup

- PostgreSQL 16 container via Docker Compose
- Database: `cmdetect_auth`
- User: `auth_user` 
- Port: 5432
- Healthcheck enabled

## JWT Claims Structure

The server generates JWT tokens with the following Hasura claims:
- `x-hasura-user-id`: Better Auth user ID
- `x-hasura-practitioner-id`: UUID from user metadata
- `x-hasura-organization-id`: UUID for organization isolation
- `x-hasura-default-role`: First role from metadata roles array
- `x-hasura-allowed-roles`: Full roles array from metadata
- `x-hasura-roles`: Additional roles array for convenience

## User Metadata Structure

Users store role and organization information in metadata:
```json
{
  "roles": ["org_admin", "physician"],
  "organizationId": "uuid",
  "practitionerId": "uuid"
}
```

Users without valid metadata get `unverified` role with limited access.

## Test Users

The seeding scripts create test users with different roles:

- `admin@test.com` (org_admin role)
- `physician@test.com` (physician role) 
- `receptionist@test.com` (receptionist role)
- `unverified@test.com` (no roles)

All test users use password: `TestPassword123!`

## Environment Variables Required

### Authentication Server
- `DATABASE_URL`: PostgreSQL connection string for Better Auth
- `BETTER_AUTH_SECRET`: Better Auth session secret (minimum 32 characters)
- `JWT_PRIVATE_KEY`: RS256 private key for JWT signing
- `PORT`: Server port (defaults to 3001)
- `FRONTEND_URL`: CORS origin (defaults to http://localhost:3000)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: Email configuration
- `POSTGRES_PASSWORD`: Database password for Docker setup

### Hasura Actions
- `HASURA_DATABASE_URL`: PostgreSQL connection string for Hasura database (patient data)
- `HASURA_ENDPOINT`: Hasura GraphQL endpoint URL
- `HASURA_ADMIN_SECRET`: Hasura admin secret for authenticated operations

## Development Setup

1. Start PostgreSQL: `docker-compose up -d`
2. Run migrations: `npm run migrate`
3. Create test users: `npm run seed:users`
4. Start development server: `npm run dev`

The server runs on port 3001 with:
- Auth endpoints at `/api/auth/*`
- Hasura action endpoints at `/api/hasura-actions/*`
- Admin endpoints at `/admin/*` (placeholder for future features)
- Health check at `/health`

## Hasura Actions

### Patient Anamnesis Submission

The server provides a Hasura action handler for anonymous patient anamnesis submission:

**Endpoint**: `POST /api/hasura-actions/submit-patient-anamnesis`

**Purpose**: Validates secure link tokens, processes patient consent and anamnesis data (including questionnaire responses), and updates registration status. Used by patients accessing anamnesis forms via email links - no authentication required.

**Features**:
- Link token validation with expiry checking
- Consent data collection with audit trail (IP, user agent)
- Multiple questionnaire responses per anamnesis submission
- Automatic status updates via database triggers
- Comprehensive error handling and validation

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

3. **Use JWT token for protected endpoints** (when admin features are added)

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.