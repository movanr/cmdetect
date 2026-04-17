/**
 * Questionnaire Viewer GraphQL Queries and Mutations
 */

import { graphql } from "@/graphql/gql";

export const UPDATE_QUESTIONNAIRE_RESPONSE = graphql(`
  mutation UpdateQuestionnaireResponse($id: String!, $response_data: jsonb!) {
    update_questionnaire_response_by_pk(
      pk_columns: { id: $id }
      _set: { response_data: $response_data }
    ) {
      id
      response_data
      updated_at
    }
  }
`);

export const GET_MANUAL_SCORES = graphql(`
  query GetManualScores($patient_record_id: String!) {
    manual_score(
      where: { patient_record_id: { _eq: $patient_record_id } }
      order_by: { questionnaire_id: asc }
    ) {
      id
      questionnaire_id
      scores
      note
      updated_at
      updated_by
    }
  }
`);

export const UPSERT_MANUAL_SCORE = graphql(`
  mutation UpsertManualScore(
    $patient_record_id: String!
    $questionnaire_id: String!
    $scores: jsonb!
    $note: String!
  ) {
    insert_manual_score_one(
      object: {
        patient_record_id: $patient_record_id
        questionnaire_id: $questionnaire_id
        scores: $scores
        note: $note
      }
      on_conflict: {
        constraint: manual_score_unique
        update_columns: [scores, note]
      }
    ) {
      id
      questionnaire_id
      scores
      note
      updated_at
      updated_by
    }
  }
`);
