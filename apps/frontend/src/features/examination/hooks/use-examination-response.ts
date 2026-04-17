/**
 * Hook for fetching examination response for a patient record
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_EXAMINATION_RESPONSE } from "../queries";
import type { FormValues } from "../form/use-examination-form";
import type { SectionId } from "../sections/registry";
import {
  migrateAndParseExaminationDataStrict,
  parseCompletedSections,
  PersistenceMigrationError,
} from "./validate-persistence";

export type ExaminationStatus = "draft" | "in_progress" | "completed";

export interface ExaminationResponse {
  id: string;
  patientRecordId: string;
  examinedBy: string;
  responseData: FormValues;
  status: ExaminationStatus;
  completedSections: SectionId[];
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query hook for fetching examination response by patient record ID.
 * Returns null if no examination exists yet.
 */
export function useExaminationResponse(patientRecordId: string) {
  return useQuery({
    queryKey: ["examination-response", patientRecordId],
    queryFn: async (): Promise<ExaminationResponse | null> => {
      const result = await execute(GET_EXAMINATION_RESPONSE, {
        patient_record_id: patientRecordId,
      });

      const response = result.examination_response?.[0];
      if (!response) {
        return null;
      }

      // Throws PersistenceMigrationError if backend data contains real
      // examination content that can't be migrated — surfaces via query.error
      // so the UI blocks hydration instead of silently resetting the form.
      const validatedData = migrateAndParseExaminationDataStrict(
        response.response_data,
      );
      if (!validatedData) {
        // No real prior data (empty shell or junk) — treat as no response.
        return null;
      }

      return {
        id: response.id,
        patientRecordId: response.patient_record_id,
        examinedBy: response.examined_by,
        responseData: validatedData,
        status: response.status as ExaminationStatus,
        completedSections: parseCompletedSections(response.completed_sections),
        startedAt: response.started_at,
        completedAt: response.completed_at ?? null,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    },
    enabled: !!patientRecordId,
    // A migration failure is deterministic — retrying won't fix it and just
    // delays the error surfacing to the user.
    retry: (failureCount, error) =>
      !(error instanceof PersistenceMigrationError) && failureCount < 3,
  });
}
