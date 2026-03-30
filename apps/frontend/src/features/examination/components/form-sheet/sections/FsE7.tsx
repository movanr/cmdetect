import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsJointSoundGrid } from "../grids/FsJointSoundGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E7_PATHS, indexMap: E7_INDEX } = createSectionPathLookup("e7");

export function FsE7() {
  const getValue = useSectionValues(E7_PATHS, E7_INDEX);

  return (
    <FormSheetSection number="7" title={SECTION_LABELS.e7.full}>
      <FsJointSoundGrid getValue={getValue} />
    </FormSheetSection>
  );
}
