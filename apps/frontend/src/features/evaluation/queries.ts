/**
 * Diagnosis Evaluation GraphQL Queries and Mutations
 */

import { graphql } from "@/graphql/gql";

/**
 * Fetch all diagnosis results for a patient record directly.
 */
export const GET_DIAGNOSIS_RESULTS = graphql(`
  query GetDiagnosisResults($patient_record_id: String!) {
    diagnosis_result(where: { patient_record_id: { _eq: $patient_record_id } }) {
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
`);

/**
 * Upsert diagnosis result rows — only updates computed_status on conflict,
 * never touches practitioner_decision.
 */
export const UPSERT_DIAGNOSIS_RESULTS = graphql(`
  mutation UpsertDiagnosisResults($results: [diagnosis_result_insert_input!]!) {
    insert_diagnosis_result(
      objects: $results
      on_conflict: {
        constraint: diagnosis_result_unique
        update_columns: [computed_status]
      }
    ) {
      returning {
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
