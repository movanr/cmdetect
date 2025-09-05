/**
 * Tests for validate-invite-token Hasura action handler
 * Tests the /actions/validate-invite-token endpoint
 */

import { resetTestDatabase, testDatabaseConnection } from "../setup/database";
import { isAuthServerAvailable } from "../setup/auth-server";
import { createAdminClient } from "../setup/graphql-client";
import { TestDataIds } from "../setup/test-data";

describe("Validate Invite Token Action Handler", () => {
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
    // First, add a public key to the test organization
    const testPublicKey = "-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdef\\n-----END PUBLIC KEY-----";
    
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
    const result = await adminClient.request(`
      mutation {
        insert_patient_record(objects: [{
          organization_id: "${TestDataIds.organizations.org1}",
          clinic_internal_id: "P001-INVITE-VALIDATION-TEST",
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
      const response = await fetch(`${AUTH_SERVER_URL}/actions/validate-invite-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {}
        })
      });

      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error_message).toBe("Invalid invite token format");
    });

    it("should reject malformed invite_token", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/validate-invite-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: "not-a-uuid"
          }
        })
      });

      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error_message).toBe("Invalid invite token format");
    });
  });

  describe("Token Validation", () => {
    it("should reject invalid invite token", async () => {
      const invalidToken = "12345678-1234-1234-1234-123456789012";

      const response = await fetch(`${AUTH_SERVER_URL}/actions/validate-invite-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: invalidToken
          }
        })
      });

      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error_message).toBe("Invalid invite link");
    });

    it.skip("should handle expired invite token", async () => {
      // Create a patient record that expires very soon, then use database to manually update it to be expired
      const shortLivedResult = await adminClient.request(`
        mutation {
          insert_patient_record(objects: [{
            organization_id: "${TestDataIds.organizations.org1}",
            clinic_internal_id: "P002-EXPIRED-TEST",
            created_by: "${TestDataIds.users.org1Receptionist}",
            assigned_to: "${TestDataIds.users.org1Physician}",
            invite_expires_at: "${new Date(Date.now() + 1000).toISOString()}"
          }]) {
            returning {
              id
              invite_token
            }
          }
        }
      `) as any;

      const recordId = shortLivedResult.insert_patient_record.returning[0].id;
      const expiredToken = shortLivedResult.insert_patient_record.returning[0].invite_token;

      // Manually update the expiration to be in the past using database update
      await adminClient.request(`
        mutation {
          update_patient_record_by_pk(
            pk_columns: { id: "${recordId}" }
            _set: { invite_expires_at: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}" }
          ) {
            id
          }
        }
      `);

      const response = await fetch(`${AUTH_SERVER_URL}/actions/validate-invite-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: expiredToken
          }
        })
      });

      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error_message).toBe("Invite link has expired");
    });
  });

  describe("Successful Validation", () => {
    it("should successfully validate invite token and return organization details", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/validate-invite-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken
          }
        })
      });

      const data = await response.json();
      expect(data.valid).toBe(true);
      expect(data.organization_name).toBe("Test Medical Practice 1");
      expect(data.public_key_pem).toBeDefined();
      expect(typeof data.public_key_pem).toBe("string");
      expect(data.public_key_pem).toContain("BEGIN PUBLIC KEY");
      expect(data.patient_record_id).toBe(patientRecordId);
      expect(data.expires_at).toBeDefined();
      expect(data.error_message).toBeUndefined();
    });

    it("should return proper ISO datetime format for expires_at", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/validate-invite-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken
          }
        })
      });

      const data = await response.json();
      expect(data.valid).toBe(true);
      
      // Verify expires_at is a valid ISO datetime string
      const expiresAt = new Date(data.expires_at);
      expect(expiresAt.toString()).not.toBe("Invalid Date");
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("Organization Public Key Validation", () => {
    it("should handle organization without public key", async () => {
      // Create an organization without public key
      const orgWithoutKeyResult = await adminClient.request(`
        mutation {
          insert_organization(objects: [{
            name: "Org Without Key",
            public_key_pem: null
          }]) {
            returning {
              id
            }
          }
        }
      `) as any;

      const orgWithoutKeyId = orgWithoutKeyResult.insert_organization.returning[0].id;

      // Create patient record for this organization
      const patientResult = await adminClient.request(`
        mutation {
          insert_patient_record(objects: [{
            organization_id: "${orgWithoutKeyId}",
            clinic_internal_id: "P003-NO-KEY-TEST",
            created_by: "${TestDataIds.users.org1Receptionist}",
            assigned_to: "${TestDataIds.users.org1Physician}",
            invite_expires_at: "${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}"
          }]) {
            returning {
              invite_token
            }
          }
        }
      `) as any;

      const noKeyToken = patientResult.insert_patient_record.returning[0].invite_token;

      const response = await fetch(`${AUTH_SERVER_URL}/actions/validate-invite-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: noKeyToken
          }
        })
      });

      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error_message).toBe("Organization encryption not configured");
    });
  });
});