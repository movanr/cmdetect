/**
 * Hook for updating questionnaire response data with optimistic updates
 *
 * Uses TanStack Query optimistic updates to prevent UI flickering:
 * - Updates cache immediately on mutation
 * - Rolls back on error
 * - No refetch needed on success
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
  };
}

export function useUpdateQuestionnaireResponse(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["questionnaire-responses", patientRecordId];

  return useMutation({
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

      // Optimistically update the cache
      queryClient.setQueryData<QuestionnaireResponse[]>(queryKey, (old) =>
        old?.map((response) =>
          response.id === id
            ? { ...response, answers: responseData.answers }
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

    onSuccess: () => {
      // No invalidateQueries() needed - cache is already updated optimistically
      toast.success("Antwort gespeichert");
    },
  });
}
