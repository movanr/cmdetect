import { describe, expect, it } from "vitest";
import {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_KEYS,
  PAIN_TYPES,
  PAIN_TYPE_KEYS,
  PALPATION_SITES,
  PALPATION_SITE_KEYS,
  REGIONS,
  REGION_KEYS,
  SIDES,
  SIDE_KEYS,
  SITE_CONFIG,
  SVG_REGIONS,
  getMovementPainQuestions,
  getPalpationPainQuestions,
  type PalpationSite,
} from "./regions";

describe("regions", () => {
  describe("SIDES", () => {
    it("contains left and right with German labels", () => {
      expect(SIDES.left).toBe("Links");
      expect(SIDES.right).toBe("Rechts");
      expect(SIDE_KEYS).toHaveLength(2);
      expect(SIDE_KEYS).toContain("left");
      expect(SIDE_KEYS).toContain("right");
    });
  });

  describe("REGIONS", () => {
    it("contains all 5 regions with German labels", () => {
      expect(REGIONS.temporalis).toBe("Temporalis");
      expect(REGIONS.masseter).toBe("Masseter");
      expect(REGIONS.tmj).toBe("Kiefergelenk");
      expect(REGIONS.otherMast).toBe("Andere Kaumusk.");
      expect(REGIONS.nonMast).toBe("Nicht-Kaumusk.");
      expect(REGION_KEYS).toHaveLength(5);
    });

    it("REGION_KEYS contains all region keys", () => {
      expect(REGION_KEYS).toContain("temporalis");
      expect(REGION_KEYS).toContain("masseter");
      expect(REGION_KEYS).toContain("tmj");
      expect(REGION_KEYS).toContain("otherMast");
      expect(REGION_KEYS).toContain("nonMast");
    });
  });

  describe("SVG_REGIONS", () => {
    it("excludes otherMast (not anatomically renderable)", () => {
      expect(SVG_REGIONS).toContain("temporalis");
      expect(SVG_REGIONS).toContain("masseter");
      expect(SVG_REGIONS).toContain("tmj");
      expect(SVG_REGIONS).toContain("nonMast");
      expect(SVG_REGIONS).not.toContain("otherMast");
      expect(SVG_REGIONS).toHaveLength(4);
    });
  });

  describe("PALPATION_SITES", () => {
    it("contains all 8 sites with German labels", () => {
      expect(PALPATION_SITES.temporalisPosterior).toBe("Temporalis (posterior)");
      expect(PALPATION_SITES.temporalisMiddle).toBe("Temporalis (mitte)");
      expect(PALPATION_SITES.temporalisAnterior).toBe("Temporalis (anterior)");
      expect(PALPATION_SITES.masseterOrigin).toBe("Masseter (Ursprung)");
      expect(PALPATION_SITES.masseterBody).toBe("Masseter (Körper)");
      expect(PALPATION_SITES.masseterInsertion).toBe("Masseter (Ansatz)");
      expect(PALPATION_SITES.tmjLateralPole).toBe("Kiefergelenk (lateraler Pol)");
      expect(PALPATION_SITES.tmjAroundLateralPole).toBe("Kiefergelenk (um lateralen Pol)");
      expect(PALPATION_SITE_KEYS).toHaveLength(8);
    });
  });

  describe("MUSCLE_GROUPS", () => {
    it("contains temporalis, masseter, tmj with German labels", () => {
      expect(MUSCLE_GROUPS.temporalis).toBe("Temporalis");
      expect(MUSCLE_GROUPS.masseter).toBe("Masseter");
      expect(MUSCLE_GROUPS.tmj).toBe("Kiefergelenk (Kiefergelenk)");
      expect(MUSCLE_GROUP_KEYS).toHaveLength(3);
    });
  });

  describe("PAIN_TYPES", () => {
    it("contains all pain types with German labels", () => {
      expect(PAIN_TYPES.pain).toBe("Schmerz");
      expect(PAIN_TYPES.familiarPain).toBe("Bekannter Schmerz");
      expect(PAIN_TYPES.familiarHeadache).toBe("Bekannter Kopfschmerz");
      expect(PAIN_TYPES.referredPain).toBe("Übertragener Schmerz");
      expect(PAIN_TYPES.spreadingPain).toBe("Ausbreitender Schmerz");
      expect(PAIN_TYPE_KEYS).toHaveLength(5);
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

      // tmj should have: pain, familiarPain, referredPain
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

      // tmj group
      expect(SITE_CONFIG.tmjLateralPole.muscleGroup).toBe("tmj");
      expect(SITE_CONFIG.tmjAroundLateralPole.muscleGroup).toBe("tmj");
    });

    it("all palpation sites have config entries", () => {
      for (const site of PALPATION_SITE_KEYS) {
        expect(SITE_CONFIG[site]).toBeDefined();
        expect(SITE_CONFIG[site].muscleGroup).toBeDefined();
        expect(typeof SITE_CONFIG[site].pressure).toBe("number");
        expect(typeof SITE_CONFIG[site].hasHeadache).toBe("boolean");
        expect(typeof SITE_CONFIG[site].hasSpreading).toBe("boolean");
      }
    });
  });
});
