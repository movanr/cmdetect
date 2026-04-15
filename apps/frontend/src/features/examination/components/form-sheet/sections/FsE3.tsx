import { E3_OPENING_PATTERNS, E3_OPENING_PATTERN_KEYS } from "@cmdetect/dc-tmd";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsEnumRadio } from "../primitives/FsEnumRadio";
import { useSectionValues } from "../use-section-values";

const { paths: E3_PATHS, indexMap: E3_INDEX } = createSectionPathLookup("e3");

const patternOptions = E3_OPENING_PATTERN_KEYS.map((k) => ({
  key: k,
  label: E3_OPENING_PATTERNS[k],
}));

export function FsE3() {
  const getValue = useSectionValues(E3_PATHS, E3_INDEX);

  return (
    <FormSheetSection number="3" title="Öffnungs- und Schließmuster">
      <FsEnumRadio
        name="e3.pattern"
        value={getValue("e3.pattern") as string | null}
        options={patternOptions}
      />
    </FormSheetSection>
  );
}
