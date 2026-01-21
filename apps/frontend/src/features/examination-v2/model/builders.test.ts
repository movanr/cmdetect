import { describe, it, expect } from "vitest";
import { bilateralPainInterview, spreadChildren } from "./builders";
import { M } from "./nodes";
import { Q } from "./primitives";
import { SIDES, MOVEMENT_REGIONS } from "./regions";
import type { QuestionNode, GroupNode, ModelNode } from "./nodes";

describe("model builders", () => {
  describe("bilateralPainInterview", () => {
    it("creates left and right sides", () => {
      const interview = bilateralPainInterview();

      expect(interview.__nodeType).toBe("group");
      expect(interview.__children).toHaveProperty("left");
      expect(interview.__children).toHaveProperty("right");
      expect(Object.keys(interview.__children)).toHaveLength(SIDES.length);
    });

    it("includes all 5 movement regions per side", () => {
      const interview = bilateralPainInterview();

      const leftSide = interview.__children.left as GroupNode;
      const rightSide = interview.__children.right as GroupNode;

      expect(Object.keys(leftSide.__children)).toHaveLength(MOVEMENT_REGIONS.length);
      expect(Object.keys(rightSide.__children)).toHaveLength(MOVEMENT_REGIONS.length);

      for (const region of MOVEMENT_REGIONS) {
        expect(leftSide.__children).toHaveProperty(region);
        expect(rightSide.__children).toHaveProperty(region);
      }
    });

    it("temporalis has pain, familiarPain, familiarHeadache", () => {
      const interview = bilateralPainInterview();

      const leftTemporalis = (interview.__children.left as GroupNode).__children
        .temporalis as GroupNode;

      expect(leftTemporalis.__nodeType).toBe("group");
      expect(leftTemporalis.__children).toHaveProperty("pain");
      expect(leftTemporalis.__children).toHaveProperty("familiarPain");
      expect(leftTemporalis.__children).toHaveProperty("familiarHeadache");
      expect(Object.keys(leftTemporalis.__children)).toHaveLength(3);
    });

    it("non-temporalis regions have pain, familiarPain only", () => {
      const interview = bilateralPainInterview();
      const leftSide = interview.__children.left as GroupNode;

      // Check masseter
      const leftMasseter = leftSide.__children.masseter as GroupNode;
      expect(leftMasseter.__children).toHaveProperty("pain");
      expect(leftMasseter.__children).toHaveProperty("familiarPain");
      expect(leftMasseter.__children).not.toHaveProperty("familiarHeadache");
      expect(Object.keys(leftMasseter.__children)).toHaveLength(2);

      // Check tmj
      const leftTmj = leftSide.__children.tmj as GroupNode;
      expect(Object.keys(leftTmj.__children)).toHaveLength(2);
      expect(leftTmj.__children).not.toHaveProperty("familiarHeadache");

      // Check otherMast
      const leftOtherMast = leftSide.__children.otherMast as GroupNode;
      expect(Object.keys(leftOtherMast.__children)).toHaveLength(2);

      // Check nonMast
      const leftNonMast = leftSide.__children.nonMast as GroupNode;
      expect(Object.keys(leftNonMast.__children)).toHaveLength(2);
    });

    it("all questions have required=true", () => {
      const interview = bilateralPainInterview();

      const checkRequiredRecursively = (node: GroupNode | QuestionNode) => {
        if (node.__nodeType === "question") {
          const config = node.__primitive.config as { required?: boolean };
          expect(config.required).toBe(true);
        } else {
          for (const child of Object.values(node.__children)) {
            checkRequiredRecursively(child);
          }
        }
      };

      checkRequiredRecursively(interview);
    });
  });

  describe("enableWhen conditions", () => {
    it("pain has no enableWhen", () => {
      const interview = bilateralPainInterview();
      const leftTemporalis = (interview.__children.left as GroupNode).__children
        .temporalis as GroupNode;
      const painQuestion = leftTemporalis.__children.pain as QuestionNode;

      const config = painQuestion.__primitive.config as { enableWhen?: unknown };
      expect(config.enableWhen).toBeUndefined();
    });

    it("familiarPain has enableWhen: pain=yes", () => {
      const interview = bilateralPainInterview();
      const leftTemporalis = (interview.__children.left as GroupNode).__children
        .temporalis as GroupNode;
      const familiarPainQuestion = leftTemporalis.__children.familiarPain as QuestionNode;

      const config = familiarPainQuestion.__primitive.config as {
        enableWhen?: { sibling: string; equals: string };
      };
      expect(config.enableWhen).toBeDefined();
      expect(config.enableWhen?.sibling).toBe("pain");
      expect(config.enableWhen?.equals).toBe("yes");
    });

    it("familiarHeadache has enableWhen: pain=yes", () => {
      const interview = bilateralPainInterview();
      const leftTemporalis = (interview.__children.left as GroupNode).__children
        .temporalis as GroupNode;
      const familiarHeadacheQuestion = leftTemporalis.__children.familiarHeadache as QuestionNode;

      const config = familiarHeadacheQuestion.__primitive.config as {
        enableWhen?: { sibling: string; equals: string };
      };
      expect(config.enableWhen).toBeDefined();
      expect(config.enableWhen?.sibling).toBe("pain");
      expect(config.enableWhen?.equals).toBe("yes");
    });

    it("non-temporalis familiarPain also has enableWhen: pain=yes", () => {
      const interview = bilateralPainInterview();
      const leftMasseter = (interview.__children.left as GroupNode).__children
        .masseter as GroupNode;
      const familiarPainQuestion = leftMasseter.__children.familiarPain as QuestionNode;

      const config = familiarPainQuestion.__primitive.config as {
        enableWhen?: { sibling: string; equals: string };
      };
      expect(config.enableWhen).toBeDefined();
      expect(config.enableWhen?.sibling).toBe("pain");
      expect(config.enableWhen?.equals).toBe("yes");
    });
  });

  describe("spreadChildren", () => {
    it("extracts __children for spreading into group", () => {
      const interview = bilateralPainInterview();
      const children = spreadChildren(interview);

      expect(children).toHaveProperty("left");
      expect(children).toHaveProperty("right");
      expect(children).toBe(interview.__children);
    });

    it("allows combining with other model nodes", () => {
      const interview = bilateralPainInterview();
      const combined = M.group({
        measurement: M.question(Q.measurement({ min: 0, max: 60 })),
        ...spreadChildren(interview),
      });

      expect(combined.__children).toHaveProperty("measurement");
      expect(combined.__children).toHaveProperty("left");
      expect(combined.__children).toHaveProperty("right");
      expect(Object.keys(combined.__children)).toHaveLength(3);
    });

    it("preserves full nested structure when spread", () => {
      const interview = bilateralPainInterview();
      const combined = M.group({
        intro: M.question(Q.boolean()),
        ...spreadChildren(interview),
      });

      // Verify the nested structure is preserved
      // TypeScript can't infer spread properties, so we cast __children
      const children = combined.__children as Record<string, ModelNode>;
      const leftSide = children.left as GroupNode;
      const leftTemporalis = leftSide.__children.temporalis as GroupNode;
      expect(leftTemporalis.__children).toHaveProperty("pain");
      expect(leftTemporalis.__children).toHaveProperty("familiarPain");
      expect(leftTemporalis.__children).toHaveProperty("familiarHeadache");
    });
  });
});
