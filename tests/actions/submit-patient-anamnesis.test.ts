import { createAdminClient } from '../setup/graphql-client';
import { TestDataIds } from '../setup/test-data';

describe('submit_patient_anamnesis Action', () => {
  let adminClient: ReturnType<typeof createAdminClient>;
  let validLinkToken: string;
  let registrationId: string;

  beforeAll(async () => {
    adminClient = createAdminClient();
  });

  beforeEach(async () => {
    // Create a test registration with a link_token for testing
    const registrationResult = await adminClient.request<{
      insert_patient_registration_one: {
        id: string;
        link_token: string;
      }
    }>(`
      mutation {
        insert_patient_registration_one(object: {
          organization_id: "${TestDataIds.organizations.org1}"
          patient_id: "${TestDataIds.patients.org1Patient1}"
          created_by_practitioner_id: "${TestDataIds.practitioners.org1Admin}"
          assigned_practitioner_id: "${TestDataIds.practitioners.org1Physician}"
          status: "pending"
          notes: "Test registration for action"
        }) {
          id
          link_token
        }
      }
    `);

    registrationId = registrationResult.insert_patient_registration_one.id;
    validLinkToken = registrationResult.insert_patient_registration_one.link_token;
    
    console.log(`Created test registration ${registrationId} with token ${validLinkToken}`);
  });

  afterEach(async () => {
    // Clean up test registration
    if (registrationId) {
      await adminClient.request(`
        mutation {
          delete_patient_registration_by_pk(id: "${registrationId}") {
            id
          }
        }
      `);
    }
  });

  describe('Successful Submission', () => {
    it('should successfully submit patient anamnesis with valid data', async () => {
      const consentData = {
        consent_given: true,
        consent_text: "I consent to the processing of my medical data",
        consent_version: "v1.0",
        ip_address: "127.0.0.1",
        user_agent: "Mozilla/5.0 (Test Browser)"
      };

      const questionnaireResponses = [
        {
          questionnaire: "symptoms-questionnaire",
          fhir_resource: {
            questionnaire: "symptoms-questionnaire",
            resourceType: "QuestionnaireResponse",
            status: "completed",
            item: [
              {
                linkId: "1",
                text: "Do you have fever?",
                answer: [{ valueBoolean: true }]
              },
              {
                linkId: "2", 
                text: "Rate your pain level (1-10)",
                answer: [{ valueInteger: 7 }]
              }
            ]
          }
        }
      ];

      const result = await adminClient.request<{
        submit_patient_anamnesis: {
          success: boolean;
          registration_id: string;
          message: string;
          submitted_questionnaires: string[];
          errors: string[];
        }
      }>(`
        mutation SubmitPatientAnamnesis(
          $linkToken: String!
          $consentData: PatientConsentInput!
          $questionnaireResponses: [QuestionnaireResponseInput!]!
        ) {
          submit_patient_anamnesis(
            link_token: $linkToken
            consent_data: $consentData
            questionnaire_responses: $questionnaireResponses
          ) {
            success
            registration_id
            message
            submitted_questionnaires
            errors
          }
        }
      `, {
        linkToken: validLinkToken,
        consentData,
        questionnaireResponses
      });

      expect(result.submit_patient_anamnesis.success).toBe(true);
      expect(result.submit_patient_anamnesis.registration_id).toBe(registrationId);
      expect(result.submit_patient_anamnesis.submitted_questionnaires).toContain("symptoms-questionnaire");
      expect(result.submit_patient_anamnesis.errors).toHaveLength(0);
    });
  });

  describe('Error Cases', () => {
    it('should reject invalid link_token', async () => {
      const consentData = {
        consent_given: true,
        consent_text: "I consent to the processing of my medical data",
        consent_version: "v1.0"
      };

      const questionnaireResponses = [
        {
          questionnaire: "test-questionnaire",
          fhir_resource: {
            questionnaire: "test-questionnaire",
            resourceType: "QuestionnaireResponse",
            status: "completed",
            item: []
          }
        }
      ];

      await expect(
        adminClient.request(`
          mutation {
            submit_patient_anamnesis(
              link_token: "invalid-token-12345"
              consent_data: {
                consent_given: true
                consent_text: "Test consent"
                consent_version: "v1.0"
              }
              questionnaire_responses: [{
                questionnaire: "test"
                fhir_resource: { questionnaire: "test" }
              }]
            ) {
              success
              errors
            }
          }
        `)
      ).rejects.toThrow();
    });

    it('should reject empty questionnaire responses array', async () => {
      await expect(
        adminClient.request(`
          mutation {
            submit_patient_anamnesis(
              link_token: "${validLinkToken}"
              consent_data: {
                consent_given: true
                consent_text: "Test consent"
                consent_version: "v1.0"
              }
              questionnaire_responses: []
            ) {
              success
              errors
            }
          }
        `)
      ).rejects.toThrow();
    });
  });
});