/**
 * Patient Records GraphQL Queries and Mutations
 */

import { graphql } from "@/graphql/gql";

// Queries
export const GET_PATIENT_RECORD = graphql(`
  query GetPatientRecord($id: String!) {
    patient_record_by_pk(id: $id) {
      id
      clinic_internal_id
      is_demo
      first_name_encrypted
      created_at
      patient_data_completed_at
      viewed
      invite_expires_at
      patient_consent {
        consent_given
      }
      userByLastViewedBy {
        id
        name
        email
      }
    }
  }
`);

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
      is_demo
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
  mutation CreatePatientRecord($clinic_internal_id: String!, $is_demo: Boolean) {
    insert_patient_record_one(
      object: { clinic_internal_id: $clinic_internal_id, is_demo: $is_demo }
    ) {
      id
      clinic_internal_id
      invite_token
      invite_expires_at
      created_at
      created_by
      is_demo
    }
  }
`);

export const MARK_VIEWED = graphql(`
  mutation MarkViewed($id: String!) {
    update_patient_record_by_pk(pk_columns: { id: $id }, _set: { viewed: true }) {
      id
      viewed
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

// Office-use keys mirror SQ_OFFICE_USE_QUESTIONS in
// packages/questionnaires/src/sq/sections.ts — keep in sync.
export const RESET_DEMO_CASE = graphql(`
  mutation ResetDemoCase($patient_record_id: String!, $empty_response_data: jsonb!) {
    update_examination_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      _set: { status: "draft", completed_sections: [], completed_at: null, response_data: $empty_response_data }
    ) {
      affected_rows
    }
    clear_meta: update_questionnaire_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      _delete_key: { response_data: "_meta" }
    ) {
      affected_rows
    }
    clear_sq8_office: update_questionnaire_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      _delete_at_path: { response_data: ["answers", "SQ8_office"] }
    ) {
      affected_rows
    }
    clear_sq9_office: update_questionnaire_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      _delete_at_path: { response_data: ["answers", "SQ9_office"] }
    ) {
      affected_rows
    }
    clear_sq10_office: update_questionnaire_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      _delete_at_path: { response_data: ["answers", "SQ10_office"] }
    ) {
      affected_rows
    }
    clear_sq11_office: update_questionnaire_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      _delete_at_path: { response_data: ["answers", "SQ11_office"] }
    ) {
      affected_rows
    }
    clear_sq12_office: update_questionnaire_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      _delete_at_path: { response_data: ["answers", "SQ12_office"] }
    ) {
      affected_rows
    }
    clear_sq13_office: update_questionnaire_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      _delete_at_path: { response_data: ["answers", "SQ13_office"] }
    ) {
      affected_rows
    }
    clear_sq14_office: update_questionnaire_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      _delete_at_path: { response_data: ["answers", "SQ14_office"] }
    ) {
      affected_rows
    }
    delete_manual_score(
      where: { patient_record_id: { _eq: $patient_record_id } }
    ) {
      affected_rows
    }
    delete_documented_diagnosis(
      where: { patient_record_id: { _eq: $patient_record_id } }
    ) {
      affected_rows
    }
    delete_criteria_assessment(
      where: { patient_record_id: { _eq: $patient_record_id } }
    ) {
      affected_rows
    }
    update_patient_record_by_pk(
      pk_columns: { id: $patient_record_id }
      _set: { viewed: false }
    ) {
      id
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
