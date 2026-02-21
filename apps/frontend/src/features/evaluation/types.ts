/**
 * Diagnosis Evaluation Types
 *
 * Frontend types for persisted diagnosis results and practitioner decisions.
 */

import type { CriterionStatus, DiagnosisId, Region, Side } from "@cmdetect/dc-tmd";

export type PractitionerDecision = "confirmed" | null;

export interface PersistedDiagnosisResult {
  id: string;
  diagnosisId: DiagnosisId;
  side: Side;
  region: Region;
  computedStatus: CriterionStatus;
  practitionerDecision: PractitionerDecision;
  decidedBy: string | null;
  decidedAt: string | null;
  note: string | null;
}
