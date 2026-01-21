import { describe, it, expect } from "vitest";
import {
  SIDES,
  MOVEMENT_REGIONS,
  SVG_REGIONS,
  PALPATION_SITES,
  MUSCLE_GROUPS,
  SITE_CONFIG,
  getMovementPainQuestions,
  getPalpationPainQuestions,
  type PalpationSite,
} from "./regions";

describe("regions", () => {
  describe("constants", () => {
    it("SIDES contains left and right", () => {
      expect(SIDES).toContain("left");
      expect(SIDES).toContain("right");
      expect(SIDES).toHaveLength(2);
    });

    it("MOVEMENT_REGIONS contains all 5 regions", () => {
      expect(MOVEMENT_REGIONS).toContain("temporalis");
      expect(MOVEMENT_REGIONS).toContain("masseter");
      expect(MOVEMENT_REGIONS).toContain("tmj");
      expect(MOVEMENT_REGIONS).toContain("otherMast");
      expect(MOVEMENT_REGIONS).toContain("nonMast");
      expect(MOVEMENT_REGIONS).toHaveLength(5);
    });

    it("SVG_REGIONS excludes otherMast (not anatomically renderable)", () => {
      expect(SVG_REGIONS).toContain("temporalis");
      expect(SVG_REGIONS).toContain("masseter");
      expect(SVG_REGIONS).toContain("tmj");
      expect(SVG_REGIONS).toContain("nonMast");
      expect(SVG_REGIONS).not.toContain("otherMast");
      expect(SVG_REGIONS).toHaveLength(4);
    });

    it("PALPATION_SITES contains all 8 sites", () => {
      expect(PALPATION_SITES).toHaveLength(8);
      expect(PALPATION_SITES).toContain("temporalisPosterior");
      expect(PALPATION_SITES).toContain("temporalisMiddle");
      expect(PALPATION_SITES).toContain("temporalisAnterior");
      expect(PALPATION_SITES).toContain("masseterOrigin");
      expect(PALPATION_SITES).toContain("masseterBody");
      expect(PALPATION_SITES).toContain("masseterInsertion");
      expect(PALPATION_SITES).toContain("tmjLateralPole");
      expect(PALPATION_SITES).toContain("tmjAroundLateralPole");
    });

    it("MUSCLE_GROUPS contains temporalis, masseter, tmj", () => {
      expect(MUSCLE_GROUPS).toContain("temporalis");
      expect(MUSCLE_GROUPS).toContain("masseter");
      expect(MUSCLE_GROUPS).toContain("tmj");
      expect(MUSCLE_GROUPS).toHaveLength(3);
    });
  });

  describe("getMovementPainQuestions", () => {
    it("returns pain, familiarPain, familiarHeadache for temporalis", () => {
      const questions = getMovementPainQuestions("temporalis");

      expect(questions).toContain("pain");
      expect(questions).toContain("familiarPain");
      expect(questions).toContain("familiarHeadache");
      expect(questions).toHaveLength(3);
    });

    it("returns pain, familiarPain only for masseter", () => {
      const questions = getMovementPainQuestions("masseter");

      expect(questions).toContain("pain");
      expect(questions).toContain("familiarPain");
      expect(questions).not.toContain("familiarHeadache");
      expect(questions).toHaveLength(2);
    });

    it("returns pain, familiarPain only for tmj", () => {
      const questions = getMovementPainQuestions("tmj");

      expect(questions).toContain("pain");
      expect(questions).toContain("familiarPain");
      expect(questions).not.toContain("familiarHeadache");
      expect(questions).toHaveLength(2);
    });

    it("returns pain, familiarPain only for otherMast", () => {
      const questions = getMovementPainQuestions("otherMast");

      expect(questions).toContain("pain");
      expect(questions).toContain("familiarPain");
      expect(questions).not.toContain("familiarHeadache");
      expect(questions).toHaveLength(2);
    });

    it("returns pain, familiarPain only for nonMast", () => {
      const questions = getMovementPainQuestions("nonMast");

      expect(questions).toContain("pain");
      expect(questions).toContain("familiarPain");
      expect(questions).not.toContain("familiarHeadache");
      expect(questions).toHaveLength(2);
    });
  });

  describe("getPalpationPainQuestions", () => {
    it("temporalis sites include familiarHeadache and spreadingPain", () => {
      const temporalisSites: PalpationSite[] = [
        "temporalisPosterior",
        "temporalisMiddle",
        "temporalisAnterior",
      ];

      for (const site of temporalisSites) {
        const questions = getPalpationPainQuestions(site);

        expect(questions).toContain("pain");
        expect(questions).toContain("familiarPain");
        expect(questions).toContain("familiarHeadache");
        expect(questions).toContain("spreadingPain");
        expect(questions).toContain("referredPain");
        expect(questions).toHaveLength(5);
      }
    });

    it("masseter sites include spreadingPain but not familiarHeadache", () => {
      const masseterSites: PalpationSite[] = [
        "masseterOrigin",
        "masseterBody",
        "masseterInsertion",
      ];

      for (const site of masseterSites) {
        const questions = getPalpationPainQuestions(site);

        expect(questions).toContain("pain");
        expect(questions).toContain("familiarPain");
        expect(questions).not.toContain("familiarHeadache");
        expect(questions).toContain("spreadingPain");
        expect(questions).toContain("referredPain");
        expect(questions).toHaveLength(4);
      }
    });

    it("tmj sites have only pain, familiarPain, referredPain", () => {
      const tmjSites: PalpationSite[] = ["tmjLateralPole", "tmjAroundLateralPole"];

      for (const site of tmjSites) {
        const questions = getPalpationPainQuestions(site);

        expect(questions).toContain("pain");
        expect(questions).toContain("familiarPain");
        expect(questions).not.toContain("familiarHeadache");
        expect(questions).not.toContain("spreadingPain");
        expect(questions).toContain("referredPain");
        expect(questions).toHaveLength(3);
      }
    });

    it("returns questions in correct order", () => {
      // Temporalis should have: pain, familiarPain, familiarHeadache, spreadingPain, referredPain
      const temporalisQuestions = getPalpationPainQuestions("temporalisPosterior");
      expect(temporalisQuestions).toEqual([
        "pain",
        "familiarPain",
        "familiarHeadache",
        "spreadingPain",
        "referredPain",
      ]);

      // Masseter should have: pain, familiarPain, spreadingPain, referredPain
      const masseterQuestions = getPalpationPainQuestions("masseterBody");
      expect(masseterQuestions).toEqual(["pain", "familiarPain", "spreadingPain", "referredPain"]);

      // TMJ should have: pain, familiarPain, referredPain
      const tmjQuestions = getPalpationPainQuestions("tmjLateralPole");
      expect(tmjQuestions).toEqual(["pain", "familiarPain", "referredPain"]);
    });
  });

  describe("SITE_CONFIG", () => {
    it("temporalis sites have hasHeadache=true", () => {
      expect(SITE_CONFIG.temporalisPosterior.hasHeadache).toBe(true);
      expect(SITE_CONFIG.temporalisMiddle.hasHeadache).toBe(true);
      expect(SITE_CONFIG.temporalisAnterior.hasHeadache).toBe(true);
    });

    it("masseter sites have hasHeadache=false, hasSpreading=true", () => {
      expect(SITE_CONFIG.masseterOrigin.hasHeadache).toBe(false);
      expect(SITE_CONFIG.masseterOrigin.hasSpreading).toBe(true);

      expect(SITE_CONFIG.masseterBody.hasHeadache).toBe(false);
      expect(SITE_CONFIG.masseterBody.hasSpreading).toBe(true);

      expect(SITE_CONFIG.masseterInsertion.hasHeadache).toBe(false);
      expect(SITE_CONFIG.masseterInsertion.hasSpreading).toBe(true);
    });

    it("tmj lateral pole has pressure=0.5 (others 1.0)", () => {
      expect(SITE_CONFIG.tmjLateralPole.pressure).toBe(0.5);
      expect(SITE_CONFIG.tmjAroundLateralPole.pressure).toBe(1.0);
    });

    it("all temporalis sites have pressure=1.0", () => {
      expect(SITE_CONFIG.temporalisPosterior.pressure).toBe(1.0);
      expect(SITE_CONFIG.temporalisMiddle.pressure).toBe(1.0);
      expect(SITE_CONFIG.temporalisAnterior.pressure).toBe(1.0);
    });

    it("temporalis sites have hasSpreading=true", () => {
      expect(SITE_CONFIG.temporalisPosterior.hasSpreading).toBe(true);
      expect(SITE_CONFIG.temporalisMiddle.hasSpreading).toBe(true);
      expect(SITE_CONFIG.temporalisAnterior.hasSpreading).toBe(true);
    });

    it("tmj sites have hasSpreading=false", () => {
      expect(SITE_CONFIG.tmjLateralPole.hasSpreading).toBe(false);
      expect(SITE_CONFIG.tmjAroundLateralPole.hasSpreading).toBe(false);
    });

    it("all sites have correct muscleGroup assignment", () => {
      // Temporalis group
      expect(SITE_CONFIG.temporalisPosterior.muscleGroup).toBe("temporalis");
      expect(SITE_CONFIG.temporalisMiddle.muscleGroup).toBe("temporalis");
      expect(SITE_CONFIG.temporalisAnterior.muscleGroup).toBe("temporalis");

      // Masseter group
      expect(SITE_CONFIG.masseterOrigin.muscleGroup).toBe("masseter");
      expect(SITE_CONFIG.masseterBody.muscleGroup).toBe("masseter");
      expect(SITE_CONFIG.masseterInsertion.muscleGroup).toBe("masseter");

      // TMJ group
      expect(SITE_CONFIG.tmjLateralPole.muscleGroup).toBe("tmj");
      expect(SITE_CONFIG.tmjAroundLateralPole.muscleGroup).toBe("tmj");
    });

    it("all palpation sites have config entries", () => {
      for (const site of PALPATION_SITES) {
        expect(SITE_CONFIG[site]).toBeDefined();
        expect(SITE_CONFIG[site].muscleGroup).toBeDefined();
        expect(typeof SITE_CONFIG[site].pressure).toBe("number");
        expect(typeof SITE_CONFIG[site].hasHeadache).toBe("boolean");
        expect(typeof SITE_CONFIG[site].hasSpreading).toBe("boolean");
      }
    });
  });
});
