/**
 * Zod schemas for SQ (Symptom Questionnaire) form validation
 *
 * Each input type has its own schema for reusability.
 * The full form schema uses superRefine for conditional validation
 * respecting enableWhen logic.
 */

import { z } from "zod";
import {
  SQ_OFFICE_USE_QUESTIONS,
  SQ_ENABLE_WHEN,
  isQuestionIdEnabled,
  type SQQuestionId,
  type SQAnswers,
} from "@cmdetect/questionnaires";

// ============================================================================
// Base Schemas (one per input type)
// ============================================================================

/**
 * Yes/No answer schema for radio buttons
 * Used by: SQ1, SQ5, SQ8-SQ14, SQ4_A-D, SQ7_A-D
 */
export const yesNoSchema = z.enum(["yes", "no"], {
  required_error: "Bitte eine Option auswählen",
  invalid_type_error: "Ungültige Auswahl",
});

export type YesNoValue = z.infer<typeof yesNoSchema>;

/**
 * Duration schema for years/months composite input
 * Used by: SQ2, SQ6
 *
 * Both fields are required numbers with min/max validation.
 * The form fields initialize with { years: 0, months: 0 } as default.
 */
export const durationSchema = z.object({
  years: z.number().min(0, "Jahre muss mindestens 0 sein"),
  months: z
    .number()
    .min(0, "Monate muss mindestens 0 sein")
    .max(11, "Monate darf maximal 11 sein"),
});

export type DurationValue = z.infer<typeof durationSchema>;

/**
 * Pain frequency schema for SQ3 dropdown
 * Used by: SQ3
 */
export const painFrequencySchema = z.enum(
  ["no_pain", "intermittent", "continuous"],
  {
    required_error: "Bitte Schmerzart auswählen",
    invalid_type_error: "Ungültige Schmerzart",
  }
);

export type PainFrequencyValue = z.infer<typeof painFrequencySchema>;

/**
 * Office-use confirmation schema (R/L/DNK checkboxes)
 * Used by: SQ8_office - SQ14_office
 *
 * Note: Validation for "at least one" and mutual exclusivity
 * is done in the form-level superRefine to check enableWhen conditions.
 */
export const officeUseSchema = z.object({
  R: z.boolean().optional(),
  L: z.boolean().optional(),
  DNK: z.boolean().optional(),
});

export type OfficeUseValue = z.infer<typeof officeUseSchema>;

// ============================================================================
// Office-use field keys type
// ============================================================================

/** All office-use field keys */
export type SQOfficeUseKey =
  | "SQ8_office"
  | "SQ9_office"
  | "SQ10_office"
  | "SQ11_office"
  | "SQ12_office"
  | "SQ13_office"
  | "SQ14_office";

// ============================================================================
// Full Form Schema
// ============================================================================

/**
 * Complete SQ form schema with all fields optional
 * (enableWhen may disable any question)
 */
const sqFormBaseSchema = z.object({
  // Section 1: Pain
  SQ1: yesNoSchema.optional(),
  SQ2: durationSchema.optional(),
  SQ3: painFrequencySchema.optional(),
  SQ4_A: yesNoSchema.optional(),
  SQ4_B: yesNoSchema.optional(),
  SQ4_C: yesNoSchema.optional(),
  SQ4_D: yesNoSchema.optional(),

  // Section 2: Headache
  SQ5: yesNoSchema.optional(),
  SQ6: durationSchema.optional(),
  SQ7_A: yesNoSchema.optional(),
  SQ7_B: yesNoSchema.optional(),
  SQ7_C: yesNoSchema.optional(),
  SQ7_D: yesNoSchema.optional(),

  // Section 3: Joint Noises
  SQ8: yesNoSchema.optional(),
  SQ8_office: officeUseSchema.optional(),

  // Section 4: Closed Locking
  SQ9: yesNoSchema.optional(),
  SQ9_office: officeUseSchema.optional(),
  SQ10: yesNoSchema.optional(),
  SQ10_office: officeUseSchema.optional(),
  SQ11: yesNoSchema.optional(),
  SQ11_office: officeUseSchema.optional(),
  SQ12: yesNoSchema.optional(),
  SQ12_office: officeUseSchema.optional(),

  // Section 5: Open Locking
  SQ13: yesNoSchema.optional(),
  SQ13_office: officeUseSchema.optional(),
  SQ14: yesNoSchema.optional(),
  SQ14_office: officeUseSchema.optional(),
});

