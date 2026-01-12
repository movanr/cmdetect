/**
 * Patient Records GraphQL Queries and Mutations
 */

import { graphql } from "@/graphql/gql";

// Queries
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
      viewed
      patient_data_completed_at
      submission_completed_at
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

// Mutations
export const CREATE_PATIENT_RECORD = graphql(`
  mutation CreatePatientRecord($clinic_internal_id: String!) {
    insert_patient_record_one(
      object: { clinic_internal_id: $clinic_internal_id }
    ) {
      id
      clinic_internal_id
      invite_token
      invite_expires_at
      created_at
      created_by
    }
  }
`);

export const DELETE_PATIENT_RECORD = graphql(`
  mutation DeletePatientRecord($id: String!) {
    update_patient_record_by_pk(
      pk_columns: { id: $id }
      _set: { deleted_at: "now()" }
    ) {
      id
    }
  }
`);

export const RESET_INVITE_TOKEN = graphql(`
  mutation ResetInviteToken($id: String!, $new_expires_at: timestamptz!) {
    update_patient_record_by_pk(
      pk_columns: { id: $id }
      _set: {
        invite_expires_at: $new_expires_at
        submission_completed_at: null
      }
    ) {
      id
      invite_expires_at
    }
  }
`);

export const GET_QUESTIONNAIRE_RESPONSES = graphql(`
  query GetQuestionnaireResponses($patient_record_id: String!) {
    questionnaire_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      order_by: { submitted_at: asc }
    ) {
      id
      response_data
      submitted_at
    }
  }
`);
