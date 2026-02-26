/**
 * Mutation hooks for saving examination responses
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { toast } from "sonner";
import {
  UPSERT_EXAMINATION_RESPONSE,
  COMPLETE_EXAMINATION,
  REOPEN_EXAMINATION,
} from "../queries";
import type { FormValues } from "../form/use-examination-form";
import type { ExaminationResponse, ExaminationStatus } from "./use-examination-response";
import type { SectionId } from "../sections/registry";
import {
  parseExaminationData,
  parseCompletedSections,
} from "./validate-persistence";
import { CURRENT_MODEL_VERSION } from "./model-versioning";

interface UpsertParams {
  patientRecordId: string;
  responseData: FormValues;
  status: ExaminationStatus;
  completedSections: SectionId[];
}

interface CompleteParams {
  id: string;
  completedSections: SectionId[];
}

/**
 * Mutation hook for upserting examination response.
 * Creates new record or updates existing one.
 */
export function useUpsertExamination(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["examination-response", patientRecordId];

  return useMutation({
    mutationFn: async ({
      patientRecordId,
      responseData,
      status,
      completedSections,
    }: UpsertParams) => {
      return execute(UPSERT_EXAMINATION_RESPONSE, {
        patient_record_id: patientRecordId,
        response_data: { _modelVersion: CURRENT_MODEL_VERSION, ...responseData },
        status,
        completed_sections: completedSections,
      });
    },

    // Optimistic update
    onMutate: async ({ responseData, status, completedSections }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousResponse =
        queryClient.getQueryData<ExaminationResponse | null>(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData<ExaminationResponse | null>(queryKey, (old) => {
        if (old) {
          return {
            ...old,
            responseData,
            status,
            completedSections,
            updatedAt: new Date().toISOString(),
          };
        }
        // If no existing record, create optimistic one (id will be replaced on success)
        return {
          id: "optimistic",
          patientRecordId,
          examinedBy: "",
          responseData,
          status,
          completedSections,
          startedAt: new Date().toISOString(),
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousResponse };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousResponse !== undefined) {
        queryClient.setQueryData(queryKey, context.previousResponse);
      }
      toast.error("Fehler beim Speichern: " + error.message);
    },

    onSuccess: (data) => {
      // Update cache with server response (gets correct id)
      const response = data.insert_examination_response_one;
      if (response) {
        const validatedData = parseExaminationData(response.response_data);
        if (validatedData) {
          queryClient.setQueryData<ExaminationResponse | null>(queryKey, (old) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...old!,
            id: response.id,
            responseData: validatedData,
            status: response.status as ExaminationStatus,
            completedSections: parseCompletedSections(response.completed_sections),
            updatedAt: response.updated_at,
          }));
        }
      }
    },
  });
}

/**
 * Mutation hook for completing an examination.
 * Sets status to 'completed' and completed_at timestamp.
 */
export function useCompleteExamination(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["examination-response", patientRecordId];

  return useMutation({
    mutationFn: async ({ id, completedSections }: CompleteParams) => {
      return execute(COMPLETE_EXAMINATION, {
        id,
        completed_sections: completedSections,
      });
    },

    onMutate: async ({ completedSections }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousResponse =
        queryClient.getQueryData<ExaminationResponse | null>(queryKey);

      // Optimistically update status to completed
      queryClient.setQueryData<ExaminationResponse | null>(queryKey, (old) => {
        if (!old) return null;
        return {
          ...old,
          status: "completed" as ExaminationStatus,
          completedSections,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousResponse };
    },

    onError: (error, _variables, context) => {
      if (context?.previousResponse !== undefined) {
        queryClient.setQueryData(queryKey, context.previousResponse);
      }
      toast.error("Fehler beim Abschließen: " + error.message);
    },

    onSuccess: () => {
      toast.success("Untersuchung abgeschlossen");
    },
  });
}

interface ReopenParams {
  id: string;
}

/**
 * Mutation hook for reopening a completed examination.
 * Sets status back to 'in_progress' and clears completed_at.
 */
export function useReopenExamination(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["examination-response", patientRecordId];

  return useMutation({
    mutationFn: async ({ id }: ReopenParams) => {
      return execute(REOPEN_EXAMINATION, { id });
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousResponse =
        queryClient.getQueryData<ExaminationResponse | null>(queryKey);

      queryClient.setQueryData<ExaminationResponse | null>(queryKey, (old) => {
        if (!old) return null;
        return {
          ...old,
          status: "in_progress" as ExaminationStatus,
          completedAt: null,
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousResponse };
    },

    onError: (error, _variables, context) => {
      if (context?.previousResponse !== undefined) {
        queryClient.setQueryData(queryKey, context.previousResponse);
      }
      toast.error("Fehler beim Wiedereröffnen: " + error.message);
    },

    onSuccess: () => {
      toast.success("Untersuchung zur Bearbeitung geöffnet");
    },
  });
}
