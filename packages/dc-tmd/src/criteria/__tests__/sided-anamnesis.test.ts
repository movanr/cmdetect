import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluate";
import { evaluateDiagnosis } from "../evaluate-diagnosis";
import {
  TMJ_NOISE_SIDED_ANAMNESIS,
  DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS,
  DISC_DISPLACEMENT_WITH_REDUCTION,
  DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING,
} from "../diagnoses/disc-displacement";
import { DEGENERATIVE_JOINT_DISEASE } from "../diagnoses/degenerative-joint-disease";
import { SUBLUXATION, SUBLUXATION_SIDED_ANAMNESIS } from "../diagnoses/subluxation";

// ============================================================================
// TMJ_NOISE_SIDED_ANAMNESIS
// ============================================================================

describe("TMJ_NOISE_SIDED_ANAMNESIS", () => {
  it("positive: SQ8_side marks left", () => {
    const data = { sq: { SQ8_side: { left: true, right: false } } };
    const result = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    expect(result.status).toBe("positive");
  });

  it("negative: SQ8_side marks only right, evaluating left (with complete E6/E7 data)", () => {
    const data = {
      sq: { SQ8_side: { left: false, right: true } },
      // Provide explicit negative E6/E7 patient noise for left side
      e6: { left: { click: { patient: "no" }, crepitus: { patient: "no" } } },
      e7: { left: { click: { patient: "no" }, crepitus: { patient: "no" } } },
    };
    const result = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    expect(result.status).toBe("negative");
  });

  it("positive: SQ8_side marks both sides (bilateral)", () => {
    const data = { sq: { SQ8_side: { left: true, right: true } } };
    const resultL = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    const resultR = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, data, { side: "right", region: "tmj" });
    expect(resultL.status).toBe("positive");
    expect(resultR.status).toBe("positive");
  });

  it("negative: DNK produces both sides false (with complete E6/E7 data)", () => {
    const data = {
      sq: { SQ8_side: { left: false, right: false } },
      e6: {
        left: { click: { patient: "no" }, crepitus: { patient: "no" } },
        right: { click: { patient: "no" }, crepitus: { patient: "no" } },
      },
      e7: {
        left: { click: { patient: "no" }, crepitus: { patient: "no" } },
        right: { click: { patient: "no" }, crepitus: { patient: "no" } },
      },
    };
    const resultL = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    const resultR = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, data, { side: "right", region: "tmj" });
    expect(resultL.status).toBe("negative");
    expect(resultR.status).toBe("negative");
  });

  it("positive: patient reports noise on this side during E6", () => {
    // No SQ8_side data, but patient reports click on left during E6
    const data = {
      sq: { SQ8_side: { left: false, right: false } },
      e6: { left: { click: { patient: "yes" } } },
    };
    const result = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    expect(result.status).toBe("positive");
  });

  it("positive: patient reports noise on this side during E7", () => {
    const data = {
      sq: {},
      e7: { right: { crepitus: { patient: "yes" } } },
    };
    const result = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, data, { side: "right", region: "tmj" });
    expect(result.status).toBe("positive");
  });

  it("negative: patient noise on opposite side only", () => {
    const data = {
      sq: { SQ8_side: { left: false, right: false } },
      e6: {
        left: { click: { patient: "no" }, crepitus: { patient: "no" } },
        right: { click: { patient: "yes" } },
      },
      e7: {
        left: { click: { patient: "no" }, crepitus: { patient: "no" } },
        right: { crepitus: { patient: "no" } },
      },
    };
    // Evaluating left, but noise only on right
    const result = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    expect(result.status).toBe("negative");
  });

  it("pending: no side data at all", () => {
    const result = evaluate(TMJ_NOISE_SIDED_ANAMNESIS, { sq: {} }, { side: "left", region: "tmj" });
    expect(result.status).toBe("pending");
  });
});

// ============================================================================
// DD WITH REDUCTION — SIDED ANAMNESIS INTEGRATION
// ============================================================================

