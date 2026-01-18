import { REGION_CATEGORIES, REGION_ORDER, RISK_INTERPRETATIONS } from "../constants";
import type {
  ElementCounts,
  ImageId,
  PainDrawingData,
  PainDrawingScore,
  PainPatterns,
  RiskLevel,
} from "../types";

/**
 * Counts drawing elements by type for a given region
 */
function countElements(
  data: PainDrawingData,
  imageId: ImageId
): ElementCounts {
  const elements = data.drawings[imageId]?.elements ?? [];

  const shadings = elements.filter((e) => e.type === "shade").length;
  const points = elements.filter((e) => e.type === "point").length;
  const arrows = elements.filter((e) => e.type === "arrow").length;

  return {
    shadings,
    points,
    arrows,
    total: shadings + points + arrows,
  };
}

/**
 * Determines risk level based on number of affected regions
 * Per DC/TMD specification:
 * - 0 regions: none
 * - 1 region: localized
 * - 2-3 regions: regional
 * - 4-5 regions: widespread
 */
function getRiskLevel(regionCount: number): RiskLevel {
  if (regionCount === 0) return "none";
  if (regionCount === 1) return "localized";
  if (regionCount <= 3) return "regional";
  return "widespread";
}

/**
 * Detects pain patterns based on affected regions
 */
function detectPatterns(affectedRegions: ImageId[]): PainPatterns {
  const hasHeadPain = affectedRegions.some((r) =>
    REGION_CATEGORIES.head.includes(r)
  );
  const hasOralPain = affectedRegions.some((r) =>
    REGION_CATEGORIES.oral.includes(r)
  );
  const hasBodyPain = affectedRegions.some((r) =>
    REGION_CATEGORIES.body.includes(r)
  );
  const hasWidespreadPain = affectedRegions.length >= 3;

  return {
    hasHeadPain,
    hasOralPain,
    hasBodyPain,
    hasWidespreadPain,
  };
}

/**
 * Calculates the pain drawing score from patient-submitted pain drawing data
 * Following DC/TMD clinical specification for pain area evaluation
 *
 * @param data - Pain drawing data from patient submission
 * @returns Comprehensive pain drawing score with region counts, patterns, and interpretation
 */
export function calculatePainDrawingScore(
  data: PainDrawingData
): PainDrawingScore {
  // Count elements for each region
  const elementCounts: Record<ImageId, ElementCounts> = {} as Record<
    ImageId,
    ElementCounts
  >;
  let totalElements = 0;

  for (const imageId of REGION_ORDER) {
    const counts = countElements(data, imageId);
    elementCounts[imageId] = counts;
    totalElements += counts.total;
  }

  // Determine affected regions (regions with at least one element)
  const affectedRegions = REGION_ORDER.filter(
    (imageId) => elementCounts[imageId].total > 0
  );

  const regionCount = affectedRegions.length;
  const riskLevel = getRiskLevel(regionCount);
  const patterns = detectPatterns(affectedRegions);
  const interpretation = RISK_INTERPRETATIONS[riskLevel];

  return {
    regionCount,
    affectedRegions,
    elementCounts,
    totalElements,
    patterns,
    riskLevel,
    interpretation,
  };
}

/**
 * Checks if a region has any drawing elements
 */
export function hasDrawings(data: PainDrawingData, imageId: ImageId): boolean {
  return (data.drawings[imageId]?.elements?.length ?? 0) > 0;
}

/**
 * Gets a human-readable summary of the pain drawing score
 */
export function getScoreSummary(score: PainDrawingScore): string {
  if (score.regionCount === 0) {
    return "Keine Schmerzareale markiert";
  }

  const regions = score.affectedRegions.length;
  const regionWord = regions === 1 ? "Region" : "Regionen";

  return `${regions} von 5 ${regionWord} betroffen`;
}
