import { E10_SITE_KEYS, E10_PAIN_QUESTIONS } from "../model/regions";
import { M, type GroupNode, type ModelNode } from "../model/nodes";
import { Q } from "../model/primitives";
import { SIDE_KEYS } from "../model/regions";

/** Field name for patient refusal (RF) per side */
export const REFUSED_FIELD = "refused" as const;

// Build pain questions for one E10 palpation site
// E10 sites only have: pain, familiarPain, referredPain (no headache, no spreading)
const e10QuestionsForSite = () => {
  return M.group(
    Object.fromEntries(
      E10_PAIN_QUESTIONS.map((q) => {
        const enableWhen = q !== "pain" ? { sibling: "pain", equals: "yes" as const } : undefined;
        return [q, M.question(Q.yesNo({ required: true, enableWhen }))];
      })
    )
  ) as GroupNode & { __children: Record<string, ModelNode> };
};

// Build all E10 sites for one side
const e10SitesForSide = () =>
  M.group(
    Object.fromEntries(E10_SITE_KEYS.map((site) => [site, e10QuestionsForSite()]))
  ) as GroupNode & { __children: Record<string, ModelNode> };

// Build E10 sites for one side with refused field
const e10SitesForSideWithRefused = () =>
  M.group({
    [REFUSED_FIELD]: M.question(Q.boolean(), REFUSED_FIELD),
    ...e10SitesForSide().__children,
  }) as GroupNode & { __children: Record<string, ModelNode> };

// Build bilateral (left + right)
const bilateral = () =>
  M.group(Object.fromEntries(SIDE_KEYS.map((s) => [s, e10SitesForSideWithRefused()]))) as GroupNode & {
    __children: Record<string, ModelNode>;
  };

// E10_MODEL: bilateral supplemental palpation sites
export const E10_MODEL = bilateral();

// Steps - split by side
export const E10_STEPS = {
  "e10-left": [`left.${REFUSED_FIELD}`, "left.*"],
  "e10-right": [`right.${REFUSED_FIELD}`, "right.*"],
} as const;
