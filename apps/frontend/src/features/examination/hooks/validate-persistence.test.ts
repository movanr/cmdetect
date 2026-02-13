import { describe, it, expect, vi } from "vitest";
import {
  parseExaminationData,
  migrateAndParseExaminationData,
  parseCompletedSections,
  getExaminationDefaults,
  CURRENT_MODEL_VERSION,
} from "./validate-persistence";
import { examinationDefaults } from "../form/use-examination-form";
import type { SectionId } from "../sections/registry";

// Suppress console.warn in tests (parseExaminationData logs on failure)
vi.spyOn(console, "warn").mockImplementation(() => {});

describe("validate-persistence", () => {
  describe("parseExaminationData", () => {
    it("accepts valid examination defaults", () => {
      const result = parseExaminationData(examinationDefaults);
      expect(result).not.toBeNull();
      expect(result).toEqual(examinationDefaults);
    });

    it("accepts defaults with modified field values", () => {
      // Clone defaults and modify a known field
      const modified = structuredClone(examinationDefaults) as Record<string, unknown>;
      const e1 = modified.e1 as Record<string, unknown>;
      const painLocation = e1.painLocation as Record<string, unknown>;
      // e1.painLocation.none is a boolean — flip it
      painLocation.none = true;

      const result = parseExaminationData(modified);
      expect(result).not.toBeNull();
    });

    it("returns null for null input", () => {
      expect(parseExaminationData(null)).toBeNull();
    });

    it("returns null for undefined input", () => {
      expect(parseExaminationData(undefined)).toBeNull();
    });

    it("returns null for empty object", () => {
      // Empty object is missing all required section keys
      expect(parseExaminationData({})).toBeNull();
    });

    it("returns null for a string", () => {
      expect(parseExaminationData("not an object")).toBeNull();
    });

    it("returns null for an array", () => {
      expect(parseExaminationData([1, 2, 3])).toBeNull();
    });

    it("returns null when a required section is missing", () => {
      const partial = structuredClone(examinationDefaults) as Record<string, unknown>;
      delete partial.e1;

      expect(parseExaminationData(partial)).toBeNull();
    });

    it("returns null when a nested field has the wrong type", () => {
      const corrupted = structuredClone(examinationDefaults) as Record<string, unknown>;
      // Replace e1 with a string instead of an object
      corrupted.e1 = "should be an object";

      expect(parseExaminationData(corrupted)).toBeNull();
    });

    it("strips extra top-level keys (zod default behavior)", () => {
      const withExtra = {
        ...structuredClone(examinationDefaults) as Record<string, unknown>,
        unknownSection: { foo: "bar" },
      };

      const result = parseExaminationData(withExtra);
      // Should pass validation (extra keys stripped by zod)
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty("unknownSection");
    });
  });

  describe("parseCompletedSections", () => {
    it("accepts valid section IDs", () => {
      const input: SectionId[] = ["e1", "e2", "e3"];
      expect(parseCompletedSections(input)).toEqual(["e1", "e2", "e3"]);
    });

    it("accepts empty array", () => {
      expect(parseCompletedSections([])).toEqual([]);
    });

    it("accepts all known section IDs", () => {
      const all: SectionId[] = ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "e10"];
      expect(parseCompletedSections(all)).toEqual(all);
    });

    it("filters out invalid section IDs", () => {
      const mixed = ["e1", "e99", "e3", "bogus"];
      const result = parseCompletedSections(mixed);
      expect(result).toEqual(["e1", "e3"]);
    });

    it("returns empty array for non-array input", () => {
      expect(parseCompletedSections(null)).toEqual([]);
      expect(parseCompletedSections(undefined)).toEqual([]);
      expect(parseCompletedSections("e1")).toEqual([]);
      expect(parseCompletedSections(42)).toEqual([]);
      expect(parseCompletedSections({})).toEqual([]);
    });

    it("filters out non-string entries", () => {
      const mixed = ["e1", 42, null, "e2", true];
      const result = parseCompletedSections(mixed);
      expect(result).toEqual(["e1", "e2"]);
    });
  });

  describe("getExaminationDefaults", () => {
    it("returns the model defaults", () => {
      const defaults = getExaminationDefaults();
      expect(defaults).toEqual(examinationDefaults);
    });

    it("returns data that passes parseExaminationData", () => {
      const defaults = getExaminationDefaults();
      expect(parseExaminationData(defaults)).not.toBeNull();
    });
  });

  describe("migrateAndParseExaminationData", () => {
    it("accepts valid data with embedded _modelVersion", () => {
      const data = { _modelVersion: CURRENT_MODEL_VERSION, ...(structuredClone(examinationDefaults) as Record<string, unknown>) };
      const result = migrateAndParseExaminationData(data);
      expect(result).not.toBeNull();
      expect(result).toEqual(examinationDefaults); // _modelVersion stripped by zod
    });

    it("accepts valid data without _modelVersion (treated as v1)", () => {
      const result = migrateAndParseExaminationData(
        structuredClone(examinationDefaults)
      );
      expect(result).not.toBeNull();
      expect(result).toEqual(examinationDefaults);
    });

    it("returns null for invalid data regardless of version", () => {
      expect(migrateAndParseExaminationData({})).toBeNull();
      expect(migrateAndParseExaminationData({ _modelVersion: CURRENT_MODEL_VERSION })).toBeNull();
      expect(migrateAndParseExaminationData({ _modelVersion: 999 })).toBeNull();
    });

    it("returns null for null input", () => {
      expect(migrateAndParseExaminationData(null)).toBeNull();
    });

    it("returns null for undefined input", () => {
      expect(migrateAndParseExaminationData(undefined)).toBeNull();
    });

    it("returns null for non-object input", () => {
      expect(migrateAndParseExaminationData("string")).toBeNull();
      expect(migrateAndParseExaminationData(42)).toBeNull();
    });

    it("returns null for array input", () => {
      expect(migrateAndParseExaminationData([1, 2])).toBeNull();
    });

    it("re-exports CURRENT_MODEL_VERSION", () => {
      expect(typeof CURRENT_MODEL_VERSION).toBe("number");
      expect(CURRENT_MODEL_VERSION).toBeGreaterThanOrEqual(1);
    });

    it("migrates v1 data (no e10) to current version", () => {
      // Simulate old data: has e1-e9 but NO e10 and NO _modelVersion
      const oldData = structuredClone(examinationDefaults) as Record<string, unknown>;
      delete oldData.e10;

      const result = migrateAndParseExaminationData(oldData);
      expect(result).not.toBeNull();
      // E10 should be added by migration with default values
      expect(result).toHaveProperty("e10");
    });

    it("migrates v1 data with _modelVersion:1 (no e10) to current version", () => {
      const oldData = structuredClone(examinationDefaults) as Record<string, unknown>;
      delete oldData.e10;
      oldData._modelVersion = 1;

      const result = migrateAndParseExaminationData(oldData);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("e10");
    });

    it("recovers old data with structural gaps via deep-merge", () => {
      // Simulate old data that has sections but is missing some nested fields
      const oldData = structuredClone(examinationDefaults) as Record<string, unknown>;
      delete oldData.e10;

      // Remove a nested field to simulate structural gap
      const e9 = oldData.e9 as Record<string, unknown>;
      const e9Left = e9.left as Record<string, unknown>;
      delete e9Left.siteDetailMode;

      const result = migrateAndParseExaminationData(oldData);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("e9");
      expect(result).toHaveProperty("e10");
    });

    it("preserves actual values during deep-merge recovery", () => {
      // Old data with real palpation values that should be preserved
      const oldData = structuredClone(examinationDefaults) as Record<string, unknown>;
      delete oldData.e10;

      // Set actual palpation answers in e9
      const e9 = oldData.e9 as Record<string, unknown>;
      const e9Right = e9.right as Record<string, unknown>;
      const temporalisPosterior = e9Right.temporalisPosterior as Record<string, unknown>;
      temporalisPosterior.pain = "yes";
      temporalisPosterior.familiarPain = "yes";

      // Remove a nested field to force deep-merge path
      const e9Left = e9.left as Record<string, unknown>;
      delete e9Left.siteDetailMode;

      const result = migrateAndParseExaminationData(oldData);
      expect(result).not.toBeNull();

      // Actual values should be preserved
      const resultE9 = (result as Record<string, unknown>).e9 as Record<string, unknown>;
      const resultRight = resultE9.right as Record<string, unknown>;
      const resultPost = resultRight.temporalisPosterior as Record<string, unknown>;
      expect(resultPost.pain).toBe("yes");
      expect(resultPost.familiarPain).toBe("yes");
    });
  });
});
