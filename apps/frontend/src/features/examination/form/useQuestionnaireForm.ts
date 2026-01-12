import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Question } from "../model/question";
import { zodSchemaFromQuestions } from "./schema/fromQuestions";

export function useQuestionForm(questions: Question[]) {
  const schema = zodSchemaFromQuestions(questions);

  return useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {},
  });
}
