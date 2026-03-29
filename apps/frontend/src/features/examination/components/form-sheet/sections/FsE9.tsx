import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { FormSheetSection } from "../FormSheetSection";
import { FsPalpationGrid } from "../grids/FsPalpationGrid";

export function FsE9() {
  return (
    <FormSheetSection number="9" title={SECTION_LABELS.e9.full}>
      <FsPalpationGrid />
    </FormSheetSection>
  );
}
