import { FormProvider } from "react-hook-form";
import { questions } from "../data/examinationDefinition";
import { QuestionRenderer } from "../render/QuestionRenderer";
import { useExaminationForm } from "./useExaminationForm";

export function ExaminationForm() {
  const methods = useExaminationForm(questions);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={methods.handleSubmit((values) => {
          console.log("FORM VALUES", values);
        })}
      >
        {questions.map((q) => (
          <QuestionRenderer key={q.id} question={q} />
        ))}

        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

/*
Usage:

<form
  onSubmit={methods.handleSubmit(values => {
    const answers = mapFormToAnswers(values);
    saveAnswers(answers);
  })}
>

*/

// the following comments are not necessarily about this exact file but general considerations
/*
// Optional: Autosave on change (very common)

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export function useAutosave(
  onSave: (answers: ExaminationAnswers) => void
) {
  const { watch } = useFormContext();

  useEffect(() => {
    const subscription = watch(values => {
      onSave(values as ExaminationAnswers);
    });
    return () => subscription.unsubscribe();
  }, [watch, onSave]);
}

// Use inside your form:

<FormProvider {...methods}>
  <Autosave />
  ...
</FormProvider>

*/

// Enable/disable logic reads from RHF, not storage

/*
const { watch } = useFormContext();
const answers = watch();

const enabled = evaluateEnableWhen(question.enableWhen, answers);

*/

/*

Later, you can:

diff answers before saving

track dirty fields

version answers

migrate schemas

validate server-side using the same Zod schema

All without touching UI rendering.

*/

/* next steps

wire enable/disable conditions

handle nested groups

support repeatable sections

generate backend validators from the same schema
*/
