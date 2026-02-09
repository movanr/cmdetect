import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluate";
import { match } from "../builders";
import { MYALGIA_ANAMNESIS } from "../diagnoses/myalgia";
import {
  LOCAL_MYALGIA,
  LOCAL_MYALGIA_EXAMINATION,
  MYOFASCIAL_PAIN_WITH_SPREADING,
  MYOFASCIAL_SPREADING_EXAMINATION,
  MYOFASCIAL_PAIN_WITH_REFERRAL,
  MYOFASCIAL_REFERRAL_EXAMINATION,
} from "../diagnoses/myalgia-subtypes";

// ============================================================================
// TEST HELPERS
// ============================================================================

/** Positive anamnesis data (shared by all myalgia subtypes) */
const positiveAnamnesis = {
  sq: {
    SQ1: "yes",
    SQ3: "intermittent",
    SQ4_A: "yes",
  },
};

/** Creates E9 palpation data for a side/site with specified pain properties */
function palpationSite(opts: {
  pain?: string;
  familiarPain?: string;
  spreadingPain?: string;
  referredPain?: string;
}) {
  return opts;
}

/** Creates a full patient dataset with anamnesis + examination data */
function patient(examData: Record<string, unknown>) {
  return { ...positiveAnamnesis, ...examData };
}

// ============================================================================
// MATCH CRITERION (unit tests)
// ============================================================================

describe("match criterion", () => {
  it("positive when template resolves to expected value", () => {
    const criterion = match("${region}", "temporalis");
    const result = evaluate(criterion, {}, { side: "left", region: "temporalis" });
    expect(result.status).toBe("positive");
  });

  it("negative when template resolves to different value", () => {
    const criterion = match("${region}", "temporalis");
    const result = evaluate(criterion, {}, { side: "left", region: "masseter" });
    expect(result.status).toBe("negative");
  });

  it("pending when template variable not provided", () => {
    const criterion = match("${region}", "temporalis");
    const result = evaluate(criterion, {}, { side: "left" });
    expect(result.status).toBe("pending");
  });

  it("works with side template", () => {
    const criterion = match("${side}", "left");
    const result = evaluate(criterion, {}, { side: "left", region: "temporalis" });
    expect(result.status).toBe("positive");
  });
});

// ============================================================================
// LOCAL MYALGIA
// ============================================================================

describe("Local Myalgia diagnosis", () => {
  describe("examination criteria", () => {
    it("positive: familiar pain from palpation, no spreading, no referred", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("positive");
    });

    it("positive: masseter region with local pain", () => {
      const data = patient({
        e1: { painLocation: { right: ["masseter"] } },
        e9: {
          right: {
            masseterOrigin: palpationSite({
              familiarPain: "yes",
              spreadingPain: "no",
              referredPain: "no",
            }),
            masseterBody: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            masseterInsertion: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "right",
        region: "masseter",
      });
      expect(result.status).toBe("positive");
    });

    it("negative: has spreading pain", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "yes", // spreading present → not local
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("negative");
    });

    it("negative: has referred pain", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "no",
              referredPain: "yes", // referred present → not local
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("negative");
    });

    it("negative: no familiar pain from palpation", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("negative");
    });

    it("pending: spreading/referred data missing (basic mode)", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            // Only basic mode data (no spreading/referred)
            temporalisPosterior: palpationSite({ familiarPain: "yes" }),
            temporalisMiddle: palpationSite({ familiarPain: "no" }),
            temporalisAnterior: palpationSite({ familiarPain: "no" }),
          },
        },
      });

      const result = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      // Familiar pain is positive, but spreading/referred data is missing → pending
      expect(result.status).toBe("pending");
    });
  });

  describe("region isolation", () => {
    it("temporalis spreading does NOT affect masseter local myalgia evaluation", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis", "masseter"] } },
        e9: {
          left: {
            // Temporalis: has spreading pain
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "yes",
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            // Masseter: local pain only
            masseterOrigin: palpationSite({
              familiarPain: "yes",
              spreadingPain: "no",
              referredPain: "no",
            }),
            masseterBody: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            masseterInsertion: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      // Temporalis should NOT be local myalgia (has spreading)
      const temporalisResult = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(temporalisResult.status).toBe("negative");

      // Masseter SHOULD be local myalgia (pain is local)
      const masseterResult = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "masseter",
      });
      expect(masseterResult.status).toBe("positive");
    });

    it("masseter referred does NOT affect temporalis local myalgia evaluation", () => {
      const data = patient({
        e1: { painLocation: { right: ["temporalis", "masseter"] } },
        e9: {
          right: {
            // Temporalis: local pain
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            // Masseter: has referred pain
            masseterOrigin: palpationSite({
              familiarPain: "yes",
              spreadingPain: "no",
              referredPain: "yes",
            }),
            masseterBody: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            masseterInsertion: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      // Temporalis SHOULD be local myalgia
      const temporalisResult = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "right",
        region: "temporalis",
      });
      expect(temporalisResult.status).toBe("positive");

      // Masseter should NOT be local myalgia (has referred)
      const masseterResult = evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "right",
        region: "masseter",
      });
      expect(masseterResult.status).toBe("negative");
    });
  });

  describe("diagnosis definition", () => {
    it("has correct metadata", () => {
      expect(LOCAL_MYALGIA.id).toBe("localMyalgia");
      expect(LOCAL_MYALGIA.name).toBe("Local Myalgia");
      expect(LOCAL_MYALGIA.nameDE).toBe("Lokale Myalgie");
      expect(LOCAL_MYALGIA.category).toBe("pain");
    });

    it("targets temporalis and masseter regions", () => {
      expect(LOCAL_MYALGIA_EXAMINATION.regions).toContain("temporalis");
      expect(LOCAL_MYALGIA_EXAMINATION.regions).toContain("masseter");
      expect(LOCAL_MYALGIA_EXAMINATION.regions).toHaveLength(2);
    });

    it("shares anamnesis with base myalgia", () => {
      expect(LOCAL_MYALGIA.anamnesis).toBe(MYALGIA_ANAMNESIS);
    });
  });
});

