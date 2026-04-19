import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { OPENING_TYPE_LABELS } from "@cmdetect/dc-tmd";
import type { FormValues } from "../../../form/use-examination-form";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { COMMON } from "../../../labels";
import { clearMovementPainInterview } from "../clear-helpers";
import { FormSheetSection } from "../FormSheetSection";
import { FsBooleanCheckbox } from "../primitives/FsBooleanCheckbox";
import { FsMeasurement } from "../primitives/FsMeasurement";
import { FsPainGrid } from "../grids/FsPainGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E4_PATHS, indexMap: E4_INDEX } = createSectionPathLookup("e4");

export function FsE4() {
  const getValue = useSectionValues(E4_PATHS, E4_INDEX);
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

  const unassistedInterviewRefused =
    getValue("e4.maxUnassisted.interviewRefused") === true;
  const assistedInterviewRefused =
    getValue("e4.maxAssisted.interviewRefused") === true;

  return (
    <FormSheetSection number="4" title="Öffnungs- und Schließbewegungen">
      <div className="space-y-3 print:space-y-1.5">
        {/* A. Pain-free opening */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 w-36 print:text-[7pt] print:w-28">
            A. {OPENING_TYPE_LABELS.painFree}
          </span>
          <FsMeasurement name="e4.painFree.measurement" min={0} max={100} />
          <FsBooleanCheckbox
            name="e4.painFree.refused"
            label={COMMON.refusedFull}
            title={COMMON.refusedTooltip}
            onChange={clearMeasurementOnRefuse("e4.painFree.measurement")}
          />
        </div>

        {/* B. Max unassisted opening */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-semibold text-slate-600 w-36 print:text-[7pt] print:w-28">
              B. {OPENING_TYPE_LABELS.maxUnassisted}
            </span>
            <FsMeasurement name="e4.maxUnassisted.measurement" min={0} max={100} />
            <FsBooleanCheckbox
              name="e4.maxUnassisted.refused"
              label={COMMON.refusedFull}
              title={COMMON.refusedTooltip}
              onChange={clearMeasurementOnRefuse("e4.maxUnassisted.measurement")}
            />
          </div>
          <div className={unassistedInterviewRefused ? "opacity-40" : ""}>
            <FsPainGrid prefix="e4.maxUnassisted" getValue={getValue} />
          </div>
          <div className="mt-1">
            <FsBooleanCheckbox
              name="e4.maxUnassisted.interviewRefused"
              label="Schmerzabfrage verweigert"
              title={COMMON.refusedTooltip}
              onChange={clearInterviewOnRefuse("e4.maxUnassisted")}
            />
          </div>
        </div>

        {/* C. Max assisted (passive) opening */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-semibold text-slate-600 w-36 print:text-[7pt] print:w-28">
              C. {OPENING_TYPE_LABELS.maxAssisted}
            </span>
            <FsMeasurement name="e4.maxAssisted.measurement" min={0} max={100} />
            <FsBooleanCheckbox
              name="e4.maxAssisted.terminated"
              label={COMMON.terminated}
              title={COMMON.terminatedTooltip}
            />
            <FsBooleanCheckbox
              name="e4.maxAssisted.refused"
              label={COMMON.refusedFull}
              title={COMMON.refusedTooltip}
              onChange={clearMeasurementOnRefuse("e4.maxAssisted.measurement")}
            />
          </div>
          <div className={assistedInterviewRefused ? "opacity-40" : ""}>
            <FsPainGrid prefix="e4.maxAssisted" getValue={getValue} />
          </div>
          <div className="mt-1">
            <FsBooleanCheckbox
              name="e4.maxAssisted.interviewRefused"
              label="Schmerzabfrage verweigert"
              title={COMMON.refusedTooltip}
              onChange={clearInterviewOnRefuse("e4.maxAssisted")}
            />
          </div>
        </div>
      </div>
    </FormSheetSection>
  );
}
