import { createAdminClient } from "./graphql-client";
import { TestPatientRecords } from "./test-data";

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
    }
  `);
}

/**
 * Set up basic test data for permission testing
 */
export async function setupTestData(): Promise<void> {
  // Note: Organizations and auth users are created separately via auth server seed script

  // Create test patient records (patient data is now part of patient_record)
  await adminClient.request(`
    mutation {
      insert_patient_record(objects: [
        {
          organization_id: "${TestPatientRecords.org1PatientRecord1.organizationId}",
          clinic_internal_id: "P001",
          created_by: "${TestPatientRecords.org1PatientRecord1.createdBy}",
          assigned_to: "${TestPatientRecords.org1PatientRecord1.assignedTo}"
        }
      ]) {
        affected_rows
        returning {
          id
          invite_token
        }
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
