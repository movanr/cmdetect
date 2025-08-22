import { createAdminClient } from "./graphql-client";
import { TestDataIds } from "./test-data";

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
      delete_patient(where: {}) {
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

  // Create test patients
  await adminClient.request(`
    mutation {
      insert_patient(objects: [
        {
          id: "${TestDataIds.patients.org1Patient1}",
          organization_id: "${TestDataIds.organizations.org1}",
          clinic_internal_id: "P001",
          first_name_encrypted: "encrypted_john",
          last_name_encrypted: "encrypted_doe"
        },
        {
          id: "${TestDataIds.patients.org1Patient2}", 
          organization_id: "${TestDataIds.organizations.org1}",
          clinic_internal_id: "P002",
          first_name_encrypted: "encrypted_jane",
          last_name_encrypted: "encrypted_smith"
        },
        {
          id: "${TestDataIds.patients.org2Patient1}",
          organization_id: "${TestDataIds.organizations.org2}",
          clinic_internal_id: "P001",
          first_name_encrypted: "encrypted_bob",
          last_name_encrypted: "encrypted_johnson"
        }
      ]) {
        affected_rows
      }
    }
  `);
}

/**
 * Reset database to clean state with fresh test data
 */
export async function resetTestDatabase(): Promise<void> {
  await clearTestData();
  await setupTestData();
}