describe("DD with Reduction — sided anamnesis gate", () => {
  it("positive only on left when SQ8_side marks left only", () => {
    const data = {
      sq: { SQ8: "yes", SQ8_side: { left: true, right: false } },
      e6: {
        left: { click: { examinerOpen: "yes", examinerClose: "yes" } },
        right: { click: { examinerOpen: "yes", examinerClose: "yes" } },
      },
    };
    const result = evaluateDiagnosis(DISC_DISPLACEMENT_WITH_REDUCTION, data);
    expect(result.isPositive).toBe(true);
    expect(result.positiveLocations).toEqual([{ side: "left", region: "tmj" }]);
  });

  it("positive on both sides when SQ8_side marks both", () => {
    const data = {
      sq: { SQ8: "yes", SQ8_side: { left: true, right: true } },
      e6: {
        left: { click: { examinerOpen: "yes", examinerClose: "yes" } },
        right: { click: { examinerOpen: "yes", examinerClose: "yes" } },
      },
    };
    const result = evaluateDiagnosis(DISC_DISPLACEMENT_WITH_REDUCTION, data);
    expect(result.isPositive).toBe(true);
    expect(result.positiveLocations).toHaveLength(2);
  });

  it("positive via patient noise fallback even without SQ8_side", () => {
    const data = {
      sq: { SQ8: "no" },
      e6: {
        right: {
          click: { patient: "yes", examinerOpen: "yes", examinerClose: "yes" },
        },
      },
    };
    const result = evaluateDiagnosis(DISC_DISPLACEMENT_WITH_REDUCTION, data);
    expect(result.isPositive).toBe(true);
    // Only right is positive (patient noise only on right)
    expect(result.positiveLocations).toEqual([{ side: "right", region: "tmj" }]);
  });

  it("sidedAnamnesisResult present in location results", () => {
    const data = {
      sq: { SQ8: "yes", SQ8_side: { left: true, right: false } },
      e6: {
        left: { click: { examinerOpen: "yes", examinerClose: "yes", patient: "no" }, crepitus: { patient: "no" } },
        right: { click: { patient: "no" }, crepitus: { patient: "no" } },
      },
      e7: {
        left: { click: { patient: "no" }, crepitus: { patient: "no" } },
        right: { click: { patient: "no" }, crepitus: { patient: "no" } },
      },
    };
    const result = evaluateDiagnosis(DISC_DISPLACEMENT_WITH_REDUCTION, data);
    const leftLoc = result.locationResults.find((l) => l.side === "left");
    const rightLoc = result.locationResults.find((l) => l.side === "right");
    expect(leftLoc?.sidedAnamnesisResult).toBeDefined();
    expect(leftLoc?.sidedAnamnesisResult?.status).toBe("positive");
    expect(rightLoc?.sidedAnamnesisResult?.status).toBe("negative");
  });
});

// ============================================================================
// DD WITH REDUCTION + INTERMITTENT LOCKING — SIDED ANAMNESIS
// ============================================================================

describe("DD with Reduction + IL — sided anamnesis gate", () => {
  it("positive only where both SQ8 and SQ11 sides match", () => {
    const data = {
      sq: {
        SQ8: "yes", SQ8_side: { left: true, right: true },
        SQ11: "yes", SQ11_side: { left: true, right: false },
        SQ12: "no",
      },
      e6: {
        left: { click: { examinerOpen: "yes", examinerClose: "yes" } },
        right: { click: { examinerOpen: "yes", examinerClose: "yes" } },
      },
    };
    const result = evaluateDiagnosis(DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING, data);
    // SQ8 side: both, SQ11 side: left only → left positive, right negative
    expect(result.isPositive).toBe(true);
    expect(result.positiveLocations).toEqual([{ side: "left", region: "tmj" }]);
  });

  it("negative on both sides when SQ11 side doesn't match", () => {
    const data = {
      sq: {
        SQ8: "yes", SQ8_side: { left: true, right: false },
        SQ11: "yes", SQ11_side: { left: false, right: true },
        SQ12: "no",
      },
      e6: {
        left: { click: { examinerOpen: "yes", examinerClose: "yes" } },
        right: { click: { examinerOpen: "yes", examinerClose: "yes" } },
      },
    };
    const result = evaluateDiagnosis(DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING, data);
    // SQ8 side: left only, SQ11 side: right only → no overlap
    expect(result.positiveLocations).toHaveLength(0);
  });
});

