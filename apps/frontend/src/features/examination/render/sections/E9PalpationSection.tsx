/**
 * E9PalpationSection - Muscle & TMJ Palpation Examination Section
 *
 * Renders the E9 section of the DC-TMD examination form:
 * - Temporalis palpation (3 zones)
 * - Masseter palpation (3 zones)
 * - TMJ palpation (2 zones)
 *
 * Each zone shows bilateral pain assessment with:
 * - Pain, familiar pain, familiar headache (temporalis only)
 * - Referred pain, spreading pain
 */

import { useFormContext } from "react-hook-form";
import type { Region } from "../../model/region";
import { ANSWER_VALUES } from "../../model/answer";
import { PAIN_TYPES, type PainType } from "../../model/pain";
import { buildInstanceId } from "../../model/questionInstance";
import { SIDES, type Side } from "../../model/side";
import { getLabel, SECTION_LABELS } from "../../content/labels";
import { REGIONS } from "../../model/region";
import { YesNoField } from "../form-fields/YesNoField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TEMPORALIS_ZONES,
  MASSETER_ZONES,
  TMJ_ZONES,
  getE9PainTypes,
  ZONE_PRESSURE,
} from "../../definition/sections/e9-palpation";

const QUESTIONNAIRE_ID = "examination";

/**
 * Ordered list of pain types as they appear in grid columns.
 */
const PAIN_TYPE_COLUMN_ORDER: readonly PainType[] = [
  PAIN_TYPES.PAIN,
  PAIN_TYPES.FAMILIAR,
  PAIN_TYPES.FAMILIAR_HEADACHE,
  PAIN_TYPES.REFERRED,
  PAIN_TYPES.SPREADING,
];

interface PalpationGroupProps {
  title: string;
  zones: readonly Region[];
  pressure?: number | "varies";
  getPainTypes: (zone: Region) => readonly PainType[];
}

/**
 * A group of palpation zones (e.g., all temporalis zones).
 */
function PalpationGroup({
  title,
  zones,
  pressure,
  getPainTypes,
}: PalpationGroupProps) {
  const { watch } = useFormContext();

  // Find the max number of pain types across all zones in this group
  const maxPainTypes = Math.max(...zones.map((z) => getPainTypes(z).length));

  const getInstanceId = (side: Side, zone: Region, painType: PainType) => {
    return buildInstanceId(QUESTIONNAIRE_ID, painType, {
      side,
      region: zone,
    });
  };

  const isEnabled = (side: Side, zone: Region, painType: PainType) => {
    if (painType === PAIN_TYPES.PAIN) return true;
    const painInstanceId = getInstanceId(side, zone, PAIN_TYPES.PAIN);
    const painValue = watch(painInstanceId);
    return painValue === ANSWER_VALUES.YES;
  };

  const pressureLabel =
    pressure === "varies"
      ? "0.5-1.0 kg"
      : pressure
        ? `${pressure} kg`
        : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h4 className="font-medium">{title}</h4>
        {pressureLabel && (
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {pressureLabel}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left font-medium">Zone</th>
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
              {Object.values(SIDES).flatMap((side) =>
                Array.from({ length: maxPainTypes }).map((_, i) => {
                  const painType = PAIN_TYPE_COLUMN_ORDER[i];
                  return (
                    <th
                      key={`${side}-header-${i}`}
                      className="p-1 text-center text-xs font-normal text-muted-foreground"
                    >
                      {painType ? getLabel(painType) : ""}
                    </th>
                  );
                })
              )}
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => {
              const painTypes = getPainTypes(zone);
              const zonePressure = ZONE_PRESSURE[zone];
              return (
                <tr key={zone} className="border-b">
                  <td className="p-2">
                    <span className="font-medium">{getLabel(zone)}</span>
                    {pressure === "varies" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({zonePressure} kg)
                      </span>
                    )}
                  </td>
                  {Object.values(SIDES).flatMap((side) =>
                    Array.from({ length: maxPainTypes }).map((_, i) => {
                      const painType = painTypes[i];
                      if (!painType) {
                        return (
                          <td
                            key={`${side}-${zone}-${i}`}
                            className="p-1 text-center"
                          />
                        );
                      }
                      const instanceId = getInstanceId(side, zone, painType);
                      const enabled = isEnabled(side, zone, painType);
                      return (
                        <td key={instanceId} className="p-1 text-center">
                          <YesNoField
                            name={instanceId}
                            disabled={!enabled}
                            className="justify-center"
                          />
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface E9PalpationSectionProps {
  className?: string;
}

export function E9PalpationSection({ className }: E9PalpationSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{SECTION_LABELS.E9}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Temporalis */}
        <PalpationGroup
          title={getLabel(REGIONS.TEMPORALIS)}
          zones={TEMPORALIS_ZONES}
          pressure={1.0}
          getPainTypes={getE9PainTypes}
        />

        {/* Masseter */}
        <PalpationGroup
          title={getLabel(REGIONS.MASSETER)}
          zones={MASSETER_ZONES}
          pressure={1.0}
          getPainTypes={getE9PainTypes}
        />

        {/* TMJ */}
        <PalpationGroup
          title={getLabel(REGIONS.TMJ)}
          zones={TMJ_ZONES}
          pressure="varies"
          getPainTypes={getE9PainTypes}
        />
      </CardContent>
    </Card>
  );
}
