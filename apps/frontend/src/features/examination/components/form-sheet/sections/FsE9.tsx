import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsPalpationGrid } from "../grids/FsPalpationGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E9_PATHS, indexMap: E9_INDEX } = createSectionPathLookup("e9");

export function FsE9() {
  const getValue = useSectionValues(E9_PATHS, E9_INDEX);

  return (
    <FormSheetSection number="9" title={SECTION_LABELS.e9.full}>
      <FsPalpationGrid getValue={getValue} />
    </FormSheetSection>
  );
}
