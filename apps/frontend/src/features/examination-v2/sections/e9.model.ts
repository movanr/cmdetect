import { SIDES } from "../model/contexts";
import {
  E9_PALPATION_SITES,
  getE9PalpationQuestions,
  type E9PalpationSite,
} from "../model/e9-contexts";
import { M, type GroupNode, type ModelNode } from "../model/nodes";
import { Q } from "../model/primitives";

// Build pain questions for one palpation site
const palpationQuestionsForSite = (site: E9PalpationSite) => {
  const questions = getE9PalpationQuestions(site);
  return M.group(
    Object.fromEntries(
      questions.map((q) => {
        // All follow-up questions (familiarPain, familiarHeadache, referredPain, spreadingPain) depend on pain === 'yes'
        const enableWhen = q !== "pain" ? { sibling: "pain", equals: "yes" as const } : undefined;

        return [q, M.question(Q.yesNo({ required: true, enableWhen }))];
      })
    )
  ) as GroupNode & { __children: Record<string, ModelNode> };
};

// Build all sites for one side
const sitesForSide = () =>
  M.group(
    Object.fromEntries(E9_PALPATION_SITES.map((site) => [site, palpationQuestionsForSite(site)]))
  ) as GroupNode & { __children: Record<string, ModelNode> };

// Build bilateral (left + right)
const bilateral = () =>
  M.group(Object.fromEntries(SIDES.map((s) => [s, sitesForSide()]))) as GroupNode & {
    __children: Record<string, ModelNode>;
  };

export const E9_MODEL = bilateral();

// Steps - split by side for cleaner UX
export const E9_STEPS = {
  "e9-left": "left.*",
  "e9-right": "right.*",
} as const;
