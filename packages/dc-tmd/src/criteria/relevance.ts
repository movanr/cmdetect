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
import { MYALGIA_SUBTYPE_IDS } from "../ids/diagnosis";
import { evaluate } from "./evaluate";
import { getCriterionId, getCriterionLabel, type Criterion, type CriterionStatus } from "./types";
import type { DiagnosisCategory, DiagnosisDefinition } from "./location";
import { ALL_DIAGNOSES } from "./index";
import { painInMasticatoryStructure, painModifiedByFunction } from "./diagnoses/myalgia";
import { headacheInTemporalRegion, headacheModifiedByFunction } from "./diagnoses/headache";
import { TMJ_NOISE_ANAMNESIS, jawLockingAnamnesis, lockingAffectsEatingAnamnesis, intermittentLockingAnamnesis } from "./diagnoses/disc-displacement";
import { jawLockingOpenPositionAnamnesis, unableToCloseWithoutManeuverAnamnesis } from "./diagnoses/subluxation";

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

// ============================================================================
// Per-Diagnosis Anamnesis Results
// ============================================================================

/**
 * Per-diagnosis anamnesis evaluation result for UI display.
 *
 * Shows the anamnesis status of each diagnosis and which examination
 * sections are needed to confirm it. Myalgia subtypes are excluded
 * since they share myalgia's anamnesis criteria.
 */
export interface DiagnosisAnamnesisResult {
  id: DiagnosisId;
  nameDE: string;
  category: DiagnosisCategory;
  anamnesisStatus: CriterionStatus;
  examinationSections: SectionId[];
}

/**
 * Evaluate each diagnosis's anamnesis status and required exam sections.
 *
 * Returns 9 diagnoses (12 minus 3 myalgia subtypes which share myalgia's
 * anamnesis and would be redundant in the display). Ordered: pain first,
 * then joint.
 *
 * @param sqData - SQ questionnaire answers
 * @returns Per-diagnosis anamnesis results with required exam sections
 */
export function getPerDiagnosisAnamnesisResults(
  sqData: Record<string, unknown>
): DiagnosisAnamnesisResult[] {
  const data = { sq: sqData };
  const subtypeSet = new Set<DiagnosisId>(MYALGIA_SUBTYPE_IDS);

  const results: DiagnosisAnamnesisResult[] = [];

  for (const diagnosis of ALL_DIAGNOSES) {
    if (subtypeSet.has(diagnosis.id)) continue;

    const result = evaluate(diagnosis.anamnesis, data);

    const sectionSet = new Set<SectionId>();
    for (const ref of collectFieldRefs(diagnosis.examination.criterion)) {
      const sectionId = extractSectionId(ref);
      if (sectionId) {
        sectionSet.add(sectionId);
      }
    }

    results.push({
      id: diagnosis.id,
      nameDE: diagnosis.nameDE,
      category: diagnosis.category,
      anamnesisStatus: result.status,
      examinationSections: [...sectionSet].sort(),
    });
  }

  return results;
}

// ============================================================================
// Anamnesis Criteria Summary
// ============================================================================

/**
 * Individual anamnesis criterion evaluation result for display.
 */
export interface AnamnesisCriterionSummary {
  /** Unique criterion ID */
  id: string;
  /** German label for UI display */
  label: string;
  /** Evaluation status */
  status: CriterionStatus;
}

/**
 * The unique anamnesis criteria to evaluate and display.
 *
 * These are the individual building blocks of the diagnosis anamnesis,
 * each tied to specific SQ questions. id and label are taken from the
 * criterion metadata. fallbackId/fallbackLabel can be used for criteria
 * that don't carry their own metadata.
 */
const ANAMNESIS_CRITERIA: ReadonlyArray<{
  criterion: Criterion;
  fallbackId?: string;
  fallbackLabel?: string;
}> = [
  { criterion: painInMasticatoryStructure },
  { criterion: painModifiedByFunction },
  { criterion: headacheInTemporalRegion },
  { criterion: headacheModifiedByFunction },
  { criterion: TMJ_NOISE_ANAMNESIS },
  { criterion: jawLockingAnamnesis },
  { criterion: lockingAffectsEatingAnamnesis },
  { criterion: intermittentLockingAnamnesis },
  { criterion: jawLockingOpenPositionAnamnesis },
  { criterion: unableToCloseWithoutManeuverAnamnesis },
];

/**
 * Evaluate each unique anamnesis criterion against SQ data.
 *
 * Returns a flat list of the 10 distinct criteria used across all
 * diagnoses, each with its evaluation status. Useful for summarising
 * the SQ questionnaire results.
 *
 * @param sqData - SQ questionnaire answers
 * @returns Evaluated anamnesis criteria with id, label, and status
 */
export function getAnamnesisCriteriaSummary(
  sqData: Record<string, unknown>
): AnamnesisCriterionSummary[] {
  const data = { sq: sqData };

  return ANAMNESIS_CRITERIA.map(({ criterion, fallbackId, fallbackLabel }) => ({
    id: getCriterionId(criterion) ?? fallbackId!,
    label: getCriterionLabel(criterion) ?? fallbackLabel!,
    status: evaluate(criterion, data).status,
  }));
}

// ============================================================================
// Grouped Anamnesis Criteria (SQ → Diagnosis Groups)
// ============================================================================

/**
 * Detail of an individual anamnesis criterion within a group.
 */
export interface AnamnesisCriterionDetail {
  id: string;
  label: string;
  status: CriterionStatus;
  /** SQ question IDs extracted from this criterion (e.g., ["SQ1", "SQ3"]) */
  sqQuestionIds: string[];
}

