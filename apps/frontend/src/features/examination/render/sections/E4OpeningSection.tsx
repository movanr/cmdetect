/**
 * E4OpeningSection - Opening Movements Examination Section
 *
 * Renders the E4 section of the DC-TMD examination form:
 * - Pain-free opening measurement
 * - Maximum unassisted opening (measurement + terminated + pain interview)
 * - Maximum assisted opening (measurement + terminated + pain interview)
 *
 * Supports two view modes:
 * - Table: Traditional grid-based pain interview
 * - Interactive: SVG head diagram with guided questioning
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { StepInstruction } from "../../content/instructions";
import { E4_INSTRUCTIONS } from "../../content/instructions";
import { getLabel, SECTION_LABELS } from "../../content/labels";
import {
  createMeasurementQuestion,
  createTerminatedQuestion,
  E4_PAIN_REGIONS,
  getE4PainTypes,
} from "../../definition/sections/e4-opening";
import { MEASUREMENT_IDS } from "../../model/measurement";
import { MOVEMENTS } from "../../model/movement";
import { REGIONS } from "../../model/region";
import { MeasurementField } from "../form-fields/MeasurementField";
import { TerminatedCheckbox } from "../form-fields/TerminatedCheckbox";
import { E4InteractiveWizard, InstructionBlock, InteractiveExamSection } from "../interactive";
import type { Region } from "../interactive/types";
import { PainInterviewGrid } from "./PainInterviewGrid";

/** View mode for pain interview */
type ViewMode = "table" | "interactive";

interface MovementSectionProps {
  title: string;
  movement: (typeof MOVEMENTS)[keyof typeof MOVEMENTS];
  viewMode: ViewMode;
  regions: readonly Region[];
  /** Instructions to display in interactive mode */
  instruction?: StepInstruction;
}

/**
 * Sub-section for a single movement type (max unassisted or max assisted).
 */
function MovementSection({
  title,
  movement,
  viewMode,
  regions,
  instruction,
}: MovementSectionProps) {
  const { watch } = useFormContext();

  // Create question objects using factories - deterministic instanceIds bind to form state
  const measurementQ = createMeasurementQuestion(movement);
  const terminatedQ = createTerminatedQuestion(movement);

  const isTerminated = watch(terminatedQ.instanceId) === true;

  return (
    <div className="space-y-4">
      {/* Instruction block - only in interactive mode */}
      {viewMode === "interactive" && instruction && <InstructionBlock {...instruction} />}

      <h4 className="font-medium">{title}</h4>

      <div className="flex items-center gap-6">
        <MeasurementField
          name={measurementQ.instanceId}
          label={getLabel(measurementQ.semanticId)}
          unit={measurementQ.unit}
          min={measurementQ.min}
          max={measurementQ.max}
        />
        <TerminatedCheckbox name={terminatedQ.instanceId} />
      </div>

      {/* Pain interview - table or interactive mode */}
      <div className={isTerminated ? "opacity-50" : ""}>
        <p className="mb-2 text-sm text-muted-foreground">
          Schmerzbeurteilung nach Bewegung
          {isTerminated && " (übersprungen - Untersuchung abgebrochen)"}
        </p>
        {viewMode === "table" ? (
          <PainInterviewGrid
            key={`grid-${movement}`}
            movement={movement}
            regions={regions}
            painTypesForRegion={getE4PainTypes}
            disabled={isTerminated}
          />
        ) : (
          <InteractiveExamSection
            key={`interactive-${movement}`}
            movement={movement}
            regions={regions}
            disabled={isTerminated}
          />
        )}
      </div>
    </div>
  );
}

interface E4OpeningSectionProps {
  /** Optional className for the container */
  className?: string;
}

export function E4OpeningSection({ className }: E4OpeningSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [includeExtraRegions, setIncludeExtraRegions] = useState(true);

  // Filter regions based on toggle - excludes NON_MAST and OTHER_MAST when off
  const regions = useMemo((): readonly Region[] => {
    if (includeExtraRegions) {
      return E4_PAIN_REGIONS;
    }
    return E4_PAIN_REGIONS.filter((r) => r !== REGIONS.NON_MAST && r !== REGIONS.OTHER_MAST);
  }, [includeExtraRegions]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{SECTION_LABELS.E4}</CardTitle>
          <div className="flex items-center gap-4">
            {/* Test toggle for extra regions */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="extra-regions"
                checked={includeExtraRegions}
                onCheckedChange={(checked) => setIncludeExtraRegions(checked === true)}
              />
              <Label
                htmlFor="extra-regions"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Alle Regionen
              </Label>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="table" className="text-xs px-3">
                  Tabelle
                </TabsTrigger>
                <TabsTrigger value="interactive" className="text-xs px-3">
                  Interaktiv
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {viewMode === "interactive" ? (
          /* Interactive wizard mode - guided 5-step workflow */
          <E4InteractiveWizard regions={regions} />
        ) : (
          /* Table mode - traditional grid layout */
          (() => {
            // Create question using factory - deterministic instanceId binds to form state
            const painFreeQ = createMeasurementQuestion(MEASUREMENT_IDS.PAIN_FREE_OPENING);
            return (
              <>
                {/* Pain-free opening - just a measurement, no pain interview */}
                <div className="space-y-4">
                  <MeasurementField
                    name={painFreeQ.instanceId}
                    label={getLabel(painFreeQ.semanticId)}
                    unit={painFreeQ.unit}
                    min={painFreeQ.min}
                    max={painFreeQ.max}
                  />
                </div>

                {/* Maximum unassisted opening */}
                <MovementSection
                  title={getLabel(MOVEMENTS.MAX_UNASSISTED_OPENING)}
                  movement={MOVEMENTS.MAX_UNASSISTED_OPENING}
                  viewMode={viewMode}
                  regions={regions}
                  instruction={E4_INSTRUCTIONS.maxUnassistedOpening}
                />

                {/* Maximum assisted opening */}
                <MovementSection
                  title={getLabel(MOVEMENTS.MAX_ASSISTED_OPENING)}
                  movement={MOVEMENTS.MAX_ASSISTED_OPENING}
                  viewMode={viewMode}
                  regions={regions}
                  instruction={E4_INSTRUCTIONS.maxAssistedOpening}
                />
              </>
            );
          })()
        )}
      </CardContent>
    </Card>
  );
}
