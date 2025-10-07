import { graphql } from "../graphql";

// Validate invite token and get organization public key
export const validateInviteToken = graphql(`
  mutation ValidateInviteToken($invite_token: String!) {
    validateInviteToken(invite_token: $invite_token) {
      valid
      public_key_pem
      organization_name
      patient_record_id
      expires_at
      error_message
    }
  }
`);

// Submit patient consent
export const submitPatientConsent = graphql(`
  mutation SubmitPatientConsent(
    $invite_token: String!
    $consent_data: ConsentInput!
  ) {
    submitPatientConsent(
      invite_token: $invite_token
      consent_data: $consent_data
    ) {
      success
      patient_consent_id
      error
    }
  }
`);

// Submit encrypted patient personal data
export const submitPatientPersonalData = graphql(`
  mutation SubmitPatientPersonalData(
    $invite_token: String!
    $patient_data: PatientPersonalDataInput!
  ) {
    submitPatientPersonalData(
      invite_token: $invite_token
      patient_data: $patient_data
    ) {
      success
      patient_record_id
      message
      error
    }
  }
`);

// Submit questionnaire response
export const submitQuestionnaireResponse = graphql(`
  mutation SubmitQuestionnaireResponse(
    $invite_token: String!
    $response_data: QuestionnaireResponseInput!
  ) {
    submitQuestionnaireResponse(
      invite_token: $invite_token
      response_data: $response_data
    ) {
      success
      questionnaire_response_id
      error
    }
  }
`);
