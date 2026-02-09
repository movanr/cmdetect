import { describe, it, expect } from "vitest";
import { getRelevantExaminationItems, collectFieldRefs } from "../relevance";
import { ALL_DIAGNOSES } from "../index";
import { MYALGIA } from "../diagnoses/myalgia";
import { field, and, or, not, any, all, threshold, computed, match } from "../builders";

// ============================================================================
// collectFieldRefs
// ============================================================================

describe("collectFieldRefs", () => {
  it("extracts ref from a field criterion", () => {
    const c = field("e1.painLocation.left", { includes: "temporalis" });
    expect(collectFieldRefs(c)).toEqual(["e1.painLocation.left"]);
  });

  it("extracts ref from a threshold criterion", () => {
    const c = threshold("e4.maxUnassisted.measurement", ">=", 40);
    expect(collectFieldRefs(c)).toEqual(["e4.maxUnassisted.measurement"]);
  });

  it("extracts refs from a computed criterion", () => {
    const c = computed(
      ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
      () => 0,
      ">=",
      40
    );
    expect(collectFieldRefs(c)).toEqual([
      "e4.maxAssisted.measurement",
      "e2.verticalOverlap",
    ]);
  });

  it("returns empty for match criterion", () => {
    const c = match("${region}", "temporalis");
    expect(collectFieldRefs(c)).toEqual([]);
  });

  it("extracts refs from AND/OR composites", () => {
    const c = and([
      field("e1.painLocation.left", { includes: "temporalis" }),
      or([
        field("e4.maxUnassisted.left.temporalis.familiarPain", { equals: "yes" }),
        field("e9.left.temporalisAnterior.familiarPain", { equals: "yes" }),
      ]),
    ]);
    expect(collectFieldRefs(c)).toEqual([
      "e1.painLocation.left",
      "e4.maxUnassisted.left.temporalis.familiarPain",
      "e9.left.temporalisAnterior.familiarPain",
    ]);
  });

  it("extracts refs from NOT criterion", () => {
    const c = not(field("e9.left.temporalisAnterior.spreadingPain", { equals: "yes" }));
    expect(collectFieldRefs(c)).toEqual(["e9.left.temporalisAnterior.spreadingPain"]);
  });

  it("extracts refs from ANY/ALL quantifiers", () => {
    const anyC = any(
      ["e9.left.temporalisPosterior.familiarPain", "e9.left.temporalisMiddle.familiarPain"],
      { equals: "yes" }
    );
    const allC = all(
      ["sq.SQ4_A", "sq.SQ4_B"],
      { equals: "yes" }
    );
    expect(collectFieldRefs(anyC)).toEqual([
      "e9.left.temporalisPosterior.familiarPain",
      "e9.left.temporalisMiddle.familiarPain",
    ]);
    expect(collectFieldRefs(allC)).toEqual(["sq.SQ4_A", "sq.SQ4_B"]);
  });

  it("extracts refs from real MYALGIA examination criterion", () => {
    const refs = collectFieldRefs(MYALGIA.examination.criterion);
    // Should contain e1, e4, and e9 refs
    expect(refs.some((r) => r.startsWith("e1."))).toBe(true);
    expect(refs.some((r) => r.startsWith("e4."))).toBe(true);
    expect(refs.some((r) => r.startsWith("e9."))).toBe(true);
  });
});

// ============================================================================
// getRelevantExaminationItems
// ============================================================================

