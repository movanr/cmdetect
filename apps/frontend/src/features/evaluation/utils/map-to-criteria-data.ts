/**
 * Maps frontend data shapes to the flat nested object expected by dc-tmd evaluate().
 *
 * The dc-tmd evaluator resolves dot-separated paths like:
 * - "sq.SQ1" → SQ questionnaire answers
 * - "sq.SQ8_side.left" → SQ office-use side data (transformed)
 * - "e1.painLocation.left" → Examination section data
 * - "e9.left.temporalisPosterior.familiarPain" → Palpation data
 *
 * The examination FormValues already use this exact nesting (e1.*, e9.*, etc.),
 * so we just need to merge SQ answers under a "sq" key and transform
 * office-use side data.
 */

import type { FormValues } from "../../examination";

/** SQ question IDs that have office-use side marking */
const SQ_OFFICE_USE_IDS = ["SQ8", "SQ9", "SQ10", "SQ11", "SQ12", "SQ13", "SQ14"] as const;

/**
 * Transforms SQ office-use { R?, L?, DNK? } into side-keyed { left, right } format.
 *
 * Rules:
 * - If SQ answer is "yes" and office-use exists: left = L || DNK, right = R || DNK
 * - If SQ answer is "yes" but no office-use: left = true, right = true (no constraint)
 * - If SQ answer is not "yes": no _side entry created (irrelevant)
 */
function transformOfficeSideData(
  sqAnswers: Record<string, unknown>
): Record<string, { left: boolean; right: boolean }> {
  const sideData: Record<string, { left: boolean; right: boolean }> = {};

  for (const qId of SQ_OFFICE_USE_IDS) {
    if (sqAnswers[qId] !== "yes") continue;

    const office = sqAnswers[`${qId}_office`] as
      | { R?: boolean; L?: boolean; DNK?: boolean }
      | undefined;

    if (office && (office.R || office.L || office.DNK)) {
      sideData[`${qId}_side`] = {
        left: !!(office.L || office.DNK),
        right: !!(office.R || office.DNK),
      };
    } else {
      // No office-use filled → both sides (backward compatible, no constraint)
      sideData[`${qId}_side`] = { left: true, right: true };
    }
  }

  return sideData;
}

/**
 * Combines SQ questionnaire answers and examination form data into
 * a single data object for dc-tmd criteria evaluation.
 *
 * @param sqAnswers - SQ questionnaire answers (e.g., { SQ1: "yes", SQ3: "intermittent" })
 * @param examinationData - Examination form values (e.g., { e1: {...}, e9: {...} })
 * @returns Merged data object with `sq` prefix for questionnaire answers
 */
export function mapToCriteriaData(
  sqAnswers: Record<string, unknown>,
  examinationData: FormValues
): Record<string, unknown> {
  return {
    sq: {
      ...sqAnswers,
      ...transformOfficeSideData(sqAnswers),
    },
    ...examinationData,
  };
}
