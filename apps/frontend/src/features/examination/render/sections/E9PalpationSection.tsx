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
import { REGION_LABELS, SIDE_LABELS, SECTION_LABELS } from "../../content/labels";
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
 * Short labels for pain types in grid headers.
 */
const PAIN_TYPE_SHORT_LABELS: Record<PainType, string> = {
  [PAIN_TYPES.PAIN]: "S",
  [PAIN_TYPES.FAMILIAR]: "B",
  [PAIN_TYPES.FAMILIAR_HEADACHE]: "K",
  [PAIN_TYPES.REFERRED]: "A",
  [PAIN_TYPES.SPREADING]: "AB",
};

/**
 * Full labels for pain types (legend).
 */
const PAIN_TYPE_FULL_LABELS: Record<PainType, string> = {
  [PAIN_TYPES.PAIN]: "Schmerz",
  [PAIN_TYPES.FAMILIAR]: "Bekannter Schmerz",
  [PAIN_TYPES.FAMILIAR_HEADACHE]: "Bekannter Kopfschmerz",
  [PAIN_TYPES.REFERRED]: "Ausstrahlend",
  [PAIN_TYPES.SPREADING]: "Ausbreitend",
};

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
                  {SIDE_LABELS[side]}
                </th>
              ))}
            </tr>
            <tr className="border-b bg-muted/30">
              <th />
              {Object.values(SIDES).flatMap((side) =>
                Array.from({ length: maxPainTypes }).map((_, i) => {
                  // Show abbreviated pain type headers
                  const painTypes = [
                    PAIN_TYPES.PAIN,
                    PAIN_TYPES.FAMILIAR,
                    PAIN_TYPES.FAMILIAR_HEADACHE,
                    PAIN_TYPES.REFERRED,
                    PAIN_TYPES.SPREADING,
                  ];
                  const label = painTypes[i]
                    ? PAIN_TYPE_SHORT_LABELS[painTypes[i]]
                    : "";
                  return (
                    <th
                      key={`${side}-header-${i}`}
                      className="p-1 text-center text-xs font-normal text-muted-foreground"
                    >
                      {label}
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
                    <span className="font-medium">{REGION_LABELS[zone]}</span>
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
        {/* Legend */}
        <div className="flex flex-wrap gap-4 rounded-lg bg-muted/50 p-3 text-xs">
          {Object.entries(PAIN_TYPE_FULL_LABELS).map(([type, full]) => (
            <span key={type}>
              <strong>{PAIN_TYPE_SHORT_LABELS[type as PainType]}</strong> ={" "}
              {full}
            </span>
          ))}
        </div>

        {/* Temporalis */}
        <PalpationGroup
          title="Temporalis"
          zones={TEMPORALIS_ZONES}
          pressure={1.0}
          getPainTypes={getE9PainTypes}
        />

        {/* Masseter */}
        <PalpationGroup
          title="Masseter"
          zones={MASSETER_ZONES}
          pressure={1.0}
          getPainTypes={getE9PainTypes}
        />

        {/* TMJ */}
        <PalpationGroup
          title="Kiefergelenk (TMJ)"
          zones={TMJ_ZONES}
          pressure="varies"
          getPainTypes={getE9PainTypes}
        />
      </CardContent>
    </Card>
  );
}
