import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluate";
import { evaluateDiagnosis } from "../evaluate-diagnosis";
import {
  TMJ_NOISE_ANAMNESIS,
  DISC_DISPLACEMENT_WITH_REDUCTION,
  DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING,
} from "../diagnoses/disc-displacement";

// ============================================================================
// TMJ_NOISE_ANAMNESIS (shared)
// ============================================================================

describe("TMJ_NOISE_ANAMNESIS", () => {
  it("positive: SQ8=yes", () => {
    const data = { sq: { SQ8: "yes" } };
    expect(evaluate(TMJ_NOISE_ANAMNESIS, data).status).toBe("positive");
  });

  it("positive: patient reports noise during E6", () => {
    const data = {
      sq: { SQ8: "no" },
      e6: { left: { click: { patient: "yes" } } },
    };
    expect(evaluate(TMJ_NOISE_ANAMNESIS, data).status).toBe("positive");
  });

  it("positive: patient reports noise during E7", () => {
    const data = {
      sq: { SQ8: "no" },
      e7: { right: { crepitus: { patient: "yes" } } },
    };
    expect(evaluate(TMJ_NOISE_ANAMNESIS, data).status).toBe("positive");
  });

  it("negative: SQ8=no and no patient-reported noise", () => {
    const data = {
      sq: { SQ8: "no" },
      e6: {
        left: { click: { patient: "no" }, crepitus: { patient: "no" } },
        right: { click: { patient: "no" }, crepitus: { patient: "no" } },
      },
      e7: {
        left: { click: { patient: "no" }, crepitus: { patient: "no" } },
        right: { click: { patient: "no" }, crepitus: { patient: "no" } },
      },
    };
    expect(evaluate(TMJ_NOISE_ANAMNESIS, data).status).toBe("negative");
  });

  it("pending: no SQ8 answer and no E6/E7 data", () => {
    expect(evaluate(TMJ_NOISE_ANAMNESIS, {}).status).toBe("pending");
  });
});

// ============================================================================
// DD WITH REDUCTION
// ============================================================================

describe("DD with Reduction", () => {
  describe("examination criteria", () => {
    it("positive: click on both opening and closing (E6)", () => {
      const data = {
        e6: { left: { click: { examinerOpen: "yes", examinerClose: "yes" } } },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITH_REDUCTION.examination.criterion,
        data,
        { side: "left", region: "tmj" }
      );
      expect(result.status).toBe("positive");
    });

    it("positive: click on opening (E6) + click on lateral (E7)", () => {
      const data = {
        e6: { right: { click: { examinerOpen: "yes", examinerClose: "no" } } },
        e7: { right: { click: { examiner: "yes" } } },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITH_REDUCTION.examination.criterion,
        data,
        { side: "right", region: "tmj" }
      );
      expect(result.status).toBe("positive");
    });

    it("positive: click on closing (E6) + click on lateral (E7)", () => {
      const data = {
        e6: { left: { click: { examinerOpen: "no", examinerClose: "yes" } } },
        e7: { left: { click: { examiner: "yes" } } },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITH_REDUCTION.examination.criterion,
        data,
        { side: "left", region: "tmj" }
      );
      expect(result.status).toBe("positive");
    });

    it("negative: click only on opening, no closing, no lateral", () => {
      const data = {
        e6: { left: { click: { examinerOpen: "yes", examinerClose: "no" } } },
        e7: { left: { click: { examiner: "no" } } },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITH_REDUCTION.examination.criterion,
        data,
        { side: "left", region: "tmj" }
      );
      expect(result.status).toBe("negative");
    });

    it("targets TMJ region", () => {
      expect(DISC_DISPLACEMENT_WITH_REDUCTION.examination.regions).toEqual(["tmj"]);
    });
  });

  describe("full diagnosis", () => {
    it("positive: SQ8 + opening/closing click", () => {
      const data = {
        sq: { SQ8: "yes", SQ8_side: { left: true, right: true } },
        e6: { left: { click: { examinerOpen: "yes", examinerClose: "yes" } } },
      };
      const result = evaluateDiagnosis(DISC_DISPLACEMENT_WITH_REDUCTION, data);
      expect(result.isPositive).toBe(true);
      expect(result.positiveLocations).toContainEqual({ side: "left", region: "tmj" });
    });

    it("has correct metadata", () => {
      expect(DISC_DISPLACEMENT_WITH_REDUCTION.id).toBe("discDisplacementWithReduction");
      expect(DISC_DISPLACEMENT_WITH_REDUCTION.nameDE).toBe("Diskusverlagerung mit Reposition");
      expect(DISC_DISPLACEMENT_WITH_REDUCTION.category).toBe("joint");
    });
  });
});

