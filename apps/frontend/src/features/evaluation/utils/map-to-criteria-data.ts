/**
 * Maps frontend data shapes to the flat nested object expected by dc-tmd evaluate().
 *
 * The dc-tmd evaluator resolves dot-separated paths like:
 * - "sq.SQ1" → SQ questionnaire answers
 * - "e1.painLocation.left" → Examination section data
 * - "e9.left.temporalisPosterior.familiarPain" → Palpation data
 *
 * The examination FormValues already use this exact nesting (e1.*, e9.*, etc.),
 * so we just need to merge SQ answers under a "sq" key.
 */

import type { FormValues } from "../../examination";

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
    sq: sqAnswers,
    ...examinationData,
  };
}
