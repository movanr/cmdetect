import { graphql } from "@/graphql/gql";

export const GET_ALL_PATIENT_RECORDS = graphql(`
  query GetAllPatientRecords {
    patient_record(order_by: [{ created_at: desc }]) {
      id
      clinic_internal_id
      invite_token
      invite_expires_at
      created_at
      created_by
      last_viewed_at
      last_viewed_by
      patient_data_completed_at
      first_name_encrypted
      last_name_encrypted
      date_of_birth_encrypted
      patient_consent {
        consent_given
        created_at
      }
      userByCreatedBy {
        id
        name
        email
      }
      userByLastViewedBy {
        id
        name
        email
      }
    }
  }
`);

export const GET_USERS = graphql(`
  query GetUsers {
    user(
      where: { isAnonymous: { _eq: false } }
      order_by: [{ createdAt: desc }]
    ) {
      id
      email
      name
      createdAt
      emailVerified
      organizationId
    }
  }
`);
