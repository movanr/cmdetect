import { graphql } from '@/graphql/gql'

export const CREATE_PATIENT_RECORD = graphql(`
  mutation CreatePatientRecord(
    $clinic_internal_id: String!
    $notes: String
  ) {
    insert_patient_record_one(
      object: {
        clinic_internal_id: $clinic_internal_id
        notes: $notes
      }
    ) {
      id
      clinic_internal_id
      invite_token
      invite_expires_at
      created_at
      created_by
      notes
    }
  }
`)
