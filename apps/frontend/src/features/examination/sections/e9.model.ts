import {
  SIDE_KEYS,
  PALPATION_SITE_KEYS,
  getPalpationPainQuestions,
  type PalpationSite,
} from "../model/regions";
import { M, type GroupNode, type ModelNode } from "../model/nodes";
import { Q } from "../model/primitives";

/** Field name for patient refusal (RF) per side */
export const REFUSED_FIELD = "refused" as const;

// Build pain questions for one palpation site
const palpationQuestionsForSite = (site: PalpationSite) => {
  const questions = getPalpationPainQuestions(site);
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
    Object.fromEntries(PALPATION_SITE_KEYS.map((site) => [site, palpationQuestionsForSite(site)]))
  ) as GroupNode & { __children: Record<string, ModelNode> };

// Build sites for one side with refused field
const sitesForSideWithRefused = () =>
  M.group({
    [REFUSED_FIELD]: M.question(Q.boolean(), REFUSED_FIELD),
    ...sitesForSide().__children,
  }) as GroupNode & { __children: Record<string, ModelNode> };

// Build bilateral (left + right)
const bilateral = () =>
  M.group(Object.fromEntries(SIDE_KEYS.map((s) => [s, sitesForSideWithRefused()]))) as GroupNode & {
    __children: Record<string, ModelNode>;
  };

// E9_MODEL includes palpation mode and site detail mode settings at root level plus bilateral palpation sites
export const E9_MODEL = M.group({
  palpationMode: M.question(Q.palpationMode()),
  siteDetailMode: M.question(Q.siteDetailMode()),
  ...bilateral().__children,
}) as GroupNode & { __children: Record<string, ModelNode> };

// Steps - split by side for cleaner UX
export const E9_STEPS = {
  "e9-left": [`left.${REFUSED_FIELD}`, "left.*"],
  "e9-right": [`right.${REFUSED_FIELD}`, "right.*"],
} as const;
