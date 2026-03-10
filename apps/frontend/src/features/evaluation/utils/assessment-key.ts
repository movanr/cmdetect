import type { PalpationSite, Region, Side } from "@cmdetect/dc-tmd";

/** Build a map key matching the format used by CriteriaChecklist. */
export function assessmentKey(
  criterionId: string,
  side: Side | null,
  region: Region | null,
  site: PalpationSite | null,
): string {
  return `${criterionId}:${side ?? ""}:${region ?? ""}:${site ?? ""}`;
}
