import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { FormSheetSection } from "../FormSheetSection";
import { FsJointSound6Grid } from "../grids/FsJointSound6Grid";

export function FsE6() {
  return (
    <FormSheetSection number="6" title={SECTION_LABELS.e6.full}>
      <FsJointSound6Grid />
    </FormSheetSection>
  );
}
