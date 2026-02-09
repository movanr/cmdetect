/**
 * Anamnesis-Based Examination Relevance
 *
 * Determines which examination items are relevant based on anamnesis (SQ) results.
 * Diagnoses whose anamnesis criteria evaluate to "negative" are ruled out,
 * and their examination fields are excluded from the relevant set.
 *
 * This enables smarter validation: only fields that contribute to still-possible
 * diagnoses need to be filled in during the examination.
 */

import type { SectionId } from "../ids/examination";
import type { DiagnosisId } from "../ids/diagnosis";
import { evaluate } from "./evaluate";
import type { Criterion } from "./types";
import type { DiagnosisDefinition } from "./location";
import { ALL_DIAGNOSES } from "./index";

/**
 * Result of anamnesis-based relevance analysis
 */
export interface AnamnesisRelevanceResult {
  /** Examination section IDs that contain fields relevant to still-possible diagnoses */
  relevantSections: SectionId[];

  /** All examination field refs from still-possible diagnoses (may contain template vars) */
  relevantFieldRefs: string[];

  /** Diagnosis IDs ruled out by anamnesis (status = "negative") */
  ruledOutDiagnoses: DiagnosisId[];

  /** Diagnosis IDs still possible after anamnesis (status = "positive" or "pending") */
  possibleDiagnoses: DiagnosisId[];
}

/**
 * Extract all field references from a criterion tree.
 *
 * Walks the criterion AST and collects all `ref` / `refs` strings
 * from leaf and quantifier nodes. Match criteria are skipped since
 * they check evaluation context, not data fields.
 */
export function collectFieldRefs(criterion: Criterion): string[] {
  switch (criterion.type) {
    case "field":
    case "threshold":
      return [criterion.ref];

    case "computed":
      return [...criterion.refs];

    case "match":
      return [];

    case "and":
    case "or":
      return criterion.criteria.flatMap(collectFieldRefs);

    case "not":
      return collectFieldRefs(criterion.criterion);

    case "any":
    case "all":
      return [...criterion.refs];
  }
}

/**
 * Extract section ID prefix from a field reference.
 *
 * @example
 * extractSectionId("e1.painLocation.left") // "e1"
 * extractSectionId("e9.${side}.temporalisAnterior.familiarPain") // "e9"
 * extractSectionId("sq.SQ1") // null (not an examination section)
 */
function extractSectionId(ref: string): SectionId | null {
  const m = ref.match(/^(e\d+)\./);
  return m ? (m[1] as SectionId) : null;
}

/**
 * Determine which examination items are relevant based on anamnesis data.
 *
 * Evaluates the anamnesis criterion of each diagnosis against the SQ data.
 * For diagnoses where anamnesis is not "negative" (i.e. still possible),
 * collects all examination field references from their examination criteria.
 *
 * @param sqData - SQ questionnaire answers (e.g. `{ SQ1: "yes", SQ3: "intermittent", SQ4_A: "yes" }`)
 * @param diagnoses - Diagnosis definitions to evaluate (defaults to ALL_DIAGNOSES)
 * @returns Relevant examination sections, field refs, and diagnosis classification
 */
export function getRelevantExaminationItems(
  sqData: Record<string, unknown>,
  diagnoses: readonly DiagnosisDefinition[] = ALL_DIAGNOSES
): AnamnesisRelevanceResult {
  const data = { sq: sqData };

  const ruledOutDiagnoses: DiagnosisId[] = [];
  const possibleDiagnoses: DiagnosisId[] = [];
  const fieldRefSet = new Set<string>();
  const sectionSet = new Set<SectionId>();

  for (const diagnosis of diagnoses) {
    const result = evaluate(diagnosis.anamnesis, data);

    if (result.status === "negative") {
      ruledOutDiagnoses.push(diagnosis.id);
      continue;
    }

    possibleDiagnoses.push(diagnosis.id);

    for (const ref of collectFieldRefs(diagnosis.examination.criterion)) {
      fieldRefSet.add(ref);
      const sectionId = extractSectionId(ref);
      if (sectionId) {
        sectionSet.add(sectionId);
      }
    }
  }

  return {
    relevantSections: [...sectionSet].sort(),
    relevantFieldRefs: [...fieldRefSet],
    ruledOutDiagnoses,
    possibleDiagnoses,
  };
}
