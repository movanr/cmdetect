/**
 * Upsert a manual score row for (patient_record_id, questionnaire_id).
 * Silent by default — this is the workhorse behind auto-save; noisy toasts on
 * every debounced flush would be obnoxious. Error toasts remain.
 *
 * Serialization: all manual-score saves for a patient share a mutation scope,
 * so concurrent autosaves (across different Axis 2 panels) sequence through
 * TanStack Query rather than racing. Offline edits queue and resume on
 * reconnect via `networkMode: "offlineFirst"`.
 *
 * Optimistic cache update mirrors the pattern in useUpdateQuestionnaireResponse.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { execute } from "@/graphql/execute";
import { UPSERT_MANUAL_SCORE } from "../queries";
import { manualScoresQueryKey, type ManualScoreRow } from "./useManualScores";

interface UpsertParams {
  patientRecordId: string;
  questionnaireId: string;
  scores: Record<string, string>;
  note: string;
}

export function useUpsertManualScore(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = manualScoresQueryKey(patientRecordId);

  return useMutation({
    mutationKey: ["manual-score", patientRecordId],
    scope: { id: `manual-score:${patientRecordId}` },
    networkMode: "offlineFirst",

    mutationFn: async ({ questionnaireId, scores, note }: UpsertParams) => {
      return execute(UPSERT_MANUAL_SCORE, {
        patient_record_id: patientRecordId,
        questionnaire_id: questionnaireId,
        scores,
        note,
      });
    },

    onMutate: async ({ questionnaireId, scores, note }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Record<string, ManualScoreRow>>(queryKey);

      queryClient.setQueryData<Record<string, ManualScoreRow>>(queryKey, (old) => {
        const next = { ...(old ?? {}) };
        const existing = next[questionnaireId];
        next[questionnaireId] = {
          id: existing?.id ?? `optimistic-${questionnaireId}`,
          questionnaireId,
          scores,
          note,
          updatedAt: new Date().toISOString(),
          updatedBy: existing?.updatedBy ?? null,
        };
        return next;
      });

      return { previous };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error("Fehler beim Speichern: " + error.message);
    },

    onSuccess: (data) => {
      const row = data.insert_manual_score_one;
      if (!row) return;
      queryClient.setQueryData<Record<string, ManualScoreRow>>(queryKey, (old) => ({
        ...(old ?? {}),
        [row.questionnaire_id]: {
          id: row.id,
          questionnaireId: row.questionnaire_id,
          scores: (row.scores as Record<string, string>) ?? {},
          note: row.note ?? "",
          updatedAt: row.updated_at,
          updatedBy: row.updated_by ?? null,
        },
      }));
    },
  });
}
