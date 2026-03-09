/**
 * Mutation hooks for upserting/deleting criteria assessments.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { UPSERT_CRITERIA_ASSESSMENT, DELETE_CRITERIA_ASSESSMENT } from "../queries";
import { CRITERIA_ASSESSMENTS_QUERY_KEY, assessmentKey } from "./use-criteria-assessments";
import type { CriteriaAssessment } from "../types";
import type { PalpationSite, Region, Side } from "@cmdetect/dc-tmd";

interface UpsertParams {
  patientRecordId: string;
  criterionId: string;
  side: Side | null;
  region: Region | null;
  site: PalpationSite | null;
  state: CriteriaAssessment["state"];
  userId: string;
}

/**
 * Upsert a criteria assessment with optimistic cache update.
 */
export function useUpsertCriteriaAssessment(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = [CRITERIA_ASSESSMENTS_QUERY_KEY, patientRecordId];

  return useMutation({
    mutationFn: async (params: UpsertParams) => {
      return execute(UPSERT_CRITERIA_ASSESSMENT, {
        object: {
          patient_record_id: params.patientRecordId,
          criterion_id: params.criterionId,
          side: params.side,
          region: params.region,
          site: params.site,
          state: params.state,
          assessed_by: params.userId,
          assessed_at: new Date().toISOString(),
        },
      });
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CriteriaAssessment[]>(queryKey);

      const key = assessmentKey(params.criterionId, params.side, params.region, params.site);
      const existing = previous?.find(
        (a) => assessmentKey(a.criterionId, a.side, a.region, a.site) === key,
      );

      const optimistic: CriteriaAssessment = {
        id: existing?.id ?? `optimistic-${Date.now()}`,
        criterionId: params.criterionId,
        side: params.side,
        region: params.region,
        site: params.site,
        state: params.state,
        assessedBy: params.userId,
        assessedAt: new Date().toISOString(),
      };

      if (existing) {
        queryClient.setQueryData<CriteriaAssessment[]>(
          queryKey,
          (previous ?? []).map((a) => (a.id === existing.id ? optimistic : a)),
        );
      } else {
        queryClient.setQueryData<CriteriaAssessment[]>(queryKey, [
          ...(previous ?? []),
          optimistic,
        ]);
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Delete a criteria assessment by PK with optimistic cache update.
 */
export function useDeleteCriteriaAssessment(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = [CRITERIA_ASSESSMENTS_QUERY_KEY, patientRecordId];

  return useMutation({
    mutationFn: async (id: string) => {
      return execute(DELETE_CRITERIA_ASSESSMENT, { id });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CriteriaAssessment[]>(queryKey);

      queryClient.setQueryData<CriteriaAssessment[]>(
        queryKey,
        (previous ?? []).filter((a) => a.id !== id),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
