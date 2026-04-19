import { REGION_KEYS, SIDE_KEYS, getValueAtPath, type Region } from "@cmdetect/dc-tmd";
import type { SideOrBoth } from "../types";

/**
 * Collects positive familiarPain findings across a set of movement prefixes
 * (U4: maxUnassisted + maxAssisted; U5: lateralRight + lateralLeft + protrusive).
 *
 * Returns a list of {region, side} with bilateral collapse: regions positive on
 * both sides across any movement → side="both"; one side only → that side.
 *
 * Output order follows REGION_KEYS (temporalis → masseter → tmj → otherMast → nonMast).
 */
export function unionFamiliarPainStructures(
  data: unknown,
  prefixes: readonly string[]
): Array<{ region: Region; side: SideOrBoth }> {
  const out: Array<{ region: Region; side: SideOrBoth }> = [];

  for (const region of REGION_KEYS) {
    const positive = { left: false, right: false };
    for (const side of SIDE_KEYS) {
      for (const prefix of prefixes) {
        if (getValueAtPath(data, `${prefix}.${side}.${region}.familiarPain`) === "yes") {
          positive[side] = true;
          break;
        }
      }
    }
    if (positive.left && positive.right) out.push({ region, side: "both" });
    else if (positive.right) out.push({ region, side: "right" });
    else if (positive.left) out.push({ region, side: "left" });
  }

  return out;
}

/**
 * OR across given prefixes × sides of `temporalis.familiarHeadache === "yes"`.
 * Used by U4 for the independent headache trigger (rule 1.6).
 */
export function anyFamiliarHeadacheAtTemporalis(
  data: unknown,
  prefixes: readonly string[]
): boolean {
  for (const side of SIDE_KEYS) {
    for (const prefix of prefixes) {
      if (getValueAtPath(data, `${prefix}.${side}.temporalis.familiarHeadache`) === "yes") {
        return true;
      }
    }
  }
  return false;
}
