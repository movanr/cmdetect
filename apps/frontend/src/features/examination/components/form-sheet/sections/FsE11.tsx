import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import { FormSheetSection } from "../FormSheetSection";
import { FsTextarea } from "../primitives/FsTextarea";

export function FsE11() {
  return (
    <FormSheetSection number="11" title={SECTION_LABELS.e11.full}>
      <FsTextarea name="e11.comment" placeholder="Kommentar..." />
    </FormSheetSection>
  );
}