// ============================================================================
// DD WITH REDUCTION + INTERMITTENT LOCKING
// ============================================================================

describe("DD with Reduction + Intermittent Locking", () => {
  describe("anamnesis criteria", () => {
    it("positive: TMJ noise + SQ11=yes + SQ12=no", () => {
      const data = {
        sq: { SQ8: "yes", SQ11: "yes", SQ12: "no" },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING.anamnesis,
        data
      );
      expect(result.status).toBe("positive");
    });

    it("negative: SQ12=yes (currently locked — not intermittent)", () => {
      const data = {
        sq: { SQ8: "yes", SQ11: "yes", SQ12: "yes" },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING.anamnesis,
        data
      );
      expect(result.status).toBe("negative");
    });

    it("negative: SQ11=no (no recent locking)", () => {
      const data = {
        sq: { SQ8: "yes", SQ11: "no", SQ12: "no" },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING.anamnesis,
        data
      );
      expect(result.status).toBe("negative");
    });
  });

  describe("full diagnosis", () => {
    it("positive: complete criteria met", () => {
      const data = {
        sq: {
          SQ8: "yes", SQ8_side: { left: true, right: true },
          SQ11: "yes", SQ11_side: { left: true, right: true },
          SQ12: "no",
        },
        e6: { right: { click: { examinerOpen: "yes", examinerClose: "yes" } } },
      };
      const result = evaluateDiagnosis(
        DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING,
        data
      );
      expect(result.isPositive).toBe(true);
    });

    it("has correct metadata", () => {
      expect(DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING.id).toBe(
        "discDisplacementWithReductionIntermittentLocking"
      );
      expect(DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING.category).toBe("joint");
    });
  });
});

// ============================================================================
// DD WITHOUT REDUCTION, WITH LIMITED OPENING
// ============================================================================

describe("DD without Reduction, Limited Opening", () => {
  describe("anamnesis criteria", () => {
    it("positive: SQ9=yes + SQ10=yes", () => {
      const data = { sq: { SQ9: "yes", SQ10: "yes" } };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.anamnesis,
        data
      );
      expect(result.status).toBe("positive");
    });

    it("negative: SQ9=no", () => {
      const data = { sq: { SQ9: "no", SQ10: "yes" } };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.anamnesis,
        data
      );
      expect(result.status).toBe("negative");
    });

    it("negative: SQ10=no (limitation not severe enough)", () => {
      const data = { sq: { SQ9: "yes", SQ10: "no" } };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.anamnesis,
        data
      );
      expect(result.status).toBe("negative");
    });
  });

  describe("examination criteria", () => {
    it("positive: maxAssisted + overlap < 40mm", () => {
      const data = {
        e4: { maxAssisted: { measurement: 30 } },
        e2: { verticalOverlap: 5 },
      };
      // computed criterion doesn't use template context
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.examination.criterion,
        data
      );
      expect(result.status).toBe("positive"); // 30 + 5 = 35 < 40
    });

    it("negative: maxAssisted + overlap >= 40mm", () => {
      const data = {
        e4: { maxAssisted: { measurement: 38 } },
        e2: { verticalOverlap: 3 },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.examination.criterion,
        data
      );
      expect(result.status).toBe("negative"); // 38 + 3 = 41 >= 40
    });

    it("positive: exactly 39mm (< 40)", () => {
      const data = {
        e4: { maxAssisted: { measurement: 36 } },
        e2: { verticalOverlap: 3 },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.examination.criterion,
        data
      );
      expect(result.status).toBe("positive"); // 36 + 3 = 39 < 40
    });

    it("negative: exactly 40mm (not < 40)", () => {
      const data = {
        e4: { maxAssisted: { measurement: 37 } },
        e2: { verticalOverlap: 3 },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.examination.criterion,
        data
      );
      expect(result.status).toBe("negative"); // 37 + 3 = 40, not < 40
    });

    it("pending: missing measurement", () => {
      const data = { e2: { verticalOverlap: 3 } };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.examination.criterion,
        data
      );
      expect(result.status).toBe("pending");
    });
  });

  it("has correct metadata", () => {
    expect(DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.id).toBe(
      "discDisplacementWithoutReductionLimitedOpening"
    );
    expect(DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.category).toBe("joint");
  });
});

