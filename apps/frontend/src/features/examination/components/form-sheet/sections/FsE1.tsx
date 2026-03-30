import {
  E1_PAIN_LOCATIONS,
  E1_PAIN_LOCATION_KEYS,
  E1_HEADACHE_LOCATIONS,
  E1_HEADACHE_LOCATION_KEYS,
  SIDES,
  type Side,
} from "../../../model/regions";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { FormSheetSection } from "../FormSheetSection";
import { FsCheckboxGroup } from "../primitives/FsCheckboxGroup";
import { useSectionValues } from "../use-section-values";

const DISPLAY_SIDES: Side[] = ["right", "left"];
const { paths: E1_PATHS, indexMap: E1_INDEX } = createSectionPathLookup("e1");

const painOptions = E1_PAIN_LOCATION_KEYS.map((k) => ({
  key: k,
  label: E1_PAIN_LOCATIONS[k],
}));

const headacheOptions = E1_HEADACHE_LOCATION_KEYS.map((k) => ({
  key: k,
  label: E1_HEADACHE_LOCATIONS[k],
}));

export function FsE1() {
  const getValue = useSectionValues(E1_PATHS, E1_INDEX);

  return (
    <>
      <FormSheetSection number="1a" title="Schmerzlokalisation: letzte 30 Tage">
        <div className="grid grid-cols-2 gap-2">
          {DISPLAY_SIDES.map((side) => (
            <div key={side}>
              <span className="text-xs font-semibold text-slate-500 print:text-[6pt]">
                {SIDES[side]}
              </span>
              <FsCheckboxGroup
                name={`e1.painLocation.${side}`}
                value={(getValue(`e1.painLocation.${side}`) as string[]) ?? []}
                options={painOptions}
              />
            </div>
          ))}
        </div>
      </FormSheetSection>

      <FormSheetSection number="1b" title="Kopfschmerzlokalisation: letzte 30 Tage">
        <div className="grid grid-cols-2 gap-2">
          {DISPLAY_SIDES.map((side) => (
            <div key={side}>
              <span className="text-xs font-semibold text-slate-500 print:text-[6pt]">
                {SIDES[side]}
              </span>
              <FsCheckboxGroup
                name={`e1.headacheLocation.${side}`}
                value={(getValue(`e1.headacheLocation.${side}`) as string[]) ?? []}
                options={headacheOptions}
              />
            </div>
          ))}
        </div>
      </FormSheetSection>
    </>
  );
}
