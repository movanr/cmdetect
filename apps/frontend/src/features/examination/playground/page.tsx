import { FormProvider } from "react-hook-form";
import { useInstanceForm } from "../form/useQuestionnaireForm";
import { QuestionRenderer } from "../render/QuestionRenderer";
import { PAIN_INTERVIEW_INSTANCES } from "./testQuestions";

export default function ExaminationPlaygroundPage() {
  const instances = PAIN_INTERVIEW_INSTANCES;

  const methods = useInstanceForm(instances);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit((data) => {
          console.log("SUBMIT", data);
        })}
        className="space-y-4"
      >
        {instances.map((i) => (
          <QuestionRenderer key={i.instanceId} instance={i} />
        ))}

        <div className="space-x-2">
          <button
            type="button"
            onClick={() => {
              console.log("Current form values:", methods.getValues());
              console.log("Registered fields:", methods.control._fields);
              console.log("Field 3:", methods.control._fields["3"]);
            }}
            className="rounded bg-gray-500 text-white px-4 py-2"
          >
            Debug Values
          </button>
          <button type="submit" className="rounded bg-black text-white px-4 py-2">
            Submit
          </button>
        </div>
      </form>
    </FormProvider>
  );

  /*const draftSchema = draftSchemaFromQuestions(testQuestions);

  const methods = useExaminationForm(draftSchema);
  
  return (
    <div className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-xl font-semibold">Examination Playground</h1>

      <FormProvider {...methods}>
        <form
          className="space-y-4"
          onSubmit={methods.handleSubmit((values) => {
            // Flatten values and validate with submit schema
            console.log(values);
            const flat = flattenObject(values);
            console.log("flattend values", flat);
            const result = submitSchemaFromQuestions(testQuestions).safeParse(flat);

            if (!result.success) {
              console.error("Submit validation failed", result.error);

              // Map Zod errors to React Hook Form
              result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as string;

                methods.setError(fieldName, {
                  type: "submit",
                  message: issue.message,
                });
              });
              return;
            }

            console.log("SUBMIT OK", result.data);
          })}
        >
          {testQuestions.map((q) => (
            <QuestionRenderer key={q.id} question={q} />
          ))}

          <div className="space-x-2">
            <button
              type="button"
              onClick={() => {
                console.log("Current form values:", methods.getValues());
                console.log("Registered fields:", methods.control._fields);
                console.log("Field 3:", methods.control._fields["3"]);
              }}
              className="rounded bg-gray-500 text-white px-4 py-2"
            >
              Debug Values
            </button>
            <button type="submit" className="rounded bg-black text-white px-4 py-2">
              Submit
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );*/
}