// ============================================================================
// MYOFASCIAL PAIN WITH SPREADING
// ============================================================================

describe("Myofascial Pain with Spreading diagnosis", () => {
  describe("examination criteria", () => {
    it("positive: familiar pain + spreading, no referred", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "yes",
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("positive");
    });

    it("positive: masseter with spreading", () => {
      const data = patient({
        e1: { painLocation: { right: ["masseter"] } },
        e9: {
          right: {
            masseterOrigin: palpationSite({
              familiarPain: "yes",
              spreadingPain: "yes",
              referredPain: "no",
            }),
            masseterBody: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            masseterInsertion: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, {
        side: "right",
        region: "masseter",
      });
      expect(result.status).toBe("positive");
    });

    it("negative: has referred pain (should be referral, not spreading)", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "yes",
              referredPain: "yes", // referred → not spreading subtype
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("negative");
    });

    it("negative: no spreading pain (should be local, not spreading)", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("negative");
    });

    it("negative: no familiar pain from palpation", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "yes",
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("negative");
    });
  });

  describe("region isolation", () => {
    it("spreading at masseter does NOT cause positive for temporalis", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis", "masseter"] } },
        e9: {
          left: {
            // Temporalis: familiar pain but NO spreading
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            // Masseter: has spreading
            masseterOrigin: palpationSite({
              familiarPain: "yes",
              spreadingPain: "yes",
              referredPain: "no",
            }),
            masseterBody: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            masseterInsertion: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      // Temporalis: NOT spreading (no spreading at temporalis sites)
      const temporalisResult = evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(temporalisResult.status).toBe("negative");

      // Masseter: IS spreading
      const masseterResult = evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, {
        side: "left",
        region: "masseter",
      });
      expect(masseterResult.status).toBe("positive");
    });
  });

  describe("diagnosis definition", () => {
    it("has correct metadata", () => {
      expect(MYOFASCIAL_PAIN_WITH_SPREADING.id).toBe("myofascialPainWithSpreading");
      expect(MYOFASCIAL_PAIN_WITH_SPREADING.name).toBe("Myofascial Pain with Spreading");
      expect(MYOFASCIAL_PAIN_WITH_SPREADING.nameDE).toBe("Myofaszialer Schmerz");
      expect(MYOFASCIAL_PAIN_WITH_SPREADING.category).toBe("pain");
    });

    it("shares anamnesis with base myalgia", () => {
      expect(MYOFASCIAL_PAIN_WITH_SPREADING.anamnesis).toBe(MYALGIA_ANAMNESIS);
    });
  });
});

// ============================================================================
// MYOFASCIAL PAIN WITH REFERRAL
// ============================================================================

