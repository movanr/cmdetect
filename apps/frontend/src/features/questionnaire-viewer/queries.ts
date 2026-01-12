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
