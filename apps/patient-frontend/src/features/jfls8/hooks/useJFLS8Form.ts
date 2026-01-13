/**
 * React Hook Form setup for JFLS-8
 */

import { useForm } from "react-hook-form";
import type { JFLS8Answers } from "@cmdetect/questionnaires";

export function useJFLS8Form(initialAnswers?: JFLS8Answers) {
  return useForm<JFLS8Answers>({
    mode: "onSubmit",
    defaultValues: initialAnswers ?? {},
  });
}