// All yes/no question IDs (for validation)
const YES_NO_QUESTION_IDS: SQQuestionId[] = [
  "SQ1",
  "SQ4_A",
  "SQ4_B",
  "SQ4_C",
  "SQ4_D",
  "SQ5",
  "SQ7_A",
  "SQ7_B",
  "SQ7_C",
  "SQ7_D",
  "SQ8",
  "SQ9",
  "SQ10",
  "SQ11",
  "SQ12",
  "SQ13",
  "SQ14",
];

// Duration question IDs
const DURATION_QUESTION_IDS: SQQuestionId[] = ["SQ2", "SQ6"];

/**
 * Full SQ form schema with conditional validation
 *
 * Uses superRefine to:
 * 1. Validate enabled yes/no questions have an answer
 * 2. Validate enabled duration questions have values
 * 3. Validate SQ3 has a value when enabled
 * 4. Validate office-use when parent answer is "yes"
 * 5. Enforce at least one R/L/DNK selection
 * 6. Enforce DNK mutual exclusivity with R/L
 */
export const sqFormSchema = sqFormBaseSchema.superRefine((data, ctx) => {
  // Cast to SQAnswers for enableWhen checking
  const answersForEnableWhen = data as unknown as SQAnswers;

  // Validate yes/no questions
  for (const questionId of YES_NO_QUESTION_IDS) {
    // Skip if question is disabled by enableWhen logic
    if (!isQuestionIdEnabled(questionId, SQ_ENABLE_WHEN, answersForEnableWhen)) {
      continue;
    }

    const answer = data[questionId as keyof typeof data];
    if (answer !== "yes" && answer !== "no") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bitte eine Option auswählen",
        path: [questionId],
      });
    }
  }

  // Validate duration questions (SQ2, SQ6)
  for (const questionId of DURATION_QUESTION_IDS) {
    // Skip if question is disabled by enableWhen logic
    if (!isQuestionIdEnabled(questionId, SQ_ENABLE_WHEN, answersForEnableWhen)) {
      continue;
    }

    const value = data[questionId as keyof typeof data] as DurationValue | undefined;
    if (!value || typeof value.years !== "number" || typeof value.months !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bitte Dauer angeben",
        path: [questionId],
      });
    }
  }

  // Validate SQ3 (pain frequency)
  if (isQuestionIdEnabled("SQ3", SQ_ENABLE_WHEN, answersForEnableWhen)) {
    const sq3Value = data.SQ3;
    if (!sq3Value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bitte Schmerzart auswählen",
        path: ["SQ3"],
      });
    }
  }

  // Validate office-use fields for questions with "yes" answers
  for (const questionId of SQ_OFFICE_USE_QUESTIONS) {
    // Skip if question is disabled by enableWhen logic
    if (
      !isQuestionIdEnabled(
        questionId as SQQuestionId,
        SQ_ENABLE_WHEN,
        answersForEnableWhen
      )
    ) {
      continue;
    }

    // Get the parent answer
    const answer = data[questionId as keyof typeof data];

    // Only validate office-use if parent answer is "yes"
    if (answer !== "yes") {
      continue;
    }

    // Get office-use field
    const officeUseKey = `${questionId}_office` as SQOfficeUseKey;
    const officeUse = data[officeUseKey];

    // Check at least one selection
    const hasSelection = officeUse?.R || officeUse?.L || officeUse?.DNK;
    if (!hasSelection) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bitte Seite angeben (Rechts/Links/Unklar)",
        path: [officeUseKey],
      });
    }

    // Check mutual exclusivity: DNK cannot be combined with R or L
    if (officeUse?.DNK && (officeUse?.R || officeUse?.L)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unklar kann nicht mit Rechts/Links kombiniert werden",
        path: [officeUseKey],
      });
    }
  }
});

/**
 * Inferred type for the full SQ form values
 */
export type SQFormValues = z.infer<typeof sqFormBaseSchema>;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * All SQ question field keys (without office-use)
 */
export type SQQuestionKey = SQQuestionId;

/**
 * All SQ field keys (questions + office-use)
 */
export type SQFieldKey = SQQuestionKey | SQOfficeUseKey;
