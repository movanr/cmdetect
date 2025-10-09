import { graphql } from "../graphql";

// Basic query to test organization access
export const getOrganizations = graphql(`
  query GetOrganizations {
    organization {
      id
      name
      city
      created_at
    }
  }
`);

// Query patient records for organization
export const getPatientRecords = graphql(`
  query GetPatientRecords($organizationId: String!) {
    patient_record(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { created_at: desc }
    ) {
      id
      created_at
      organization_id
    }
  }
`);

// Patient consent submission via Hasura Action
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

// Questionnaire response submission via Hasura Action
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