// ============================================================================
// DD WITHOUT REDUCTION, WITHOUT LIMITED OPENING
// ============================================================================

describe("DD without Reduction, No Limited Opening", () => {
  describe("examination criteria", () => {
    it("positive: maxAssisted + overlap >= 40mm", () => {
      const data = {
        e4: { maxAssisted: { measurement: 42 } },
        e2: { verticalOverlap: 3 },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING.examination.criterion,
        data
      );
      expect(result.status).toBe("positive"); // 42 + 3 = 45 >= 40
    });

    it("positive: exactly 40mm (>= 40)", () => {
      const data = {
        e4: { maxAssisted: { measurement: 37 } },
        e2: { verticalOverlap: 3 },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING.examination.criterion,
        data
      );
      expect(result.status).toBe("positive"); // 37 + 3 = 40 >= 40
    });

    it("negative: maxAssisted + overlap < 40mm", () => {
      const data = {
        e4: { maxAssisted: { measurement: 30 } },
        e2: { verticalOverlap: 5 },
      };
      const result = evaluate(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING.examination.criterion,
        data
      );
      expect(result.status).toBe("negative"); // 30 + 5 = 35 < 40
    });
  });

  describe("full diagnosis", () => {
    it("positive: SQ9+SQ10 + opening >= 40mm", () => {
      const data = {
        sq: {
          SQ9: "yes", SQ9_side: { left: true, right: true },
          SQ10: "yes", SQ10_side: { left: true, right: true },
        },
        e4: { maxAssisted: { measurement: 45 } },
        e2: { verticalOverlap: 3 },
      };
      const result = evaluateDiagnosis(
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING,
        data
      );
      expect(result.isPositive).toBe(true);
    });
  });

  it("has correct metadata", () => {
    expect(DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING.id).toBe(
      "discDisplacementWithoutReductionWithoutLimitedOpening"
    );
  });
});

// ============================================================================
// MUTUAL EXCLUSIVITY: Limited vs No Limited Opening
// ============================================================================

describe("DD without Reduction: Limited vs No Limited are mutually exclusive", () => {
  it("limited positive when < 40mm, no-limited negative", () => {
    const data = {
      sq: {
        SQ9: "yes", SQ9_side: { left: true, right: true },
        SQ10: "yes", SQ10_side: { left: true, right: true },
      },
      e4: { maxAssisted: { measurement: 30 } },
      e2: { verticalOverlap: 5 },
    };
    const limited = evaluateDiagnosis(DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING, data);
    const noLimited = evaluateDiagnosis(DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING, data);
    expect(limited.isPositive).toBe(true);
    expect(noLimited.isPositive).toBe(false);
  });

  it("no-limited positive when >= 40mm, limited negative", () => {
    const data = {
      sq: {
        SQ9: "yes", SQ9_side: { left: true, right: true },
        SQ10: "yes", SQ10_side: { left: true, right: true },
      },
      e4: { maxAssisted: { measurement: 42 } },
      e2: { verticalOverlap: 3 },
    };
    const limited = evaluateDiagnosis(DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING, data);
    const noLimited = evaluateDiagnosis(DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING, data);
    expect(limited.isPositive).toBe(false);
    expect(noLimited.isPositive).toBe(true);
  });
});
