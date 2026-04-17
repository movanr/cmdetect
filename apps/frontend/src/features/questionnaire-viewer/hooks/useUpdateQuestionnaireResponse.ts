/**
 * Hook for updating questionnaire response data with optimistic updates
 *
 * Uses TanStack Query optimistic updates to prevent UI flickering:
 * - Updates cache immediately on mutation
 * - Rolls back on error
 * - No refetch needed on success
 *
 * Serialization: saves for the same patient share a mutation scope, so
 * overlapping edits (e.g. answer edit + office-use toggle in quick succession)
 * sequence at the network layer rather than racing. Offline edits queue via
 * `networkMode: "offlineFirst"` and resume on reconnect.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { UPDATE_QUESTIONNAIRE_RESPONSE } from "../queries";
import { toast } from "sonner";
import type { QuestionnaireResponse } from "./useQuestionnaireResponses";

interface UpdateParams {
  id: string;
  responseData: {
    questionnaire_id: string;
    questionnaire_version: string;
    answers: Record<string, unknown>;
    _meta?: {
      reviewed_at?: string;
      reviewed_by?: string;
      review_skipped_at?: string;
    };
  };
  /** Override the success toast message. Pass `null` to suppress the toast. */
  successMessage?: string | null;
}

export function useUpdateQuestionnaireResponse(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["questionnaire-responses", patientRecordId];

  return useMutation({
    mutationKey: ["questionnaire-response", patientRecordId],
    scope: { id: `questionnaire-response:${patientRecordId}` },
    networkMode: "offlineFirst",

    mutationFn: async ({ id, responseData }: UpdateParams) => {
      return execute(UPDATE_QUESTIONNAIRE_RESPONSE, {
        id,
        response_data: responseData,
      });
    },

    // Optimistic update: update cache immediately before server responds
    onMutate: async ({ id, responseData }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for rollback
      const previousResponses =
        queryClient.getQueryData<QuestionnaireResponse[]>(queryKey);

      // Optimistically update the cache — mirror the _meta fields the
      // useQuestionnaireResponses hook surfaces so downstream gating
      // (e.g. step completion) sees the new state immediately.
      queryClient.setQueryData<QuestionnaireResponse[]>(queryKey, (old) =>
        old?.map((response) =>
          response.id === id
            ? {
                ...response,
                answers: responseData.answers,
                reviewedAt: responseData._meta?.reviewed_at ?? response.reviewedAt,
                reviewedBy: responseData._meta?.reviewed_by ?? response.reviewedBy,
                reviewSkippedAt:
                  responseData._meta?.review_skipped_at ?? response.reviewSkippedAt,
              }
            : response
        )
      );

      // Return context with the previous value for rollback
      return { previousResponses };
    },

    // Rollback on error
    onError: (error, _variables, context) => {
      // Restore the previous cache value
      if (context?.previousResponses) {
        queryClient.setQueryData(queryKey, context.previousResponses);
      }
      toast.error("Fehler beim Speichern: " + error.message);
    },

    onSuccess: (_data, variables) => {
      // No invalidateQueries() needed - cache is already updated optimistically
      if (variables.successMessage === null) return;
      toast.success(variables.successMessage ?? "Antwort gespeichert");
    },
  });
}
