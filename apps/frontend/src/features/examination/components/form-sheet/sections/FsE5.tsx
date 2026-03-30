import { MOVEMENT_TYPE_LABELS } from "@cmdetect/dc-tmd";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsMeasurement } from "../primitives/FsMeasurement";
import { FsPainGrid } from "../grids/FsPainGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E5_PATHS, indexMap: E5_INDEX } = createSectionPathLookup("e5");

export function FsE5() {
  const getValue = useSectionValues(E5_PATHS, E5_INDEX);

  return (
    <FormSheetSection number="5" title="Lateral- und Protrusionsbewegungen">
      <div className="space-y-3 print:space-y-1.5">
        {/* A. Laterotrusion right */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-600 w-40 print:text-[7pt] print:w-32">
              A. {MOVEMENT_TYPE_LABELS.lateralRight}
            </span>
            <FsMeasurement name="e5.lateralRight.measurement" />
          </div>
          <FsPainGrid prefix="e5.lateralRight" getValue={getValue} />
        </div>

        {/* B. Laterotrusion left */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-600 w-40 print:text-[7pt] print:w-32">
              B. {MOVEMENT_TYPE_LABELS.lateralLeft}
            </span>
            <FsMeasurement name="e5.lateralLeft.measurement" />
          </div>
          <FsPainGrid prefix="e5.lateralLeft" getValue={getValue} />
        </div>

        {/* C. Protrusion */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-600 w-40 print:text-[7pt] print:w-32">
              C. {MOVEMENT_TYPE_LABELS.protrusive}
            </span>
            <FsMeasurement name="e5.protrusive.measurement" />
          </div>
          <FsPainGrid prefix="e5.protrusive" getValue={getValue} />
        </div>
      </div>
    </FormSheetSection>
  );
}
