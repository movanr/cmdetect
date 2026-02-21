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
import { BookOpen, CheckCircle } from "lucide-react";
import type { FieldPath } from "react-hook-form";
import { E8_RICH_INSTRUCTIONS } from "../../content/instructions";
import { setInstanceValue } from "../../form/form-helpers";
import { useExaminationForm, type FormValues } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { QuestionField } from "../QuestionField";
import { YesNoField } from "../inputs/YesNoField";
import { IntroPanel, MeasurementFlowBlock, SectionFooter } from "../ui";
import { SectionCommentButton } from "../ui/SectionCommentButton";
import type { SectionProps } from "./types";

const SIDES = [
  { key: "right", label: "Rechtes Kiefergelenk" },
  { key: "left", label: "Linkes Kiefergelenk" },
] as const;

const LOCKING_TYPES = [
  { key: "closedLocking", label: "Geschlossene Arretierung", reductionLabel: "Reposition (geschl.)" },
  { key: "openLocking", label: "Geöffnete Arretierung", reductionLabel: "Reposition (geöffnet)" },
] as const;

export function E8Section({ onComplete, onBack, isFirstSection }: SectionProps) {
  const { form, getInstancesForStep, validateStep } = useExaminationForm();

  const instances = getInstancesForStep("e8-all");

  const getInstance = (path: string) =>
    instances.find((i) => i.path === path);

  const yesNoPaths = instances
    .filter((i) => i.renderType === "yesNo")
    .map((i) => i.path as FieldPath<FormValues>);
  const hasUnansweredLockings = form.watch(yesNoPaths).some((v) => v == null);

  // Set all unanswered locking questions to "no"
  const handleNoMoreLockings = () => {
    for (const inst of instances) {
      if (inst.renderType === "yesNo") {
        const currentValue = form.getValues(inst.path as FieldPath<FormValues>);
        if (currentValue == null) {
          setInstanceValue(form.setValue, inst.path, "no");
        }
      }
    }
  };

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
        <div className="flex items-center gap-1">
          <SectionCommentButton sectionId="e8" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/protocol/$section" params={{ section: "e8" }}>
              <BookOpen className="h-4 w-4 mr-1" />
              Protokoll
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Instruction flow */}
        <IntroPanel title="Anweisungen">
          <MeasurementFlowBlock instruction={E8_RICH_INSTRUCTIONS.jointLocking} />
        </IntroPanel>

        {/* Bilateral locking observations — side by side (single column on small screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SIDES.map(({ key: side, label: sideLabel }) => (
          <div key={side} className="space-y-4">
            {/* Locking observation table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left text-sm font-medium p-3" colSpan={2}>{sideLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {LOCKING_TYPES.map(({ key: lockingType, label: lockingLabel }) => (
                    <tr key={lockingType} className="border-t">
                      <td className="p-3 text-sm font-medium">{lockingLabel}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center">
                          <YesNoField name={`e8.${side}.${lockingType}.locking`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Conditional reduction fields (below table) */}
            <div className="pl-4 space-y-3">
              {LOCKING_TYPES.map(({ key: lockingType, reductionLabel }) => {
                const reduction = getInstance(`e8.${side}.${lockingType}.reduction`);
                return reduction && (
                  <QuestionField key={lockingType} instance={reduction} label={reductionLabel} />
                );
              })}
            </div>
          </div>
        ))}
        </div>
        {/* "Keine weiteren Blockierungen" shortcut — only shown when there are unanswered fields */}
        {hasUnansweredLockings && <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleNoMoreLockings}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Keine weiteren Blockierungen
          </Button>
        </div>}
      </CardContent>
      <SectionFooter
        onNext={handleNext}
        onSkipConfirm={onComplete}
        onBack={onBack}
        isFirstStep={isFirstSection}
        directSkipLabel="Abschnitt überspringen"
      />
    </Card>
  );
}
