import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsSupplPalpGrid } from "../grids/FsSupplPalpGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E10_PATHS, indexMap: E10_INDEX } = createSectionPathLookup("e10");

export function FsE10() {
  const getValue = useSectionValues(E10_PATHS, E10_INDEX);

  return (
    <FormSheetSection number="10" title={SECTION_LABELS.e10.full}>
      <FsSupplPalpGrid getValue={getValue} />
    </FormSheetSection>
  );
}
