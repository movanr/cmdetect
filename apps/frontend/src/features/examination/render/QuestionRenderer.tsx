/*import type { Question } from "../model/questionBlueprint";
import { QuestionGroupRenderer } from "./QuestionGroupRenderer";
import { ChoiceQuestion } from "./questions/ChoiceQuestion";
import { NumericQuestion } from "./questions/NumericQuestion";

export function QuestionRenderer({ question }: { question: Question }) {
  switch (question.type) {
    case "numeric":
      return <NumericQuestion question={question} />;
    case "choice":
      return <ChoiceQuestion question={question} />;
    case "group":
      return <QuestionGroupRenderer group={question} />;
    default:
      assertNever(question);
  }
}

function assertNever(_x: never): never {
  throw new Error("Unhandled question type");
}
*/

// render/QuestionRenderer.tsx

import { Controller, useFormContext } from "react-hook-form";
import type { Question } from "../model/question";

export function QuestionRenderer({ question }: { question: Question }) {
  const { control } = useFormContext();

  if (question.type === "choice") {
    return (
      <Controller
        name={question.instanceId}
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-1">
            <div className="font-medium">{question.context.region}</div>
            <div className="font-medium">{question.semanticId}</div>

            {question.answerOptions.map((opt) => (
              <label key={opt.semanticId} className="flex gap-2">
                <input
                  type="radio"
                  value={opt.semanticId}
                  checked={field.value === opt.semanticId}
                  onChange={() => field.onChange(opt.semanticId)}
                />
                {opt.semanticId}
              </label>
            ))}

            {fieldState.error && (
              <div className="text-sm text-red-600">{fieldState.error.message}</div>
            )}
          </div>
        )}
      />
    );
  }

  return null;
}
