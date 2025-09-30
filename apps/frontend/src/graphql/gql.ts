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
    "\n  query GetOrganizationById($id: String!) {\n    organization_by_pk(id: $id) {\n      id\n      name\n      city\n      created_at\n      public_key_pem\n      key_fingerprint\n      key_created_at\n    }\n  }\n": typeof types.GetOrganizationByIdDocument,
    "\n  mutation UpdateOrganizationPublicKey(\n    $id: String!\n    $public_key_pem: String!\n    $key_fingerprint: String!\n    $key_created_at: timestamptz!\n  ) {\n    update_organization_by_pk(\n      pk_columns: { id: $id }\n      _set: {\n        public_key_pem: $public_key_pem\n        key_fingerprint: $key_fingerprint\n        key_created_at: $key_created_at\n      }\n    ) {\n      id\n      public_key_pem\n      key_fingerprint\n      key_created_at\n    }\n  }\n": typeof types.UpdateOrganizationPublicKeyDocument,
    "\n  query GetAllPatientRecords {\n    patient_record(\n      order_by: [{ created_at: desc }]\n    ) {\n      id\n      clinic_internal_id\n      invite_token\n      invite_expires_at\n      notes\n      created_at\n      created_by\n      first_viewed_at\n      first_viewed_by\n      last_activity_at\n      last_activity_by\n      patient_data_completed_at\n      first_name_encrypted\n      last_name_encrypted\n      date_of_birth_encrypted\n      patient_consent {\n        consent_given\n        created_at\n      }\n    }\n  }\n": typeof types.GetAllPatientRecordsDocument,
    "\n  query GetUsers {\n    user(\n      where: { isAnonymous: { _eq: false } }\n      order_by: [{ createdAt: desc }]\n    ) {\n      id\n      email\n      name\n      createdAt\n      emailVerified\n      organizationId\n    }\n  }\n": typeof types.GetUsersDocument,
    "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n": typeof types.GetOrganizationsDocument,
    "\n  query GetPatientRecords($organizationId: String!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      created_at\n      organization_id\n      notes\n    }\n  }\n": typeof types.GetPatientRecordsDocument,
    "\n  mutation SubmitPatientConsent(\n    $invite_token: String!\n    $consent_data: ConsentInput!\n  ) {\n    submitPatientConsent(\n      invite_token: $invite_token\n      consent_data: $consent_data\n    ) {\n      success\n      patient_consent_id\n      error\n    }\n  }\n": typeof types.SubmitPatientConsentDocument,
    "\n  mutation SubmitQuestionnaireResponse(\n    $invite_token: String!\n    $response_data: QuestionnaireResponseInput!\n  ) {\n    submitQuestionnaireResponse(\n      invite_token: $invite_token\n      response_data: $response_data\n    ) {\n      success\n      questionnaire_response_id\n      error\n    }\n  }\n": typeof types.SubmitQuestionnaireResponseDocument,
    "\n  query GetOrganizationPhysicians {\n    user {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n": typeof types.GetOrganizationPhysiciansDocument,
};
const documents: Documents = {
    "\n  query GetOrganizationById($id: String!) {\n    organization_by_pk(id: $id) {\n      id\n      name\n      city\n      created_at\n      public_key_pem\n      key_fingerprint\n      key_created_at\n    }\n  }\n": types.GetOrganizationByIdDocument,
    "\n  mutation UpdateOrganizationPublicKey(\n    $id: String!\n    $public_key_pem: String!\n    $key_fingerprint: String!\n    $key_created_at: timestamptz!\n  ) {\n    update_organization_by_pk(\n      pk_columns: { id: $id }\n      _set: {\n        public_key_pem: $public_key_pem\n        key_fingerprint: $key_fingerprint\n        key_created_at: $key_created_at\n      }\n    ) {\n      id\n      public_key_pem\n      key_fingerprint\n      key_created_at\n    }\n  }\n": types.UpdateOrganizationPublicKeyDocument,
    "\n  query GetAllPatientRecords {\n    patient_record(\n      order_by: [{ created_at: desc }]\n    ) {\n      id\n      clinic_internal_id\n      invite_token\n      invite_expires_at\n      notes\n      created_at\n      created_by\n      first_viewed_at\n      first_viewed_by\n      last_activity_at\n      last_activity_by\n      patient_data_completed_at\n      first_name_encrypted\n      last_name_encrypted\n      date_of_birth_encrypted\n      patient_consent {\n        consent_given\n        created_at\n      }\n    }\n  }\n": types.GetAllPatientRecordsDocument,
    "\n  query GetUsers {\n    user(\n      where: { isAnonymous: { _eq: false } }\n      order_by: [{ createdAt: desc }]\n    ) {\n      id\n      email\n      name\n      createdAt\n      emailVerified\n      organizationId\n    }\n  }\n": types.GetUsersDocument,
    "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n": types.GetOrganizationsDocument,
    "\n  query GetPatientRecords($organizationId: String!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      created_at\n      organization_id\n      notes\n    }\n  }\n": types.GetPatientRecordsDocument,
    "\n  mutation SubmitPatientConsent(\n    $invite_token: String!\n    $consent_data: ConsentInput!\n  ) {\n    submitPatientConsent(\n      invite_token: $invite_token\n      consent_data: $consent_data\n    ) {\n      success\n      patient_consent_id\n      error\n    }\n  }\n": types.SubmitPatientConsentDocument,
    "\n  mutation SubmitQuestionnaireResponse(\n    $invite_token: String!\n    $response_data: QuestionnaireResponseInput!\n  ) {\n    submitQuestionnaireResponse(\n      invite_token: $invite_token\n      response_data: $response_data\n    ) {\n      success\n      questionnaire_response_id\n      error\n    }\n  }\n": types.SubmitQuestionnaireResponseDocument,
    "\n  query GetOrganizationPhysicians {\n    user {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n": types.GetOrganizationPhysiciansDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizationById($id: String!) {\n    organization_by_pk(id: $id) {\n      id\n      name\n      city\n      created_at\n      public_key_pem\n      key_fingerprint\n      key_created_at\n    }\n  }\n"): typeof import('./graphql').GetOrganizationByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOrganizationPublicKey(\n    $id: String!\n    $public_key_pem: String!\n    $key_fingerprint: String!\n    $key_created_at: timestamptz!\n  ) {\n    update_organization_by_pk(\n      pk_columns: { id: $id }\n      _set: {\n        public_key_pem: $public_key_pem\n        key_fingerprint: $key_fingerprint\n        key_created_at: $key_created_at\n      }\n    ) {\n      id\n      public_key_pem\n      key_fingerprint\n      key_created_at\n    }\n  }\n"): typeof import('./graphql').UpdateOrganizationPublicKeyDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetAllPatientRecords {\n    patient_record(\n      order_by: [{ created_at: desc }]\n    ) {\n      id\n      clinic_internal_id\n      invite_token\n      invite_expires_at\n      notes\n      created_at\n      created_by\n      first_viewed_at\n      first_viewed_by\n      last_activity_at\n      last_activity_by\n      patient_data_completed_at\n      first_name_encrypted\n      last_name_encrypted\n      date_of_birth_encrypted\n      patient_consent {\n        consent_given\n        created_at\n      }\n    }\n  }\n"): typeof import('./graphql').GetAllPatientRecordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUsers {\n    user(\n      where: { isAnonymous: { _eq: false } }\n      order_by: [{ createdAt: desc }]\n    ) {\n      id\n      email\n      name\n      createdAt\n      emailVerified\n      organizationId\n    }\n  }\n"): typeof import('./graphql').GetUsersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n"): typeof import('./graphql').GetOrganizationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPatientRecords($organizationId: String!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      created_at\n      organization_id\n      notes\n    }\n  }\n"): typeof import('./graphql').GetPatientRecordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitPatientConsent(\n    $invite_token: String!\n    $consent_data: ConsentInput!\n  ) {\n    submitPatientConsent(\n      invite_token: $invite_token\n      consent_data: $consent_data\n    ) {\n      success\n      patient_consent_id\n      error\n    }\n  }\n"): typeof import('./graphql').SubmitPatientConsentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitQuestionnaireResponse(\n    $invite_token: String!\n    $response_data: QuestionnaireResponseInput!\n  ) {\n    submitQuestionnaireResponse(\n      invite_token: $invite_token\n      response_data: $response_data\n    ) {\n      success\n      questionnaire_response_id\n      error\n    }\n  }\n"): typeof import('./graphql').SubmitQuestionnaireResponseDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizationPhysicians {\n    user {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n"): typeof import('./graphql').GetOrganizationPhysiciansDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
