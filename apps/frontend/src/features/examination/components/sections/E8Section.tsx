/**
 * E8: Joint Locking (Gelenkblockierung)
 *
 * Single-step section with bilateral locking observations.
 * Per side: closed locking and open locking, each with a yes/no toggle
 * and conditional reduction enum (patient/examiner/not reduced).
 *
 * Locking is only documented if observed during the examination.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { E8_RICH_INSTRUCTIONS } from "../../content/instructions";
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { QuestionField } from "../QuestionField";
import { YesNoField } from "../inputs/YesNoField";
import { MeasurementFlowBlock, SectionFooter } from "../ui";
import type { SectionProps } from "./types";

const SIDES = [
  { key: "right", label: "Rechtes Kiefergelenk" },
  { key: "left", label: "Linkes Kiefergelenk" },
] as const;

const LOCKING_TYPES = [
  { key: "closedLocking", label: "Geschlossene Arretierung" },
  { key: "openLocking", label: "Geöffnete Arretierung" },
] as const;

export function E8Section({ onComplete, onBack, isFirstSection }: SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();

  const instances = getInstancesForStep("e8-all");

  const getInstance = (path: string) =>
    instances.find((i) => i.path === path);

  const handleNext = () => {
    const isValid = validateStep("e8-all");
    if (isValid) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{getSectionCardTitle(SECTIONS.e8)}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/protocol/$section" params={{ section: "e8" }}>
            <BookOpen className="h-4 w-4 mr-1" />
            Protokoll
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Instruction flow */}
        <MeasurementFlowBlock instruction={E8_RICH_INSTRUCTIONS.jointLocking} />

        {/* Bilateral locking observations — side by side */}
        <div className="grid grid-cols-2 gap-6">
        {SIDES.map(({ key: side, label: sideLabel }) => (
          <div key={side} className="rounded-lg border p-4 space-y-4">
            <h4 className="font-medium">{sideLabel}</h4>

            {LOCKING_TYPES.map(({ key: lockingType, label: lockingLabel }) => {
              const reduction = getInstance(`e8.${side}.${lockingType}.reduction`);
              return (
                <div key={lockingType} className="space-y-3">
                  <YesNoField
                    name={`e8.${side}.${lockingType}.locking`}
                    label={lockingLabel}
                  />
                  {reduction && (
                    <div className="pl-4">
                      <QuestionField instance={reduction} label="Reposition" />
                    </div>
                  )}
                </div>
              );
            })}
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
        checkIncomplete={() => !validateStep("e8-all")}
      />
    </Card>
  );
}
