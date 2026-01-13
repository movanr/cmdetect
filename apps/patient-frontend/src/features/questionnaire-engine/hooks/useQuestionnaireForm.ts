/**
 * Generic form hook for questionnaires
 */

import { useForm } from "react-hook-form";

export function useQuestionnaireForm<T extends Record<string, unknown>>(
  initialAnswers?: T
) {
  return useForm<T>({
    mode: "onSubmit",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: initialAnswers as any,
  });
}
