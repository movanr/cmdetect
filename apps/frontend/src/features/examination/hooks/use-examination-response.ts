/**
 * Hook for fetching examination response for a patient record
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_EXAMINATION_RESPONSE } from "../queries";
import type { FormValues } from "../form/use-examination-form";
import type { SectionId } from "../sections/registry";
import {
  parseExaminationData,
  parseCompletedSections,
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

      const validatedData = parseExaminationData(response.response_data);
      if (!validatedData) {
        // Backend data doesn't match current schema — treat as no response
        console.warn(
          "[examination] Backend response_data failed schema validation for record:",
          patientRecordId
        );
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
  });
}
