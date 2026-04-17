/**
 * E8: Joint Locking (Gelenkblockierung)
 *
 * Single-step section with bilateral locking observations.
 * Per side: closed locking and open locking, each with a Blockade yes/no
 * and two conditional "lösbar durch" yes/no fields (Patient, Untersucher).
 *
 * Locking is only documented if observed during the examination.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "@/config/features";
import { E8_LOCKING_TYPE_DESCRIPTIONS, E8_LOCKING_TYPE_LABELS, SECTIONS, type E8LockingType } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle } from "lucide-react";
import { useWatch, type FieldPath } from "react-hook-form";
import { E8_RICH_INSTRUCTIONS } from "../../content/instructions";
import { setInstanceValue } from "../../form/form-helpers";
import { useExaminationForm, type FormValues } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { YesNoField } from "../inputs/YesNoField";
import { IntroPanel, MeasurementFlowBlock, SectionFooter } from ".";
import { SectionCommentButton } from "../ui/SectionCommentButton";
import type { SectionProps } from "./types";

const SIDES = [
  { key: "right", label: "Rechtes Kiefergelenk" },
  { key: "left", label: "Linkes Kiefergelenk" },
] as const;

const LOCKING_TYPES: { key: E8LockingType; label: string }[] = [
  {
    key: "closedLocking",
    label: `${E8_LOCKING_TYPE_LABELS.closedLocking} — ${E8_LOCKING_TYPE_DESCRIPTIONS.closedLocking}`,
  },
  {
    key: "openLocking",
    label: `${E8_LOCKING_TYPE_LABELS.openLocking} — ${E8_LOCKING_TYPE_DESCRIPTIONS.openLocking}`,
  },
];

export function E8Section({ onComplete, onBack, isFirstSection }: SectionProps) {
  const { form, getInstancesForStep, validateStep } = useExaminationForm();

  const instances = getInstancesForStep("e8-all");

  const yesNoPaths = instances
    .filter((i) => i.renderType === "yesNo")
    .map((i) => i.path as FieldPath<FormValues>);
  const yesNoValues = useWatch({ name: yesNoPaths });
  const hasUnansweredLockings = yesNoValues.some((v) => v == null);

  // Subscribe to the 4 locking fields to drive disabled state of the
  // "reducible by" cells.
  const lockingPaths = SIDES.flatMap(({ key: side }) =>
    LOCKING_TYPES.map(({ key: type }) => `e8.${side}.${type}.locking` as FieldPath<FormValues>)
  );
  const lockingValues = useWatch({ name: lockingPaths });
  const lockingMap = new Map(lockingPaths.map((p, i) => [p, lockingValues[i]]));

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
          <SectionCommentButton />
          {features.docsViewer && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/protocol/$section" params={{ section: "e8" }}>
                <BookOpen className="h-4 w-4 mr-1" />
                Protokoll
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Instruction flow */}
        <IntroPanel title="Anweisungen">
          <MeasurementFlowBlock instruction={E8_RICH_INSTRUCTIONS.jointLocking} />
        </IntroPanel>

        {/* Bilateral locking observations — right side stacked above left */}
        <div className="space-y-6">
          {SIDES.map(({ key: side, label: sideLabel }) => (
            <div key={side} className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left text-sm font-medium p-3" rowSpan={2}>
                      {sideLabel}
                    </th>
                    <th className="text-center text-sm font-medium p-3 w-48" rowSpan={2}>
                      Blockade
                    </th>
                    <th
                      className="text-center text-sm font-medium p-3 pb-1 border-b border-border/50"
                      colSpan={2}
                    >
                      lösbar durch
                    </th>
                  </tr>
                  <tr className="bg-muted/50">
                    <th className="text-center text-xs font-normal text-muted-foreground px-3 pb-2 pt-0 w-48">
                      Patient
                    </th>
                    <th className="text-center text-xs font-normal text-muted-foreground px-3 pb-2 pt-0 w-48">
                      Untersucher
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LOCKING_TYPES.map(({ key: lockingType, label: lockingLabel }) => {
                    const lockingPath = `e8.${side}.${lockingType}.locking` as FieldPath<FormValues>;
                    const isLocking = lockingMap.get(lockingPath) === "yes";
                    return (
                      <tr key={lockingType} className="border-t">
                        <td className="p-3 text-sm font-medium">{lockingLabel}</td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            <YesNoField name={lockingPath} />
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            <YesNoField
                              name={`e8.${side}.${lockingType}.reducibleByPatient` as FieldPath<FormValues>}
                              disabled={!isLocking}
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            <YesNoField
                              name={`e8.${side}.${lockingType}.reducibleByExaminer` as FieldPath<FormValues>}
                              disabled={!isLocking}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
