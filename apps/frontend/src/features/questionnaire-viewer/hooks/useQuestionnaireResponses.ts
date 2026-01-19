/**
 * Hook for fetching questionnaire responses for a patient record
 * Uses graceful parsing to handle malformed data without crashing
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_QUESTIONNAIRE_RESPONSES } from "@/features/patient-records/queries";
import { ResponseDataSchema } from "@cmdetect/questionnaires";

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
  /** Warning message if parsing failed (data may be incomplete) */
  _parseWarning?: string;
}

export function useQuestionnaireResponses(patientRecordId: string) {
  return useQuery({
    queryKey: ["questionnaire-responses", patientRecordId],
    queryFn: async () => {
      const result = await execute(GET_QUESTIONNAIRE_RESPONSES, {
        patient_record_id: patientRecordId,
      });

      // Transform the response data with graceful parsing
      return (result.questionnaire_response || []).map((response) => {
        const rawData = response.response_data;
        const parsed = ResponseDataSchema.safeParse(rawData);

        if (!parsed.success) {
          // Log warning for debugging but don't crash
          console.warn(
            `Invalid response_data for ${response.id}:`,
            parsed.error.message
          );

          // Graceful fallback - extract what we can from raw data
          const fallbackData = rawData as {
            questionnaire_id?: string;
            questionnaire_version?: string;
            answers?: Record<string, unknown>;
            _meta?: {
              reviewed_at?: string;
              reviewed_by?: string;
            };
          } | null;

          return {
            id: response.id,
            questionnaireId: fallbackData?.questionnaire_id ?? "unknown",
            questionnaireVersion: fallbackData?.questionnaire_version ?? "1.0",
            answers: fallbackData?.answers ?? {},
            submittedAt: response.submitted_at,
            reviewedAt: fallbackData?._meta?.reviewed_at,
            reviewedBy: fallbackData?._meta?.reviewed_by,
            _parseWarning: parsed.error.message,
          } satisfies QuestionnaireResponse;
        }

        // Successfully parsed - return typed data
        return {
          id: response.id,
          questionnaireId: parsed.data.questionnaire_id,
          questionnaireVersion: parsed.data.questionnaire_version,
          answers: parsed.data.answers,
          submittedAt: response.submitted_at,
          reviewedAt: parsed.data._meta?.reviewed_at,
          reviewedBy: parsed.data._meta?.reviewed_by,
        } satisfies QuestionnaireResponse;
      });
    },
    enabled: !!patientRecordId,
  });
}
