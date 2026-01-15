/**
 * PainInterviewGrid - Displays a bilateral pain assessment grid
 *
 * Used by E4 (movements) and E9 (palpation) sections to display
 * pain questions in a structured grid format.
 *
 * Layout:
 * - Rows: Regions (e.g., Temporalis, Masseter, TMJ)
 * - Columns: Sides (Right, Left)
 * - Cells: Pain type questions (pain, familiar, headache, etc.)
 */

import { Fragment } from "react";
import { useFormContext } from "react-hook-form";
import { ANSWER_VALUES } from "../../model/answer";
import type { Movement } from "../../model/movement";
import { PAIN_TYPES, type PainType } from "../../model/pain";
import type { Region } from "../../model/region";
import { REGIONS } from "../../model/region";
import { SIDES, type Side } from "../../model/side";
import { buildInstanceId } from "../../model/questionInstance";
import { REGION_LABELS, SIDE_LABELS } from "../../content/labels";
import { YesNoField } from "../form-fields/YesNoField";

const QUESTIONNAIRE_ID = "examination";

interface PainInterviewGridProps {
  /** Movement context for E4 (opening movements) */
  movement?: Movement;
  /** Regions to display in rows */
  regions: readonly Region[];
  /** Pain types to display for each region-side combination */
  painTypesForRegion: (region: Region) => readonly PainType[];
  /** Whether the entire grid is disabled */
  disabled?: boolean;
  /** Optional className for the container */
  className?: string;
}

/**
 * Determines which pain types to show for a given region in E4.
 * - Temporalis: pain, familiar, familiarHeadache
 * - Others: pain, familiar
 */
export function getE4PainTypes(region: Region): readonly PainType[] {
  if (region === REGIONS.TEMPORALIS) {
    return [PAIN_TYPES.PAIN, PAIN_TYPES.FAMILIAR, PAIN_TYPES.FAMILIAR_HEADACHE];
  }
  return [PAIN_TYPES.PAIN, PAIN_TYPES.FAMILIAR];
}

/**
 * Compact label for pain types in the grid header.
 */
const PAIN_TYPE_SHORT_LABELS: Record<PainType, string> = {
  [PAIN_TYPES.PAIN]: "S",
  [PAIN_TYPES.FAMILIAR]: "B",
  [PAIN_TYPES.FAMILIAR_HEADACHE]: "K",
  [PAIN_TYPES.REFERRED]: "A",
  [PAIN_TYPES.SPREADING]: "AB",
};

/**
 * Full label for pain types (used in tooltips/legends).
 */
const PAIN_TYPE_FULL_LABELS: Record<PainType, string> = {
  [PAIN_TYPES.PAIN]: "Schmerz",
  [PAIN_TYPES.FAMILIAR]: "Bekannter Schmerz",
  [PAIN_TYPES.FAMILIAR_HEADACHE]: "Bekannter Kopfschmerz",
  [PAIN_TYPES.REFERRED]: "Ausstrahlend",
  [PAIN_TYPES.SPREADING]: "Ausbreitend",
};

export function PainInterviewGrid({
  movement,
  regions,
  painTypesForRegion,
  disabled = false,
  className,
}: PainInterviewGridProps) {
  const { watch } = useFormContext();

  // Get the maximum number of pain types across all regions for column span
  const maxPainTypes = Math.max(...regions.map((r) => painTypesForRegion(r).length));

  // Build instance ID for a specific question
  const getInstanceId = (side: Side, region: Region, painType: PainType) => {
    return buildInstanceId(QUESTIONNAIRE_ID, painType, {
      movement,
      side,
      region,
    });
  };

  // Check if a dependent question should be enabled
  const isEnabled = (side: Side, region: Region, painType: PainType) => {
    if (disabled) return false;
    if (painType === PAIN_TYPES.PAIN) return true;

    // Check if pain = yes for this side/region/movement
    const painInstanceId = getInstanceId(side, region, PAIN_TYPES.PAIN);
    const painValue = watch(painInstanceId);
    return painValue === ANSWER_VALUES.YES;
  };

  return (
    <div className={className}>
      {/* Legend */}
      <div className="mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {Object.entries(PAIN_TYPE_SHORT_LABELS).map(([type, short]) => (
          <span key={type}>
            <strong>{short}</strong> = {PAIN_TYPE_FULL_LABELS[type as PainType]}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left font-medium">Region</th>
              {Object.values(SIDES).map((side) => (
                <th
                  key={side}
                  className="p-2 text-center font-medium"
                  colSpan={maxPainTypes}
                >
                  {SIDE_LABELS[side]}
                </th>
              ))}
            </tr>
            <tr className="border-b bg-muted/30">
              <th />
              {Object.values(SIDES).map((side) => (
                // Sub-header for pain types
                <Fragment key={side}>
                  {Array.from({ length: maxPainTypes }).map((_, i) => (
                    <th
                      key={`${side}-${i}`}
                      className="p-1 text-center text-xs font-normal text-muted-foreground"
                    >
                      {i === 0 && PAIN_TYPE_SHORT_LABELS[PAIN_TYPES.PAIN]}
                      {i === 1 && PAIN_TYPE_SHORT_LABELS[PAIN_TYPES.FAMILIAR]}
                      {i === 2 && PAIN_TYPE_SHORT_LABELS[PAIN_TYPES.FAMILIAR_HEADACHE]}
                    </th>
                  ))}
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => {
              const painTypes = painTypesForRegion(region);
              return (
                <tr key={region} className="border-b">
                  <td className="p-2 font-medium">{REGION_LABELS[region]}</td>
                  {Object.values(SIDES).map((side) => (
                    <Fragment key={side}>
                      {Array.from({ length: maxPainTypes }).map((_, i) => {
                        const painType = painTypes[i];
                        if (!painType) {
                          // Empty cell for regions with fewer pain types
                          return (
                            <td
                              key={`${side}-${region}-${i}`}
                              className="p-1 text-center"
                            />
                          );
                        }
                        const instanceId = getInstanceId(side, region, painType);
                        const enabled = isEnabled(side, region, painType);
                        return (
                          <td
                            key={instanceId}
                            className="p-1 text-center"
                          >
                            <YesNoField
                              name={instanceId}
                              disabled={!enabled}
                              className="justify-center"
                            />
                          </td>
                        );
                      })}
                    </Fragment>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
