/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n": typeof types.GetOrganizationsDocument,
    "\n  query GetPatientRecords($organizationId: uuid!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      created_at\n      organization_id\n      notes\n    }\n  }\n": typeof types.GetPatientRecordsDocument,
    "\n  mutation SubmitPatientConsent(\n    $invite_token: String!\n    $consent_data: ConsentInput!\n  ) {\n    submitPatientConsent(\n      invite_token: $invite_token\n      consent_data: $consent_data\n    ) {\n      success\n      patient_consent_id\n      error\n    }\n  }\n": typeof types.SubmitPatientConsentDocument,
    "\n  mutation SubmitQuestionnaireResponse(\n    $invite_token: String!\n    $response_data: QuestionnaireResponseInput!\n  ) {\n    submitQuestionnaireResponse(\n      invite_token: $invite_token\n      response_data: $response_data\n    ) {\n      success\n      questionnaire_response_id\n      error\n    }\n  }\n": typeof types.SubmitQuestionnaireResponseDocument,
};
const documents: Documents = {
    "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n": types.GetOrganizationsDocument,
    "\n  query GetPatientRecords($organizationId: uuid!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      created_at\n      organization_id\n      notes\n    }\n  }\n": types.GetPatientRecordsDocument,
    "\n  mutation SubmitPatientConsent(\n    $invite_token: String!\n    $consent_data: ConsentInput!\n  ) {\n    submitPatientConsent(\n      invite_token: $invite_token\n      consent_data: $consent_data\n    ) {\n      success\n      patient_consent_id\n      error\n    }\n  }\n": types.SubmitPatientConsentDocument,
    "\n  mutation SubmitQuestionnaireResponse(\n    $invite_token: String!\n    $response_data: QuestionnaireResponseInput!\n  ) {\n    submitQuestionnaireResponse(\n      invite_token: $invite_token\n      response_data: $response_data\n    ) {\n      success\n      questionnaire_response_id\n      error\n    }\n  }\n": types.SubmitQuestionnaireResponseDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n"): typeof import('./graphql').GetOrganizationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPatientRecords($organizationId: uuid!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      created_at\n      organization_id\n      notes\n    }\n  }\n"): typeof import('./graphql').GetPatientRecordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitPatientConsent(\n    $invite_token: String!\n    $consent_data: ConsentInput!\n  ) {\n    submitPatientConsent(\n      invite_token: $invite_token\n      consent_data: $consent_data\n    ) {\n      success\n      patient_consent_id\n      error\n    }\n  }\n"): typeof import('./graphql').SubmitPatientConsentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitQuestionnaireResponse(\n    $invite_token: String!\n    $response_data: QuestionnaireResponseInput!\n  ) {\n    submitQuestionnaireResponse(\n      invite_token: $invite_token\n      response_data: $response_data\n    ) {\n      success\n      questionnaire_response_id\n      error\n    }\n  }\n"): typeof import('./graphql').SubmitQuestionnaireResponseDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
