/**
 * SQ EnableWhen Conditions Map
 * Extracted for use when you don't need full question objects
 */
import type { EnableWhenCondition, SQQuestionId } from "../types";

/**
 * EnableWhen conditions for SQ questions
 * Questions without entries are always shown
 */
export const SQ_ENABLE_WHEN: Partial<
  Record<SQQuestionId, EnableWhenCondition[]>
> = {
  // SQ2, SQ3 require SQ1 = yes
  SQ2: [{ questionId: "SQ1", operator: "=", value: "yes" }],
  SQ3: [{ questionId: "SQ1", operator: "=", value: "yes" }],

  // SQ4_A-D require SQ1 = yes AND SQ3 != no_pain
  SQ4_A: [
    { questionId: "SQ1", operator: "=", value: "yes" },
    { questionId: "SQ3", operator: "!=", value: "no_pain" },
  ],
  SQ4_B: [
    { questionId: "SQ1", operator: "=", value: "yes" },
    { questionId: "SQ3", operator: "!=", value: "no_pain" },
  ],
  SQ4_C: [
    { questionId: "SQ1", operator: "=", value: "yes" },
    { questionId: "SQ3", operator: "!=", value: "no_pain" },
  ],
  SQ4_D: [
    { questionId: "SQ1", operator: "=", value: "yes" },
    { questionId: "SQ3", operator: "!=", value: "no_pain" },
  ],

  // SQ6, SQ7_A-D require SQ5 = yes
  SQ6: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  SQ7_A: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  SQ7_B: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  SQ7_C: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  SQ7_D: [{ questionId: "SQ5", operator: "=", value: "yes" }],

  // SQ10, SQ11 require SQ9 = yes
  SQ10: [{ questionId: "SQ9", operator: "=", value: "yes" }],
  SQ11: [{ questionId: "SQ9", operator: "=", value: "yes" }],

  // SQ12 requires SQ9 = yes AND SQ11 = yes
  SQ12: [
    { questionId: "SQ9", operator: "=", value: "yes" },
    { questionId: "SQ11", operator: "=", value: "yes" },
  ],

  // SQ14 requires SQ13 = yes
  SQ14: [{ questionId: "SQ13", operator: "=", value: "yes" }],
};
