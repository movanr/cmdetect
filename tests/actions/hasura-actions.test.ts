/**
 * Tests for Hasura Actions through GraphQL endpoint
 * Tests the validateInviteToken and other actions via Hasura GraphQL
 */

import { resetTestDatabase, testDatabaseConnection } from "../setup/database";
import { createAdminClient } from "../setup/graphql-client";
import { TestDataIds } from "../setup/test-data";

describe("Hasura Actions Integration", () => {
  let patientRecordId: string;
  let inviteToken: string;
  const adminClient = createAdminClient();
  const HASURA_URL =
    process.env.HASURA_URL || "http://localhost:8080/v1/graphql";

  beforeAll(async () => {
    // Check services availability
    const hasuraAvailable = await testDatabaseConnection();
    if (!hasuraAvailable) {
      throw new Error(
        "Hasura is not available. Please start Hasura before running tests."
      );
    }

    // Reset test data and create fresh patient record
    await resetTestDatabase();
    await setupPatientRecord();
  });

  const setupPatientRecord = async () => {
    // Add a test public key to the organization (pseudo key for testing only)
    const testPublicKey =
      "-----BEGIN PUBLIC KEY-----\\nBGRvTm90VXNlVGhpc0tleUluUHJvZHVjdGlvbkl0SXNPbmx5Rm9yVGVzdGluZ1B1cnBvc2VzT25seQ==\\n-----END PUBLIC KEY-----";

    await adminClient.request(`
      mutation {
        update_organization_by_pk(
          pk_columns: { id: "${TestDataIds.organizations.org1}" }
          _set: { public_key_pem: "${testPublicKey}" }
        ) {
          id
        }
      }
    `);

    // Create a patient record with invite token for testing
    const result = (await adminClient.request(`
      mutation {
        insert_patient_record(objects: [{
          organization_id: "${TestDataIds.organizations.org1}",
          clinic_internal_id: "P001-HASURA-ACTION-TEST",
          created_by: "${TestDataIds.users.org1Receptionist}",
          invite_expires_at: "${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}"
        }]) {
          returning {
            id
            invite_token
          }
        }
      }
    `)) as any;

    patientRecordId = result.insert_patient_record.returning[0].id;
    inviteToken = result.insert_patient_record.returning[0].invite_token;
  };

  const hasuraGraphQLRequest = async (query: string, variables?: any) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const response = await fetch(HASURA_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
    }
    return data.data;
  };

  describe("validateInviteToken Action", () => {
    it("should reject invalid invite token through GraphQL", async () => {
      const query = `
        mutation TestValidateInvite($token: String!) {
          validateInviteToken(invite_token: $token) {
            valid
            organization_name
            public_key_pem
            error_message
          }
        }
      `;

      const result = await hasuraGraphQLRequest(query, {
        token: "invalid-token-123",
      });

      expect(result.validateInviteToken.valid).toBe(false);
      expect(result.validateInviteToken.error_message).toBe(
        "Invalid invite token format"
      );
      expect(result.validateInviteToken.organization_name).toBeNull();
      expect(result.validateInviteToken.public_key_pem).toBeNull();
    });

    it("should validate correct invite token through GraphQL", async () => {
      const query = `
        mutation TestValidateInvite($token: String!) {
          validateInviteToken(invite_token: $token) {
            valid
            organization_name
            public_key_pem
            patient_record_id
            expires_at
            error_message
          }
        }
      `;

      const result = await hasuraGraphQLRequest(query, { token: inviteToken });

      expect(result.validateInviteToken.valid).toBe(true);
      expect(result.validateInviteToken.organization_name).toBe(
        "Test Medical Practice 1"
      );
      expect(result.validateInviteToken.public_key_pem).toContain(
        "BEGIN PUBLIC KEY"
      );
      expect(result.validateInviteToken.patient_record_id).toBe(
        patientRecordId
      );
      expect(result.validateInviteToken.expires_at).toBeDefined();
      expect(result.validateInviteToken.error_message).toBeNull();
    });

    it("should reject malformed UUID through GraphQL", async () => {
      const query = `
        mutation TestValidateInvite($token: String!) {
          validateInviteToken(invite_token: $token) {
            valid
            error_message
          }
        }
      `;

      const result = await hasuraGraphQLRequest(query, {
        token: "not-a-valid-uuid",
      });

      expect(result.validateInviteToken.valid).toBe(false);
      expect(result.validateInviteToken.error_message).toBe(
        "Invalid invite token format"
      );
    });
  });

  describe("submitPatientConsent Action", () => {
    it("should successfully submit consent through GraphQL", async () => {
      const query = `
        mutation SubmitConsent($token: String!, $consent: ConsentInput!) {
          submitPatientConsent(invite_token: $token, consent_data: $consent) {
            success
            patient_consent_id
            error
          }
        }
      `;

      const variables = {
        token: inviteToken,
        consent: {
          consent_given: true,
          consent_text: "I agree to the terms and conditions",
          consent_version: "v1.0",
        },
      };

      const result = await hasuraGraphQLRequest(query, variables);

      expect(result.submitPatientConsent.success).toBe(true);
      expect(result.submitPatientConsent.patient_consent_id).toBeDefined();
      expect(result.submitPatientConsent.error).toBeNull();
    });
  });

  describe("submitPatientPersonalData Action", () => {
    it("should successfully submit encrypted personal data through GraphQL", async () => {
      const query = `
        mutation SubmitPersonalData($token: String!, $data: PatientPersonalDataInput!) {
          submitPatientPersonalData(invite_token: $token, patient_data: $data) {
            success
            patient_record_id
            message
            error
          }
        }
      `;

      const variables = {
        token: inviteToken,
        data: {
          first_name_encrypted: "encrypted_jane",
          last_name_encrypted: "encrypted_doe",
          date_of_birth_encrypted: "encrypted_1990-01-01",
        },
      };

      const result = await hasuraGraphQLRequest(query, variables);

      expect(result.submitPatientPersonalData.success).toBe(true);
      expect(result.submitPatientPersonalData.patient_record_id).toBe(
        patientRecordId
      );
      expect(result.submitPatientPersonalData.message).toBe(
        "Patient personal data submitted successfully"
      );
      expect(result.submitPatientPersonalData.error).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent action gracefully", async () => {
      const query = `
        mutation NonExistentAction {
          nonExistentAction(input: "test") {
            result
          }
        }
      `;

      await expect(hasuraGraphQLRequest(query)).rejects.toThrow();
    });

    it("should handle missing required variables", async () => {
      const query = `
        mutation TestValidateInvite($token: String!) {
          validateInviteToken(invite_token: $token) {
            valid
            error_message
          }
        }
      `;

      // Don't provide the required $token variable
      await expect(hasuraGraphQLRequest(query, {})).rejects.toThrow();
    });
  });

  describe("Public Access", () => {
    it("should allow unauthenticated public access to validateInviteToken", async () => {
      const query = `
        mutation TestPublicAccess($token: String!) {
          validateInviteToken(invite_token: $token) {
            valid
            error_message
          }
        }
      `;

      // This should succeed without any authentication
      const result = await hasuraGraphQLRequest(query, { token: "test-token" });

      expect(result.validateInviteToken.valid).toBe(false);
      expect(result.validateInviteToken.error_message).toBe(
        "Invalid invite token format"
      );
    });
  });
});
