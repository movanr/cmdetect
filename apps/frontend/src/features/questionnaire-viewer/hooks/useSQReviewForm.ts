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
export function useSQReviewForm(
  options: UseSQReviewFormOptions = {}
): UseFormReturn<SQFormValues> {
  const { initialAnswers } = options;

  return useForm<SQFormValues>({
    resolver: zodResolver(sqFormSchema),
    mode: "onChange", // Real-time validation as user interacts
    defaultValues: initialAnswers ?? {},
  });
}
