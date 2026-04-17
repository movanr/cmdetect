/**
 * Examination GraphQL Queries and Mutations
 */

import { graphql } from "@/graphql/gql";

/**
 * Get active physicians in the organization (for Behandler selector).
 */
export const GET_PHYSICIANS = graphql(`
  query GetPhysicians {
    user(
      where: {
        roles: { _contains: "physician" }
        isActive: { _eq: true }
      }
      order_by: [{ name: asc }]
    ) {
      id
      name
    }
  }
`);

/**
 * Get examination response for a patient record.
 * Returns null or one record (unique constraint on patient_record_id).
 */
export const GET_EXAMINATION_RESPONSE = graphql(`
  query GetExaminationResponse($patient_record_id: String!) {
    examination_response(
      where: { patient_record_id: { _eq: $patient_record_id } }
      limit: 1
    ) {
      id
      patient_record_id
      examined_by
      response_data
      status
      completed_sections
      started_at
      completed_at
      created_at
      updated_at
    }
  }
`);

/**
 * Upsert examination response.
 * Creates new record or updates existing one (on patient_record_id conflict).
 */
export const UPSERT_EXAMINATION_RESPONSE = graphql(`
  mutation UpsertExaminationResponse(
    $patient_record_id: String!
    $examined_by: String!
    $response_data: jsonb!
    $status: String!
    $completed_sections: jsonb!
  ) {
    insert_examination_response_one(
      object: {
        patient_record_id: $patient_record_id
        examined_by: $examined_by
        response_data: $response_data
        status: $status
        completed_sections: $completed_sections
      }
      on_conflict: {
        constraint: examination_response_patient_record_unique
        update_columns: [examined_by, response_data, status, completed_sections]
      }
    ) {
      id
      patient_record_id
      response_data
      status
      completed_sections
      updated_at
    }
  }
`);

/**
 * Upsert + complete in a single mutation: writes response_data, marks status
 * "completed", sets completed_at. Used on the completion path so data and
 * status land atomically (previously two sequential mutations that could
 * leave the row stuck in_progress if the second call failed).
 *
 * completed_at is intentionally NOT in UPSERT_EXAMINATION_RESPONSE's
 * update_columns — regular saves must not clear it after completion.
 */
export const UPSERT_AND_COMPLETE_EXAMINATION = graphql(`
  mutation UpsertAndCompleteExamination(
    $patient_record_id: String!
    $examined_by: String!
    $response_data: jsonb!
    $completed_sections: jsonb!
  ) {
    insert_examination_response_one(
      object: {
        patient_record_id: $patient_record_id
        examined_by: $examined_by
        response_data: $response_data
        status: "completed"
        completed_sections: $completed_sections
        completed_at: "now()"
      }
      on_conflict: {
        constraint: examination_response_patient_record_unique
        update_columns: [examined_by, response_data, status, completed_sections, completed_at]
      }
    ) {
      id
      patient_record_id
      response_data
      status
      completed_sections
      completed_at
      updated_at
    }
  }
`);

