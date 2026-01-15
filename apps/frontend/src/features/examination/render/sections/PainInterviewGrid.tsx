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
import { QUESTIONNAIRE_ID } from "../../model/constants";
import type { Movement } from "../../model/movement";
import { PAIN_TYPES, PAIN_TYPE_DISPLAY_ORDER, type PainType } from "../../model/pain";
import type { Region } from "../../model/region";
import { SIDES, type Side } from "../../model/side";
import { buildInstanceId } from "../../model/questionInstance";
import { getLabel } from "../../content/labels";
import { YesNoField } from "../form-fields/YesNoField";

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
                  {getLabel(side)}
                </th>
              ))}
            </tr>
            <tr className="border-b bg-muted/30">
              <th />
              {Object.values(SIDES).map((side) => (
                // Sub-header for pain types - show full labels
                <Fragment key={side}>
                  {Array.from({ length: maxPainTypes }).map((_, i) => {
                    const painType = PAIN_TYPE_DISPLAY_ORDER[i];
                    return (
                      <th
                        key={`${side}-${i}`}
                        className="p-1 text-center text-xs font-normal text-muted-foreground"
                      >
                        {painType ? getLabel(painType) : ""}
                      </th>
                    );
                  })}
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => {
              const painTypes = painTypesForRegion(region);
              return (
                <tr key={region} className="border-b">
                  <td className="p-2 font-medium">{getLabel(region)}</td>
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
