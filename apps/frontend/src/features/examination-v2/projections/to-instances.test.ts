import { describe, it, expect } from "vitest";
import {
  instancesFromModel,
  enrichContext,
  getStepInstances,
  defaultsFromModel,
  type QuestionInstance,
  type StepDefinition,
} from "./to-instances";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

describe("to-instances projections", () => {
  describe("instancesFromModel", () => {
    it("generates correct path for single question", () => {
      const model = M.question(Q.boolean());
      const instances = instancesFromModel("testKey", model);

      expect(instances).toHaveLength(1);
      expect(instances[0].path).toBe("testKey");
    });

    it("includes renderType from primitive", () => {
      const boolModel = M.question(Q.boolean());
      const yesNoModel = M.question(Q.yesNo());
      const measurementModel = M.question(Q.measurement());

      const boolInstances = instancesFromModel("bool", boolModel);
      const yesNoInstances = instancesFromModel("yesNo", yesNoModel);
      const measurementInstances = instancesFromModel("measurement", measurementModel);

      expect(boolInstances[0].renderType).toBe("checkbox");
      expect(yesNoInstances[0].renderType).toBe("yesNo");
      expect(measurementInstances[0].renderType).toBe("measurement");
    });

    it("preserves labelKey when provided", () => {
      const model = M.question(Q.boolean(), "myLabelKey");
      const instances = instancesFromModel("testKey", model);

      expect(instances[0].labelKey).toBe("myLabelKey");
    });

    it("omits labelKey when not provided", () => {
      const model = M.question(Q.boolean());
      const instances = instancesFromModel("testKey", model);

      expect(instances[0].labelKey).toBeUndefined();
    });

    it("includes config from primitive", () => {
      const model = M.question(Q.measurement({ unit: "mm", min: 0, max: 100 }));
      const instances = instancesFromModel("testKey", model);

      expect(instances[0].config).toEqual({ unit: "mm", min: 0, max: 100 });
    });

    it("preserves enableWhen from config", () => {
      const enableWhen = { sibling: "pain", equals: "yes" };
      const model = M.question(Q.yesNo({ enableWhen }));
      const instances = instancesFromModel("testKey", model);

      expect(instances[0].enableWhen).toEqual(enableWhen);
    });

    it("handles 1-level nested group", () => {
      const model = M.group({
        child: M.question(Q.boolean()),
      });
      const instances = instancesFromModel("root", model);

      expect(instances).toHaveLength(1);
      expect(instances[0].path).toBe("root.child");
    });

    it("handles 2-level nested group", () => {
      const model = M.group({
        level1: M.group({
          level2: M.question(Q.boolean()),
        }),
      });
      const instances = instancesFromModel("root", model);

      expect(instances).toHaveLength(1);
      expect(instances[0].path).toBe("root.level1.level2");
    });

    it("handles 3+ level nested group", () => {
      const model = M.group({
        level1: M.group({
          level2: M.group({
            level3: M.group({
              leaf: M.question(Q.boolean()),
            }),
          }),
        }),
      });
      const instances = instancesFromModel("root", model);

      expect(instances).toHaveLength(1);
      expect(instances[0].path).toBe("root.level1.level2.level3.leaf");
    });

    it("accumulates context across traversal", () => {
      const model = M.group({
        left: M.group({
          temporalis: M.group({
            pain: M.question(Q.yesNo()),
          }),
        }),
      });
      const instances = instancesFromModel("root", model);

      expect(instances).toHaveLength(1);
      expect(instances[0].context).toEqual({ side: "left", region: "temporalis", painType: "pain" });
    });

    it("returns empty array for empty group", () => {
      const model = M.group({});
      const instances = instancesFromModel("root", model);

      expect(instances).toHaveLength(0);
    });

    it("handles mixed question and group children", () => {
      const model = M.group({
        question1: M.question(Q.boolean()),
        nested: M.group({
          question2: M.question(Q.yesNo()),
        }),
        question3: M.question(Q.measurement()),
      });
      const instances = instancesFromModel("root", model);

      expect(instances).toHaveLength(3);
      const paths = instances.map((i) => i.path);
      expect(paths).toContain("root.question1");
      expect(paths).toContain("root.nested.question2");
      expect(paths).toContain("root.question3");
    });
  });

  describe("enrichContext", () => {
    it('adds side: "left" for "left" key', () => {
      const result = enrichContext({}, "left");
      expect(result).toEqual({ side: "left" });
    });

    it('adds side: "right" for "right" key', () => {
      const result = enrichContext({}, "right");
      expect(result).toEqual({ side: "right" });
    });

    it("adds region for temporalis", () => {
      const result = enrichContext({}, "temporalis");
      expect(result).toEqual({ region: "temporalis" });
    });

    it("adds region for masseter", () => {
      const result = enrichContext({}, "masseter");
      expect(result).toEqual({ region: "masseter" });
    });

    it("adds region for tmj", () => {
      const result = enrichContext({}, "tmj");
      expect(result).toEqual({ region: "tmj" });
    });

    it("adds region for otherMast", () => {
      const result = enrichContext({}, "otherMast");
      expect(result).toEqual({ region: "otherMast" });
    });

    it("adds region for nonMast", () => {
      const result = enrichContext({}, "nonMast");
      expect(result).toEqual({ region: "nonMast" });
    });

    it("adds site and muscleGroup for palpation sites", () => {
      // temporalisPosterior
      const posterior = enrichContext({}, "temporalisPosterior");
      expect(posterior.site).toBe("temporalisPosterior");
      expect(posterior.muscleGroup).toBe("temporalis");

      // masseterBody
      const body = enrichContext({}, "masseterBody");
      expect(body.site).toBe("masseterBody");
      expect(body.muscleGroup).toBe("masseter");

      // tmjLateralPole
      const lateral = enrichContext({}, "tmjLateralPole");
      expect(lateral.site).toBe("tmjLateralPole");
      expect(lateral.muscleGroup).toBe("tmj");
    });

    it("adds painType for pain types", () => {
      expect(enrichContext({}, "pain")).toEqual({ painType: "pain" });
      expect(enrichContext({}, "familiarPain")).toEqual({ painType: "familiarPain" });
      expect(enrichContext({}, "familiarHeadache")).toEqual({ painType: "familiarHeadache" });
      expect(enrichContext({}, "referredPain")).toEqual({ painType: "referredPain" });
      expect(enrichContext({}, "spreadingPain")).toEqual({ painType: "spreadingPain" });
    });

    it("preserves existing context when enriching", () => {
      const existing = { side: "left", region: "temporalis" };
      const result = enrichContext(existing, "pain");
      expect(result).toEqual({ side: "left", region: "temporalis", painType: "pain" });
    });

    it("returns unchanged context for unrecognized key", () => {
      const existing = { side: "left" };
      const result = enrichContext(existing, "unknownKey");
      expect(result).toBe(existing); // same reference
    });
  });

  describe("getStepInstances", () => {
    const createTestInstances = (): QuestionInstance[] => [
      { path: "root.intro.question1", renderType: "checkbox", context: {}, config: {} },
      { path: "root.intro.question2", renderType: "yesNo", context: {}, config: {} },
      { path: "root.left.temporalis.pain", renderType: "yesNo", context: { side: "left", region: "temporalis", painType: "pain" }, config: {} },
      { path: "root.left.masseter.pain", renderType: "yesNo", context: { side: "left", region: "masseter", painType: "pain" }, config: {} },
      { path: "root.right.temporalis.pain", renderType: "yesNo", context: { side: "right", region: "temporalis", painType: "pain" }, config: {} },
      { path: "root.nested.deep.item", renderType: "measurement", context: {}, config: {} },
    ];

    it("filters by single explicit path", () => {
      const instances = createTestInstances();
      const steps = { step1: ["intro.question1"] } as const;

      const result = getStepInstances(instances, steps, "step1", "root");

      expect(result).toHaveLength(1);
      expect(result[0].path).toBe("root.intro.question1");
    });

    it("filters by multiple explicit paths", () => {
      const instances = createTestInstances();
      const steps = { step1: ["intro.question1", "intro.question2"] } as const;

      const result = getStepInstances(instances, steps, "step1", "root");

      expect(result).toHaveLength(2);
      expect(result.map((i) => i.path)).toContain("root.intro.question1");
      expect(result.map((i) => i.path)).toContain("root.intro.question2");
    });

    it("returns empty for non-matching paths", () => {
      const instances = createTestInstances();
      const steps = { step1: ["nonexistent.path"] } as const;

      const result = getStepInstances(instances, steps, "step1", "root");

      expect(result).toHaveLength(0);
    });

    it("wildcard matches prefix with context.side", () => {
      const instances = createTestInstances();
      const steps: Record<string, StepDefinition> = { step1: "left.*" };

      const result = getStepInstances(instances, steps, "step1", "root");

      expect(result).toHaveLength(2);
      expect(result.every((i) => i.path.startsWith("root.left."))).toBe(true);
      expect(result.every((i) => i.context.side === "left")).toBe(true);
    });

    it("wildcard excludes instances without context.side", () => {
      const instances = createTestInstances();
      const steps: Record<string, StepDefinition> = { step1: "intro.*" };

      const result = getStepInstances(instances, steps, "step1", "root");

      // intro questions have no context.side, so should be excluded
      expect(result).toHaveLength(0);
    });

    it("returns empty for non-matching wildcard", () => {
      const instances = createTestInstances();
      const steps: Record<string, StepDefinition> = { step1: "nonexistent.*" };

      const result = getStepInstances(instances, steps, "step1", "root");

      expect(result).toHaveLength(0);
    });
  });

  describe("defaultsFromModel", () => {
    it("returns false for Q.boolean()", () => {
      const model = M.question(Q.boolean());
      expect(defaultsFromModel(model)).toBe(false);
    });

    it("returns null for Q.yesNo()", () => {
      const model = M.question(Q.yesNo());
      expect(defaultsFromModel(model)).toBe(null);
    });

    it("returns null for Q.measurement()", () => {
      const model = M.question(Q.measurement());
      expect(defaultsFromModel(model)).toBe(null);
    });

    it("builds nested object for groups", () => {
      const model = M.group({
        bool: M.question(Q.boolean()),
        nested: M.group({
          yesNo: M.question(Q.yesNo()),
          measurement: M.question(Q.measurement()),
        }),
      });

      const defaults = defaultsFromModel(model);

      expect(defaults).toEqual({
        bool: false,
        nested: {
          yesNo: null,
          measurement: null,
        },
      });
    });
  });
});
