import { describe, it, expect } from "vitest";
import { evaluateDiagnosis, evaluateAllDiagnoses } from "../evaluate-diagnosis";
import { MYALGIA } from "../diagnoses/myalgia";
import { LOCAL_MYALGIA, MYOFASCIAL_PAIN_WITH_SPREADING, MYOFASCIAL_PAIN_WITH_REFERRAL } from "../diagnoses/myalgia-subtypes";
import { ALL_DIAGNOSES } from "../index";

// Minimal positive anamnesis data for myalgia
const positiveAnamnesis = {
  sq: {
    SQ1: "yes",
    SQ3: "intermittent",
    SQ4_A: "yes",
  },
};

// Positive examination data for left temporalis
const positiveExamLeftTemporalis = {
  e1: {
    painLocation: {
      left: ["temporalis"],
    },
  },
  e9: {
    left: {
      temporalisPosterior: { familiarPain: "yes" },
    },
  },
};

// Complete positive patient data
const positivePatient = {
  ...positiveAnamnesis,
  ...positiveExamLeftTemporalis,
};

describe("evaluateDiagnosis", () => {
  describe("myalgia", () => {
    it("positive when anamnesis and at least one location met", () => {
      const result = evaluateDiagnosis(MYALGIA, positivePatient);

      expect(result.diagnosisId).toBe("myalgia");
      expect(result.isPositive).toBe(true);
      expect(result.status).toBe("positive");
      expect(result.anamnesisMet).toBe(true);
      expect(result.anamnesisStatus).toBe("positive");
      expect(result.positiveLocations.length).toBeGreaterThan(0);
    });

    it("negative when anamnesis fails", () => {
      const data = {
        sq: {
          SQ1: "no", // No pain
          SQ3: "intermittent",
          SQ4_A: "yes",
        },
        ...positiveExamLeftTemporalis,
      };

      const result = evaluateDiagnosis(MYALGIA, data);

      expect(result.isPositive).toBe(false);
      expect(result.status).toBe("negative");
      expect(result.anamnesisMet).toBe(false);
    });

    it("negative when all locations negative despite positive anamnesis", () => {
      const data = {
        ...positiveAnamnesis,
        e1: {
          painLocation: {
            left: [], // No pain regions
            right: [],
          },
        },
      };

      const result = evaluateDiagnosis(MYALGIA, data);

      expect(result.isPositive).toBe(false);
      expect(result.anamnesisMet).toBe(true);
      // All locations should be negative (no matching pain region)
      expect(result.locationResults.every((l) => !l.isPositive)).toBe(true);
    });

    it("pending when data is missing", () => {
      const data = {}; // No data at all

      const result = evaluateDiagnosis(MYALGIA, data);

      expect(result.isPositive).toBe(false);
      expect(result.status).toBe("pending");
    });

    it("pending when anamnesis pending", () => {
      const data = {
        // Missing SQ answers
        ...positiveExamLeftTemporalis,
      };

      const result = evaluateDiagnosis(MYALGIA, data);

      expect(result.isPositive).toBe(false);
      expect(result.anamnesisStatus).toBe("pending");
    });

    it("evaluates correct number of locations (2 sides × 2 regions)", () => {
      const result = evaluateDiagnosis(MYALGIA, positivePatient);

      // Myalgia has regions: temporalis, masseter
      // Sides: left, right
      // Total: 2 × 2 = 4 locations
      expect(result.locationResults).toHaveLength(4);

      const locations = result.locationResults.map((l) => `${l.side}-${l.region}`);
      expect(locations).toContain("left-temporalis");
      expect(locations).toContain("left-masseter");
      expect(locations).toContain("right-temporalis");
      expect(locations).toContain("right-masseter");
    });

    it("identifies correct positive locations", () => {
      const result = evaluateDiagnosis(MYALGIA, positivePatient);

      // Only left temporalis should be positive
      expect(result.positiveLocations).toEqual([
        { side: "left", region: "temporalis" },
      ]);
    });

    it("bilateral positive when both sides have findings", () => {
      const data = {
        ...positiveAnamnesis,
        e1: {
          painLocation: {
            left: ["temporalis"],
            right: ["masseter"],
          },
        },
        e9: {
          left: {
            temporalisPosterior: { familiarPain: "yes" },
          },
          right: {
            masseterOrigin: { familiarPain: "yes" },
          },
        },
      };

      const result = evaluateDiagnosis(MYALGIA, data);

      expect(result.isPositive).toBe(true);
      expect(result.positiveLocations).toHaveLength(2);
      expect(result.positiveLocations).toContainEqual({ side: "left", region: "temporalis" });
      expect(result.positiveLocations).toContainEqual({ side: "right", region: "masseter" });
    });
  });

  describe("status derivation", () => {
    it("negative anamnesis → overall negative regardless of locations", () => {
      const data = {
        sq: { SQ1: "no" },
        ...positiveExamLeftTemporalis,
      };

      const result = evaluateDiagnosis(MYALGIA, data);
      expect(result.status).toBe("negative");
    });

    it("positive anamnesis + all locations negative → overall negative", () => {
      const data = {
        ...positiveAnamnesis,
        e1: { painLocation: { left: [], right: [] } },
        e9: {
          left: {
            temporalisPosterior: { familiarPain: "no" },
            temporalisMiddle: { familiarPain: "no" },
            temporalisAnterior: { familiarPain: "no" },
          },
          right: {
            temporalisPosterior: { familiarPain: "no" },
            temporalisMiddle: { familiarPain: "no" },
            temporalisAnterior: { familiarPain: "no" },
          },
        },
      };

      const result = evaluateDiagnosis(MYALGIA, data);
      expect(result.anamnesisMet).toBe(true);
      expect(result.status).toBe("negative");
    });

    it("pending anamnesis + all locations negative → overall negative", () => {
      const data = {
        // SQ answers missing → anamnesis pending
        e1: { painLocation: { left: [], right: [] } },
        e9: {
          left: {
            temporalisPosterior: { familiarPain: "no" },
            temporalisMiddle: { familiarPain: "no" },
            temporalisAnterior: { familiarPain: "no" },
          },
          right: {
            temporalisPosterior: { familiarPain: "no" },
            temporalisMiddle: { familiarPain: "no" },
            temporalisAnterior: { familiarPain: "no" },
          },
        },
      };

      const result = evaluateDiagnosis(MYALGIA, data);
      expect(result.status).toBe("negative");
    });
  });
});

