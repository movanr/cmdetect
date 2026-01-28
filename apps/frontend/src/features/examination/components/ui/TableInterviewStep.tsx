import { Fragment, useMemo } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { YesNoField } from "../inputs/YesNoField";
import {
  BASE_REGIONS,
  PAIN_TYPES,
  REGIONS,
  SIDES,
  getMovementPainQuestions,
  type Region,
  type Side,
} from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import type { IncompleteRegion } from "../../form/validation";

export interface TableInterviewStepProps {
  instances: QuestionInstance[];
  /** Regions with validation errors (incomplete data) */
  incompleteRegions?: IncompleteRegion[];
  /** Regions to display in table. Defaults to BASE_REGIONS (temporalis, masseter, tmj) */
  regions?: readonly Region[];
}

// Display order for pain types (matches getMovementPainQuestions output)
const PAIN_TYPE_ORDER = ["pain", "familiarPain", "familiarHeadache"] as const;

// Display order for sides: right first (patient's right shown on left side of screen)
const SIDE_ORDER: Side[] = ["right", "left"];

/**
 * TableInterviewStep - Displays pain assessment in a compact table format
 *
 * Alternative to DiagramInterviewStep for E4 pain interview.
 * Shows separate tables for right and left sides.
 */
export function TableInterviewStep({
  instances,
  incompleteRegions = [],
  regions = BASE_REGIONS,
}: TableInterviewStepProps) {
  const { watch } = useFormContext();

  // Watch all instance paths to trigger re-renders on value changes
  const watchPaths = instances.map((i) => i.path);
  watch(watchPaths);

  // Group instances by region/side/painType for quick lookup
  const instanceMap = useMemo(() => {
    const map = new Map<string, QuestionInstance>();
    for (const inst of instances) {
      const { region, side, painType } = inst.context;
      if (region && side && painType) {
        map.set(`${region}-${side}-${painType}`, inst);
      }
    }
    return map;
  }, [instances]);

  // Get instance for a specific region/side/painType
  const getInstance = (region: Region, side: Side, painType: string) =>
    instanceMap.get(`${region}-${side}-${painType}`);

  // Check if familiar pain/headache should be enabled (pain must be "yes")
  const isEnabled = (region: Region, side: Side, painType: string) => {
    if (painType === "pain") return true;

    const painInstance = getInstance(region, side, "pain");
    if (!painInstance) return false;

    const painValue = watch(painInstance.path);
    return painValue === "yes";
  };

  // Check if a region/side has incomplete data
  const isIncomplete = (region: Region, side: Side) =>
    incompleteRegions.some((r) => r.region === region && r.side === side);

  // Render a single side table
  const renderSideTable = (side: Side) => (
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-muted-foreground mb-2">{SIDES[side]}</h4>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-2 text-left font-normal text-muted-foreground" />
              {PAIN_TYPE_ORDER.map((painType) => (
                <th
                  key={painType}
                  className="p-1 text-center text-xs font-normal text-muted-foreground"
                >
                  {PAIN_TYPES[painType]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => {
              const regionPainTypes = getMovementPainQuestions(region);
              const incomplete = isIncomplete(region, side);

              return (
                <tr
                  key={region}
                  className={cn(
                    "border-b",
                    incomplete && "ring-1 ring-inset ring-destructive bg-destructive/5"
                  )}
                >
                  <td className="p-2 font-medium">{REGIONS[region]}</td>
                  {PAIN_TYPE_ORDER.map((painType) => {
                    // Check if this pain type applies to this region
                    const applies = (regionPainTypes as readonly string[]).includes(painType);

                    if (!applies) {
                      return (
                        <td
                          key={`${region}-${painType}`}
                          className="p-1 text-center text-muted-foreground"
                        >
                          —
                        </td>
                      );
                    }

                    const instance = getInstance(region, side, painType);
                    if (!instance) {
                      return (
                        <td key={`${region}-${painType}`} className="p-1 text-center" />
                      );
                    }

                    const enabled = isEnabled(region, side, painType);

                    return (
                      <td key={`${region}-${painType}`} className="p-1 text-center">
                        <YesNoField
                          name={instance.path as FieldPath<FieldValues>}
                          disabled={!enabled}
                          className="justify-center"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex gap-6">
      {SIDE_ORDER.map((side) => (
        <Fragment key={side}>{renderSideTable(side)}</Fragment>
      ))}
    </div>
  );
}