/**
 * A group of diagnoses that share the same anamnesis criteria.
 */
export interface AnamnesisGroup {
  diagnosisIds: DiagnosisId[];
  /** Display label for the diagnosis category (e.g., "Schmerzerkrankungen", "Diskusverlagerung") */
  categoryLabel: string;
  category: DiagnosisCategory;
  criteria: AnamnesisCriterionDetail[];
  /** Examination sections needed to confirm diagnoses in this group */
  examinationSections: SectionId[];
  groupStatus: CriterionStatus;
}

/**
 * Extract SQ question IDs from a criterion tree.
 *
 * Collects all field refs starting with "sq.", strips the prefix,
 * and strips any _side suffix to get the base question ID.
 */
export function extractSqQuestionIds(criterion: Criterion): string[] {
  const refs = collectFieldRefs(criterion);
  const ids = new Set<string>();
  for (const ref of refs) {
    if (ref.startsWith("sq.")) {
      // Strip "sq." prefix, then strip suffixes (_side, _office, _A/_B/etc.)
      // to get the base question ID (e.g., "SQ7" from "SQ7_A")
      let qId = ref.slice(3);
      qId = qId.replace(/_side\..+$/, "").replace(/_office$/, "").replace(/_[A-Z]$/, "");
      ids.add(qId);
    }
  }
  return [...ids];
}

/**
 * Group definitions mapping diagnosis groups to their anamnesis criteria.
 *
 * Each group has a `categoryLabel` for UI display (e.g., "Schmerzerkrankungen").
 * Groups with the same categoryLabel are merged in the frontend card.
 */
const ANAMNESIS_GROUPS: ReadonlyArray<{
  diagnosisIds: DiagnosisId[];
  categoryLabel: string;
  category: DiagnosisCategory;
  criteria: Criterion[];
}> = [
  {
    diagnosisIds: ["myalgia", "arthralgia"],
    categoryLabel: "Schmerzerkrankungen",
    category: "pain",
    criteria: [painInMasticatoryStructure, painModifiedByFunction],
  },
  {
    diagnosisIds: ["headacheAttributedToTmd"],
    categoryLabel: "Schmerzerkrankungen",
    category: "pain",
    criteria: [headacheInTemporalRegion, headacheModifiedByFunction],
  },
  {
    diagnosisIds: ["discDisplacementWithReduction"],
    categoryLabel: "Diskusverlagerung",
    category: "joint",
    criteria: [TMJ_NOISE_ANAMNESIS],
  },
  {
    diagnosisIds: ["discDisplacementWithReductionIntermittentLocking"],
    categoryLabel: "Diskusverlagerung",
    category: "joint",
    criteria: [TMJ_NOISE_ANAMNESIS, intermittentLockingAnamnesis],
  },
  {
    diagnosisIds: [
      "discDisplacementWithoutReductionLimitedOpening",
      "discDisplacementWithoutReductionWithoutLimitedOpening",
    ],
    categoryLabel: "Diskusverlagerung",
    category: "joint",
    criteria: [jawLockingAnamnesis, lockingAffectsEatingAnamnesis],
  },
  {
    diagnosisIds: ["degenerativeJointDisease"],
    categoryLabel: "Degenerative Gelenkerkrankung",
    category: "joint",
    criteria: [TMJ_NOISE_ANAMNESIS],
  },
  {
    diagnosisIds: ["subluxation"],
    categoryLabel: "Subluxation",
    category: "joint",
    criteria: [jawLockingOpenPositionAnamnesis, unableToCloseWithoutManeuverAnamnesis],
  },
];

/** Combine criterion statuses with AND logic. */
function andStatus(statuses: CriterionStatus[]): CriterionStatus {
  if (statuses.some((s) => s === "negative")) return "negative";
  if (statuses.some((s) => s === "pending")) return "pending";
  return "positive";
}

/**
 * Get anamnesis criteria grouped by diagnosis groups.
 *
 * Shows the inverse relationship: which SQ questions feed into which
 * diagnosis groups, with the actual criteria and their evaluation status.
 *
 * @param sqData - SQ questionnaire answers
 * @returns Anamnesis groups with evaluated criteria
 */
export function getGroupedAnamnesisCriteria(
  sqData: Record<string, unknown>
): AnamnesisGroup[] {
  const data = { sq: sqData };

  return ANAMNESIS_GROUPS.map((group) => {
    const criteria: AnamnesisCriterionDetail[] = group.criteria.map((criterion) => ({
      id: getCriterionId(criterion) ?? "",
      label: getCriterionLabel(criterion) ?? "",
      status: evaluate(criterion, data).status,
      sqQuestionIds: extractSqQuestionIds(criterion),
    }));

    // Collect exam sections from all diagnoses in this group
    const sectionSet = new Set<SectionId>();
    for (const diagId of group.diagnosisIds) {
      const diag = ALL_DIAGNOSES.find((d) => d.id === diagId);
      if (diag) {
        for (const ref of collectFieldRefs(diag.examination.criterion)) {
          const sectionId = extractSectionId(ref);
          if (sectionId) sectionSet.add(sectionId);
        }
      }
    }

    return {
      diagnosisIds: [...group.diagnosisIds],
      categoryLabel: group.categoryLabel,
      category: group.category,
      criteria,
      examinationSections: [...sectionSet].sort(),
      groupStatus: andStatus(criteria.map((c) => c.status)),
    };
  });
}
