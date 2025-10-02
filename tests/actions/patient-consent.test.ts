/**
 * Tests for submit-patient-consent Hasura action handler
 * Tests the /actions/submit-patient-consent endpoint
 */

import { resetTestDatabase, testDatabaseConnection } from "../setup/database";
import { isAuthServerAvailable } from "../setup/auth-server";
import { createAdminClient } from "../setup/graphql-client";
import { TestDataIds } from "../setup/test-data";

describe("Patient Consent Action Handler", () => {
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
          clinic_internal_id: "P001-TEST",
          created_by: "${TestDataIds.users.org1Receptionist}",
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
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            consent_data: {
              consent_given: true,
              consent_text: "Test consent text",
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid invite token format");
    });

    it("should reject malformed invite_token", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: "not-a-uuid",
            consent_data: {
              consent_given: true,
              consent_text: "Test consent text",
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid invite token format");
    });

    it("should reject missing consent_data", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
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
      expect(data.error).toBe("Invalid consent data");
    });

    it("should reject missing consent_given", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            consent_data: {
              consent_text: "Test consent text",
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("consent_given must be a boolean");
    });

    it("should reject non-boolean consent_given", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            consent_data: {
              consent_given: "yes",
              consent_text: "Test consent text",
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("consent_given must be a boolean");
    });

    it("should reject missing consent_text", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            consent_data: {
              consent_given: true,
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("consent_text is required and must be a string");
    });

    it("should reject missing consent_version", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            consent_data: {
              consent_given: true,
              consent_text: "Test consent text"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("consent_version is required and must be a string");
    });
  });

  describe("Token Validation", () => {
    it("should reject invalid invite token", async () => {
      const invalidToken = "12345678-1234-1234-1234-123456789012";

      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: invalidToken,
            consent_data: {
              consent_given: true,
              consent_text: "Test consent text",
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid or expired invite token");
    });

    // TODO: Re-enable this test when we can properly handle expired tokens in test environment
    // Database constraints prevent creating records with past expiration dates
    it.skip("should reject expired invite token", async () => {
      // Test skipped due to database constraints on invite_expires_at
    });
  });

  describe("Successful Consent Submission", () => {
    it("should successfully submit consent with all required fields", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            consent_data: {
              consent_given: true,
              consent_text: "I agree to the terms and conditions of this medical treatment.",
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.patient_consent_id).toBeDefined();

      // Verify consent was stored in database
      const consentQuery = await adminClient.request(`
        query {
          patient_consent(where: {id: {_eq: "${data.patient_consent_id}"}}) {
            id
            patient_record_id
            consent_given
            consent_text
            consent_version
            consented_at
          }
        }
      `) as any;

      const consent = consentQuery.patient_consent[0];
      expect(consent.consent_given).toBe(true);
      expect(consent.consent_text).toBe("I agree to the terms and conditions of this medical treatment.");
      expect(consent.consent_version).toBe("v1.0");
      expect(consent.consented_at).toBeDefined();
    });

    it("should successfully submit consent with false consent_given", async () => {
      // Create another patient record for this test
      const newPatientResult = await adminClient.request(`
        mutation {
          insert_patient_record(objects: [{
            organization_id: "${TestDataIds.organizations.org1}",
            clinic_internal_id: "P002-TEST",
            created_by: "${TestDataIds.users.org1Receptionist}",
            invite_expires_at: "${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}"
          }]) {
            returning {
              invite_token
            }
          }
        }
      `) as any;

      const newInviteToken = newPatientResult.insert_patient_record.returning[0].invite_token;

      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: newInviteToken,
            consent_data: {
              consent_given: false,
              consent_text: "I do not consent to this treatment.",
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.patient_consent_id).toBeDefined();

      // Verify consent was stored correctly
      const consentQuery = await adminClient.request(`
        query {
          patient_consent(where: {id: {_eq: "${data.patient_consent_id}"}}) {
            consent_given
          }
        }
      `) as any;

      expect(consentQuery.patient_consent[0].consent_given).toBe(false);
    });

    it("should update existing consent (upsert functionality)", async () => {
      // First submission
      const firstResponse = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            consent_data: {
              consent_given: true,
              consent_text: "First consent text",
              consent_version: "v1.0"
            }
          }
        })
      });

      const firstData = await firstResponse.json();
      expect(firstData.success).toBe(true);

      // Second submission with same invite token (should update)
      const secondResponse = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            invite_token: inviteToken,
            consent_data: {
              consent_given: false,
              consent_text: "Updated consent text",
              consent_version: "v2.0"
            }
          }
        })
      });

      const secondData = await secondResponse.json();
      expect(secondData.success).toBe(true);

      // Verify only one consent record exists with updated data
      const consentQuery = await adminClient.request(`
        query {
          patient_consent(where: {patient_record_id: {_eq: "${patientRecordId}"}}) {
            id
            consent_given
            consent_text
            consent_version
          }
        }
      `) as any;

      expect(consentQuery.patient_consent).toHaveLength(1);
      const consent = consentQuery.patient_consent[0];
      expect(consent.consent_given).toBe(false);
      expect(consent.consent_text).toBe("Updated consent text");
      expect(consent.consent_version).toBe("v2.0");
    });

    it("should handle minimal consent data", async () => {
      // Create another patient record for this test
      const newPatientResult = await adminClient.request(`
        mutation {
          insert_patient_record(objects: [{
            organization_id: "${TestDataIds.organizations.org1}",
            clinic_internal_id: "P-MINIMAL",
            created_by: "${TestDataIds.users.org1Receptionist}",
            invite_expires_at: "${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}"
          }]) {
            returning {
              invite_token
            }
          }
        }
      `) as any;

      const minimalInviteToken = newPatientResult.insert_patient_record.returning[0].invite_token;

      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: {
            invite_token: minimalInviteToken,
            consent_data: {
              consent_given: true,
              consent_text: "Minimal consent text",
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.patient_consent_id).toBeDefined();

      // Verify consent was stored correctly
      const consentQuery = await adminClient.request(`
        query {
          patient_consent(where: {id: {_eq: "${data.patient_consent_id}"}}) {
            consent_given
            consent_text
            consent_version
          }
        }
      `) as any;

      const consent = consentQuery.patient_consent[0];
      expect(consent.consent_given).toBe(true);
      expect(consent.consent_text).toBe("Minimal consent text");
      expect(consent.consent_version).toBe("v1.0");
    });
  });
});