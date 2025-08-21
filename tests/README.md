# Hasura Permission Testing

This directory contains comprehensive tests for verifying Hasura permission configurations in the cmdetect medical practice management system.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start your test environment:**

   ```bash
   # Make sure Hasura and PostgreSQL are running
   docker-compose up -d
   ```

3. **Set environment variables:**

   ```bash
   export HASURA_TEST_ENDPOINT="http://localhost:8080/v1/graphql"
   export HASURA_ADMIN_SECRET="your_test_admin_secret"
   ```

4. **Generate GraphQL types (optional but recommended):**
   ```bash
   npm run codegen
   ```

## Running Tests

```bash
# Run all permission tests
npm run test:permissions

# Run tests in watch mode for development
npm run test:watch

# Run specific test file
npm test organization-isolation

# Run with verbose output
npm test -- --verbose
```

## Test Structure

### Core Test Categories

- **Organization Isolation** (`organization-isolation.test.ts`)

  - Verifies multi-tenant data separation
  - Tests cross-organization access denial
  - Validates organization-scoped operations

- **Role-Based Access** (`role-based-access.test.ts`)
  - Tests org_admin, physician, and receptionist permissions
  - Verifies role-specific operation restrictions
  - Validates hierarchical access controls

### Test Utilities


- **GraphQL Client** (`setup/graphql-client.ts`)

  - Role-based GraphQL clients
  - Admin client for setup operations
  - Automatic JWT token injection

- **Database Utils** (`setup/database.ts`)
  - Test data setup and cleanup
  - Consistent test UUIDs
  - Database reset between tests

## Key Testing Principles

1. **Test Isolation**: Each test runs with a clean database state
2. **Role Simulation**: Uses JWT tokens to simulate different user roles
3. **Permission Verification**: Tests both allowed and denied operations
4. **Organization Separation**: Verifies strict multi-tenant isolation

## Writing New Tests

1. **Create GraphQL operations** in `tests/graphql/` if needed
2. **Use existing test clients** from `setup/graphql-client.ts`
3. **Follow the pattern** of testing both positive and negative cases
4. **Test cross-organization access denial** for any new entities

Example test structure:

```typescript
import { createTestClients } from "../setup/graphql-client";

describe("New Feature Permissions", () => {
  let clients: ReturnType<typeof createTestClients>;

  beforeEach(() => {
    clients = createTestClients();
  });

  it("should allow authorized operation", async () => {
    // Test allowed operation
  });

  it("should deny unauthorized operation", async () => {
    // Test denied operation
    await expect(/* operation */).rejects.toThrow();
  });
});
```

## Environment Configuration

The tests expect the following environment variables:

- `HASURA_TEST_ENDPOINT`: GraphQL endpoint (default: http://localhost:8080/v1/graphql)
- `HASURA_ADMIN_SECRET`: Admin secret for test database operations

For production-like testing, use a separate test database and configure JWT secret to match your test setup.
