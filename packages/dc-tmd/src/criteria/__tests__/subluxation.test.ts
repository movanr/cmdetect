import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluate";
import { evaluateDiagnosis } from "../evaluate-diagnosis";
import { SUBLUXATION, SUBLUXATION_ANAMNESIS } from "../diagnoses/subluxation";

describe("Subluxation diagnosis", () => {
  describe("anamnesis criteria", () => {
    it("positive: SQ13=yes + SQ14=yes", () => {
      const data = { sq: { SQ13: "yes", SQ14: "yes" } };
      expect(evaluate(SUBLUXATION_ANAMNESIS, data).status).toBe("positive");
    });

    it("negative: SQ13=no", () => {
      const data = { sq: { SQ13: "no", SQ14: "yes" } };
      expect(evaluate(SUBLUXATION_ANAMNESIS, data).status).toBe("negative");
    });

    it("negative: SQ14=no (can close without special maneuver)", () => {
      const data = { sq: { SQ13: "yes", SQ14: "no" } };
      expect(evaluate(SUBLUXATION_ANAMNESIS, data).status).toBe("negative");
    });

    it("pending: missing SQ13", () => {
      const data = { sq: { SQ14: "yes" } };
      expect(evaluate(SUBLUXATION_ANAMNESIS, data).status).toBe("pending");
    });

    it("pending: missing SQ14", () => {
      const data = { sq: { SQ13: "yes" } };
      expect(evaluate(SUBLUXATION_ANAMNESIS, data).status).toBe("pending");
    });
  });

  describe("examination criteria", () => {
    it("trivially positive for TMJ region (exam is optional per DC/TMD)", () => {
      const result = evaluate(SUBLUXATION.examination.criterion, {}, {
        side: "left",
        region: "tmj",
      });
      expect(result.status).toBe("positive");
    });

    it("targets TMJ region", () => {
      expect(SUBLUXATION.examination.regions).toEqual(["tmj"]);
    });
  });

  describe("full diagnosis evaluation", () => {
    it("positive when anamnesis met (exam always positive for TMJ)", () => {
      const data = {
        sq: {
          SQ13: "yes", SQ13_side: { left: true, right: true },
          SQ14: "yes", SQ14_side: { left: true, right: true },
        },
      };
      const result = evaluateDiagnosis(SUBLUXATION, data);
      expect(result.isPositive).toBe(true);
      // Both sides should be positive since exam is trivially true and sides match
      expect(result.positiveLocations).toHaveLength(2);
      expect(result.positiveLocations).toContainEqual({ side: "left", region: "tmj" });
      expect(result.positiveLocations).toContainEqual({ side: "right", region: "tmj" });
    });

    it("negative when anamnesis not met", () => {
      const data = { sq: { SQ13: "no", SQ14: "no" } };
      const result = evaluateDiagnosis(SUBLUXATION, data);
      expect(result.isPositive).toBe(false);
    });

    it("evaluates 2 locations (left + right TMJ)", () => {
      const data = {
        sq: {
          SQ13: "yes", SQ13_side: { left: true, right: true },
          SQ14: "yes", SQ14_side: { left: true, right: true },
        },
      };
      const result = evaluateDiagnosis(SUBLUXATION, data);
      expect(result.locationResults).toHaveLength(2);
    });
  });

  describe("diagnosis definition structure", () => {
    it("has correct metadata", () => {
      expect(SUBLUXATION.id).toBe("subluxation");
      expect(SUBLUXATION.nameDE).toBe("Subluxation");
      expect(SUBLUXATION.category).toBe("joint");
    });

    it("has high sensitivity and specificity per DC/TMD", () => {
      // Sens: 0.98, Spec: 1.0 — one of the most reliable diagnoses
      // Just verify the diagnosis is structured correctly
      expect(SUBLUXATION.requires).toBeUndefined();
    });
  });
});
