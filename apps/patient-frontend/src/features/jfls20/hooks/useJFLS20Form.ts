/**
 * React Hook Form setup for JFLS-20
 */

import { useForm } from "react-hook-form";
import type { JFLS20Answers } from "@cmdetect/questionnaires";

export function useJFLS20Form(initialAnswers?: JFLS20Answers) {
  return useForm<JFLS20Answers>({
    mode: "onSubmit",
    defaultValues: initialAnswers ?? {},
  });
}
