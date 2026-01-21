/**
 * Reusable model builders for common examination patterns.
 */
import { M, type GroupNode, type ModelNode } from "./nodes";
import { Q } from "./primitives";
import {
  SIDES,
  MOVEMENT_REGIONS,
  getMovementPainQuestions,
  type MovementRegion,
} from "./regions";

type GroupWithChildren<C extends Record<string, ModelNode> = Record<string, ModelNode>> = GroupNode<C>;

/**
 * Build pain questions for one region.
 * - pain (always)
 * - familiarPain (enableWhen: pain === 'yes')
 * - familiarHeadache (temporalis only, enableWhen: pain === 'yes')
 */
const painQuestionsForRegion = (region: MovementRegion): GroupWithChildren => {
  const questions = getMovementPainQuestions(region);
  return M.group(
    Object.fromEntries(
      questions.map((q) => {
        const enableWhen =
          q === "familiarPain" || q === "familiarHeadache"
            ? { sibling: "pain", equals: "yes" as const }
            : undefined;

        return [q, M.question(Q.yesNo({ required: true, enableWhen }))];
      })
    )
  ) as GroupWithChildren;
};

/**
 * Build all regions for one side.
 * Returns: { temporalis: {...}, masseter: {...}, tmj: {...}, otherMast: {...}, nonMast: {...} }
 */
const regionsForSide = (): GroupWithChildren =>
  M.group(
    Object.fromEntries(MOVEMENT_REGIONS.map((r) => [r, painQuestionsForRegion(r)]))
  ) as GroupWithChildren;

/**
 * Build bilateral pain interview (left + right sides with all regions).
 * Used by E4 (opening movements) and E5 (lateral/protrusive movements).
 *
 * Returns: { left: { regions... }, right: { regions... } }
 */
export const bilateralPainInterview = (): GroupWithChildren =>
  M.group(
    Object.fromEntries(SIDES.map((s) => [s, regionsForSide()]))
  ) as GroupWithChildren;

/**
 * Spread helper - extracts __children for spreading into another group.
 * Usage: M.group({ measurement: ..., ...spreadChildren(bilateralPainInterview()) })
 */
export const spreadChildren = (group: GroupWithChildren): Record<string, ModelNode> =>
  group.__children;
