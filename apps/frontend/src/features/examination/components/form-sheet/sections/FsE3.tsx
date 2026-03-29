import { E3_OPENING_PATTERNS, E3_OPENING_PATTERN_KEYS } from "@cmdetect/dc-tmd";
import { FormSheetSection } from "../FormSheetSection";
import { FsEnumRadio } from "../primitives/FsEnumRadio";

const patternOptions = E3_OPENING_PATTERN_KEYS.map((k) => ({
  key: k,
  label: E3_OPENING_PATTERNS[k],
}));

export function FsE3() {
  return (
    <FormSheetSection number="3" title="Öffnungs- und Schließmuster">
      <FsEnumRadio name="e3.openingPattern" options={patternOptions} />
    </FormSheetSection>
  );
}