// ============================================================================
// DD WITHOUT REDUCTION — SIDED ANAMNESIS
// ============================================================================

describe("DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS", () => {
  it("positive: both SQ9 and SQ10 side match left", () => {
    const data = {
      sq: {
        SQ9_side: { left: true, right: false },
        SQ10_side: { left: true, right: false },
      },
    };
    const result = evaluate(DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    expect(result.status).toBe("positive");
  });

  it("negative: SQ9 left but SQ10 right only", () => {
    const data = {
      sq: {
        SQ9_side: { left: true, right: false },
        SQ10_side: { left: false, right: true },
      },
    };
    const result = evaluate(DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    expect(result.status).toBe("negative");
  });
});

describe("DD without Reduction Limited — sided anamnesis gate", () => {
  it("positive only on left when SQ9+SQ10 side marks left", () => {
    const data = {
      sq: {
        SQ9: "yes", SQ9_side: { left: true, right: false },
        SQ10: "yes", SQ10_side: { left: true, right: false },
      },
      e4: { maxAssisted: { measurement: 30 } },
      e2: { verticalOverlap: 5 },
    };
    const result = evaluateDiagnosis(DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING, data);
    expect(result.isPositive).toBe(true);
    expect(result.positiveLocations).toEqual([{ side: "left", region: "tmj" }]);
  });
});

// ============================================================================
// DJD — SIDED ANAMNESIS
// ============================================================================

describe("DJD — sided anamnesis gate", () => {
  it("positive only on left when SQ8_side marks left", () => {
    const data = {
      sq: { SQ8: "yes", SQ8_side: { left: true, right: false } },
      e6: {
        left: { crepitus: { examinerOpen: "yes" } },
        right: { crepitus: { examinerOpen: "yes" } },
      },
    };
    const result = evaluateDiagnosis(DEGENERATIVE_JOINT_DISEASE, data);
    expect(result.isPositive).toBe(true);
    expect(result.positiveLocations).toEqual([{ side: "left", region: "tmj" }]);
  });
});

// ============================================================================
// SUBLUXATION — SIDED ANAMNESIS
// ============================================================================

describe("SUBLUXATION_SIDED_ANAMNESIS", () => {
  it("positive: both SQ13 and SQ14 side match", () => {
    const data = {
      sq: {
        SQ13_side: { left: true, right: false },
        SQ14_side: { left: true, right: false },
      },
    };
    const result = evaluate(SUBLUXATION_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    expect(result.status).toBe("positive");
  });

  it("negative: SQ13 left but SQ14 right only", () => {
    const data = {
      sq: {
        SQ13_side: { left: true, right: false },
        SQ14_side: { left: false, right: true },
      },
    };
    const result = evaluate(SUBLUXATION_SIDED_ANAMNESIS, data, { side: "left", region: "tmj" });
    expect(result.status).toBe("negative");
  });
});

describe("Subluxation — sided anamnesis gate", () => {
  it("positive only on right when SQ13+SQ14 side marks right", () => {
    const data = {
      sq: {
        SQ13: "yes", SQ13_side: { left: false, right: true },
        SQ14: "yes", SQ14_side: { left: false, right: true },
      },
    };
    const result = evaluateDiagnosis(SUBLUXATION, data);
    expect(result.isPositive).toBe(true);
    expect(result.positiveLocations).toEqual([{ side: "right", region: "tmj" }]);
  });

  it("positive on both sides (bilateral)", () => {
    const data = {
      sq: {
        SQ13: "yes", SQ13_side: { left: true, right: true },
        SQ14: "yes", SQ14_side: { left: true, right: true },
      },
    };
    const result = evaluateDiagnosis(SUBLUXATION, data);
    expect(result.isPositive).toBe(true);
    expect(result.positiveLocations).toHaveLength(2);
  });
});
