/**
 * Tests for submit-patient-personal-data Hasura action handler
 * Tests the /actions/submit-patient-personal-data endpoint
 */

import { resetTestDatabase, testDatabaseConnection } from "../setup/database";
import { isAuthServerAvailable } from "../setup/auth-server";
import { createAdminClient } from "../setup/graphql-client";
import { TestDataIds } from "../setup/test-data";

describe("Patient Personal Data Action Handler", () => {
  const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || "http://localhost:3001";
  let patientRecordId: string;
  let inviteToken: string;
  const adminClient = createAdminClient();

  beforeAll(async () => {
    // Check services availability
    const hasuraAvailable = await testDatabaseConnection();
    const authServerAvailable = await isAuthServerAvailable();

    if (!hasuraAvailable) {
      throw new Error("Hasura is not available. Please start Hasura before running tests.");
    }
    if (!authServerAvailable) {
      throw new Error("Auth server is not available. Please start the auth server before running tests.");
    }

    // Reset test data and create fresh patient record
    await resetTestDatabase();
    await setupPatientRecord();
  });

  const setupPatientRecord = async () => {
    // Create a patient record with invite token for testing
    const result = await adminClient.request(`
      mutation {
        insert_patient_record(objects: [{
          organization_id: "${TestDataIds.organizations.org1}",
          clinic_internal_id: "P001-PERSONAL-DATA-TEST",
          created_by: "${TestDataIds.users.org1Receptionist}",
          assigned_to: "${TestDataIds.users.org1Physician}",
          invite_expires_at: "${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}"
        }]) {
          returning {
            id
            invite_token
          }
        }
      }
    `) as any;
    
    patientRecordId = result.insert_patient_record.returning[0].id;
    inviteToken = result.insert_patient_record.returning[0].invite_token;
  };

  describe("Input Validation", () => {
    it("should reject missing invite_token", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-personal-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            patient_data: {
              first_name_encrypted: "encrypted_john",
              last_name_encrypted: "encrypted_doe",
              gender_encrypted: "encrypted_male",
              date_of_birth_encrypted: "encrypted_1990-01-01"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid invite token format");
    });

    it("should reject malformed invite_token", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-personal-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: "not-a-uuid",
            patient_data: {
              first_name_encrypted: "encrypted_john",
              last_name_encrypted: "encrypted_doe",
              gender_encrypted: "encrypted_male",
              date_of_birth_encrypted: "encrypted_1990-01-01"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid invite token format");
    });

    it("should reject missing patient_data", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-personal-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid patient personal data");
    });

    it("should reject missing required encrypted fields", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-personal-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            patient_data: {
              first_name_encrypted: "encrypted_john",
              // Missing other required fields
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("last_name_encrypted is required and must be a non-empty string");
    });

    it("should reject empty encrypted fields", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-personal-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            patient_data: {
              first_name_encrypted: "",
              last_name_encrypted: "encrypted_doe",
              gender_encrypted: "encrypted_male",
              date_of_birth_encrypted: "encrypted_1990-01-01"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("first_name_encrypted is required and must be a non-empty string");
    });
  });

  describe("Token Validation", () => {
    it("should reject invalid invite token", async () => {
      const invalidToken = "12345678-1234-1234-1234-123456789012";

      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-personal-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: invalidToken,
            patient_data: {
              first_name_encrypted: "encrypted_john",
              last_name_encrypted: "encrypted_doe",
              gender_encrypted: "encrypted_male",
              date_of_birth_encrypted: "encrypted_1990-01-01"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid or expired invite token");
    });
  });

  describe("Successful Personal Data Submission", () => {
    it("should successfully submit encrypted personal data", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-personal-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            patient_data: {
              first_name_encrypted: "encrypted_john",
              last_name_encrypted: "encrypted_doe",
              gender_encrypted: "encrypted_male",
              date_of_birth_encrypted: "encrypted_1990-01-01"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.patient_record_id).toBe(patientRecordId);
      expect(data.message).toBe("Patient personal data submitted successfully");

      // Verify patient_data_completed_at was set (but don't check the encrypted data)
      const recordQuery = await adminClient.request(`
        query {
          patient_record(where: {id: {_eq: "${patientRecordId}"}}) {
            patient_data_completed_at
          }
        }
      `) as any;

      const record = recordQuery.patient_record[0];
      expect(record.patient_data_completed_at).not.toBeNull();
    });

    it("should reject duplicate submission", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-personal-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            patient_data: {
              first_name_encrypted: "encrypted_jane",
              last_name_encrypted: "encrypted_smith",
              gender_encrypted: "encrypted_female",
              date_of_birth_encrypted: "encrypted_1985-05-15"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Patient personal data has already been completed");
    });
  });
});