describe("Myofascial Pain with Referral diagnosis", () => {
  describe("examination criteria", () => {
    it("positive: familiar pain + referred pain", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              referredPain: "yes",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("positive");
    });

    it("positive: referred pain with spreading also present", () => {
      // Referral takes precedence — spreading is irrelevant for this diagnosis
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "yes",
              referredPain: "yes",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("positive");
    });

    it("positive: masseter with referred pain", () => {
      const data = patient({
        e1: { painLocation: { right: ["masseter"] } },
        e9: {
          right: {
            masseterBody: palpationSite({
              familiarPain: "yes",
              referredPain: "yes",
            }),
            masseterOrigin: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
            masseterInsertion: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, {
        side: "right",
        region: "masseter",
      });
      expect(result.status).toBe("positive");
    });

    it("negative: no referred pain", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              spreadingPain: "yes",
              referredPain: "no",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              spreadingPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("negative");
    });

    it("negative: no familiar pain from palpation", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            temporalisPosterior: palpationSite({
              familiarPain: "no",
              referredPain: "yes",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("negative");
    });

    it("pending: referred pain data missing", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis"] } },
        e9: {
          left: {
            // Only familiar pain data (no referred)
            temporalisPosterior: palpationSite({ familiarPain: "yes" }),
            temporalisMiddle: palpationSite({ familiarPain: "no" }),
            temporalisAnterior: palpationSite({ familiarPain: "no" }),
          },
        },
      });

      const result = evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(result.status).toBe("pending");
    });
  });

  describe("region isolation", () => {
    it("referred at temporalis does NOT cause positive for masseter", () => {
      const data = patient({
        e1: { painLocation: { left: ["temporalis", "masseter"] } },
        e9: {
          left: {
            // Temporalis: has referred pain
            temporalisPosterior: palpationSite({
              familiarPain: "yes",
              referredPain: "yes",
            }),
            temporalisMiddle: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
            temporalisAnterior: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
            // Masseter: familiar pain but no referred
            masseterOrigin: palpationSite({
              familiarPain: "yes",
              referredPain: "no",
            }),
            masseterBody: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
            masseterInsertion: palpationSite({
              familiarPain: "no",
              referredPain: "no",
            }),
          },
        },
      });

      // Temporalis: IS referral
      const temporalisResult = evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      });
      expect(temporalisResult.status).toBe("positive");

      // Masseter: NOT referral (no referred at masseter sites)
      const masseterResult = evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, {
        side: "left",
        region: "masseter",
      });
      expect(masseterResult.status).toBe("negative");
    });
  });

  describe("diagnosis definition", () => {
    it("has correct metadata", () => {
      expect(MYOFASCIAL_PAIN_WITH_REFERRAL.id).toBe("myofascialPainWithReferral");
      expect(MYOFASCIAL_PAIN_WITH_REFERRAL.name).toBe("Myofascial Pain with Referral");
      expect(MYOFASCIAL_PAIN_WITH_REFERRAL.nameDE).toBe("Myofaszialer Schmerz mit Übertragung");
      expect(MYOFASCIAL_PAIN_WITH_REFERRAL.category).toBe("pain");
    });

    it("shares anamnesis with base myalgia", () => {
      expect(MYOFASCIAL_PAIN_WITH_REFERRAL.anamnesis).toBe(MYALGIA_ANAMNESIS);
    });
  });
});

// ============================================================================
// MUTUAL EXCLUSIVITY
// ============================================================================

describe("Myalgia subtype mutual exclusivity", () => {
  it("local pain: only local myalgia positive", () => {
    const data = patient({
      e1: { painLocation: { left: ["temporalis"] } },
      e9: {
        left: {
          temporalisPosterior: palpationSite({
            familiarPain: "yes",
            spreadingPain: "no",
            referredPain: "no",
          }),
          temporalisMiddle: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
          temporalisAnterior: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
        },
      },
    });

    const ctx = { side: "left" as const, region: "temporalis" as const };

    expect(evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, ctx).status).toBe("positive");
    expect(evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, ctx).status).toBe("negative");
    expect(evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, ctx).status).toBe("negative");
  });

  it("spreading pain: only spreading myalgia positive", () => {
    const data = patient({
      e1: { painLocation: { left: ["temporalis"] } },
      e9: {
        left: {
          temporalisPosterior: palpationSite({
            familiarPain: "yes",
            spreadingPain: "yes",
            referredPain: "no",
          }),
          temporalisMiddle: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
          temporalisAnterior: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
        },
      },
    });

    const ctx = { side: "left" as const, region: "temporalis" as const };

    expect(evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, ctx).status).toBe("negative");
    expect(evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, ctx).status).toBe("positive");
    expect(evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, ctx).status).toBe("negative");
  });

  it("referred pain: only referral myalgia positive (spreading excluded)", () => {
    const data = patient({
      e1: { painLocation: { left: ["temporalis"] } },
      e9: {
        left: {
          temporalisPosterior: palpationSite({
            familiarPain: "yes",
            spreadingPain: "no",
            referredPain: "yes",
          }),
          temporalisMiddle: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
          temporalisAnterior: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
        },
      },
    });

    const ctx = { side: "left" as const, region: "temporalis" as const };

    expect(evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, ctx).status).toBe("negative");
    expect(evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, ctx).status).toBe("negative");
    expect(evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, ctx).status).toBe("positive");
  });

  it("both spreading and referred: only referral positive", () => {
    const data = patient({
      e1: { painLocation: { left: ["temporalis"] } },
      e9: {
        left: {
          temporalisPosterior: palpationSite({
            familiarPain: "yes",
            spreadingPain: "yes",
            referredPain: "yes",
          }),
          temporalisMiddle: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
          temporalisAnterior: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
        },
      },
    });

    const ctx = { side: "left" as const, region: "temporalis" as const };

    expect(evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, ctx).status).toBe("negative");
    expect(evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, ctx).status).toBe("negative");
    expect(evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, ctx).status).toBe("positive");
  });
});

