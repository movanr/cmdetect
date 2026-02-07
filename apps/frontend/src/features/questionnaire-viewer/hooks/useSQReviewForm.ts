/**
 * React Hook Form hook for SQ review wizard
 *
 * Uses Zod schema validation with zodResolver for:
 * - Real-time validation (mode: "onChange")
 * - Type-safe form values
 * - Conditional validation respecting enableWhen logic
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormReturn } from "react-hook-form";
import { sqFormSchema, type SQFormValues } from "../schema/sqZodSchemas";

interface UseSQReviewFormOptions {
  /** Initial form values from existing questionnaire response */
  initialAnswers?: SQFormValues;
}

/**
 * Creates a React Hook Form instance for SQ review with Zod validation
 *
 * Features:
 * - Real-time validation on change (mode: "onChange")
 * - Zod schema validates office-use only when parent answer is "yes"
 * - Respects enableWhen conditions (disabled questions not validated)
 * - Type-safe SQFormValues inferred from Zod schema
 */
/**
 * Normalizes SQ2/SQ6 duration objects so both years and months are present.
 *
 * Patient frontend allows submitting only years or only months,
 * but the practitioner review schema requires both. This fills in
 * the missing field with 0 to avoid a validation mismatch.
 */
function normalizeDurationDefaults(answers: SQFormValues): SQFormValues {
  const normalized = { ...answers };
  for (const key of ["SQ2", "SQ6"] as const) {
    const val = normalized[key];
    if (val && typeof val === "object") {
      normalized[key] = {
        years: typeof val.years === "number" ? val.years : 0,
        months: typeof val.months === "number" ? val.months : 0,
      };
    }
  }
  return normalized;
}

export function useSQReviewForm(
  options: UseSQReviewFormOptions = {}
): UseFormReturn<SQFormValues> {
  const { initialAnswers } = options;

  return useForm<SQFormValues>({
    resolver: zodResolver(sqFormSchema),
    mode: "onChange", // Real-time validation as user interacts
    defaultValues: initialAnswers ? normalizeDurationDefaults(initialAnswers) : {},
  });
}
