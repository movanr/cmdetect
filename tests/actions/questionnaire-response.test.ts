/**
 * Tests for submit-questionnaire-response Hasura action handler
 * Tests the /actions/submit-questionnaire-response endpoint
 */

import { resetTestDatabase, testDatabaseConnection, createTestPatientRecord } from "../setup/database";
import { isAuthServerAvailable, createAuthenticatedClient } from "../setup/auth-server";
import { createAdminClient } from "../setup/graphql-client";
import { TestDataIds } from "@cmdetect/test-utils";

describe("Questionnaire Response Action Handler", () => {
  const AUTH_SERVER_URL =
    process.env.AUTH_SERVER_URL || "http://localhost:3001";
  let patientRecordId: string;
  let inviteToken: string;
  let consentId: string;
  const adminClient = createAdminClient();
  let receptionistClient: Awaited<ReturnType<typeof createAuthenticatedClient>>;

  beforeAll(async () => {
    // Check services availability
    const hasuraAvailable = await testDatabaseConnection();
    const authServerAvailable = await isAuthServerAvailable();

    if (!hasuraAvailable) {
      throw new Error(
        "Hasura is not available. Please start Hasura before running tests."
      );
    }
    if (!authServerAvailable) {
      throw new Error(
        "Auth server is not available. Please start the auth server before running tests."
      );
    }

    receptionistClient = await createAuthenticatedClient("org1Receptionist");

    // Reset test data and create necessary setup
    await resetTestDatabase();
    await setupPatientRecordWithConsent();
  });

  const setupPatientRecordWithConsent = async () => {
    ({ id: patientRecordId, inviteToken } = await createTestPatientRecord(
      receptionistClient, adminClient, "P001-QR-TEST"
    ));

    // Create consent for the patient record
    const consentResult = (await adminClient.request(`
      mutation {
        insert_patient_consent(objects: [{
          patient_record_id: "${patientRecordId}",
          organization_id: "${TestDataIds.organizations.org1}",
          consent_given: true,
          consent_text: "Test consent text",
          consent_version: "v1.0",
          consented_at: "2024-01-01T10:00:00Z"
        }]) {
          returning {
            id
          }
        }
      }
    `)) as any;

    consentId = consentResult.insert_patient_consent.returning[0].id;
  };

  // Valid response data for PHQ-4 (uses GenericAnswersSchema - accepts any key-value pairs)
  const validResponseData = {
    questionnaire_id: "phq-4",
    questionnaire_version: "v1.0",
    answers: { q1: 0, q2: 1, q3: 2, q4: 3 },
  };

  describe("Input Validation", () => {
    it("should reject missing invite_token", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              response_data: validResponseData,
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid invite token format");
    });

    it("should reject malformed invite_token", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "not-a-uuid",
              response_data: validResponseData,
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid invite token format");
    });

    it("should reject missing response_data", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid response data");
    });

    it("should reject non-object response_data", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: "not-an-object",
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid response data");
    });
  });

  describe("Response Data Validation", () => {
    it("should reject missing questionnaire_id", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                questionnaire_version: "v1.0",
                answers: { q1: 0 },
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should reject invalid questionnaire_id", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                questionnaire_id: "not-a-valid-id",
                questionnaire_version: "v1.0",
                answers: { q1: 0 },
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should reject missing questionnaire_version", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                questionnaire_id: "phq-4",
                answers: { q1: 0 },
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should reject missing answers", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                questionnaire_id: "phq-4",
                questionnaire_version: "v1.0",
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe("Token and Consent Validation", () => {
    it("should reject invalid invite token", async () => {
      const invalidToken = "12345678-1234-1234-1234-123456789012";

      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: invalidToken,
              response_data: validResponseData,
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid or expired invite token");
    });

    it("should reject expired invite token", async () => {
      const { inviteToken: expiredToken } = await createTestPatientRecord(
        receptionistClient, adminClient, "P-EXPIRED-QR", 1500
      );

      await new Promise(r => setTimeout(r, 2000));

      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: expiredToken,
              response_data: validResponseData,
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid or expired invite token");
    });

    it("should require consent before submitting questionnaire response", async () => {
      const { inviteToken: noConsentToken } = await createTestPatientRecord(
        receptionistClient, adminClient, "P-NO-CONSENT"
      );

      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: noConsentToken,
              response_data: validResponseData,
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        "No consent found for this patient record. Please submit consent first."
      );
    });
  });

  describe("Successful Response Submission", () => {
    it("should successfully submit a questionnaire response", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: validResponseData,
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.questionnaire_response_id).toBeDefined();

      // Verify response was stored in database
      const responseQuery = (await adminClient.request(`
        query {
          questionnaire_response(where: {id: {_eq: "${data.questionnaire_response_id}"}}) {
            id
            patient_record_id
            patient_consent_id
            organization_id
            response_data
            submitted_at
          }
        }
      `)) as any;

      const storedResponse = responseQuery.questionnaire_response[0];
      expect(storedResponse.patient_record_id).toBe(patientRecordId);
      expect(storedResponse.patient_consent_id).toBe(consentId);
      expect(storedResponse.organization_id).toBe(TestDataIds.organizations.org1);
      expect(storedResponse.response_data.questionnaire_id).toBe("phq-4");
      expect(storedResponse.response_data.questionnaire_version).toBe("v1.0");
      expect(storedResponse.response_data.answers).toEqual({ q1: 0, q2: 1, q3: 2, q4: 3 });
      expect(storedResponse.submitted_at).toBeDefined();
    });

    it("should allow multiple responses for the same patient record (different questionnaires)", async () => {
      const { id: newPatientRecordId, inviteToken: newInviteToken } =
        await createTestPatientRecord(receptionistClient, adminClient, "P-MULTI-QR");

      // Create consent
      await adminClient.request(`
        mutation {
          insert_patient_consent(objects: [{
            patient_record_id: "${newPatientRecordId}",
            organization_id: "${TestDataIds.organizations.org1}",
            consent_given: true,
            consent_text: "Test consent text",
            consent_version: "v1.0",
            consented_at: "2024-01-01T10:00:00Z"
          }]) {
            returning { id }
          }
        }
      `);

      // Submit two different questionnaires
      const firstResponse = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: newInviteToken,
              response_data: {
                questionnaire_id: "phq-4",
                questionnaire_version: "v1.0",
                answers: { q1: 0, q2: 0, q3: 0, q4: 0 },
              },
            },
          }),
        }
      );

      const secondResponse = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: newInviteToken,
              response_data: {
                questionnaire_id: "gcps-1m",
                questionnaire_version: "v1.0",
                answers: { q1: 5, q2: 3 },
              },
            },
          }),
        }
      );

      const firstData = await firstResponse.json();
      const secondData = await secondResponse.json();

      expect(firstData.success).toBe(true);
      expect(firstData.questionnaire_response_id).toBeDefined();
      expect(secondData.success).toBe(true);
      expect(secondData.questionnaire_response_id).toBeDefined();
      expect(firstData.questionnaire_response_id).not.toBe(secondData.questionnaire_response_id);
    });
  });
});
