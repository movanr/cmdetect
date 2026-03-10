/**
 * Diagnosis Evaluation Types
 *
 * Frontend types for documented diagnoses (persisted to documented_diagnosis table).
 * Row existence = practitioner documented this diagnosis for the report.
 */

import type { DiagnosisId, PalpationSite, Region, Side } from "@cmdetect/dc-tmd";

export interface DocumentedDiagnosis {
  id: string;
  diagnosisId: DiagnosisId;
  side: Side;
  region: Region;
  site: PalpationSite | null;
  documentedBy: string | null;
  documentedAt: string | null;
  note: string | null;
}

export type CriterionUserState = CriteriaAssessment["state"];

export interface CriteriaAssessment {
  id: string;
  criterionId: string;
  side: Side | null;
  region: Region | null;
  site: PalpationSite | null;
  state: "positive" | "negative" | "pending";
  assessedBy: string | null;
  assessedAt: string | null;
}
