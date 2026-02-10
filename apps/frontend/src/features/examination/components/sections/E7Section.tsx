/**
 * E7: TMJ Sounds during Lateral and Protrusive Movements
 *
 * Single-step section with bilateral tables for examiner-detected and
 * patient-reported joint sounds (click/crepitus), plus conditional
 * pain questions when patient reports clicking.
 *
 * Simpler table than E6: one examiner column (not split by open/close).
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { E7_RICH_INSTRUCTIONS } from "../../content/instructions";
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { QuestionField } from "../QuestionField";
import { YesNoField } from "../inputs/YesNoField";
import { IntroPanel, MeasurementFlowBlock, SectionFooter } from "../ui";
import type { SectionProps } from "./types";

const SIDES = [
  { key: "right", label: "Rechtes Kiefergelenk" },
  { key: "left", label: "Linkes Kiefergelenk" },
] as const;

export function E7Section({ onComplete, onBack, isFirstSection }: SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();

  const instances = getInstancesForStep("e7-all");

  const getInstance = (path: string) =>
    instances.find((i) => i.path === path);

  const handleNext = () => {
    const isValid = validateStep("e7-all");
    if (isValid) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{getSectionCardTitle(SECTIONS.e7)}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/protocol/$section" params={{ section: "e7" }}>
            <BookOpen className="h-4 w-4 mr-1" />
            Protokoll
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Instruction flow */}
        <IntroPanel title="Anweisungen">
          <MeasurementFlowBlock instruction={E7_RICH_INSTRUCTIONS.jointSounds} />
        </IntroPanel>

        {/* Bilateral tables — side by side */}
        <div className="grid grid-cols-2 gap-6">
        {SIDES.map(({ key: side, label }) => (
          <div key={side} className="space-y-4">
            <h4 className="font-medium">{label}</h4>

            {/* Sound observation table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left text-sm font-medium p-3 w-28" />
                    <th className="text-center text-sm font-medium p-3">Untersucher</th>
                    <th className="text-center text-sm font-medium p-3">Patient</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Click row */}
                  <tr className="border-t">
                    <td className="p-3 text-sm font-medium">Knacken</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <YesNoField name={`e7.${side}.click.examiner`} />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <YesNoField name={`e7.${side}.click.patient`} />
                      </div>
                    </td>
                  </tr>
                  {/* Crepitus row */}
                  <tr className="border-t">
                    <td className="p-3 text-sm font-medium">Reiben</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <YesNoField name={`e7.${side}.crepitus.examiner`} />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <YesNoField name={`e7.${side}.crepitus.patient`} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Conditional pain fields (below table, only for click) */}
            {(() => {
              const painWithClick = getInstance(`e7.${side}.click.painWithClick`);
              const familiarPain = getInstance(`e7.${side}.click.familiarPain`);
              return (
                <div className="pl-4 space-y-3">
                  {painWithClick && (
                    <QuestionField instance={painWithClick} label="schmerzhaftes Knacken" />
                  )}
                  {familiarPain && (
                    <QuestionField instance={familiarPain} label="Bekannter Schmerz" />
                  )}
                </div>
              );
            })()}
          </div>
        ))}
        </div>
      </CardContent>
      <SectionFooter
        onNext={handleNext}
        onSkipConfirm={onComplete}
        onBack={onBack}
        isFirstStep={isFirstSection}
        warnOnSkip
        checkIncomplete={() => !validateStep("e7-all")}
      />
    </Card>
  );
}
