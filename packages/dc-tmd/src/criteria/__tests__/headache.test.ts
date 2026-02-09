import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluate";
import { evaluateDiagnosis, evaluateAllDiagnoses } from "../evaluate-diagnosis";
import {
  HEADACHE_ATTRIBUTED_TO_TMD,
  HEADACHE_ANAMNESIS,
  HEADACHE_EXAMINATION,
} from "../diagnoses/headache";
import { MYALGIA } from "../diagnoses/myalgia";
import { ARTHRALGIA } from "../diagnoses/arthralgia";

describe("Headache Attributed to TMD diagnosis", () => {
  describe("anamnesis criteria", () => {
    it("positive: headache in temporal region + modified by function", () => {
      const data = {
        sq: { SQ5: "yes", SQ7_A: "yes" },
      };
      expect(evaluate(HEADACHE_ANAMNESIS, data).status).toBe("positive");
    });

    it("positive: multiple SQ7 items positive", () => {
      const data = {
        sq: { SQ5: "yes", SQ7_B: "yes", SQ7_D: "yes" },
      };
      expect(evaluate(HEADACHE_ANAMNESIS, data).status).toBe("positive");
    });

    it("negative: no headache in temporal region", () => {
      const data = {
        sq: { SQ5: "no", SQ7_A: "yes" },
      };
      expect(evaluate(HEADACHE_ANAMNESIS, data).status).toBe("negative");
    });

    it("negative: headache not modified by function", () => {
      const data = {
        sq: { SQ5: "yes", SQ7_A: "no", SQ7_B: "no", SQ7_C: "no", SQ7_D: "no" },
      };
      expect(evaluate(HEADACHE_ANAMNESIS, data).status).toBe("negative");
    });

    it("pending: missing SQ7 answers", () => {
      const data = {
        sq: { SQ5: "yes" },
      };
      expect(evaluate(HEADACHE_ANAMNESIS, data).status).toBe("pending");
    });
  });

  describe("examination criteria", () => {
    it("positive: headache location confirmed + familiar headache on palpation", () => {
      const data = {
        e1: { headacheLocation: { left: ["temporalis"] } },
        e9: { left: { temporalisAnterior: { familiarHeadache: "yes" } } },
      };
      const result = evaluate(HEADACHE_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("positive");
    });

    it("positive: headache location confirmed + familiar headache on opening (E4)", () => {
      const data = {
        e1: { headacheLocation: { right: ["temporalis"] } },
        e4: { maxAssisted: { right: { temporalis: { familiarHeadache: "yes" } } } },
      };
      const result = evaluate(HEADACHE_EXAMINATION.criterion, data, {
        side: "right",
        region: "temporalis",
      });
      expect(result.status).toBe("positive");
    });

    it("positive: headache location confirmed + familiar headache on movement (E5)", () => {
      const data = {
        e1: { headacheLocation: { left: ["temporalis"] } },
        e5: { protrusive: { left: { temporalis: { familiarHeadache: "yes" } } } },
      };
      const result = evaluate(HEADACHE_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("positive");
    });

    it("negative: headache location doesn't include temporalis", () => {
      const data = {
        e1: { headacheLocation: { left: ["other"] } },
        e9: { left: { temporalisPosterior: { familiarHeadache: "yes" } } },
      };
      const result = evaluate(HEADACHE_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("negative");
    });

    it("only targets temporalis region", () => {
      expect(HEADACHE_EXAMINATION.regions).toEqual(["temporalis"]);
    });
  });

  describe("cross-diagnosis requires", () => {
    const headachePositiveData = {
      sq: { SQ5: "yes", SQ7_A: "yes" },
      e1: { headacheLocation: { left: ["temporalis"] } },
      e9: { left: { temporalisPosterior: { familiarHeadache: "yes" } } },
    };

    it("headache negative when evaluated alone (requires myalgia or arthralgia)", () => {
      const results = evaluateAllDiagnoses([HEADACHE_ATTRIBUTED_TO_TMD], headachePositiveData);
      expect(results[0].isPositive).toBe(false);
      expect(results[0].status).toBe("negative");
    });

    it("headache positive when myalgia is also positive", () => {
      const data = {
        ...headachePositiveData,
        sq: {
          ...headachePositiveData.sq,
          SQ1: "yes",
          SQ3: "intermittent",
          SQ4_A: "yes",
        },
        e1: {
          ...headachePositiveData.e1,
          painLocation: { left: ["temporalis"] },
        },
        e9: {
          left: {
            temporalisPosterior: { familiarPain: "yes", familiarHeadache: "yes" },
          },
        },
      };
      const results = evaluateAllDiagnoses(
        [MYALGIA, HEADACHE_ATTRIBUTED_TO_TMD],
        data
      );
      expect(results.find((r) => r.diagnosisId === "myalgia")?.isPositive).toBe(true);
      expect(results.find((r) => r.diagnosisId === "headacheAttributedToTmd")?.isPositive).toBe(true);
    });

    it("headache positive when arthralgia is also positive", () => {
      const data = {
        ...headachePositiveData,
        sq: {
          ...headachePositiveData.sq,
          SQ1: "yes",
          SQ3: "continuous",
          SQ4_B: "yes",
        },
        e1: {
          ...headachePositiveData.e1,
          painLocation: { left: ["tmj"] },
        },
        e9: {
          left: {
            tmjLateralPole: { familiarPain: "yes" },
            temporalisPosterior: { familiarHeadache: "yes" },
          },
        },
      };
      const results = evaluateAllDiagnoses(
        [ARTHRALGIA, HEADACHE_ATTRIBUTED_TO_TMD],
        data
      );
      expect(results.find((r) => r.diagnosisId === "arthralgia")?.isPositive).toBe(true);
      expect(results.find((r) => r.diagnosisId === "headacheAttributedToTmd")?.isPositive).toBe(true);
    });
  });

  describe("diagnosis definition structure", () => {
    it("has correct metadata", () => {
      expect(HEADACHE_ATTRIBUTED_TO_TMD.id).toBe("headacheAttributedToTmd");
      expect(HEADACHE_ATTRIBUTED_TO_TMD.nameDE).toBe("Auf CMD zurückgeführte Kopfschmerzen");
      expect(HEADACHE_ATTRIBUTED_TO_TMD.category).toBe("pain");
      expect(HEADACHE_ATTRIBUTED_TO_TMD.requires).toEqual({ anyOf: ["myalgia", "arthralgia"] });
    });
  });
});