describe("getRelevantExaminationItems", () => {
  // Positive anamnesis: SQ1=yes, SQ3=intermittent, SQ4_A=yes
  const positiveAnamnesis = {
    SQ1: "yes",
    SQ3: "intermittent",
    SQ4_A: "yes",
  };

  // Negative anamnesis: SQ1=no (no pain in masticatory structure)
  const negativeAnamnesis = {
    SQ1: "no",
    SQ3: "never",
    SQ4_A: "no",
  };

  // Partial/pending anamnesis: SQ1=yes but SQ4 missing
  const pendingAnamnesis = {
    SQ1: "yes",
    SQ3: "intermittent",
  };

  describe("with all current diagnoses", () => {
    it("returns relevant sections when myalgia anamnesis is positive", () => {
      const result = getRelevantExaminationItems(positiveAnamnesis);

      // All myalgia/arthralgia diagnoses share the same anamnesis → all possible
      expect(result.possibleDiagnoses).toContain("myalgia");
      expect(result.possibleDiagnoses).toContain("localMyalgia");
      expect(result.possibleDiagnoses).toContain("myofascialPainWithSpreading");
      expect(result.possibleDiagnoses).toContain("myofascialPainWithReferral");
      expect(result.possibleDiagnoses).toContain("arthralgia");

      // Joint disorders + headache have different anamnesis criteria (SQ5/SQ7/SQ8/SQ9/SQ13/SQ14)
      // which are pending with only pain anamnesis data → still possible
      expect(result.possibleDiagnoses).toContain("discDisplacementWithReduction");
      expect(result.possibleDiagnoses).toContain("subluxation");

      // Myalgia diagnoses reference e1, e4, e9
      expect(result.relevantSections).toContain("e1");
      expect(result.relevantSections).toContain("e4");
      expect(result.relevantSections).toContain("e9");

      // Joint disorders reference e2, e5, e6, e7
      expect(result.relevantSections).toContain("e2");
      expect(result.relevantSections).toContain("e5");
      expect(result.relevantSections).toContain("e6");
      expect(result.relevantSections).toContain("e7");

      // E3 and E8 not referenced by any diagnosis
      expect(result.relevantSections).not.toContain("e3");
      expect(result.relevantSections).not.toContain("e8");
    });

    it("rules out pain diagnoses when pain anamnesis is negative, joint diagnoses remain possible", () => {
      const result = getRelevantExaminationItems(negativeAnamnesis);

      // All myalgia/arthralgia diagnoses ruled out
      expect(result.ruledOutDiagnoses).toContain("myalgia");
      expect(result.ruledOutDiagnoses).toContain("localMyalgia");
      expect(result.ruledOutDiagnoses).toContain("myofascialPainWithSpreading");
      expect(result.ruledOutDiagnoses).toContain("myofascialPainWithReferral");
      expect(result.ruledOutDiagnoses).toContain("arthralgia");

      // Joint disorders and headache have different anamnesis → pending (SQ8, SQ9, etc. not provided)
      expect(result.possibleDiagnoses).toContain("discDisplacementWithReduction");
      expect(result.possibleDiagnoses).toContain("degenerativeJointDisease");
      expect(result.possibleDiagnoses).toContain("subluxation");

      // Headache has its own anamnesis (SQ5/SQ7) — also pending
      expect(result.possibleDiagnoses).toContain("headacheAttributedToTmd");
    });

    it("keeps diagnoses possible when anamnesis is pending", () => {
      const result = getRelevantExaminationItems(pendingAnamnesis);

      // SQ4 fields are missing → painModifiedByFunction is pending
      // AND(painInMasticatory=positive, painModified=pending) → pending (not negative)
      expect(result.possibleDiagnoses.length).toBe(ALL_DIAGNOSES.length);
      expect(result.ruledOutDiagnoses).toEqual([]);
      expect(result.relevantSections.length).toBeGreaterThan(0);
    });

    it("returns sorted section IDs", () => {
      const result = getRelevantExaminationItems(positiveAnamnesis);

      const sorted = [...result.relevantSections].sort();
      expect(result.relevantSections).toEqual(sorted);
    });
  });

  describe("with partial anamnesis failure", () => {
    it("rules out pain diagnoses when criterion A fails (SQ1=no), joint diagnoses remain", () => {
      const result = getRelevantExaminationItems({
        SQ1: "no",
        SQ3: "intermittent",
        SQ4_A: "yes",
      });

      // Myalgia/arthralgia ruled out (SQ1=no → painInMasticatory=negative)
      expect(result.ruledOutDiagnoses).toContain("myalgia");
      expect(result.ruledOutDiagnoses).toContain("arthralgia");

      // Joint disorders still possible (their anamnesis uses SQ8/SQ9/SQ13, all pending)
      expect(result.possibleDiagnoses).toContain("discDisplacementWithReduction");
      expect(result.possibleDiagnoses).toContain("subluxation");
    });

    it("rules out pain diagnoses when criterion B fails (all SQ4=no), joint diagnoses remain", () => {
      const result = getRelevantExaminationItems({
        SQ1: "yes",
        SQ3: "intermittent",
        SQ4_A: "no",
        SQ4_B: "no",
        SQ4_C: "no",
        SQ4_D: "no",
      });

      // Pain diagnoses ruled out (painModifiedByFunction=negative)
      expect(result.ruledOutDiagnoses).toContain("myalgia");
      expect(result.ruledOutDiagnoses).toContain("arthralgia");
      expect(result.possibleDiagnoses).not.toContain("myalgia");

      // Joint disorders still possible
      expect(result.possibleDiagnoses).toContain("subluxation");
    });

    it("rules out pain diagnoses when SQ3 is never, joint diagnoses remain", () => {
      const result = getRelevantExaminationItems({
        SQ1: "yes",
        SQ3: "never",
        SQ4_A: "yes",
      });

      // SQ3 = "never" → neither "intermittent" nor "continuous" → negative for pain diagnoses
      expect(result.ruledOutDiagnoses).toContain("myalgia");
      // Joint disorders still possible
      expect(result.possibleDiagnoses).toContain("subluxation");
    });

    it("rules out all diagnoses when all SQ answers are negative (DD/DJD remain pending due to E6/E7 patient noise)", () => {
      const result = getRelevantExaminationItems({
        SQ1: "no",
        SQ3: "never",
        SQ4_A: "no",
        SQ4_B: "no",
        SQ4_C: "no",
        SQ4_D: "no",
        SQ5: "no",
        SQ7_A: "no",
        SQ7_B: "no",
        SQ7_C: "no",
        SQ7_D: "no",
        SQ8: "no",
        SQ9: "no",
        SQ10: "no",
        SQ11: "no",
        SQ13: "no",
        SQ14: "no",
      });

      // DD with Reduction and Degenerative Joint Disease have TMJ_NOISE_ANAMNESIS
      // which includes OR(SQ8, e6/e7 patient noise). With SQ8=no but E6/E7 patient
      // fields absent, the OR is pending (not negative). This is correct — the examiner
      // might discover patient-reported noise during the exam.
      expect(result.ruledOutDiagnoses.length).toBe(ALL_DIAGNOSES.length - 2);
      expect(result.possibleDiagnoses).toContain("discDisplacementWithReduction");
      expect(result.possibleDiagnoses).toContain("degenerativeJointDisease");
    });
  });

  describe("with custom diagnosis list", () => {
    it("accepts a subset of diagnoses", () => {
      const result = getRelevantExaminationItems(positiveAnamnesis, [MYALGIA]);

      expect(result.possibleDiagnoses).toEqual(["myalgia"]);
      // Only base myalgia refs (includes e4 for opening familiar pain)
      expect(result.relevantSections).toContain("e4");
    });
  });
});
