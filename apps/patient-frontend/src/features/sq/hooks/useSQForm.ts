/**
 * React Hook Form setup for DC/TMD Symptom Questionnaire
 */

import { useForm, type UseFormReturn } from "react-hook-form";
import type { SQAnswers } from "@cmdetect/questionnaires";

type UseSQFormOptions = {
  initialAnswers?: SQAnswers;
};

/**
 * Creates a form instance for the SQ questionnaire
 * Uses mode: "onSubmit" to only validate when Next is clicked
 */
export function useSQForm(
  options: UseSQFormOptions = {}
): UseFormReturn<SQAnswers> {
  const { initialAnswers } = options;

  return useForm<SQAnswers>({
    mode: "onSubmit", // Only validate on submit (Next button)
    defaultValues: initialAnswers ?? {},
  });
}