describe("evaluateAllDiagnoses", () => {
  it("evaluates all 4 diagnosis definitions", () => {
    const results = evaluateAllDiagnoses(ALL_DIAGNOSES, positivePatient);

    expect(results).toHaveLength(4);
    expect(results.map((r) => r.diagnosisId)).toEqual([
      "myalgia",
      "localMyalgia",
      "myofascialPainWithSpreading",
      "myofascialPainWithReferral",
    ]);
  });

  it("returns myalgia positive when base criteria met", () => {
    const results = evaluateAllDiagnoses(ALL_DIAGNOSES, positivePatient);

    const myalgia = results.find((r) => r.diagnosisId === "myalgia");
    expect(myalgia?.isPositive).toBe(true);
  });

  it("works with empty data", () => {
    const results = evaluateAllDiagnoses(ALL_DIAGNOSES, {});

    expect(results).toHaveLength(4);
    results.forEach((result) => {
      expect(result.isPositive).toBe(false);
      expect(result.status).toBe("pending");
    });
  });

  it("accepts a subset of diagnoses", () => {
    const subset = [MYALGIA, LOCAL_MYALGIA];
    const results = evaluateAllDiagnoses(subset, positivePatient);

    expect(results).toHaveLength(2);
    expect(results[0].diagnosisId).toBe("myalgia");
    expect(results[1].diagnosisId).toBe("localMyalgia");
  });
});
