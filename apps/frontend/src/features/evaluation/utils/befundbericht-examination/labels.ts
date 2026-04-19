import type { SideOrBoth } from "./types";

/**
 * TMJ location phrase:
 *   right → "im rechten Kiefergelenk"
 *   left  → "im linken Kiefergelenk"
 *   both  → "im Kiefergelenk (beidseitig)"
 *
 * The unilateral form uses a dative-masculine adjective; the bilateral form
 * uses a postfixed parenthetical because the attributive form
 * ("im beidseitigen Kiefergelenk") reads awkwardly.
 */
export function tmjLocation(side: SideOrBoth): string {
  if (side === "right") return "im rechten Kiefergelenk";
  if (side === "left") return "im linken Kiefergelenk";
  return "im Kiefergelenk (beidseitig)";
}

/** Adverbial form used in enumerations: "Temporalis [rechts|links|beidseits]". */
export function sideAdv(side: SideOrBoth): string {
  if (side === "right") return "rechts";
  if (side === "left") return "links";
  return "beidseits";
}
