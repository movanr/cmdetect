import { GraphQLClient } from "graphql-request";
import { createAuthenticatedClient } from "./auth-server";

// Test Hasura endpoint - should point to your test instance
const HASURA_ENDPOINT =
  process.env.HASURA_GRAPHQL_ENDPOINT || "http://91.98.19.187:8080/v1/graphql";
const HASURA_ADMIN_SECRET =
  process.env.HASURA_GRAPHQL_ADMIN_SECRET || "your_test_admin_secret";

/**
 * Create a GraphQL client with admin privileges (bypasses all permissions)
 */
export function createAdminClient(): GraphQLClient {
  return new GraphQLClient(HASURA_ENDPOINT, {
    headers: {
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
  });
}

/**
 * Create multiple authenticated clients for testing different roles simultaneously
 * Note: These return promises since authentication is async
 */
export async function createTestClients() {
  return {
    admin: createAdminClient(),

    // Organization 1 users (authenticated via auth server)
    org1Admin: await createAuthenticatedClient('org1Admin'),
    org1Physician: await createAuthenticatedClient('org1Physician'), 
    org1Receptionist: await createAuthenticatedClient('org1Receptionist'),

    // Organization 2 users for isolation testing
    org2Admin: await createAuthenticatedClient('org2Admin'),
    org2Physician: await createAuthenticatedClient('org2Physician'),
  };
}

export type TestClients = Awaited<ReturnType<typeof createTestClients>>;
