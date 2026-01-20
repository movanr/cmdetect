import { describe, it, expect } from "vitest";
import { getStepPaths } from "./use-step-validation";
import type { QuestionInstance } from "../projections/to-instances";

describe("getStepPaths", () => {
  const createTestInstances = (): QuestionInstance[] => [
    // Measurements (no side context)
    {
      path: "e4.painFreeOpening",
      renderType: "measurement",
      context: {},
      config: { required: true },
    },
    {
      path: "e4.maxUnassistedOpening",
      renderType: "measurement",
      context: {},
      config: { required: true },
    },
    // Intro questions (no side context)
    {
      path: "e4.intro.hasIncisor",
      renderType: "checkbox",
      context: {},
      config: {},
    },
    {
      path: "e4.intro.overbite",
      renderType: "measurement",
      context: {},
      config: {},
    },
    // Interview questions - left temporalis (has side context)
    {
      path: "e4.maxUnassisted.left.temporalis.pain",
      renderType: "yesNo",
      context: { side: "left", region: "temporalis", painType: "pain" },
      config: { required: true },
    },
    {
      path: "e4.maxUnassisted.left.temporalis.familiarPain",
      renderType: "yesNo",
      context: { side: "left", region: "temporalis", painType: "familiarPain" },
      config: { required: true },
    },
    // Interview questions - left masseter (has side context)
    {
      path: "e4.maxUnassisted.left.masseter.pain",
      renderType: "yesNo",
      context: { side: "left", region: "masseter", painType: "pain" },
      config: { required: true },
    },
    // Interview questions - right temporalis (has side context)
    {
      path: "e4.maxUnassisted.right.temporalis.pain",
      renderType: "yesNo",
      context: { side: "right", region: "temporalis", painType: "pain" },
      config: { required: true },
    },
    {
      path: "e4.maxUnassisted.right.temporalis.familiarPain",
      renderType: "yesNo",
      context: { side: "right", region: "temporalis", painType: "familiarPain" },
      config: { required: true },
    },
    // maxAssisted section
    {
      path: "e4.maxAssisted.left.temporalis.pain",
      renderType: "yesNo",
      context: { side: "left", region: "temporalis", painType: "pain" },
      config: { required: true },
    },
  ];

  describe("explicit path arrays", () => {
    it("prepends rootKey to each path", () => {
      const instances = createTestInstances();
      const steps = {
        measurements: ["painFreeOpening", "maxUnassistedOpening"],
      } as const;

      const paths = getStepPaths(instances, steps, "measurements", "e4");

      expect(paths).toEqual(["e4.painFreeOpening", "e4.maxUnassistedOpening"]);
    });

    it("handles single path", () => {
      const instances = createTestInstances();
      const steps = {
        single: ["painFreeOpening"],
      } as const;

      const paths = getStepPaths(instances, steps, "single", "e4");

      expect(paths).toEqual(["e4.painFreeOpening"]);
    });

    it("handles multiple paths from nested structure", () => {
      const instances = createTestInstances();
      const steps = {
        intro: ["intro.hasIncisor", "intro.overbite"],
      } as const;

      const paths = getStepPaths(instances, steps, "intro", "e4");

      expect(paths).toEqual(["e4.intro.hasIncisor", "e4.intro.overbite"]);
    });
  });

  describe("wildcard patterns", () => {
    it("expands wildcard to matching instance paths", () => {
      const instances = createTestInstances();
      const steps: Record<string, readonly string[] | string> = {
        leftInterview: "maxUnassisted.left.*",
      };

      const paths = getStepPaths(instances, steps, "leftInterview", "e4");

      expect(paths).toHaveLength(3);
      expect(paths).toContain("e4.maxUnassisted.left.temporalis.pain");
      expect(paths).toContain("e4.maxUnassisted.left.temporalis.familiarPain");
      expect(paths).toContain("e4.maxUnassisted.left.masseter.pain");
    });

    it("filters by context.side (only interview questions)", () => {
      const instances = createTestInstances();
      const steps: Record<string, readonly string[] | string> = {
        rightInterview: "maxUnassisted.right.*",
      };

      const paths = getStepPaths(instances, steps, "rightInterview", "e4");

      expect(paths).toHaveLength(2);
      expect(paths.every((p) => p.includes(".right."))).toBe(true);
    });

    it("excludes instances without context.side", () => {
      const instances = createTestInstances();
      // Wildcard on intro which has no side context
      const steps: Record<string, readonly string[] | string> = {
        introWildcard: "intro.*",
      };

      const paths = getStepPaths(instances, steps, "introWildcard", "e4");

      // intro instances don't have context.side, so should be empty
      expect(paths).toHaveLength(0);
    });

    it("returns empty for non-matching prefix", () => {
      const instances = createTestInstances();
      const steps: Record<string, readonly string[] | string> = {
        nonexistent: "nonexistent.*",
      };

      const paths = getStepPaths(instances, steps, "nonexistent", "e4");

      expect(paths).toHaveLength(0);
    });

    it("handles wildcard on maxAssisted section", () => {
      const instances = createTestInstances();
      const steps: Record<string, readonly string[] | string> = {
        maxAssistedLeft: "maxAssisted.left.*",
      };

      const paths = getStepPaths(instances, steps, "maxAssistedLeft", "e4");

      expect(paths).toHaveLength(1);
      expect(paths[0]).toBe("e4.maxAssisted.left.temporalis.pain");
    });

    it("correctly uses rootKey in prefix matching", () => {
      const instances = createTestInstances();
      const steps: Record<string, readonly string[] | string> = {
        allLeft: "maxUnassisted.left.*",
      };

      // With wrong rootKey, nothing should match
      const pathsWrongRoot = getStepPaths(instances, steps, "allLeft", "e5");
      expect(pathsWrongRoot).toHaveLength(0);

      // With correct rootKey, should match
      const pathsCorrectRoot = getStepPaths(instances, steps, "allLeft", "e4");
      expect(pathsCorrectRoot).toHaveLength(3);
    });
  });
});
