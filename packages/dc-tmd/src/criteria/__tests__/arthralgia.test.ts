import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluate";
import { evaluateDiagnosis } from "../evaluate-diagnosis";
import { ARTHRALGIA, ARTHRALGIA_ANAMNESIS, ARTHRALGIA_EXAMINATION } from "../diagnoses/arthralgia";

describe("Arthralgia diagnosis", () => {
  describe("anamnesis criteria", () => {
    it("positive: same criteria as myalgia (pain in masticatory structure + modified)", () => {
      const data = {
        sq: { SQ1: "yes", SQ3: "intermittent", SQ4_A: "yes" },
      };
      expect(evaluate(ARTHRALGIA_ANAMNESIS, data).status).toBe("positive");
    });

    it("negative: no pain in masticatory structure", () => {
      const data = {
        sq: { SQ1: "no", SQ3: "intermittent", SQ4_A: "yes" },
      };
      expect(evaluate(ARTHRALGIA_ANAMNESIS, data).status).toBe("negative");
    });

    it("pending: missing SQ data", () => {
      expect(evaluate(ARTHRALGIA_ANAMNESIS, {}).status).toBe("pending");
    });
  });

  describe("examination criteria", () => {
    it("positive: TMJ pain location confirmed + familiar pain on palpation", () => {
      const data = {
        e1: { painLocation: { left: ["tmj"] } },
        e9: { left: { tmjLateralPole: { familiarPain: "yes" } } },
      };
      const result = evaluate(ARTHRALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "tmj",
      });
      expect(result.status).toBe("positive");
    });

    it("positive: TMJ pain location confirmed + familiar pain on opening (E4)", () => {
      const data = {
        e1: { painLocation: { right: ["tmj"] } },
        e4: { maxUnassisted: { right: { tmj: { familiarPain: "yes" } } } },
      };
      const result = evaluate(ARTHRALGIA_EXAMINATION.criterion, data, {
        side: "right",
        region: "tmj",
      });
      expect(result.status).toBe("positive");
    });

    it("positive: TMJ pain location confirmed + familiar pain on movement (E5)", () => {
      const data = {
        e1: { painLocation: { left: ["tmj"] } },
        e5: { lateralRight: { left: { tmj: { familiarPain: "yes" } } } },
      };
      const result = evaluate(ARTHRALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "tmj",
      });
      expect(result.status).toBe("positive");
    });

    it("negative: pain location does not include tmj", () => {
      const data = {
        e1: { painLocation: { left: ["temporalis"] } },
        e9: { left: { tmjLateralPole: { familiarPain: "yes" } } },
      };
      const result = evaluate(ARTHRALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "tmj",
      });
      expect(result.status).toBe("negative");
    });

    it("only targets TMJ region", () => {
      expect(ARTHRALGIA_EXAMINATION.regions).toEqual(["tmj"]);
    });
  });

  describe("full diagnosis evaluation", () => {
    it("positive when anamnesis + examination both met", () => {
      const data = {
        sq: { SQ1: "yes", SQ3: "continuous", SQ4_B: "yes" },
        e1: { painLocation: { right: ["tmj"] } },
        e9: { right: { tmjAroundLateralPole: { familiarPain: "yes" } } },
      };
      const result = evaluateDiagnosis(ARTHRALGIA, data);
      expect(result.isPositive).toBe(true);
      expect(result.positiveLocations).toContainEqual({ side: "right", region: "tmj" });
    });

    it("evaluates 2 locations (left + right TMJ)", () => {
      const data = {
        sq: { SQ1: "yes", SQ3: "intermittent", SQ4_A: "yes" },
        e1: { painLocation: { left: ["tmj"], right: ["tmj"] } },
        e9: {
          left: { tmjLateralPole: { familiarPain: "yes" } },
          right: { tmjLateralPole: { familiarPain: "yes" } },
        },
      };
      const result = evaluateDiagnosis(ARTHRALGIA, data);
      expect(result.locationResults).toHaveLength(2);
      expect(result.positiveLocations).toHaveLength(2);
    });
  });

  describe("diagnosis definition structure", () => {
    it("has correct metadata", () => {
      expect(ARTHRALGIA.id).toBe("arthralgia");
      expect(ARTHRALGIA.nameDE).toBe("Arthralgie");
      expect(ARTHRALGIA.category).toBe("pain");
    });
  });
});
