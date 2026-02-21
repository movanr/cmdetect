/**
 * Evaluation Feature
 *
 * Provides DC/TMD diagnosis evaluation UI, data mapping utilities,
 * backend persistence, and practitioner decision management.
 */

export { EvaluationView } from "./components/EvaluationView";
export { SummaryDiagrams } from "./components/SummaryDiagrams";
export { mapToCriteriaData } from "./utils/map-to-criteria-data";

// Backend persistence
export { useDiagnosisSync } from "./hooks/use-diagnosis-sync";
export type {
  PractitionerDecision,
  PersistedDiagnosisResult,
} from "./types";
