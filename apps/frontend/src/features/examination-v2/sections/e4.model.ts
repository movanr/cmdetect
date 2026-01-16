import { M, type GroupNode, type ModelNode } from "../model/nodes";
import { Q } from "../model/primitives";
import { SIDES, E4_REGIONS, getPainQuestions, type E4Region } from "../model/contexts";

// Build pain interview for one region
const painQuestionsForRegion = (region: E4Region) => {
  const questions = getPainQuestions(region);
  return M.group(
    Object.fromEntries(questions.map((q) => [q, M.question(Q.yesNo())]))
  ) as GroupNode & { __children: Record<string, ModelNode> };
};

// Build all regions for one side
const regionsForSide = () =>
  M.group(
    Object.fromEntries(E4_REGIONS.map((r) => [r, painQuestionsForRegion(r)]))
  ) as GroupNode & { __children: Record<string, ModelNode> };

// Build bilateral (left + right)
const bilateral = () =>
  M.group(Object.fromEntries(SIDES.map((s) => [s, regionsForSide()]))) as GroupNode & {
    __children: Record<string, ModelNode>;
  };

export const E4_MODEL = M.group({
  painFree: M.group({
    measurement: M.question(Q.measurement({ unit: "mm" }), "painFreeOpening"),
  }),
  maxUnassisted: M.group({
    measurement: M.question(
      Q.measurement({ unit: "mm" }),
      "maxUnassistedOpening"
    ),
    ...bilateral().__children,
  }),
  maxAssisted: M.group({
    measurement: M.question(
      Q.measurement({ unit: "mm" }),
      "maxAssistedOpening"
    ),
    terminated: M.question(Q.boolean(), "terminated"),
    ...bilateral().__children,
  }),
});

// Steps - just arrays of paths or wildcard
export const E4_STEPS = {
  e4a: ["painFree.measurement"],
  "e4b-measure": ["maxUnassisted.measurement"],
  "e4b-interview": "maxUnassisted.*",
  "e4c-measure": ["maxAssisted.measurement", "maxAssisted.terminated"],
  "e4c-interview": "maxAssisted.*",
} as const;
