import {
  E2_REFERENCE_TEETH,
  E2_REFERENCE_TOOTH_KEYS,
  E2_MIDLINE_DIRECTIONS,
  E2_MIDLINE_DIRECTION_KEYS,
} from "@cmdetect/dc-tmd";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsEnumRadio } from "../primitives/FsEnumRadio";
import { FsMeasurement } from "../primitives/FsMeasurement";
import { useSectionValues } from "../use-section-values";

const { paths: E2_PATHS, indexMap: E2_INDEX } = createSectionPathLookup("e2");

const toothOptions = E2_REFERENCE_TOOTH_KEYS.map((k) => ({
  key: k,
  label: E2_REFERENCE_TEETH[k],
}));

const midlineOptions = E2_MIDLINE_DIRECTION_KEYS.map((k) => ({
  key: k,
  label: E2_MIDLINE_DIRECTIONS[k],
}));

export function FsE2() {
  const getValue = useSectionValues(E2_PATHS, E2_INDEX);

  return (
    <FormSheetSection number="2" title="Schneidekantenverhältnisse">
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-500 print:text-[7pt]">Referenzzahn:</span>
          <FsEnumRadio
            name="e2.referenceTooth.selection"
            value={getValue("e2.referenceTooth.selection") as string | null}
            options={toothOptions}
          />
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 print:text-[7pt]">Horiz. Überbiss:</span>
            <FsMeasurement name="e2.horizontalOverjet" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 print:text-[7pt]">Vert. Überbiss:</span>
            <FsMeasurement name="e2.verticalOverlap" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 print:text-[7pt]">Mittellinienabw.:</span>
            <FsEnumRadio
              name="e2.midlineDeviation.direction"
              value={getValue("e2.midlineDeviation.direction") as string | null}
              options={midlineOptions}
            />
            <FsMeasurement name="e2.midlineDeviation.mm" width="w-12" />
          </div>
        </div>
      </div>
    </FormSheetSection>
  );
}
