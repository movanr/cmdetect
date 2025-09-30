import { graphql } from '@/graphql/gql'

export const GET_ALL_PATIENT_RECORDS = graphql(`
  query GetAllPatientRecords {
    patient_record(
      order_by: [{ created_at: desc }]
    ) {
      id
      clinic_internal_id
      invite_token
      invite_expires_at
      notes
      created_at
      created_by
      first_viewed_at
      first_viewed_by
      last_activity_at
      last_activity_by
      patient_data_completed_at
      first_name_encrypted
      last_name_encrypted
      date_of_birth_encrypted
      patient_consent {
        consent_given
        created_at
      }
    }
  }
`)

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
`)