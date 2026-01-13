/**
 * OBC Form Hook
 * Sets up React Hook Form for OBC questionnaire
 */

import { useForm } from "react-hook-form";
import type { OBCAnswers } from "@cmdetect/questionnaires";

export function useOBCForm(initialAnswers?: OBCAnswers) {
  return useForm<OBCAnswers>({
    mode: "onSubmit",
    defaultValues: initialAnswers ?? {},
  });
}
