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

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { MOVEMENTS } from "../../model/movement";
import { REGIONS } from "../../model/region";
import { getLabel, SECTION_LABELS } from "../../content/labels";
import { MEASUREMENT_IDS } from "../../model/measurement";
import { MeasurementField } from "../form-fields/MeasurementField";
import { TerminatedCheckbox } from "../form-fields/TerminatedCheckbox";
import { PainInterviewGrid, getE4PainTypes } from "./PainInterviewGrid";
import { InteractiveExamSection } from "../interactive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Regions assessed in E4 (general regions, not palpation zones).
 */
const E4_REGIONS = [
  REGIONS.TEMPORALIS,
  REGIONS.MASSETER,
  REGIONS.TMJ,
  REGIONS.OTHER_MAST,
  REGIONS.NON_MAST,
] as const;

/** View mode for pain interview */
type ViewMode = "table" | "interactive";

interface MovementSectionProps {
  title: string;
  measurementId: string;
  measurementLabel: string;
  terminatedId: string;
  movement: (typeof MOVEMENTS)[keyof typeof MOVEMENTS];
  viewMode: ViewMode;
}

/**
 * Sub-section for a single movement type (max unassisted or max assisted).
 */
function MovementSection({
  title,
  measurementId,
  measurementLabel,
  terminatedId,
  movement,
  viewMode,
}: MovementSectionProps) {
  const { watch } = useFormContext();
  const isTerminated = watch(terminatedId) === true;

  return (
    <div className="space-y-4">
      <h4 className="font-medium">{title}</h4>

      <div className="flex items-center gap-6">
        <MeasurementField
          name={measurementId}
          label={measurementLabel}
          unit="mm"
          min={0}
          max={100}
        />
        <TerminatedCheckbox name={terminatedId} />
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
            regions={E4_REGIONS}
            painTypesForRegion={getE4PainTypes}
            disabled={isTerminated}
          />
        ) : (
          <InteractiveExamSection
            key={`interactive-${movement}`}
            movement={movement}
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{SECTION_LABELS.E4}</CardTitle>
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
          >
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
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Pain-free opening - just a measurement, no pain interview */}
        <div>
          <MeasurementField
            name="examination.painFreeOpening"
            label={getLabel(MEASUREMENT_IDS.PAIN_FREE_OPENING)}
            unit="mm"
            min={0}
            max={100}
          />
        </div>

        {/* Maximum unassisted opening */}
        <MovementSection
          title={getLabel(MOVEMENTS.MAX_UNASSISTED_OPENING)}
          measurementId="examination.maxUnassistedOpening"
          measurementLabel={getLabel(MOVEMENTS.MAX_UNASSISTED_OPENING)}
          terminatedId="examination.terminated:movement=maxUnassistedOpening"
          movement={MOVEMENTS.MAX_UNASSISTED_OPENING}
          viewMode={viewMode}
        />

        {/* Maximum assisted opening */}
        <MovementSection
          title={getLabel(MOVEMENTS.MAX_ASSISTED_OPENING)}
          measurementId="examination.maxAssistedOpening"
          measurementLabel={getLabel(MOVEMENTS.MAX_ASSISTED_OPENING)}
          terminatedId="examination.terminated:movement=maxAssistedOpening"
          movement={MOVEMENTS.MAX_ASSISTED_OPENING}
          viewMode={viewMode}
        />
      </CardContent>
    </Card>
  );
}
