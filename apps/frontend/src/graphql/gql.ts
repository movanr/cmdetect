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
    "\n  query GetPatientRecords($organizationId: uuid!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      workflow_status\n      invite_status\n      created_at\n      organization_id\n      notes\n    }\n  }\n": typeof types.GetPatientRecordsDocument,
};
const documents: Documents = {
    "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n": types.GetOrganizationsDocument,
    "\n  query GetPatientRecords($organizationId: uuid!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      workflow_status\n      invite_status\n      created_at\n      organization_id\n      notes\n    }\n  }\n": types.GetPatientRecordsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizations {\n    organization {\n      id\n      name\n      city\n      created_at\n    }\n  }\n"): typeof import('./graphql').GetOrganizationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPatientRecords($organizationId: uuid!) {\n    patient_record(\n      where: { organization_id: { _eq: $organizationId } }\n      order_by: { created_at: desc }\n    ) {\n      id\n      workflow_status\n      invite_status\n      created_at\n      organization_id\n      notes\n    }\n  }\n"): typeof import('./graphql').GetPatientRecordsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
