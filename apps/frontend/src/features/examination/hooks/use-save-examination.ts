/**
 * Mutation hooks for saving examination responses
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { toast } from "sonner";
import {
  UPSERT_EXAMINATION_RESPONSE,
  UPSERT_AND_COMPLETE_EXAMINATION,
} from "../queries";
import { examinationSchema, type FormValues } from "../form/use-examination-form";
import type { ExaminationResponse, ExaminationStatus } from "./use-examination-response";
import type { SectionId } from "../sections/registry";
import {
  parseExaminationData,
  parseCompletedSections,
} from "./validate-persistence";
import { CURRENT_MODEL_VERSION } from "./model-versioning";

interface UpsertParams {
  patientRecordId: string;
  examinedBy: string;
  responseData: FormValues;
  status: ExaminationStatus;
  completedSections: SectionId[];
}

interface CompleteParams {
  patientRecordId: string;
  examinedBy: string;
  responseData: FormValues;
  completedSections: SectionId[];
}

/**
 * Defense-in-depth: the form's own Zod resolver already validates on submit,
 * but autosave serialization runs on a raw getValues() snapshot. Re-validating
 * here rejects programmatic writes that bypass the form (and surfaces schema
 * drift loudly instead of silently persisting garbage).
 */
function validateOrThrow(responseData: FormValues) {
  const parsed = examinationSchema.safeParse(responseData);
  if (!parsed.success) {
    // Keep Zod details in the console for devs; user-facing message is plain.
    console.error("[examination] Schema validation failed", parsed.error);
    throw new Error("Untersuchungsdaten sind ungültig.");
  }
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
      examinedBy,
      responseData,
      status,
      completedSections,
    }: UpsertParams) => {
      return execute(UPSERT_EXAMINATION_RESPONSE, {
        patient_record_id: patientRecordId,
        examined_by: examinedBy,
        response_data: { _modelVersion: CURRENT_MODEL_VERSION, ...responseData },
        status,
        completed_sections: completedSections,
      });
    },

    // Optimistic update — but only after validation passes.
    onMutate: async ({ responseData, status, completedSections }) => {
      validateOrThrow(responseData);

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
      // Stable id → Sonner replaces instead of stacking a new toast per
      // debounced autosave retry.
      toast.error("Fehler beim Speichern: " + error.message, {
        id: `examination-save-error:${patientRecordId}`,
      });
    },

    onSuccess: (data) => {
      // Dismiss any lingering error toast so the UI reflects the recovered state.
      toast.dismiss(`examination-save-error:${patientRecordId}`);
      // Update cache with server response (gets correct id)
      const response = data.insert_examination_response_one;
      if (!response) return;
      const validatedData = parseExaminationData(response.response_data);
      if (!validatedData) return;
      queryClient.setQueryData<ExaminationResponse | null>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          id: response.id,
          responseData: validatedData,
          status: response.status as ExaminationStatus,
          completedSections: parseCompletedSections(response.completed_sections),
          updatedAt: response.updated_at,
        };
      });
    },
  });
}

/**
 * Mutation hook for completing an examination in a single atomic write.
 * Writes response_data, status="completed", completed_sections, and completed_at
 * together, so data and status land together. Replaces the prior two-mutation
 * split (upsert then status update) which could leave the row stuck
 * in_progress if the status call failed.
 */
export function useCompleteExamination(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["examination-response", patientRecordId];

  return useMutation({
    mutationFn: async ({
      patientRecordId,
      examinedBy,
      responseData,
      completedSections,
    }: CompleteParams) => {
      return execute(UPSERT_AND_COMPLETE_EXAMINATION, {
        patient_record_id: patientRecordId,
        examined_by: examinedBy,
        response_data: { _modelVersion: CURRENT_MODEL_VERSION, ...responseData },
        completed_sections: completedSections,
      });
    },

    onMutate: async ({ responseData, completedSections }) => {
      validateOrThrow(responseData);

      await queryClient.cancelQueries({ queryKey });

      const previousResponse =
        queryClient.getQueryData<ExaminationResponse | null>(queryKey);

      queryClient.setQueryData<ExaminationResponse | null>(queryKey, (old) => {
        const now = new Date().toISOString();
        if (old) {
          return {
            ...old,
            responseData,
            status: "completed",
            completedSections,
            completedAt: now,
            updatedAt: now,
          };
        }
        return {
          id: "optimistic",
          patientRecordId,
          examinedBy: "",
          responseData,
          status: "completed",
          completedSections,
          startedAt: now,
          completedAt: now,
          createdAt: now,
          updatedAt: now,
        };
      });

      return { previousResponse };
    },

    onError: (error, _variables, context) => {
      if (context?.previousResponse !== undefined) {
        queryClient.setQueryData(queryKey, context.previousResponse);
      }
      toast.error("Fehler beim Abschließen: " + error.message, {
        id: `examination-complete-error:${patientRecordId}`,
      });
    },

    onSuccess: (data) => {
      const response = data.insert_examination_response_one;
      if (!response) {
        toast.success("Untersuchung abgeschlossen");
        return;
      }
      const validatedData = parseExaminationData(response.response_data);
      if (validatedData) {
        queryClient.setQueryData<ExaminationResponse | null>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            id: response.id,
            responseData: validatedData,
            status: response.status as ExaminationStatus,
            completedSections: parseCompletedSections(response.completed_sections),
            completedAt: response.completed_at ?? null,
            updatedAt: response.updated_at,
          };
        });
      }
      toast.success("Untersuchung abgeschlossen");
    },
  });
}
