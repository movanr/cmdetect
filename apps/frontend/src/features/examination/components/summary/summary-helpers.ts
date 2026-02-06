/**
 * Shared formatting helpers for examination summary display.
 */

/**
 * Build a compact summary string from bilateral region selections.
 * Shows laterality: (rechts), (links), or (beidseitig).
 *
 * Extracted from E1Section for shared use.
 */
export function buildRegionSummary(
  rightValues: string[] | undefined,
  leftValues: string[] | undefined,
  regionLabels: Record<string, string>,
  noneLabel: string
): string {
  const right = (rightValues ?? []).filter((v) => v !== "none");
  const left = (leftValues ?? []).filter((v) => v !== "none");

  if (right.length === 0 && left.length === 0) {
    return noneLabel;
  }

  const allRegions = new Set([...right, ...left]);
  const parts: string[] = [];

  for (const region of allRegions) {
    const label = regionLabels[region] || region;
    const inRight = right.includes(region);
    const inLeft = left.includes(region);

    if (inRight && inLeft) {
      parts.push(`${label} (beidseitig)`);
    } else if (inRight) {
      parts.push(`${label} (rechts)`);
    } else {
      parts.push(`${label} (links)`);
    }
  }

  return parts.join(", ");
}

/**
 * Format a measurement value with refused/terminated handling.
 */
export function formatMeasurement(
  value: number | null | undefined,
  refused?: boolean,
  terminated?: boolean
): { text: string; variant: "normal" | "refused" | "terminated" | "empty" } {
  if (refused) {
    return { text: "RF", variant: "refused" };
  }
  if (value == null) {
    return { text: "—", variant: "empty" };
  }
  const suffix = terminated ? " (Hand gehoben)" : "";
  return { text: `${value} mm${suffix}`, variant: terminated ? "terminated" : "normal" };
}
