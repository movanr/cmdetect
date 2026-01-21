import { describe, it, expect } from "vitest";
import {
  validateInterviewCompletion,
  isFieldEnabled,
  validateInstances,
  type IncompleteRegion,
} from "./validation";
import type { QuestionInstance } from "../projections/to-instances";

describe("validation", () => {
  describe("validateInterviewCompletion", () => {
    const createInterviewInstances = (): QuestionInstance[] => [
      // Left temporalis - has familiarHeadache
      {
        path: "e4.left.temporalis.pain",
        renderType: "yesNo",
        context: { side: "left", region: "temporalis", painType: "pain" },
        config: { required: true },
      },
      {
        path: "e4.left.temporalis.familiarPain",
        renderType: "yesNo",
        context: { side: "left", region: "temporalis", painType: "familiarPain" },
        config: { required: true },
        enableWhen: { sibling: "pain", equals: "yes" },
      },
      {
        path: "e4.left.temporalis.familiarHeadache",
        renderType: "yesNo",
        context: { side: "left", region: "temporalis", painType: "familiarHeadache" },
        config: { required: true },
        enableWhen: { sibling: "pain", equals: "yes" },
      },
      // Left masseter - no familiarHeadache
      {
        path: "e4.left.masseter.pain",
        renderType: "yesNo",
        context: { side: "left", region: "masseter", painType: "pain" },
        config: { required: true },
      },
      {
        path: "e4.left.masseter.familiarPain",
        renderType: "yesNo",
        context: { side: "left", region: "masseter", painType: "familiarPain" },
        config: { required: true },
        enableWhen: { sibling: "pain", equals: "yes" },
      },
      // Right temporalis - has familiarHeadache
      {
        path: "e4.right.temporalis.pain",
        renderType: "yesNo",
        context: { side: "right", region: "temporalis", painType: "pain" },
        config: { required: true },
      },
      {
        path: "e4.right.temporalis.familiarPain",
        renderType: "yesNo",
        context: { side: "right", region: "temporalis", painType: "familiarPain" },
        config: { required: true },
        enableWhen: { sibling: "pain", equals: "yes" },
      },
      {
        path: "e4.right.temporalis.familiarHeadache",
        renderType: "yesNo",
        context: { side: "right", region: "temporalis", painType: "familiarHeadache" },
        config: { required: true },
        enableWhen: { sibling: "pain", equals: "yes" },
      },
    ];

    it("returns valid when all pain questions answered", () => {
      const instances = createInterviewInstances();
      const values: Record<string, string | null> = {
        "e4.left.temporalis.pain": "no",
        "e4.left.masseter.pain": "no",
        "e4.right.temporalis.pain": "no",
      };

      const result = validateInterviewCompletion(instances, (path) => values[path]);

      expect(result.valid).toBe(true);
      expect(result.incompleteRegions).toHaveLength(0);
    });

    it("returns invalid when pain unanswered", () => {
      const instances = createInterviewInstances();
      const values: Record<string, string | null> = {
        "e4.left.temporalis.pain": null, // unanswered
        "e4.left.masseter.pain": "no",
        "e4.right.temporalis.pain": "no",
      };

      const result = validateInterviewCompletion(instances, (path) => values[path]);

      expect(result.valid).toBe(false);
      expect(result.incompleteRegions).toHaveLength(1);
      expect(result.incompleteRegions[0]).toMatchObject({
        region: "temporalis",
        side: "left",
        missingPain: true,
        missingFamiliarPain: false,
        missingFamiliarHeadache: false,
      });
    });

    it("returns invalid when pain=yes but familiarPain unanswered", () => {
      const instances = createInterviewInstances();
      const values: Record<string, string | null> = {
        "e4.left.temporalis.pain": "yes",
        "e4.left.temporalis.familiarPain": null, // unanswered
        "e4.left.temporalis.familiarHeadache": "no",
        "e4.left.masseter.pain": "no",
        "e4.right.temporalis.pain": "no",
      };

      const result = validateInterviewCompletion(instances, (path) => values[path]);

      expect(result.valid).toBe(false);
      const incomplete = result.incompleteRegions.find(
        (r) => r.region === "temporalis" && r.side === "left"
      );
      expect(incomplete).toBeDefined();
      expect(incomplete!.missingFamiliarPain).toBe(true);
    });

    it("returns invalid when temporalis pain=yes but familiarHeadache unanswered", () => {
      const instances = createInterviewInstances();
      const values: Record<string, string | null> = {
        "e4.left.temporalis.pain": "yes",
        "e4.left.temporalis.familiarPain": "no",
        "e4.left.temporalis.familiarHeadache": null, // unanswered
        "e4.left.masseter.pain": "no",
        "e4.right.temporalis.pain": "no",
      };

      const result = validateInterviewCompletion(instances, (path) => values[path]);

      expect(result.valid).toBe(false);
      const incomplete = result.incompleteRegions.find(
        (r) => r.region === "temporalis" && r.side === "left"
      );
      expect(incomplete).toBeDefined();
      expect(incomplete!.missingFamiliarHeadache).toBe(true);
    });

    it("non-temporalis regions don't require familiarHeadache", () => {
      const instances = createInterviewInstances();
      const values: Record<string, string | null> = {
        "e4.left.temporalis.pain": "no",
        "e4.left.masseter.pain": "yes",
        "e4.left.masseter.familiarPain": "no",
        // No familiarHeadache for masseter - and that's OK
        "e4.right.temporalis.pain": "no",
      };

      const result = validateInterviewCompletion(instances, (path) => values[path]);

      expect(result.valid).toBe(true);
      expect(result.incompleteRegions).toHaveLength(0);
    });

    it("handles multiple regions with mixed completion", () => {
      const instances = createInterviewInstances();
      const values: Record<string, string | null> = {
        "e4.left.temporalis.pain": null, // incomplete
        "e4.left.masseter.pain": "yes",
        "e4.left.masseter.familiarPain": null, // incomplete
        "e4.right.temporalis.pain": "no", // complete
      };

      const result = validateInterviewCompletion(instances, (path) => values[path]);

      expect(result.valid).toBe(false);
      expect(result.incompleteRegions).toHaveLength(2);
      const leftTemporalis = result.incompleteRegions.find(
        (r) => r.region === "temporalis" && r.side === "left"
      );
      const leftMasseter = result.incompleteRegions.find(
        (r) => r.region === "masseter" && r.side === "left"
      );
      expect(leftTemporalis).toBeDefined();
      expect(leftMasseter).toBeDefined();
    });

    it("groups by region AND side correctly", () => {
      const instances = createInterviewInstances();
      const values: Record<string, string | null> = {
        "e4.left.temporalis.pain": "no", // left temporalis complete
        "e4.left.masseter.pain": "no", // left masseter complete
        "e4.right.temporalis.pain": null, // right temporalis incomplete
      };

      const result = validateInterviewCompletion(instances, (path) => values[path]);

      expect(result.valid).toBe(false);
      expect(result.incompleteRegions).toHaveLength(1);
      expect(result.incompleteRegions[0]).toMatchObject({
        region: "temporalis",
        side: "right",
        missingPain: true,
      });
    });

    it("returns correct incompleteRegions details", () => {
      const instances = createInterviewInstances();
      const values: Record<string, string | null> = {
        "e4.left.temporalis.pain": "yes",
        "e4.left.temporalis.familiarPain": null,
        "e4.left.temporalis.familiarHeadache": null,
        "e4.left.masseter.pain": "no",
        "e4.right.temporalis.pain": "no",
      };

      const result = validateInterviewCompletion(instances, (path) => values[path]);

      expect(result.valid).toBe(false);
      const incomplete = result.incompleteRegions[0] as IncompleteRegion;
      expect(incomplete.region).toBe("temporalis");
      expect(incomplete.side).toBe("left");
      expect(incomplete.missingPain).toBe(false);
      expect(incomplete.missingFamiliarPain).toBe(true);
      expect(incomplete.missingFamiliarHeadache).toBe(true);
    });

    it("skips instances without region/side context", () => {
      const instances: QuestionInstance[] = [
        // Instance with no context
        {
          path: "e4.painFreeOpening",
          renderType: "measurement",
          context: {},
          config: { required: true },
        },
        // Instance with only side, no region
        {
          path: "e4.left.something",
          renderType: "yesNo",
          context: { side: "left" },
          config: { required: true },
        },
        // Instance with only region, no side
        {
          path: "e4.temporalis.something",
          renderType: "yesNo",
          context: { region: "temporalis" },
          config: { required: true },
        },
      ];

      const result = validateInterviewCompletion(instances, () => null);

      // Should not create any incomplete regions since none have both region and side
      expect(result.valid).toBe(true);
      expect(result.incompleteRegions).toHaveLength(0);
    });
  });

  describe("isFieldEnabled", () => {
    it("returns true when no enableWhen condition", () => {
      const instance: QuestionInstance = {
        path: "e4.pain",
        renderType: "yesNo",
        context: {},
        config: {},
      };

      expect(isFieldEnabled(instance, () => null)).toBe(true);
    });

    it("returns true when sibling equals condition value", () => {
      const instance: QuestionInstance = {
        path: "e4.left.temporalis.familiarPain",
        renderType: "yesNo",
        context: {},
        config: {},
        enableWhen: { sibling: "pain", equals: "yes" },
      };

      const getValue = (path: string) => (path === "e4.left.temporalis.pain" ? "yes" : null);

      expect(isFieldEnabled(instance, getValue)).toBe(true);
    });

    it("returns false when sibling does not equal condition value", () => {
      const instance: QuestionInstance = {
        path: "e4.left.temporalis.familiarPain",
        renderType: "yesNo",
        context: {},
        config: {},
        enableWhen: { sibling: "pain", equals: "yes" },
      };

      const getValue = (path: string) => (path === "e4.left.temporalis.pain" ? "no" : null);

      expect(isFieldEnabled(instance, getValue)).toBe(false);
    });

    it("handles null/undefined sibling values", () => {
      const instance: QuestionInstance = {
        path: "e4.left.temporalis.familiarPain",
        renderType: "yesNo",
        context: {},
        config: {},
        enableWhen: { sibling: "pain", equals: "yes" },
      };

      expect(isFieldEnabled(instance, () => null)).toBe(false);
      expect(isFieldEnabled(instance, () => undefined)).toBe(false);
    });

    it("constructs correct sibling path from instance path", () => {
      const instance: QuestionInstance = {
        path: "e4.maxUnassisted.left.temporalis.familiarPain",
        renderType: "yesNo",
        context: {},
        config: {},
        enableWhen: { sibling: "pain", equals: "yes" },
      };

      const capturedPaths: string[] = [];
      const getValue = (path: string) => {
        capturedPaths.push(path);
        return "yes";
      };

      isFieldEnabled(instance, getValue);

      expect(capturedPaths).toContain("e4.maxUnassisted.left.temporalis.pain");
    });
  });

  describe("validateInstances", () => {
    it("skips disabled fields (enableWhen=false)", () => {
      const instances: QuestionInstance[] = [
        {
          path: "e4.pain",
          renderType: "yesNo",
          context: {},
          config: { required: true },
        },
        {
          path: "e4.familiarPain",
          renderType: "yesNo",
          context: {},
          config: { required: true },
          enableWhen: { sibling: "pain", equals: "yes" },
        },
      ];

      const values: Record<string, unknown> = {
        "e4.pain": "no",
        "e4.familiarPain": null, // Would be invalid if enabled
      };

      const result = validateInstances(instances, (path) => values[path]);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("validates required fields", () => {
      const instances: QuestionInstance[] = [
        {
          path: "e4.pain",
          renderType: "yesNo",
          context: {},
          config: { required: true },
        },
      ];

      const result = validateInstances(instances, () => null);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({ path: "e4.pain", message: "Dieses Feld ist erforderlich" });
    });

    it("allows empty non-required fields", () => {
      const instances: QuestionInstance[] = [
        {
          path: "e4.optionalField",
          renderType: "yesNo",
          context: {},
          config: { required: false },
        },
      ];

      const result = validateInstances(instances, () => null);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("validates measurement min constraint", () => {
      const instances: QuestionInstance[] = [
        {
          path: "e4.opening",
          renderType: "measurement",
          context: {},
          config: { min: 10, max: 60 },
        },
      ];

      const result = validateInstances(instances, () => 5);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({ path: "e4.opening", message: "Minimum: 10" });
    });

    it("validates measurement max constraint", () => {
      const instances: QuestionInstance[] = [
        {
          path: "e4.opening",
          renderType: "measurement",
          context: {},
          config: { min: 0, max: 60 },
        },
      ];

      const result = validateInstances(instances, () => 100);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({ path: "e4.opening", message: "Maximum: 60" });
    });

    it("allows measurements within range", () => {
      const instances: QuestionInstance[] = [
        {
          path: "e4.opening",
          renderType: "measurement",
          context: {},
          config: { min: 0, max: 60 },
        },
      ];

      const result = validateInstances(instances, () => 30);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("defaults min=0 and max=100 when not specified", () => {
      const instances: QuestionInstance[] = [
        {
          path: "e4.opening",
          renderType: "measurement",
          context: {},
          config: {},
        },
      ];

      // Test below default min (0)
      const belowMin = validateInstances(instances, () => -5);
      expect(belowMin.valid).toBe(false);
      expect(belowMin.errors[0].message).toBe("Minimum: 0");

      // Test above default max (100)
      const aboveMax = validateInstances(instances, () => 150);
      expect(aboveMax.valid).toBe(false);
      expect(aboveMax.errors[0].message).toBe("Maximum: 100");

      // Test within default range
      const withinRange = validateInstances(instances, () => 50);
      expect(withinRange.valid).toBe(true);
    });

    it("collects multiple errors across instances", () => {
      const instances: QuestionInstance[] = [
        {
          path: "e4.pain",
          renderType: "yesNo",
          context: {},
          config: { required: true },
        },
        {
          path: "e4.opening",
          renderType: "measurement",
          context: {},
          config: { required: true },
        },
        {
          path: "e4.lateralRight",
          renderType: "measurement",
          context: {},
          config: { min: 0, max: 20 },
        },
      ];

      const values: Record<string, unknown> = {
        "e4.pain": null,
        "e4.opening": "",
        "e4.lateralRight": 50,
      };

      const result = validateInstances(instances, (path) => values[path]);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.map((e) => e.path)).toEqual([
        "e4.pain",
        "e4.opening",
        "e4.lateralRight",
      ]);
    });
  });
});
