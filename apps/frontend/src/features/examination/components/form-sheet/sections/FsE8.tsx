import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsLockGrid } from "../grids/FsLockGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E8_PATHS, indexMap: E8_INDEX } = createSectionPathLookup("e8");

export function FsE8() {
  const getValue = useSectionValues(E8_PATHS, E8_INDEX);

  return (
    <FormSheetSection number="8" title={SECTION_LABELS.e8.full}>
      <FsLockGrid getValue={getValue} />
    </FormSheetSection>
  );
}
