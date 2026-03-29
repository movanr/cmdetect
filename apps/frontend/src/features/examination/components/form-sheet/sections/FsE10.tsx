import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { FormSheetSection } from "../FormSheetSection";
import { FsSupplPalpGrid } from "../grids/FsSupplPalpGrid";

export function FsE10() {
  return (
    <FormSheetSection number="10" title={SECTION_LABELS.e10.full}>
      <FsSupplPalpGrid />
    </FormSheetSection>
  );
}
