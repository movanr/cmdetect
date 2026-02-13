import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluate";
import { MYALGIA, MYALGIA_ANAMNESIS, MYALGIA_EXAMINATION } from "../diagnoses/myalgia";

describe("Myalgia diagnosis", () => {
  describe("anamnesis criteria", () => {
    it("positive: pain in masticatory structure + modified by function", () => {
      const data = {
        sq: {
          SQ1: "yes", // Pain in jaw/temple/ear
          SQ3: "intermittent", // Pain pattern
          SQ4_A: "yes", // Modified by chewing
        },
      };

      const result = evaluate(MYALGIA_ANAMNESIS, data);

      expect(result.status).toBe("positive");
    });

    it("positive: continuous pain modified by jaw movement", () => {
      const data = {
        sq: {
          SQ1: "yes",
          SQ3: "continuous",
          SQ4_B: "yes", // Modified by jaw movement
        },
      };

      const result = evaluate(MYALGIA_ANAMNESIS, data);

      expect(result.status).toBe("positive");
    });

    it("negative: no pain in masticatory structure", () => {
      const data = {
        sq: {
          SQ1: "no", // No pain
          SQ3: "intermittent",
          SQ4_A: "yes",
        },
      };

      const result = evaluate(MYALGIA_ANAMNESIS, data);

      expect(result.status).toBe("negative");
    });

    it("negative: pain not modified by any function", () => {
      const data = {
        sq: {
          SQ1: "yes",
          SQ3: "intermittent",
          SQ4_A: "no",
          SQ4_B: "no",
          SQ4_C: "no",
          SQ4_D: "no",
        },
      };

      const result = evaluate(MYALGIA_ANAMNESIS, data);

      expect(result.status).toBe("negative");
    });

    it("negative: pain but acute (not intermittent/continuous)", () => {
      const data = {
        sq: {
          SQ1: "yes",
          SQ3: "acute", // Not intermittent or continuous
          SQ4_A: "yes",
        },
      };

      const result = evaluate(MYALGIA_ANAMNESIS, data);

      expect(result.status).toBe("negative");
    });

    it("pending: missing SQ1 answer", () => {
      const data = {
        sq: {
          SQ3: "intermittent",
          SQ4_A: "yes",
        },
      };

      const result = evaluate(MYALGIA_ANAMNESIS, data);

      expect(result.status).toBe("pending");
    });

    it("pending: missing SQ3 answer", () => {
      const data = {
        sq: {
          SQ1: "yes",
          SQ4_A: "yes",
        },
      };

      const result = evaluate(MYALGIA_ANAMNESIS, data);

      expect(result.status).toBe("pending");
    });

    it("pending: missing all SQ4 answers", () => {
      const data = {
        sq: {
          SQ1: "yes",
          SQ3: "intermittent",
        },
      };

      const result = evaluate(MYALGIA_ANAMNESIS, data);

      expect(result.status).toBe("pending");
    });
  });

  describe("examination criteria", () => {
    it("positive: pain location confirmed + familiar pain on palpation", () => {
      const data = {
        e1: { painLocation: { left: ["temporalis"] } },
        e9: { left: { temporalisPosterior: { familiarPain: "yes" } } },
      };

      const result = evaluate(MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });

      expect(result.status).toBe("positive");
    });

    it("positive: pain location confirmed + familiar pain on opening", () => {
      const data = {
        e1: { painLocation: { left: ["temporalis"] } },
        e4: {
          maxUnassisted: { left: { temporalis: { familiarPain: "yes" } } },
        },
      };

      const result = evaluate(MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });

      expect(result.status).toBe("positive");
    });

    it("positive: masseter region confirmed + familiar pain on palpation", () => {
      const data = {
        e1: { painLocation: { right: ["masseter"] } },
        e9: { right: { masseterOrigin: { familiarPain: "yes" } } },
      };

      const result = evaluate(MYALGIA_EXAMINATION.criterion, data, {
        side: "right",
        region: "masseter",
      });

      expect(result.status).toBe("positive");
    });

    it("negative: pain location not in specified region", () => {
      const data = {
        e1: { painLocation: { left: ["masseter"] } }, // No temporalis
        e9: { left: { temporalisPosterior: { familiarPain: "yes" } } },
      };

      const result = evaluate(MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis", // Looking for temporalis but patient has masseter
      });

      expect(result.status).toBe("negative");
    });

    it("negative: no familiar pain on palpation or opening", () => {
      const data = {
        e1: { painLocation: { left: ["temporalis"] } },
        e4: {
          maxUnassisted: { left: { temporalis: { familiarPain: "no" } } },
          maxAssisted: { left: { temporalis: { familiarPain: "no" } } },
        },
        // Only need to provide the evaluated region's palpation sites (region-gated)
        e9: {
          left: {
            temporalisPosterior: { familiarPain: "no" },
            temporalisMiddle: { familiarPain: "no" },
            temporalisAnterior: { familiarPain: "no" },
          },
        },
      };

      const result = evaluate(MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });

      expect(result.status).toBe("negative");
    });

    it("cross-region isolation: temporalis familiarPain should not affect masseter evaluation", () => {
      const data = {
        e1: { painLocation: { right: ["masseter"] } },
        // Temporalis has familiar pain, but masseter does NOT
        e9: {
          right: {
            temporalisPosterior: { familiarPain: "yes" },
            temporalisMiddle: { familiarPain: "yes" },
            masseterOrigin: { familiarPain: "no" },
            masseterBody: { familiarPain: "no" },
            masseterInsertion: { familiarPain: "no" },
          },
        },
        e4: {
          maxUnassisted: { right: { masseter: { familiarPain: "no" } } },
          maxAssisted: { right: { masseter: { familiarPain: "no" } } },
        },
      };

      // Evaluating for masseter — should be negative despite temporalis having familiar pain
      const result = evaluate(MYALGIA_EXAMINATION.criterion, data, {
        side: "right",
        region: "masseter",
      });

      expect(result.status).toBe("negative");
    });

    it("pending: missing pain location data", () => {
      const data = {
        e1: { painLocation: {} }, // No side data
        e9: { left: { temporalisPosterior: { familiarPain: "yes" } } },
      };

      const result = evaluate(MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });

      expect(result.status).toBe("pending");
    });
  });

  describe("clinical scenarios", () => {
    it("typical myalgia patient: bilateral temporalis pain", () => {
      const patient = {
        sq: {
          SQ1: "yes",
          SQ3: "continuous",
          SQ4_B: "yes", // Modified by jaw movement
        },
        e1: {
          painLocation: {
            left: ["temporalis"],
            right: ["temporalis"],
          },
        },
        e9: {
          left: { temporalisMiddle: { familiarPain: "yes" } },
          right: { temporalisPosterior: { familiarPain: "yes" } },
        },
      };

      // Check anamnesis
      const anamnesisResult = evaluate(MYALGIA_ANAMNESIS, patient);
      expect(anamnesisResult.status).toBe("positive");

      // Check left temporalis
      const leftResult = evaluate(MYALGIA_EXAMINATION.criterion, patient, {
        side: "left",
        region: "temporalis",
      });
      expect(leftResult.status).toBe("positive");

      // Check right temporalis
      const rightResult = evaluate(MYALGIA_EXAMINATION.criterion, patient, {
        side: "right",
        region: "temporalis",
      });
      expect(rightResult.status).toBe("positive");
    });

    it("unilateral masseter myalgia", () => {
      const patient = {
        sq: {
          SQ1: "yes",
          SQ3: "intermittent",
          SQ4_A: "yes", // Modified by chewing
          SQ4_C: "yes", // Modified by clenching
        },
        e1: {
          painLocation: {
            left: [],
            right: ["masseter"],
          },
        },
        e9: {
          left: {
            masseterOrigin: { familiarPain: "no" },
            masseterBody: { familiarPain: "no" },
            masseterInsertion: { familiarPain: "no" },
          },
          right: {
            masseterOrigin: { familiarPain: "yes" },
            masseterBody: { familiarPain: "yes" },
            masseterInsertion: { familiarPain: "no" },
          },
        },
      };

      // Anamnesis positive
      expect(evaluate(MYALGIA_ANAMNESIS, patient).status).toBe("positive");

      // Left masseter negative (no pain location)
      expect(
        evaluate(MYALGIA_EXAMINATION.criterion, patient, {
          side: "left",
          region: "masseter",
        }).status
      ).toBe("negative");

      // Right masseter positive
      expect(
        evaluate(MYALGIA_EXAMINATION.criterion, patient, {
          side: "right",
          region: "masseter",
        }).status
      ).toBe("positive");
    });

    it("patient with pain but not myalgia (acute onset)", () => {
      const patient = {
        sq: {
          SQ1: "yes",
          SQ3: "acute", // Acute, not chronic pattern
          SQ4_A: "yes",
        },
        e1: {
          painLocation: {
            left: ["temporalis"],
          },
        },
        e9: {
          left: { temporalisPosterior: { familiarPain: "yes" } },
        },
      };

      // Anamnesis fails due to acute pattern
      expect(evaluate(MYALGIA_ANAMNESIS, patient).status).toBe("negative");

      // Examination would be positive if checked
      expect(
        evaluate(MYALGIA_EXAMINATION.criterion, patient, {
          side: "left",
          region: "temporalis",
        }).status
      ).toBe("positive");
    });

    it("incomplete examination - pending status", () => {
      const patient = {
        sq: {
          SQ1: "yes",
          SQ3: "continuous",
          SQ4_B: "yes",
        },
        e1: {
          painLocation: {
            left: ["temporalis"],
          },
        },
        // E9 palpation not yet performed
        e9: {},
        // E4 opening not yet performed
        e4: {},
      };

      // Anamnesis complete and positive
      expect(evaluate(MYALGIA_ANAMNESIS, patient).status).toBe("positive");

      // Examination pending (need palpation or opening data)
      const examResult = evaluate(MYALGIA_EXAMINATION.criterion, patient, {
        side: "left",
        region: "temporalis",
      });
      expect(examResult.status).toBe("pending");
    });
  });

  describe("diagnosis definition structure", () => {
    it("has correct diagnosis metadata", () => {
      expect(MYALGIA.id).toBe("myalgia");
      expect(MYALGIA.name).toBe("Myalgia");
      expect(MYALGIA.nameDE).toBe("Myalgie");
      expect(MYALGIA.category).toBe("pain");
    });

    it("examination targets temporalis and masseter regions", () => {
      expect(MYALGIA_EXAMINATION.regions).toContain("temporalis");
      expect(MYALGIA_EXAMINATION.regions).toContain("masseter");
      expect(MYALGIA_EXAMINATION.regions).toHaveLength(2);
    });
  });
});
