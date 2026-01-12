/**
 * Hook for updating questionnaire response data
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { UPDATE_QUESTIONNAIRE_RESPONSE } from "../queries";
import { toast } from "sonner";

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

  return useMutation({
    mutationFn: async ({ id, responseData }: UpdateParams) => {
      return execute(UPDATE_QUESTIONNAIRE_RESPONSE, {
        id,
        response_data: responseData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questionnaire-responses", patientRecordId],
      });
      toast.success("Antwort gespeichert");
    },
    onError: (error) => {
      toast.error("Fehler beim Speichern: " + error.message);
    },
  });
}
