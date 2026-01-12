/**
 * Hook for fetching questionnaire responses for a patient record
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_QUESTIONNAIRE_RESPONSES } from "@/features/patient-records/queries";

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  questionnaireVersion: string;
  answers: Record<string, unknown>;
  submittedAt: string;
}

export function useQuestionnaireResponses(patientRecordId: string) {
  return useQuery({
    queryKey: ["questionnaire-responses", patientRecordId],
    queryFn: async () => {
      const result = await execute(GET_QUESTIONNAIRE_RESPONSES, {
        patient_record_id: patientRecordId,
      });

      // Transform the response data
      return (result.questionnaire_response || []).map((response) => {
        const responseData = response.response_data as {
          questionnaire_id: string;
          questionnaire_version: string;
          answers: Record<string, unknown>;
        };

        return {
          id: response.id,
          questionnaireId: responseData?.questionnaire_id || "unknown",
          questionnaireVersion: responseData?.questionnaire_version || "1.0",
          answers: responseData?.answers || {},
          submittedAt: response.submitted_at,
        } satisfies QuestionnaireResponse;
      });
    },
    enabled: !!patientRecordId,
  });
}
