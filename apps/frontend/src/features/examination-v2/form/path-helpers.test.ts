import { describe, it, expect } from "vitest";
import { createPathHelpers } from "./path-helpers";
import type { QuestionInstance } from "../projections/to-instances";

describe("createPathHelpers", () => {
  const createTestInstances = (): QuestionInstance[] => [
    // Measurements (no side/region context)
    {
      path: "e4.painFreeOpening",
      renderType: "measurement",
      context: {},
      config: { required: true, min: 0, max: 60 },
    },
    {
      path: "e4.maxUnassistedOpening",
      renderType: "measurement",
      context: {},
      config: { required: true },
    },
    // Interview questions - left temporalis
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
      enableWhen: { sibling: "pain", equals: "yes" },
    },
    {
      path: "e4.maxUnassisted.left.temporalis.familiarHeadache",
      renderType: "yesNo",
      context: { side: "left", region: "temporalis", painType: "familiarHeadache" },
      config: { required: true },
      enableWhen: { sibling: "pain", equals: "yes" },
    },
    // Interview questions - left masseter
    {
      path: "e4.maxUnassisted.left.masseter.pain",
      renderType: "yesNo",
      context: { side: "left", region: "masseter", painType: "pain" },
      config: { required: true },
    },
    {
      path: "e4.maxUnassisted.left.masseter.familiarPain",
      renderType: "yesNo",
      context: { side: "left", region: "masseter", painType: "familiarPain" },
      config: { required: true },
      enableWhen: { sibling: "pain", equals: "yes" },
    },
    // Interview questions - right temporalis
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
      enableWhen: { sibling: "pain", equals: "yes" },
    },
    // MaxAssisted section - left temporalis
    {
      path: "e4.maxAssisted.left.temporalis.pain",
      renderType: "yesNo",
      context: { side: "left", region: "temporalis", painType: "pain" },
      config: { required: true },
    },
    // Checkbox type
    {
      path: "e4.intro.checked",
      renderType: "checkbox",
      context: {},
      config: {},
    },
  ];

  describe("all()", () => {
    it("returns all instance paths", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const allPaths = helpers.all();

      expect(allPaths).toHaveLength(11);
      expect(allPaths).toContain("e4.painFreeOpening");
      expect(allPaths).toContain("e4.maxUnassisted.left.temporalis.pain");
      expect(allPaths).toContain("e4.intro.checked");
    });
  });

  describe("get()", () => {
    it("returns valid path unchanged", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const path = helpers.get("e4.painFreeOpening");

      expect(path).toBe("e4.painFreeOpening");
    });

    it("throws for invalid path", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      expect(() => helpers.get("e4.nonexistent.path")).toThrow("Invalid path: e4.nonexistent.path");
    });
  });

  describe("has()", () => {
    it("returns true for existing path", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      expect(helpers.has("e4.painFreeOpening")).toBe(true);
      expect(helpers.has("e4.maxUnassisted.left.temporalis.pain")).toBe(true);
    });

    it("returns false for non-existing path", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      expect(helpers.has("e4.nonexistent")).toBe(false);
      expect(helpers.has("e5.painFreeOpening")).toBe(false);
    });
  });

  describe("byPrefix()", () => {
    it("filters paths by prefix", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const paths = helpers.byPrefix("e4.maxUnassisted.left");

      expect(paths).toHaveLength(5);
      expect(paths.every((p) => p.startsWith("e4.maxUnassisted.left"))).toBe(true);
    });

    it("returns empty for non-matching prefix", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const paths = helpers.byPrefix("e4.nonexistent");

      expect(paths).toHaveLength(0);
    });
  });

  describe("byContext()", () => {
    it("filters by single context key", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const leftInstances = helpers.byContext({ side: "left" });

      expect(leftInstances.length).toBeGreaterThan(0);
      expect(leftInstances.every((i) => i.context.side === "left")).toBe(true);
    });

    it("filters by multiple context keys", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const filtered = helpers.byContext({ side: "left", region: "temporalis" });

      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every((i) => i.context.side === "left" && i.context.region === "temporalis")
      ).toBe(true);
    });

    it("returns empty for non-matching context", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const filtered = helpers.byContext({ side: "left", region: "nonexistent" });

      expect(filtered).toHaveLength(0);
    });
  });

  describe("bySide()", () => {
    it("returns left-side paths only", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const leftPaths = helpers.bySide("left");

      expect(leftPaths.length).toBeGreaterThan(0);
      // Verify all paths are from left side by checking instances
      const leftInstances = instances.filter((i) => i.context.side === "left");
      expect(leftPaths).toHaveLength(leftInstances.length);
    });

    it("returns right-side paths only", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const rightPaths = helpers.bySide("right");

      // We have 2 right-side instances in our test data
      expect(rightPaths).toHaveLength(2);
      expect(rightPaths.every((p) => p.includes(".right."))).toBe(true);
    });
  });

  describe("byRegion()", () => {
    it("returns paths for specified region", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const temporalisPaths = helpers.byRegion("temporalis");

      expect(temporalisPaths.length).toBeGreaterThan(0);
      expect(temporalisPaths.every((p) => p.includes("temporalis"))).toBe(true);
    });

    it("returns paths for masseter region", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const masseterPaths = helpers.byRegion("masseter");

      expect(masseterPaths).toHaveLength(2);
      expect(masseterPaths.every((p) => p.includes("masseter"))).toBe(true);
    });
  });

  describe("measurements()", () => {
    it("returns only measurement-type paths", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const measurements = helpers.measurements();

      expect(measurements).toHaveLength(2);
      expect(measurements).toContain("e4.painFreeOpening");
      expect(measurements).toContain("e4.maxUnassistedOpening");
    });
  });

  describe("yesNoQuestions()", () => {
    it("returns only yesNo-type paths", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const yesNoQuestions = helpers.yesNoQuestions();

      // Should include all yesNo questions (8 in our test data)
      expect(yesNoQuestions).toHaveLength(8);
      expect(yesNoQuestions.every((p) => !p.includes("Opening"))).toBe(true);
      expect(yesNoQuestions.every((p) => !p.includes("checked"))).toBe(true);
    });
  });

  describe("interviewQuestions()", () => {
    it("returns all interview questions (with side and painType)", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const interviewQuestions = helpers.interviewQuestions();

      // Interview questions have both side and painType in context
      expect(interviewQuestions.length).toBeGreaterThan(0);
      const interviewInstances = instances.filter((i) => i.context.side && i.context.painType);
      expect(interviewQuestions).toHaveLength(interviewInstances.length);
    });

    it("filters by section when provided - maxUnassisted", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const maxUnassistedQuestions = helpers.interviewQuestions("maxUnassisted");

      expect(maxUnassistedQuestions.length).toBeGreaterThan(0);
      expect(maxUnassistedQuestions.every((p) => p.includes("maxUnassisted"))).toBe(true);
      expect(maxUnassistedQuestions.every((p) => !p.includes("maxAssisted"))).toBe(true);
    });

    it("filters by section when provided - maxAssisted", () => {
      const instances = createTestInstances();
      const helpers = createPathHelpers(instances, "e4");

      const maxAssistedQuestions = helpers.interviewQuestions("maxAssisted");

      expect(maxAssistedQuestions).toHaveLength(1);
      expect(maxAssistedQuestions[0]).toBe("e4.maxAssisted.left.temporalis.pain");
    });
  });
});
