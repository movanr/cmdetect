/**
 * Evaluation Feature
 *
 * Provides DC/TMD diagnosis evaluation UI, data mapping utilities,
 * backend persistence, and documented diagnosis management.
 */

export { EvaluationView } from "./components/EvaluationView";
export { SummaryDiagrams } from "./components/SummaryDiagrams";
export { evaluationSearchSchema } from "./search-schema";
export type { EvaluationSearch } from "./search-schema";
export { mapToCriteriaData } from "./utils/map-to-criteria-data";

// Backend persistence
export { useDocumentedDiagnoses } from "./hooks/use-diagnosis-evaluation";
export type { DocumentedDiagnosis } from "./types";
