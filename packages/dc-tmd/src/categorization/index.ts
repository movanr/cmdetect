/**
 * DC/TMD Clinical Findings Categorization
 *
 * Categorizes DC/TMD data into symptoms (SQ + E confirmed),
 * history (SQ only), and signs (E only).
 */

// Types
export type {
  FindingCategory,
  SymptomDomain,
  HistoryType,
  SymptomFinding,
  HistoryFinding,
  SignFinding,
  CategorizedFinding,
  ClinicalFindings,
} from "./types";

// Extraction
export { extractClinicalFindings } from "./extract";

// Anamnesis text generation
export { generateAnamnesisText } from "./anamnesis-text";
