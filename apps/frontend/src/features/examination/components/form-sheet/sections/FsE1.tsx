import {
  E1_PAIN_LOCATIONS,
  E1_PAIN_LOCATION_KEYS,
  E1_HEADACHE_LOCATIONS,
  E1_HEADACHE_LOCATION_KEYS,
  SIDES,
  type Side,
} from "../../../model/regions";

const DISPLAY_SIDES: Side[] = ["right", "left"];
import { FormSheetSection } from "../FormSheetSection";
import { FsCheckboxGroup } from "../primitives/FsCheckboxGroup";

const painOptions = E1_PAIN_LOCATION_KEYS.map((k) => ({
  key: k,
  label: E1_PAIN_LOCATIONS[k],
}));

const headacheOptions = E1_HEADACHE_LOCATION_KEYS.map((k) => ({
  key: k,
  label: E1_HEADACHE_LOCATIONS[k],
}));

export function FsE1() {
  return (
    <>
      <FormSheetSection number="1a" title="Schmerzlokalisation: letzte 30 Tage">
        <div className="grid grid-cols-2 gap-2">
          {DISPLAY_SIDES.map((side) => (
            <div key={side}>
              <span className="text-xs font-semibold text-slate-500 print:text-[6pt]">
                {SIDES[side]}
              </span>
              <FsCheckboxGroup name={`e1.painLocation.${side}`} options={painOptions} />
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
              <FsCheckboxGroup name={`e1.headacheLocation.${side}`} options={headacheOptions} />
            </div>
          ))}
        </div>
      </FormSheetSection>
    </>
  );
}
