/**
 * Tests for submit-questionnaire-response Hasura action handler
 * Tests the /actions/submit-questionnaire-response endpoint
 */

import { resetTestDatabase, testDatabaseConnection } from "../setup/database";
import { isAuthServerAvailable } from "../setup/auth-server";
import { createAdminClient } from "../setup/graphql-client";
import { TestDataIds } from "../setup/test-data";

describe("Questionnaire Response Action Handler", () => {
  const AUTH_SERVER_URL =
    process.env.AUTH_SERVER_URL || "http://localhost:3001";
  let patientRecordId: string;
  let inviteToken: string;
  let consentId: string;
  const adminClient = createAdminClient();

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

    // Reset test data and create necessary setup
    await resetTestDatabase();
    await setupPatientRecordWithConsent();
  });

  const setupPatientRecordWithConsent = async () => {
    // Create a patient record with invite token
    const patientRecordResult = (await adminClient.request(`
      mutation {
        insert_patient_record(objects: [{
          organization_id: "${TestDataIds.organizations.org1}",
          patient_id: "${TestDataIds.patients.org1Patient1}",
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
    `)) as any;

    patientRecordId = patientRecordResult.insert_patient_record.returning[0].id;
    inviteToken =
      patientRecordResult.insert_patient_record.returning[0].invite_token;

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

  describe("Input Validation", () => {
    const validFHIRResource = {
      resourceType: "QuestionnaireResponse",
      questionnaire: "http://example.com/questionnaire/123",
      status: "completed",
      item: [
        {
          linkId: "1",
          text: "What is your name?",
          answer: [
            {
              valueString: "John Doe",
            },
          ],
        },
      ],
    };

    it("should reject missing invite_token", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              response_data: {
                fhir_resource: validFHIRResource,
              },
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
              response_data: {
                fhir_resource: validFHIRResource,
              },
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

  describe("FHIR Validation", () => {
    it("should reject missing fhir_resource", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {},
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("FHIR resource must be an object");
    });

    it("should reject non-object fhir_resource", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                fhir_resource: "not-an-object",
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("FHIR resource must be an object");
    });

    it("should reject wrong resourceType", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                fhir_resource: {
                  resourceType: "Patient",
                  questionnaire: "http://example.com/questionnaire/123",
                  status: "completed",
                },
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("resourceType must be 'QuestionnaireResponse'");
    });

    it("should reject missing questionnaire field", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                fhir_resource: {
                  resourceType: "QuestionnaireResponse",
                  status: "completed",
                },
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        "questionnaire field is required and must be a string"
      );
    });

    it("should reject non-string questionnaire field", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                fhir_resource: {
                  resourceType: "QuestionnaireResponse",
                  questionnaire: 123,
                  status: "completed",
                },
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        "questionnaire field is required and must be a string"
      );
    });

    it("should reject missing status field", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                fhir_resource: {
                  resourceType: "QuestionnaireResponse",
                  questionnaire: "http://example.com/questionnaire/123",
                },
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("status field is required and must be a string");
    });

    it("should reject invalid status values", async () => {
      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                fhir_resource: {
                  resourceType: "QuestionnaireResponse",
                  questionnaire: "http://example.com/questionnaire/123",
                  status: "invalid-status",
                },
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe(
        "status must be one of: in-progress, completed, amended, entered-in-error, stopped"
      );
    });

    it("should accept all valid status values", async () => {
      const validStatuses = [
        "in-progress",
        "completed",
        "amended",
        "entered-in-error",
        "stopped",
      ];

      for (const status of validStatuses) {
        // Create a new patient record for each test to avoid conflicts
        const newPatientResult = (await adminClient.request(`
          mutation {
            insert_patient(objects: [{
              id: "test-patient-${status}",
              organization_id: "${TestDataIds.organizations.org1}",
              clinic_internal_id: "P-${status.toUpperCase()}",
              first_name_encrypted: "encrypted_test",
              last_name_encrypted: "encrypted_${status}"
            }]) {
              returning { id }
            }
            insert_patient_record(objects: [{
              organization_id: "${TestDataIds.organizations.org1}",
              patient_id: "test-patient-${status}",
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
        `)) as any;

        const newPatientRecordId =
          newPatientResult.insert_patient_record.returning[0].id;
        const newInviteToken =
          newPatientResult.insert_patient_record.returning[0].invite_token;

        // Create consent for the new patient record
        (await adminClient.request(`
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
        `)) as any;

        const response = await fetch(
          `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: {
                invite_token: newInviteToken,
                response_data: {
                  fhir_resource: {
                    resourceType: "QuestionnaireResponse",
                    questionnaire: "http://example.com/questionnaire/123",
                    status: status,
                  },
                },
              },
            }),
          }
        );

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.questionnaire_response_id).toBeDefined();
      }
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
              response_data: {
                fhir_resource: {
                  resourceType: "QuestionnaireResponse",
                  questionnaire: "http://example.com/questionnaire/123",
                  status: "completed",
                },
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid or expired invite token");
    });

    // TODO: Re-enable this test when we can properly handle expired tokens in test environment
    // Database constraints prevent creating records with past expiration dates
    it.skip("should reject expired invite token", async () => {
      // Test skipped due to database constraints on invite_expires_at
    });

    it("should require consent before submitting questionnaire response", async () => {
      // Create a patient record without consent
      const noConsentResult = (await adminClient.request(`
        mutation {
          insert_patient(objects: [{
            id: "test-patient-no-consent",
            organization_id: "${TestDataIds.organizations.org1}",
            clinic_internal_id: "P-NO-CONSENT",
            first_name_encrypted: "encrypted_no",
            last_name_encrypted: "encrypted_consent"
          }]) {
            returning { id }
          }
          insert_patient_record(objects: [{
            organization_id: "${TestDataIds.organizations.org1}",
            patient_id: "test-patient-no-consent",
            created_by: "${TestDataIds.users.org1Receptionist}",
            assigned_to: "${TestDataIds.users.org1Physician}",
            invite_expires_at: "${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}"
          }]) {
            returning {
              invite_token
            }
          }
        }
      `)) as any;

      const noConsentToken =
        noConsentResult.insert_patient_record.returning[0].invite_token;

      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: noConsentToken,
              response_data: {
                fhir_resource: {
                  resourceType: "QuestionnaireResponse",
                  questionnaire: "http://example.com/questionnaire/123",
                  status: "completed",
                },
              },
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
    it("should successfully submit a complete FHIR questionnaire response", async () => {
      const fhirResource = {
        resourceType: "QuestionnaireResponse",
        questionnaire: "http://example.com/questionnaire/patient-intake",
        status: "completed",
        authored: "2023-10-01T10:00:00Z",
        subject: {
          reference: "Patient/123",
        },
        item: [
          {
            linkId: "1",
            text: "What is your chief complaint?",
            answer: [
              {
                valueString: "Headache for the past week",
              },
            ],
          },
          {
            linkId: "2",
            text: "Rate your pain on a scale of 1-10",
            answer: [
              {
                valueInteger: 7,
              },
            ],
          },
          {
            linkId: "3",
            text: "Any allergies?",
            answer: [
              {
                valueBoolean: true,
              },
            ],
          },
        ],
      };

      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                fhir_resource: fhirResource,
              },
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
            fhir_resource
            submitted_at
          }
        }
      `)) as any;

      const storedResponse = responseQuery.questionnaire_response[0];
      expect(storedResponse.patient_record_id).toBe(patientRecordId);
      expect(storedResponse.patient_consent_id).toBe(consentId);
      expect(storedResponse.organization_id).toBe(
        TestDataIds.organizations.org1
      );
      expect(storedResponse.fhir_resource).toEqual(fhirResource);
      expect(storedResponse.submitted_at).toBeDefined();
    });

    it("should handle minimal valid FHIR questionnaire response", async () => {
      // Create another patient record for this test
      const newPatientResult = (await adminClient.request(`
        mutation {
          insert_patient(objects: [{
            id: "test-patient-minimal-fhir",
            organization_id: "${TestDataIds.organizations.org1}",
            clinic_internal_id: "P-MINIMAL-FHIR",
            first_name_encrypted: "encrypted_minimal",
            last_name_encrypted: "encrypted_fhir"
          }]) {
            returning { id }
          }
          insert_patient_record(objects: [{
            organization_id: "${TestDataIds.organizations.org1}",
            patient_id: "test-patient-minimal-fhir",
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
      `)) as any;

      const newPatientRecordId =
        newPatientResult.insert_patient_record.returning[0].id;
      const newInviteToken =
        newPatientResult.insert_patient_record.returning[0].invite_token;

      // Create consent for the new patient record
      (await adminClient.request(`
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
      `)) as any;

      const minimalFhirResource = {
        resourceType: "QuestionnaireResponse",
        questionnaire: "http://example.com/questionnaire/minimal",
        status: "in-progress",
      };

      const response = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: newInviteToken,
              response_data: {
                fhir_resource: minimalFhirResource,
              },
            },
          }),
        }
      );

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.questionnaire_response_id).toBeDefined();

      // Verify minimal response was stored correctly
      const responseQuery = (await adminClient.request(`
        query {
          questionnaire_response(where: {id: {_eq: "${data.questionnaire_response_id}"}}) {
            fhir_resource
          }
        }
      `)) as any;

      expect(responseQuery.questionnaire_response[0].fhir_resource).toEqual(
        minimalFhirResource
      );
    });

    it("should allow multiple responses for the same patient record", async () => {
      const firstResponse = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                fhir_resource: {
                  resourceType: "QuestionnaireResponse",
                  questionnaire: "http://example.com/questionnaire/first",
                  status: "completed",
                },
              },
            },
          }),
        }
      );

      const firstData = await firstResponse.json();
      expect(firstData.success).toBe(true);

      const secondResponse = await fetch(
        `${AUTH_SERVER_URL}/actions/submit-questionnaire-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: inviteToken,
              response_data: {
                fhir_resource: {
                  resourceType: "QuestionnaireResponse",
                  questionnaire: "http://example.com/questionnaire/second",
                  status: "completed",
                },
              },
            },
          }),
        }
      );

      const secondData = await secondResponse.json();
      expect(secondData.success).toBe(true);

      // Verify both responses exist
      const responseQuery = (await adminClient.request(`
        query {
          questionnaire_response(where: {patient_record_id: {_eq: "${patientRecordId}"}}) {
            id
            fhir_resource
          }
        }
      `)) as any;

      // Should have at least the 2 responses we just submitted
      expect(responseQuery.questionnaire_response.length).toBeGreaterThanOrEqual(2);

      const questionnaires = responseQuery.questionnaire_response.map(
        (r: any) => r.fhir_resource.questionnaire
      );
      expect(questionnaires).toContain(
        "http://example.com/questionnaire/first"
      );
      expect(questionnaires).toContain(
        "http://example.com/questionnaire/second"
      );
    });
  });
});
