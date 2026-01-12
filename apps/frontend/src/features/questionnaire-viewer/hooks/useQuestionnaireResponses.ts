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
  /** ISO timestamp when the questionnaire was reviewed with patient */
  reviewedAt?: string;
  /** User ID of who reviewed the questionnaire */
  reviewedBy?: string;
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
          _meta?: {
            reviewed_at?: string;
            reviewed_by?: string;
          };
        };

        return {
          id: response.id,
          questionnaireId: responseData?.questionnaire_id || "unknown",
          questionnaireVersion: responseData?.questionnaire_version || "1.0",
          answers: responseData?.answers || {},
          submittedAt: response.submitted_at,
          reviewedAt: responseData?._meta?.reviewed_at,
          reviewedBy: responseData?._meta?.reviewed_by,
        } satisfies QuestionnaireResponse;
      });
    },
    enabled: !!patientRecordId,
  });
}
