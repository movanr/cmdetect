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
    "\n  query SearchPatientsByClinicId($clinicInternalId: String!) {\n    patient(\n      where: { \n        clinic_internal_id: { _eq: $clinicInternalId }\n      }\n    ) {\n      id\n      clinic_internal_id\n      first_name_encrypted\n      last_name_encrypted\n      date_of_birth_encrypted\n      gender_encrypted\n      created_at\n      organization_id\n    }\n  }\n": typeof types.SearchPatientsByClinicIdDocument,
    "\n  query GetOrganizationPhysicians {\n    user {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n": typeof types.GetOrganizationPhysiciansDocument,
    "\n  mutation CreatePatient($patient: patient_insert_input!) {\n    insert_patient_one(object: $patient) {\n      id\n      clinic_internal_id\n      first_name_encrypted\n      last_name_encrypted\n      date_of_birth_encrypted\n      gender_encrypted\n      created_at\n      organization_id\n    }\n  }\n": typeof types.CreatePatientDocument,
    "\n  mutation CreatePatientRecord($patientRecord: patient_record_insert_input!) {\n    insert_patient_record_one(object: $patientRecord) {\n      id\n      patient_id\n      assigned_to\n      notes\n      created_at\n      created_by\n      organization_id\n      patient {\n        id\n        clinic_internal_id\n        first_name_encrypted\n        last_name_encrypted\n      }\n      user {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n": typeof types.CreatePatientRecordDocument,
    "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n": typeof types.GetOrganizationsDocument,
    "\n  query GetPatientRecords($organizationId: String!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      created_at\n      organization_id\n      notes\n    }\n  }\n": typeof types.GetPatientRecordsDocument,
    "\n  mutation SubmitPatientConsent(\n    $invite_token: String!\n    $consent_data: ConsentInput!\n  ) {\n    submitPatientConsent(\n      invite_token: $invite_token\n      consent_data: $consent_data\n    ) {\n      success\n      patient_consent_id\n      error\n    }\n  }\n": typeof types.SubmitPatientConsentDocument,
    "\n  mutation SubmitQuestionnaireResponse(\n    $invite_token: String!\n    $response_data: QuestionnaireResponseInput!\n  ) {\n    submitQuestionnaireResponse(\n      invite_token: $invite_token\n      response_data: $response_data\n    ) {\n      success\n      questionnaire_response_id\n      error\n    }\n  }\n": typeof types.SubmitQuestionnaireResponseDocument,
};
const documents: Documents = {
    "\n  query SearchPatientsByClinicId($clinicInternalId: String!) {\n    patient(\n      where: { \n        clinic_internal_id: { _eq: $clinicInternalId }\n      }\n    ) {\n      id\n      clinic_internal_id\n      first_name_encrypted\n      last_name_encrypted\n      date_of_birth_encrypted\n      gender_encrypted\n      created_at\n      organization_id\n    }\n  }\n": types.SearchPatientsByClinicIdDocument,
    "\n  query GetOrganizationPhysicians {\n    user {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n": types.GetOrganizationPhysiciansDocument,
    "\n  mutation CreatePatient($patient: patient_insert_input!) {\n    insert_patient_one(object: $patient) {\n      id\n      clinic_internal_id\n      first_name_encrypted\n      last_name_encrypted\n      date_of_birth_encrypted\n      gender_encrypted\n      created_at\n      organization_id\n    }\n  }\n": types.CreatePatientDocument,
    "\n  mutation CreatePatientRecord($patientRecord: patient_record_insert_input!) {\n    insert_patient_record_one(object: $patientRecord) {\n      id\n      patient_id\n      assigned_to\n      notes\n      created_at\n      created_by\n      organization_id\n      patient {\n        id\n        clinic_internal_id\n        first_name_encrypted\n        last_name_encrypted\n      }\n      user {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n": types.CreatePatientRecordDocument,
    "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n": types.GetOrganizationsDocument,
    "\n  query GetPatientRecords($organizationId: String!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      created_at\n      organization_id\n      notes\n    }\n  }\n": types.GetPatientRecordsDocument,
    "\n  mutation SubmitPatientConsent(\n    $invite_token: String!\n    $consent_data: ConsentInput!\n  ) {\n    submitPatientConsent(\n      invite_token: $invite_token\n      consent_data: $consent_data\n    ) {\n      success\n      patient_consent_id\n      error\n    }\n  }\n": types.SubmitPatientConsentDocument,
    "\n  mutation SubmitQuestionnaireResponse(\n    $invite_token: String!\n    $response_data: QuestionnaireResponseInput!\n  ) {\n    submitQuestionnaireResponse(\n      invite_token: $invite_token\n      response_data: $response_data\n    ) {\n      success\n      questionnaire_response_id\n      error\n    }\n  }\n": types.SubmitQuestionnaireResponseDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchPatientsByClinicId($clinicInternalId: String!) {\n    patient(\n      where: { \n        clinic_internal_id: { _eq: $clinicInternalId }\n      }\n    ) {\n      id\n      clinic_internal_id\n      first_name_encrypted\n      last_name_encrypted\n      date_of_birth_encrypted\n      gender_encrypted\n      created_at\n      organization_id\n    }\n  }\n"): typeof import('./graphql').SearchPatientsByClinicIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizationPhysicians {\n    user {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n"): typeof import('./graphql').GetOrganizationPhysiciansDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePatient($patient: patient_insert_input!) {\n    insert_patient_one(object: $patient) {\n      id\n      clinic_internal_id\n      first_name_encrypted\n      last_name_encrypted\n      date_of_birth_encrypted\n      gender_encrypted\n      created_at\n      organization_id\n    }\n  }\n"): typeof import('./graphql').CreatePatientDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePatientRecord($patientRecord: patient_record_insert_input!) {\n    insert_patient_record_one(object: $patientRecord) {\n      id\n      patient_id\n      assigned_to\n      notes\n      created_at\n      created_by\n      organization_id\n      patient {\n        id\n        clinic_internal_id\n        first_name_encrypted\n        last_name_encrypted\n      }\n      user {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n"): typeof import('./graphql').CreatePatientRecordDocument;
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


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
