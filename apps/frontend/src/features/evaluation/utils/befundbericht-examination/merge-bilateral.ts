import type { Finding, SidedFinding, SideOrBoth } from "./types";

/**
 * Rule 1.7 — "Rechts UND links mit identischen Feldern → 'beidseits'."
 *
 * Collapses pairs of right/left findings into a single `side: "both"` finding,
 * but only when every other field is deep-equal. Any asymmetry (including
 * differences in qualifiers) → both findings pass through unchanged.
 *
 * Assumes input is already ordered within a section. Order is preserved for
 * non-merged findings; merged pairs take the position of the first (right) occurrence.
 */
export function mergeBilateral<F extends Finding>(findings: F[]): F[] {
  const out: F[] = [];
  const consumed = new Set<number>();

  for (let i = 0; i < findings.length; i++) {
    if (consumed.has(i)) continue;
    const a = findings[i];
    const aSide = (a as Partial<SidedFinding>).side;
    if (aSide !== "right" && aSide !== "left") {
      out.push(a);
      continue;
    }

    let matched = false;
    for (let j = i + 1; j < findings.length; j++) {
      if (consumed.has(j)) continue;
      const b = findings[j];
      if (!isMergeablePair(a, b)) continue;
      out.push(withSide(a, "both"));
      consumed.add(j);
      matched = true;
      break;
    }
    if (!matched) out.push(a);
  }

  return out;
}

function isMergeablePair(a: Finding, b: Finding): boolean {
  const aSide = (a as Partial<SidedFinding>).side;
  const bSide = (b as Partial<SidedFinding>).side;
  if (aSide !== "right" && aSide !== "left") return false;
  if (bSide !== "right" && bSide !== "left") return false;
  if (aSide === bSide) return false;
  return deepEqualExceptSide(a, b);
}

function withSide<F extends Finding>(finding: F, side: SideOrBoth): F {
  return { ...finding, side };
}

/** Deep equality that ignores the `side` field. */
function deepEqualExceptSide(a: unknown, b: unknown, path: string[] = []): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualExceptSide(a[i], b[i], path)) return false;
    }
    return true;
  }

  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
  for (const k of keys) {
    if (k === "side" && path.length === 0) continue;
    if (!deepEqualExceptSide(ao[k], bo[k], [...path, k])) return false;
  }
  return true;
}
