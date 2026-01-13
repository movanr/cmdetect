/**
 * React Hook Form setup for GCPS 1-Month
 */

import { useForm } from "react-hook-form";
import type { GCPS1MAnswers } from "@cmdetect/questionnaires";

export function useGCPS1MForm(initialAnswers?: GCPS1MAnswers) {
  return useForm<GCPS1MAnswers>({
    mode: "onSubmit",
    defaultValues: initialAnswers ?? {},
  });
}
