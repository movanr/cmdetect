import { GraphQLClient } from "graphql-request";
import { createAdminClient } from "./graphql-client";

function assertTestEnvironment(): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      `SAFETY: Destructive test operations require NODE_ENV=test.\n` +
        `Current NODE_ENV: ${process.env.NODE_ENV ?? "(unset)"}\n` +
        `Never set NODE_ENV=test on a server with real patient data.`
    );
  }
}

const adminClient = createAdminClient();

/**
 * Test if the database/Hasura is available
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Simple introspection query to test connectivity
    await adminClient.request(`
      query {
        __schema {
          queryType {
            name
          }
        }
      }
    `);
    return true;
  } catch (error) {
    return false;
  }
}

// TestDataIds is now imported from test-data.ts


/**
 * Clear application test data (NOT auth users or organizations)
 * Auth users and organizations are managed separately by the auth server seed script
 */
export async function clearTestData(): Promise<void> {
  assertTestEnvironment();
  // Delete only application data, leave auth users and organizations alone
  await adminClient.request(`
    mutation {
      delete_questionnaire_response(where: {}) {
        affected_rows
      }
      delete_patient_consent(where: {}) {
        affected_rows
      }
      delete_patient_record(where: {}) {
        affected_rows
      }
    }
  `);
}

/**
 * Set up basic test data for permission testing
 */
export async function setupTestData(): Promise<void> {
  // Note: Organizations and auth users are created separately via auth server seed script
  // No default test patient records needed - tests create their own as needed
}

/**
 * Reset database to clean state with fresh test data
 */
export async function resetTestDatabase(): Promise<void> {
  await clearTestData();
  await setupTestData();
}

/**
 * Creates a test patient record using an authenticated receptionist client
 * (organization_id and created_by are auto-set from the JWT), then sets
 * invite_expires_at via the admin client.
 *
 * Use this instead of inserting via admin client with hardcoded user IDs.
 */
export async function createTestPatientRecord(
  receptionistClient: GraphQLClient,
  adminClient: GraphQLClient,
  clinicInternalId: string,
  expiresInMs = 24 * 60 * 60 * 1000
): Promise<{ id: string; inviteToken: string }> {
  const result = (await receptionistClient.request(`
    mutation {
      insert_patient_record(objects: [{ clinic_internal_id: "${clinicInternalId}" }]) {
        returning { id invite_token }
      }
    }
  `)) as any;

  const id: string = result.insert_patient_record.returning[0].id;
  const inviteToken: string = result.insert_patient_record.returning[0].invite_token;

  await adminClient.request(`
    mutation {
      update_patient_record_by_pk(
        pk_columns: { id: "${id}" }
        _set: { invite_expires_at: "${new Date(Date.now() + expiresInMs).toISOString()}" }
      ) { id }
    }
  `);

  return { id, inviteToken };
}
