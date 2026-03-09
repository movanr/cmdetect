/**
 * Documented Diagnosis GraphQL Queries and Mutations
 *
 * Row existence = practitioner documented this diagnosis for the report.
 */

import { graphql } from "@/graphql/gql";

/**
 * Fetch all documented diagnoses for a patient record.
 */
export const GET_DOCUMENTED_DIAGNOSES = graphql(`
  query GetDocumentedDiagnoses($patient_record_id: String!) {
    documented_diagnosis(where: { patient_record_id: { _eq: $patient_record_id } }) {
      id
      diagnosis_id
      side
      region
      site
      documented_by
      documented_at
      note
    }
  }
`);

/**
 * Document a single diagnosis (insert row).
 */
export const DOCUMENT_DIAGNOSIS = graphql(`
  mutation DocumentDiagnosis($object: documented_diagnosis_insert_input!) {
    insert_documented_diagnosis_one(object: $object) {
      id
      diagnosis_id
      side
      region
      site
      documented_by
      documented_at
      note
    }
  }
`);

/**
 * Undocument a single diagnosis (delete by PK).
 */
export const UNDOCUMENT_DIAGNOSIS = graphql(`
  mutation UndocumentDiagnosis($id: String!) {
    delete_documented_diagnosis_by_pk(id: $id) {
      id
    }
  }
`);

/**
 * Fetch all criteria assessments for a patient record.
 */
export const GET_CRITERIA_ASSESSMENTS = graphql(`
  query GetCriteriaAssessments($patient_record_id: String!) {
    criteria_assessment(where: { patient_record_id: { _eq: $patient_record_id } }) {
      id
      criterion_id
      side
      region
      site
      state
      assessed_by
      assessed_at
    }
  }
`);

/**
 * Upsert a criteria assessment (insert or update on conflict).
 */
export const UPSERT_CRITERIA_ASSESSMENT = graphql(`
  mutation UpsertCriteriaAssessment($object: criteria_assessment_insert_input!) {
    insert_criteria_assessment_one(
      object: $object
      on_conflict: {
        constraint: criteria_assessment_unique
        update_columns: [state, assessed_by, assessed_at]
      }
    ) {
      id
      criterion_id
      side
      region
      site
      state
      assessed_by
      assessed_at
    }
  }
`);

/**
 * Delete a criteria assessment by PK (return to auto-computed state).
 */
export const DELETE_CRITERIA_ASSESSMENT = graphql(`
  mutation DeleteCriteriaAssessment($id: String!) {
    delete_criteria_assessment_by_pk(id: $id) {
      id
    }
  }
`);
