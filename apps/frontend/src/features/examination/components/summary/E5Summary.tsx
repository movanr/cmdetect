import { MOVEMENT_TYPES, REGION_KEYS, type PainType } from "@cmdetect/dc-tmd";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { MovementPainTable, type MovementGroup } from "./MovementPainTable";
import { SummarySection } from "./SummarySection";

const E5_ROW_LABELS: Record<string, string> = {
  [MOVEMENT_TYPES.lateralRight]: "Laterotrusion nach rechts",
  [MOVEMENT_TYPES.lateralLeft]: "Laterotrusion nach links",
  [MOVEMENT_TYPES.protrusive]: "Protrusion",
};

const PAIN_TYPES_E5: PainType[] = ["pain", "familiarPain", "familiarHeadache"];

const E5_MOVEMENT_ORDER = [
  MOVEMENT_TYPES.lateralRight,
  MOVEMENT_TYPES.lateralLeft,
  MOVEMENT_TYPES.protrusive,
] as const;

export function E5Summary() {
  const { getValues } = useFormContext<FormValues>();
  const getValue = (path: string): unknown =>
    getValues(path as FieldPath<FormValues>) as unknown;

  const groups: MovementGroup[] = E5_MOVEMENT_ORDER.map((movementType) => ({
    label: E5_ROW_LABELS[movementType],
    movementKey: movementType,
    sectionPrefix: "e5",
    measurement: getValue(`e5.${movementType}.measurement`) as number | null,
    refused: getValue(`e5.${movementType}.refused`) === true,
    interviewRefused: getValue(`e5.${movementType}.interviewRefused`) === true,
    hasPainInterview: true,
    regions: REGION_KEYS,
    painTypes: PAIN_TYPES_E5,
    getValue,
  }));

  return (
    <SummarySection sectionId="e5">
      <MovementPainTable groups={groups} />
    </SummarySection>
  );
}
