/**
 * Diagnosis Evaluation GraphQL Queries and Mutations
 */

import { graphql } from "@/graphql/gql";

/**
 * Get diagnosis evaluation with nested results for a patient record.
 */
export const GET_DIAGNOSIS_EVALUATION = graphql(`
  query GetDiagnosisEvaluation($patient_record_id: String!) {
    diagnosis_evaluation(
      where: { patient_record_id: { _eq: $patient_record_id } }
      limit: 1
    ) {
      id
      patient_record_id
      source_data_hash
      evaluated_by
      evaluated_at
      created_at
      updated_at
      diagnosis_results {
        id
        diagnosis_id
        side
        region
        computed_status
        practitioner_decision
        decided_by
        decided_at
        note
      }
    }
  }
`);

/**
 * Insert diagnosis evaluation with nested result rows atomically.
 */
export const INSERT_DIAGNOSIS_EVALUATION = graphql(`
  mutation InsertDiagnosisEvaluation(
    $patient_record_id: String!
    $source_data_hash: String!
    $results: [diagnosis_result_insert_input!]!
  ) {
    insert_diagnosis_evaluation_one(
      object: {
        patient_record_id: $patient_record_id
        source_data_hash: $source_data_hash
        diagnosis_results: { data: $results }
      }
    ) {
      id
      patient_record_id
      source_data_hash
      evaluated_by
      evaluated_at
      diagnosis_results {
        id
        diagnosis_id
        side
        region
        computed_status
        practitioner_decision
        decided_by
        decided_at
        note
      }
    }
  }
`);

/**
 * Delete diagnosis evaluation by PK (cascade deletes all results).
 */
export const DELETE_DIAGNOSIS_EVALUATION = graphql(`
  mutation DeleteDiagnosisEvaluation($id: String!) {
    delete_diagnosis_evaluation_by_pk(id: $id) {
      id
    }
  }
`);

/**
 * Update practitioner decision on a single diagnosis result row.
 */
export const UPDATE_DIAGNOSIS_RESULT_DECISION = graphql(`
  mutation UpdateDiagnosisResultDecision(
    $id: String!
    $practitioner_decision: String
    $decided_by: String
    $decided_at: timestamptz
    $note: String
  ) {
    update_diagnosis_result_by_pk(
      pk_columns: { id: $id }
      _set: {
        practitioner_decision: $practitioner_decision
        decided_by: $decided_by
        decided_at: $decided_at
        note: $note
      }
    ) {
      id
      practitioner_decision
      decided_by
      decided_at
      note
      updated_at
    }
  }
`);
