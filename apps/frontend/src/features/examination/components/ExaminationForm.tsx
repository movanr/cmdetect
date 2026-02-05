import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { examinationFormConfig } from "../form/use-examination-form";
import { SECTION_REGISTRY, type SectionId } from "../sections/registry";
import { E1Section } from "./sections/E1Section";
import { E2Section } from "./sections/E2Section";
import { E3Section } from "./sections/E3Section";
import { E4Section } from "./sections/E4Section";
import { E9Section } from "./sections/E9Section";
import type { SectionProps } from "./sections/types";

// Map section IDs to components (only implemented sections)
const SECTION_COMPONENTS: Partial<Record<SectionId, React.ComponentType<SectionProps>>> = {
  e1: E1Section,
  e2: E2Section,
  e3: E3Section,
  e4: E4Section,
  e9: E9Section,
};

interface ExaminationFormProps {
  onComplete?: (values: unknown) => void;
}

export function ExaminationForm({ onComplete }: ExaminationFormProps) {
  const form = useForm(examinationFormConfig);
  const [currentSection, setCurrentSection] = useState<SectionId>(SECTION_REGISTRY[0].id);

  const handleSubmit = form.handleSubmit((values) => {
    onComplete?.(values);
  });

  // Watch values for debug display
  const allValues = form.watch();

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <Tabs value={currentSection} onValueChange={(v) => setCurrentSection(v as SectionId)}>
          <TabsList
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${SECTION_REGISTRY.length}, 1fr)` }}
          >
            {SECTION_REGISTRY.map((section) => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {SECTION_REGISTRY.map((section, index) => {
            const SectionComponent = SECTION_COMPONENTS[section.id];
            const nextSection = SECTION_REGISTRY[index + 1]?.id;
            const prevSection = SECTION_REGISTRY[index - 1]?.id;
            const handleSectionComplete = nextSection
              ? () => setCurrentSection(nextSection)
              : undefined;
            const handleSectionBack = prevSection
              ? () => setCurrentSection(prevSection)
              : undefined;
            const isFirstSection = index === 0;

            return (
              <TabsContent key={section.id} value={section.id} className="mt-4">
                {SectionComponent ? (
                  <SectionComponent
                    onComplete={handleSectionComplete}
                    onBack={handleSectionBack}
                    isFirstSection={isFirstSection}
                  />
                ) : (
                  <div className="p-4 text-muted-foreground">
                    Abschnitt {section.label} ist noch nicht implementiert.
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSubmit}>Untersuchung abschließen</Button>
        </div>

        {/* Debug: Current Values */}
        <details className="border rounded">
          <summary className="p-2 cursor-pointer font-medium text-sm">Debug: Form Values</summary>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(allValues, null, 2)}
          </pre>
        </details>
      </div>
    </FormProvider>
  );
}
