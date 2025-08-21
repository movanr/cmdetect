import { createAdminClient } from './graphql-client';
import { 
  TestUsers, 
  TestOrganizations, 
  TestPatients, 
  TestRegistrations,
  TestDataIds 
} from './test-data';

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
 * Clear all test data from the database
 */
export async function clearTestData(): Promise<void> {
  // Delete in reverse dependency order
  await adminClient.request(`
    mutation {
      delete_questionnaire_response(where: {}) {
        affected_rows
      }
      delete_patient_consent(where: {}) {
        affected_rows
      }
      delete_patient_registration(where: {}) {
        affected_rows
      }
      delete_patient(where: {}) {
        affected_rows
      }
      delete_practitioner(where: {}) {
        affected_rows
      }
      delete_organization(where: {}) {
        affected_rows
      }
    }
  `);
}

/**
 * Set up basic test data for permission testing
 */
export async function setupTestData(): Promise<void> {
  // Create organizations
  await adminClient.request(`
    mutation {
      insert_organization(objects: [
        {
          id: "${TestDataIds.organizations.org1}",
          name: "Test Medical Practice 1",
          city: "Test City 1"
        },
        {
          id: "${TestDataIds.organizations.org2}",
          name: "Test Medical Practice 2", 
          city: "Test City 2"
        }
      ]) {
        affected_rows
      }
    }
  `);

  // Create practitioners from TestUsers (single source of truth)
  const practitionersGraphQL = Object.values(TestUsers).map(user => `
    {
      id: "${user.practitionerId}",
      auth_user_id: "${user.email}",
      email: "${user.email}",
      first_name: "${user.firstName}",
      last_name: "${user.lastName}",
      roles: ["${user.role}"],
      organization_id: "${user.organizationId}",
      is_active: ${user.isActive}
    }`).join(',');

  await adminClient.request(`
    mutation {
      insert_practitioner(objects: [${practitionersGraphQL}]) {
        affected_rows
      }
    }
  `);

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