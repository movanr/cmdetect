import { OPENING_TYPE_LABELS } from "@cmdetect/dc-tmd";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsMeasurement } from "../primitives/FsMeasurement";
import { FsPainGrid } from "../grids/FsPainGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E4_PATHS, indexMap: E4_INDEX } = createSectionPathLookup("e4");

export function FsE4() {
  const getValue = useSectionValues(E4_PATHS, E4_INDEX);

  return (
    <FormSheetSection number="4" title="Öffnungs- und Schließbewegungen">
      <div className="space-y-3 print:space-y-1.5">
        {/* A. Pain-free opening */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 w-36 print:text-[7pt] print:w-28">
            A. {OPENING_TYPE_LABELS.painFree}
          </span>
          <FsMeasurement name="e4.painFree.measurement" min={0} max={100} />
        </div>

        {/* B. Max unassisted opening */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-600 w-36 print:text-[7pt] print:w-28">
              B. {OPENING_TYPE_LABELS.maxUnassisted}
            </span>
            <FsMeasurement name="e4.maxUnassisted.measurement" min={0} max={100} />
          </div>
          <FsPainGrid prefix="e4.maxUnassisted" getValue={getValue} />
        </div>

        {/* C. Max assisted (passive) opening */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-600 w-36 print:text-[7pt] print:w-28">
              C. {OPENING_TYPE_LABELS.maxAssisted}
            </span>
            <FsMeasurement name="e4.maxAssisted.measurement" min={0} max={100} />
          </div>
          <FsPainGrid prefix="e4.maxAssisted" getValue={getValue} />
        </div>
      </div>
    </FormSheetSection>
  );
}
