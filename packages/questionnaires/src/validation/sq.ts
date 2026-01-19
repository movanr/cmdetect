/**
 * SQ (DC/TMD Symptom Questionnaire) validation schema
 *
 * Note: The SQ has conditional logic - many questions are only shown based on
 * prior answers. This schema validates the structure, but complete validation
 * of conditional requirements is handled client-side in the patient frontend.
 */
import { z } from "zod";
import { CompositeNumberAnswerSchema, YesNoSchema } from "./common";

/**
 * SQ3 pain frequency options
 */
export const SQPainFrequencySchema = z.enum([
  "no_pain",
  "intermittent",
  "continuous",
]);


/**
 * SQ answers schema - validates structure
 *
 * Most fields are optional because they depend on conditional logic (enableWhen):
 * - SQ2, SQ3, SQ4_A-D only shown if SQ1 = "yes"
 * - SQ4_A-D also require SQ3 != "no_pain"
 * - SQ6, SQ7_A-D only shown if SQ5 = "yes"
 * - SQ10, SQ11 only shown if SQ9 = "yes"
 * - SQ12 only shown if SQ9 = "yes" AND SQ11 = "yes"
 * - SQ14 only shown if SQ13 = "yes"
 *
 * REQUIRED questions (always shown): SQ1, SQ5, SQ8, SQ9, SQ13
 */
export const SQAnswersSchema = z
  .object({
    // Section: Pain
    SQ1: YesNoSchema, // Required - always shown
    SQ2: CompositeNumberAnswerSchema.optional(), // Duration - if SQ1=yes
    SQ3: SQPainFrequencySchema.optional(), // Pain frequency - if SQ1=yes
    SQ4_A: YesNoSchema.optional(), // Matrix - if SQ1=yes AND SQ3 != no_pain
    SQ4_B: YesNoSchema.optional(),
    SQ4_C: YesNoSchema.optional(),
    SQ4_D: YesNoSchema.optional(),

    // Section: Headache
    SQ5: YesNoSchema, // Required - always shown
    SQ6: CompositeNumberAnswerSchema.optional(), // Duration - if SQ5=yes
    SQ7_A: YesNoSchema.optional(), // Matrix - if SQ5=yes
    SQ7_B: YesNoSchema.optional(),
    SQ7_C: YesNoSchema.optional(),
    SQ7_D: YesNoSchema.optional(),

    // Section: Jaw joint noises
    SQ8: YesNoSchema, // Required - always shown

    // Section: Closed locking
    SQ9: YesNoSchema, // Required - always shown
    SQ10: YesNoSchema.optional(), // If SQ9=yes
    SQ11: YesNoSchema.optional(), // If SQ9=yes
    SQ12: YesNoSchema.optional(), // If SQ9=yes AND SQ11=yes

    // Section: Open locking
    SQ13: YesNoSchema, // Required - always shown
    SQ14: YesNoSchema.optional(), // If SQ13=yes
  })
  .passthrough(); // Allow additional fields for future compatibility

/**
 * Check if SQ screening is negative (all main symptom questions answered "no")
 *
 * A negative screening means the patient doesn't report TMD symptoms for:
 * - Jaw/temple pain (SQ1)
 * - Temple headaches (SQ5)
 * - Jaw joint noises (SQ8)
 * - Closed locking (SQ9)
 * - Open locking (SQ13)
 *
 * Note: SQ10 (severity of locking) is NOT included because it's conditional on SQ9
 */
export function isSQScreeningNegative(
  answers: z.infer<typeof SQAnswersSchema>
): boolean {
  return (
    answers.SQ1 === "no" &&
    answers.SQ5 === "no" &&
    answers.SQ8 === "no" &&
    answers.SQ9 === "no" &&
    answers.SQ13 === "no"
  );
}

export type SQAnswers = z.infer<typeof SQAnswersSchema>;
export type SQPainFrequency = z.infer<typeof SQPainFrequencySchema>;
