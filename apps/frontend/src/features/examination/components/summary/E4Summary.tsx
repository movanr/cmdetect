import { OPENING_TYPES, REGION_KEYS, type PainType } from "@cmdetect/dc-tmd";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { COMMON } from "../../labels";
import { MovementPainTable, type MovementGroup } from "./MovementPainTable";
import { SummarySection } from "./SummarySection";

const PAIN_TYPES_E4: PainType[] = ["pain", "familiarPain", "familiarHeadache"];

export function E4Summary() {
  const { getValues } = useFormContext<FormValues>();
  const getValue = (path: string): unknown =>
    getValues(path as FieldPath<FormValues>) as unknown;

  const groups: MovementGroup[] = [
    {
      label: COMMON.painFreeOpening,
      movementKey: OPENING_TYPES.painFree,
      sectionPrefix: "e4",
      measurement: getValue(`e4.${OPENING_TYPES.painFree}.measurement`) as number | null,
      refused: getValue(`e4.${OPENING_TYPES.painFree}.refused`) === true,
      hasPainInterview: false,
      regions: REGION_KEYS,
      painTypes: PAIN_TYPES_E4,
      getValue,
    },
    {
      label: COMMON.maxUnassistedOpening,
      movementKey: OPENING_TYPES.maxUnassisted,
      sectionPrefix: "e4",
      measurement: getValue(`e4.${OPENING_TYPES.maxUnassisted}.measurement`) as number | null,
      refused: getValue(`e4.${OPENING_TYPES.maxUnassisted}.refused`) === true,
      interviewRefused: getValue(`e4.${OPENING_TYPES.maxUnassisted}.interviewRefused`) === true,
      hasPainInterview: true,
      regions: REGION_KEYS,
      painTypes: PAIN_TYPES_E4,
      getValue,
    },
    {
      label: COMMON.maxAssistedOpening,
      movementKey: OPENING_TYPES.maxAssisted,
      sectionPrefix: "e4",
      measurement: getValue(`e4.${OPENING_TYPES.maxAssisted}.measurement`) as number | null,
      refused: getValue(`e4.${OPENING_TYPES.maxAssisted}.refused`) === true,
      terminated: getValue(`e4.${OPENING_TYPES.maxAssisted}.terminated`) === true,
      interviewRefused: getValue(`e4.${OPENING_TYPES.maxAssisted}.interviewRefused`) === true,
      hasPainInterview: true,
      regions: REGION_KEYS,
      painTypes: PAIN_TYPES_E4,
      getValue,
    },
  ];

  return (
    <SummarySection sectionId="e4">
      <MovementPainTable groups={groups} />
    </SummarySection>
  );
}
