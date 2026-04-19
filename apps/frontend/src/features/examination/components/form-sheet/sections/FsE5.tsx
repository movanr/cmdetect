import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { MOVEMENT_TYPE_LABELS } from "@cmdetect/dc-tmd";
import type { FormValues } from "../../../form/use-examination-form";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { COMMON } from "../../../labels";
import { clearMovementPainInterview } from "../clear-helpers";
import { FormSheetSection } from "../FormSheetSection";
import { FsBooleanCheckbox } from "../primitives/FsBooleanCheckbox";
import { FsMeasurement } from "../primitives/FsMeasurement";
import { FsPainGrid } from "../grids/FsPainGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E5_PATHS, indexMap: E5_INDEX } = createSectionPathLookup("e5");

type Movement = "lateralRight" | "lateralLeft" | "protrusive";

const MOVEMENTS: { key: Movement; letter: string }[] = [
  { key: "lateralRight", letter: "A" },
  { key: "lateralLeft", letter: "B" },
  { key: "protrusive", letter: "C" },
];

export function FsE5() {
  const getValue = useSectionValues(E5_PATHS, E5_INDEX);
  const { setValue } = useFormContext<FormValues>();

  const clearMeasurementOnRefuse =
    (path: string) => (refused: boolean) => {
      if (refused) setValue(path as never, null as never, { shouldDirty: true });
    };

  const clearInterviewOnRefuse = useCallback(
    (prefix: string) => (refused: boolean) => {
      if (refused) clearMovementPainInterview(setValue, prefix);
    },
    [setValue]
  );

  return (
    <FormSheetSection number="5" title="Lateral- und Protrusionsbewegungen">
      <div className="space-y-3 print:space-y-1.5">
        {MOVEMENTS.map(({ key, letter }) => {
          const prefix = `e5.${key}`;
          const interviewRefused = getValue(`${prefix}.interviewRefused`) === true;
          return (
            <div key={key}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-semibold text-slate-600 w-40 print:text-[7pt] print:w-32">
                  {letter}. {MOVEMENT_TYPE_LABELS[key]}
                </span>
                <FsMeasurement name={`${prefix}.measurement`} min={0} max={30} />
                <FsBooleanCheckbox
                  name={`${prefix}.refused`}
                  label={COMMON.refusedFull}
                  title={COMMON.refusedTooltip}
                  onChange={clearMeasurementOnRefuse(`${prefix}.measurement`)}
                />
              </div>
              <div className={interviewRefused ? "opacity-40" : ""}>
                <FsPainGrid prefix={prefix} getValue={getValue} />
              </div>
              <div className="mt-1">
                <FsBooleanCheckbox
                  name={`${prefix}.interviewRefused`}
                  label="Schmerzabfrage verweigert"
                  title={COMMON.refusedTooltip}
                  onChange={clearInterviewOnRefuse(prefix)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </FormSheetSection>
  );
}
