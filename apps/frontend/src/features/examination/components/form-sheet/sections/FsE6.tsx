import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsJointSound6Grid } from "../grids/FsJointSound6Grid";
import { useSectionValues } from "../use-section-values";

const { paths: E6_PATHS, indexMap: E6_INDEX } = createSectionPathLookup("e6");

export function FsE6() {
  const getValue = useSectionValues(E6_PATHS, E6_INDEX);

  return (
    <FormSheetSection number="6" title={SECTION_LABELS.e6.full}>
      <FsJointSound6Grid getValue={getValue} />
    </FormSheetSection>
  );
}
