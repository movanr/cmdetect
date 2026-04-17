/**
 * Fetches practitioner-authored manual scores + clinical notes for a patient record.
 * Returns a map keyed by questionnaire_id so components can look up their own row
 * in O(1). Data is shared across all Axis 2 tabs on the anamnesis review page.
 *
 * Each row's jsonb payload is graceful-parsed against ManualScoreEntrySchema — if
 * the stored shape is corrupt (non-object scores, non-string values, missing
 * note) we log and fall back to empty defaults rather than crashing. Mirrors the
 * pattern used by useQuestionnaireResponses.
 */

import { useQuery } from "@tanstack/react-query";
import { ManualScoreEntrySchema } from "@cmdetect/questionnaires";
import { execute } from "@/graphql/execute";
import { GET_MANUAL_SCORES } from "../queries";

export interface ManualScoreRow {
  id: string;
  questionnaireId: string;
  scores: Record<string, string>;
  note: string;
  updatedAt: string;
  updatedBy: string | null;
  /** Warning message if parsing failed (data was coerced to defaults) */
  _parseWarning?: string;
}

export const manualScoresQueryKey = (patientRecordId: string) =>
  ["manual-scores", patientRecordId] as const;

export function useManualScores(patientRecordId: string) {
  return useQuery({
    queryKey: manualScoresQueryKey(patientRecordId),
    queryFn: async () => {
      const result = await execute(GET_MANUAL_SCORES, {
        patient_record_id: patientRecordId,
      });

      const byQuestionnaire: Record<string, ManualScoreRow> = {};
      for (const row of result.manual_score ?? []) {
        const parsed = ManualScoreEntrySchema.safeParse({
          scores: row.scores ?? {},
          note: row.note ?? "",
        });

        if (!parsed.success) {
          console.warn(
            `Invalid manual_score payload for ${row.id} (${row.questionnaire_id}):`,
            parsed.error.message
          );
          byQuestionnaire[row.questionnaire_id] = {
            id: row.id,
            questionnaireId: row.questionnaire_id,
            scores: {},
            note: "",
            updatedAt: row.updated_at,
            updatedBy: row.updated_by ?? null,
            _parseWarning: parsed.error.message,
          };
          continue;
        }

        byQuestionnaire[row.questionnaire_id] = {
          id: row.id,
          questionnaireId: row.questionnaire_id,
          scores: parsed.data.scores,
          note: parsed.data.note,
          updatedAt: row.updated_at,
          updatedBy: row.updated_by ?? null,
        };
      }
      return byQuestionnaire;
    },
    enabled: !!patientRecordId,
  });
}
