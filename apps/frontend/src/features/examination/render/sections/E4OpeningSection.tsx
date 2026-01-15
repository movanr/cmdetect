/**
 * E4OpeningSection - Opening Movements Examination Section
 *
 * Renders the E4 section of the DC-TMD examination form:
 * - Pain-free opening measurement
 * - Maximum unassisted opening (measurement + terminated + pain interview)
 * - Maximum assisted opening (measurement + terminated + pain interview)
 */

import { useFormContext } from "react-hook-form";
import { MOVEMENTS } from "../../model/movement";
import { REGIONS } from "../../model/region";
import { SECTION_LABELS, EXAMINATION_LABELS } from "../../content/labels";
import { MeasurementField } from "../form-fields/MeasurementField";
import { TerminatedCheckbox } from "../form-fields/TerminatedCheckbox";
import { PainInterviewGrid, getE4PainTypes } from "./PainInterviewGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface MovementSectionProps {
  title: string;
  measurementId: string;
  measurementLabel: string;
  terminatedId: string;
  movement: (typeof MOVEMENTS)[keyof typeof MOVEMENTS];
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

      {/* Pain interview grid - disabled if terminated */}
      <div className={isTerminated ? "opacity-50" : ""}>
        <p className="mb-2 text-sm text-muted-foreground">
          Schmerzbeurteilung nach Bewegung
          {isTerminated && " (übersprungen - Untersuchung abgebrochen)"}
        </p>
        <PainInterviewGrid
          movement={movement}
          regions={E4_REGIONS}
          painTypesForRegion={getE4PainTypes}
          disabled={isTerminated}
        />
      </div>
    </div>
  );
}

interface E4OpeningSectionProps {
  /** Optional className for the container */
  className?: string;
}

export function E4OpeningSection({ className }: E4OpeningSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{SECTION_LABELS.E4}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Pain-free opening - just a measurement, no pain interview */}
        <div>
          <MeasurementField
            name="examination.painFreeOpening"
            label={EXAMINATION_LABELS.painFreeOpening.text}
            unit="mm"
            min={0}
            max={100}
          />
          {EXAMINATION_LABELS.painFreeOpening.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {EXAMINATION_LABELS.painFreeOpening.description}
            </p>
          )}
        </div>

        {/* Maximum unassisted opening */}
        <MovementSection
          title="Maximale unassistierte Mundöffnung"
          measurementId="examination.maxUnassistedOpening"
          measurementLabel={EXAMINATION_LABELS.maxUnassistedOpening.text}
          terminatedId="examination.terminated:movement=maxUnassistedOpening"
          movement={MOVEMENTS.MAX_UNASSISTED_OPENING}
        />

        {/* Maximum assisted opening */}
        <MovementSection
          title="Maximale assistierte Mundöffnung"
          measurementId="examination.maxAssistedOpening"
          measurementLabel={EXAMINATION_LABELS.maxAssistedOpening.text}
          terminatedId="examination.terminated:movement=maxAssistedOpening"
          movement={MOVEMENTS.MAX_ASSISTED_OPENING}
        />
      </CardContent>
    </Card>
  );
}
