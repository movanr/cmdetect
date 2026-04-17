/**
 * Mutation hooks for saving examination responses.
 *
 * All writes share `mutationKey: ["examination-response", patientRecordId]`
 * + `scope: { id: patientRecordId }` so TanStack Query serializes concurrent
 * mutations on the same exam (upsert + complete can overlap in code; scope
 * guarantees the network calls run strictly in order).
 *
 * `networkMode: "offlineFirst"` pauses mutations when offline and auto-resumes
 * them on reconnect within the same tab session.
 *
 * No optimistic cache updates: the form is the working copy, the query cache
 * is only ever written from a real server response. This prevents the class of
 * bugs where an orphaned optimistic placeholder never gets swapped back.
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
 * Defense-in-depth: the form's own Zod resolver validates on submit, but
 * autosave serializes a raw getValues() snapshot. Re-validating here rejects
 * programmatic writes that bypass the form (and surfaces schema drift loudly
 * instead of silently persisting garbage). Throws on failure — the mutation
 * rejects, onError runs, no network call happens.
 */
function validateOrThrow(responseData: FormValues) {
  const parsed = examinationSchema.safeParse(responseData);
  if (!parsed.success) {
    console.error("[examination] Schema validation failed", parsed.error);
    throw new Error("Untersuchungsdaten sind ungültig.");
  }
}

export function useUpsertExamination(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["examination-response", patientRecordId];

  return useMutation({
    mutationKey: ["examination-response", patientRecordId],
    scope: { id: `examination-response:${patientRecordId}` },
    networkMode: "offlineFirst",

    mutationFn: async ({
      patientRecordId,
      examinedBy,
      responseData,
      status,
      completedSections,
    }: UpsertParams) => {
      validateOrThrow(responseData);
      return execute(UPSERT_EXAMINATION_RESPONSE, {
        patient_record_id: patientRecordId,
        examined_by: examinedBy,
        response_data: { _modelVersion: CURRENT_MODEL_VERSION, ...responseData },
        status,
        completed_sections: completedSections,
      });
    },

    onError: (error) => {
      // Stable id → Sonner replaces instead of stacking a new toast per
      // debounced autosave retry.
      toast.error("Fehler beim Speichern: " + error.message, {
        id: `examination-save-error:${patientRecordId}`,
      });
    },

    onSuccess: (data) => {
      toast.dismiss(`examination-save-error:${patientRecordId}`);
      const response = data.insert_examination_response_one;
      if (!response) return;
      const validatedData = parseExaminationData(response.response_data);
      if (!validatedData) return;

      const existing =
        queryClient.getQueryData<ExaminationResponse | null>(queryKey);
      if (!existing) {
        // First save — mutation return is missing started_at/created_at/
        // examined_by. Invalidate to refetch the complete record.
        queryClient.invalidateQueries({ queryKey });
        return;
      }
      queryClient.setQueryData<ExaminationResponse>(queryKey, {
        ...existing,
        id: response.id,
        responseData: validatedData,
        status: response.status as ExaminationStatus,
        completedSections: parseCompletedSections(response.completed_sections),
        updatedAt: response.updated_at,
      });
    },
  });
}

/**
 * Mutation hook for completing an examination in a single atomic write.
 * Writes response_data, status="completed", completed_sections, and
 * completed_at together so data and status land together. Shares
 * mutationKey/scope with useUpsertExamination so a pending upsert
 * drains before completion runs.
 */
export function useCompleteExamination(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["examination-response", patientRecordId];

  return useMutation({
    mutationKey: ["examination-response", patientRecordId],
    scope: { id: `examination-response:${patientRecordId}` },
    networkMode: "offlineFirst",

    mutationFn: async ({
      patientRecordId,
      examinedBy,
      responseData,
      completedSections,
    }: CompleteParams) => {
      validateOrThrow(responseData);
      return execute(UPSERT_AND_COMPLETE_EXAMINATION, {
        patient_record_id: patientRecordId,
        examined_by: examinedBy,
        response_data: { _modelVersion: CURRENT_MODEL_VERSION, ...responseData },
        completed_sections: completedSections,
      });
    },

    onError: (error) => {
      toast.error("Fehler beim Abschließen: " + error.message, {
        id: `examination-complete-error:${patientRecordId}`,
      });
    },

    onSuccess: (data) => {
      toast.dismiss(`examination-complete-error:${patientRecordId}`);
      const response = data.insert_examination_response_one;
      if (!response) {
        toast.success("Untersuchung abgeschlossen");
        return;
      }
      const validatedData = parseExaminationData(response.response_data);
      if (validatedData) {
        const existing =
          queryClient.getQueryData<ExaminationResponse | null>(queryKey);
        if (!existing) {
          queryClient.invalidateQueries({ queryKey });
        } else {
          queryClient.setQueryData<ExaminationResponse>(queryKey, {
            ...existing,
            id: response.id,
            responseData: validatedData,
            status: response.status as ExaminationStatus,
            completedSections: parseCompletedSections(response.completed_sections),
            completedAt: response.completed_at ?? null,
            updatedAt: response.updated_at,
          });
        }
      }
      toast.success("Untersuchung abgeschlossen");
    },
  });
}