// ============================================================================
// PALPATION-ONLY REQUIREMENT
// ============================================================================

describe("Subtypes require palpation-only familiar pain (not E4 opening)", () => {
  it("familiar pain from E4 opening only: subtypes are pending/negative", () => {
    const data = patient({
      e1: { painLocation: { left: ["temporalis"] } },
      // E4 opening has familiar pain, but E9 palpation does NOT
      e4: {
        maxUnassisted: { left: { temporalis: { familiarPain: "yes" } } },
      },
      e9: {
        left: {
          temporalisPosterior: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
          temporalisMiddle: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
          temporalisAnterior: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
        },
      },
    });

    const ctx = { side: "left" as const, region: "temporalis" as const };

    // All subtypes should be negative — they require palpation familiar pain
    expect(evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, ctx).status).toBe("negative");
    expect(evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, ctx).status).toBe("negative");
    expect(evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, ctx).status).toBe("negative");
  });
});

// ============================================================================
// CLINICAL SCENARIOS
// ============================================================================

describe("Clinical scenarios", () => {
  it("bilateral: local myalgia right masseter + spreading left temporalis", () => {
    const data = patient({
      e1: {
        painLocation: {
          left: ["temporalis"],
          right: ["masseter"],
        },
      },
      e9: {
        left: {
          temporalisPosterior: palpationSite({
            familiarPain: "yes",
            spreadingPain: "yes",
            referredPain: "no",
          }),
          temporalisMiddle: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
          temporalisAnterior: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
        },
        right: {
          masseterOrigin: palpationSite({
            familiarPain: "yes",
            spreadingPain: "no",
            referredPain: "no",
          }),
          masseterBody: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
          masseterInsertion: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
        },
      },
    });

    // Left temporalis → spreading
    expect(
      evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      }).status
    ).toBe("positive");
    expect(
      evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "left",
        region: "temporalis",
      }).status
    ).toBe("negative");

    // Right masseter → local
    expect(
      evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, {
        side: "right",
        region: "masseter",
      }).status
    ).toBe("positive");
    expect(
      evaluate(MYOFASCIAL_SPREADING_EXAMINATION.criterion, data, {
        side: "right",
        region: "masseter",
      }).status
    ).toBe("negative");
  });

  it("multiple sites positive in same region", () => {
    const data = patient({
      e1: { painLocation: { left: ["masseter"] } },
      e9: {
        left: {
          masseterOrigin: palpationSite({
            familiarPain: "yes",
            spreadingPain: "no",
            referredPain: "no",
          }),
          masseterBody: palpationSite({
            familiarPain: "yes",
            spreadingPain: "no",
            referredPain: "yes", // referred at a different site
          }),
          masseterInsertion: palpationSite({
            familiarPain: "no",
            spreadingPain: "no",
            referredPain: "no",
          }),
        },
      },
    });

    const ctx = { side: "left" as const, region: "masseter" as const };

    // Referred pain at any site → referral diagnosis
    expect(evaluate(MYOFASCIAL_REFERRAL_EXAMINATION.criterion, data, ctx).status).toBe("positive");
    // Local myalgia excluded (referred present)
    expect(evaluate(LOCAL_MYALGIA_EXAMINATION.criterion, data, ctx).status).toBe("negative");
  });
});
