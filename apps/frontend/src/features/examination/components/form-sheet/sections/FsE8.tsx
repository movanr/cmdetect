import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { FormSheetSection } from "../FormSheetSection";
import { FsLockGrid } from "../grids/FsLockGrid";

export function FsE8() {
  return (
    <FormSheetSection number="8" title={SECTION_LABELS.e8.full}>
      <FsLockGrid />
    </FormSheetSection>
  );
}
