/**
 * Examination GraphQL Queries and Mutations
 */

import { graphql } from "@/graphql/gql";

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
    $response_data: jsonb!
    $status: String!
    $completed_sections: jsonb!
  ) {
    insert_examination_response_one(
      object: {
        patient_record_id: $patient_record_id
        response_data: $response_data
        status: $status
        completed_sections: $completed_sections
      }
      on_conflict: {
        constraint: examination_response_patient_record_unique
        update_columns: [response_data, status, completed_sections]
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
 * Complete examination - sets status to 'completed' and completed_at timestamp.
 */
export const COMPLETE_EXAMINATION = graphql(`
  mutation CompleteExamination($id: String!, $completed_sections: jsonb!) {
    update_examination_response_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: "completed"
        completed_at: "now()"
        completed_sections: $completed_sections
      }
    ) {
      id
      status
      completed_at
      completed_sections
      updated_at
    }
  }
`);
