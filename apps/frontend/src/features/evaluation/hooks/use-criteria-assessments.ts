/**
 * Query hooks for criteria assessments.
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { execute } from "@/graphql/execute";
import { GET_CRITERIA_ASSESSMENTS } from "../queries";
import type { CriteriaAssessment } from "../types";
import type { PalpationSite, Region, Side } from "@cmdetect/dc-tmd";

function mapRow(row: {
  id: string;
  criterion_id: string;
  side?: string | null;
  region?: string | null;
  site?: string | null;
  state: string;
  assessed_by?: string | null;
  assessed_at?: string | null;
}): CriteriaAssessment {
  return {
    id: row.id,
    criterionId: row.criterion_id,
    side: (row.side as Side) ?? null,
    region: (row.region as Region) ?? null,
    site: (row.site as PalpationSite) ?? null,
    state: row.state as CriteriaAssessment["state"],
    assessedBy: row.assessed_by ?? null,
    assessedAt: row.assessed_at ?? null,
  };
}

export const CRITERIA_ASSESSMENTS_QUERY_KEY = "criteria-assessments";

export function useCriteriaAssessments(patientRecordId: string) {
  return useQuery({
    queryKey: [CRITERIA_ASSESSMENTS_QUERY_KEY, patientRecordId],
    queryFn: async (): Promise<CriteriaAssessment[]> => {
      const result = await execute(GET_CRITERIA_ASSESSMENTS, {
        patient_record_id: patientRecordId,
      });
      return (result.criteria_assessment ?? []).map(mapRow);
    },
    enabled: !!patientRecordId,
  });
}

/** Build a map key matching the format used by CriteriaChecklist. */
export function assessmentKey(
  criterionId: string,
  side: Side | null,
  region: Region | null,
  site: PalpationSite | null,
): string {
  return `${criterionId}:${side ?? ""}:${region ?? ""}:${site ?? ""}`;
}

/**
 * Derived map keyed by `criterionId:side:region:site` for O(1) lookups.
 */
export function useCriteriaAssessmentMap(patientRecordId: string) {
  const query = useCriteriaAssessments(patientRecordId);

  const map = useMemo(() => {
    const m = new Map<string, CriteriaAssessment>();
    for (const a of query.data ?? []) {
      m.set(assessmentKey(a.criterionId, a.side, a.region, a.site), a);
    }
    return m;
  }, [query.data]);

  return { ...query, data: map };
}
