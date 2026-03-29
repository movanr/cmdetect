import { SECTION_LABELS, SECTION_KEYS, getSectionBadge, type SectionId } from "@cmdetect/dc-tmd";
import { FormSheetSection } from "../FormSheetSection";
import { FsTextarea } from "../primitives/FsTextarea";

// E11 has one text field per section (e1-e10)
const COMMENT_SECTIONS = SECTION_KEYS.filter((id): id is Exclude<SectionId, "e11"> => id !== "e11");

export function FsE11() {
  return (
    <FormSheetSection number="11" title={SECTION_LABELS.e11.full}>
      <div className="space-y-1">
        {COMMENT_SECTIONS.map((sectionId) => (
          <div key={sectionId}>
            <span className="text-xs text-slate-400 print:text-[6pt]">
              {getSectionBadge(sectionId)}: {SECTION_LABELS[sectionId].short}
            </span>
            <FsTextarea name={`e11.${sectionId}`} placeholder="Kommentar..." />
          </div>
        ))}
      </div>
    </FormSheetSection>
  );
}
