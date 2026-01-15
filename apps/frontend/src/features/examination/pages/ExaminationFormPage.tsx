/**
 * ExaminationFormPage - Main examination form integrating all sections
 *
 * This is the form-based mode of the DC-TMD examination engine.
 * It renders all examination sections in a scrollable form.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - All questions are optional during entry
 * - Submit validates completeness
 * - Form state persists during the session
 */

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { E4OpeningSection } from "../render/sections/E4OpeningSection";
import { E9PalpationSection } from "../render/sections/E9PalpationSection";
import { createE4Questions, E4_SECTION } from "../definition/sections/e4-opening";
import { createE9Questions, E9_SECTION } from "../definition/sections/e9-palpation";
import { zodSchemaFromQuestions } from "../form/schema/fromQuestions";

/**
 * Create the combined schema from all section questions.
 */
function createExaminationSchema() {
  const e4Questions = createE4Questions();
  const e9Questions = createE9Questions();
  const allQuestions = [...e4Questions, ...e9Questions];
  return zodSchemaFromQuestions(allQuestions);
}

// Create the schema once
const examinationSchema = createExaminationSchema();
type ExaminationFormValues = z.infer<typeof examinationSchema>;

interface ExaminationFormPageProps {
  /** Initial values to populate the form */
  defaultValues?: Partial<ExaminationFormValues>;
  /** Callback when form is submitted */
  onSubmit?: (values: ExaminationFormValues) => void;
  /** Callback when form values change (for autosave) */
  onChange?: (values: ExaminationFormValues) => void;
}

export function ExaminationFormPage({
  defaultValues,
  onSubmit,
  // onChange is available for autosave implementation
  onChange: _onChange,
}: ExaminationFormPageProps) {
  const methods = useForm<ExaminationFormValues>({
    resolver: zodResolver(examinationSchema),
    mode: "onChange",
    defaultValues: defaultValues ?? {},
  });

  const handleSubmit = methods.handleSubmit((data) => {
    console.log("Examination form submitted:", data);
    onSubmit?.(data);
  });

  // Optional: Track changes for autosave
  // useEffect(() => {
  //   const subscription = methods.watch((values) => {
  //     onChange?.(values as ExaminationFormValues);
  //   });
  //   return () => subscription.unsubscribe();
  // }, [methods, onChange]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">DC-TMD Untersuchung</h1>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log("Current values:", methods.getValues());
              }}
            >
              Debug
            </Button>
            <Button type="submit">Speichern</Button>
          </div>
        </div>

        <Tabs defaultValue="E4" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="E4">{E4_SECTION.id} - Öffnung</TabsTrigger>
            <TabsTrigger value="E9">{E9_SECTION.id} - Palpation</TabsTrigger>
          </TabsList>
          <TabsContent value="E4" className="mt-4">
            <E4OpeningSection />
          </TabsContent>
          <TabsContent value="E9" className="mt-4">
            <E9PalpationSection />
          </TabsContent>
        </Tabs>

        {/* Form state summary */}
        {methods.formState.isDirty && (
          <p className="text-sm text-muted-foreground">
            Sie haben ungespeicherte Änderungen.
          </p>
        )}
      </form>
    </FormProvider>
  );
}
