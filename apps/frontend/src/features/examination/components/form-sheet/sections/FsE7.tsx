import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { FormSheetSection } from "../FormSheetSection";
import { FsJointSoundGrid } from "../grids/FsJointSoundGrid";

export function FsE7() {
  return (
    <FormSheetSection number="7" title={SECTION_LABELS.e7.full}>
      <FsJointSoundGrid />
    </FormSheetSection>
  );
}
