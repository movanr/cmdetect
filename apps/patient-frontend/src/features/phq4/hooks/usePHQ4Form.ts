/**
 * React Hook Form setup for PHQ-4
 */

import { useForm } from "react-hook-form";
import type { PHQ4Answers } from "../model/answer";

export function usePHQ4Form(initialAnswers?: PHQ4Answers) {
  return useForm<PHQ4Answers>({
    mode: "onSubmit",
    defaultValues: initialAnswers ?? {},
  });
}
