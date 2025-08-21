import { graphql } from "../graphql";

/*export const getSubmissionsList = graphql(`
  query GetSubmissionsList($organizationId: uuid!) {
    patient_registration(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { created_at: desc }
    ) {
      id
      status
      link_expires_at
      created_at
      notes
      patient {
        id
        clinic_internal_id
        first_name_encrypted
        last_name_encrypted
        date_of_birth_encrypted
        gender_encrypted
        organization_id
      }
      assigned_to_practitioner {
        id
        first_name
        last_name
      }
      created_by_practitioner {
        id
        first_name
        last_name
      }
      
    }
  }
`);
*/
