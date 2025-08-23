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
  query GetPatientRecords($organizationId: uuid!) {
    patient_record(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { created_at: desc }
    ) {
      id
      workflow_status
      invite_status
      created_at
      organization_id
      notes
    }
  }
`);



