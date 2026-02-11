import { describe, it, expect } from "vitest";
import { getRelevantExaminationItems, getPerDiagnosisAnamnesisResults, getAnamnesisCriteriaSummary, collectFieldRefs } from "../relevance";
import { ALL_DIAGNOSES } from "../index";
import { MYALGIA } from "../diagnoses/myalgia";
import { MYALGIA_SUBTYPE_IDS } from "../../ids/diagnosis";
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

// ============================================================================
// getPerDiagnosisAnamnesisResults
// ============================================================================

describe("getPerDiagnosisAnamnesisResults", () => {
  it("returns exactly 9 diagnoses (12 minus 3 myalgia subtypes)", () => {
    const results = getPerDiagnosisAnamnesisResults({});
    expect(results).toHaveLength(9);
  });

  it("never contains myalgia subtypes", () => {
    const results = getPerDiagnosisAnamnesisResults({});
    const ids = results.map((r) => r.id);
    for (const subtypeId of MYALGIA_SUBTYPE_IDS) {
      expect(ids).not.toContain(subtypeId);
    }
  });

  it("contains correct category and nameDE fields", () => {
    const results = getPerDiagnosisAnamnesisResults({});
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.myalgia.category).toBe("pain");
    expect(byId.myalgia.nameDE).toBe("Myalgie");

    expect(byId.arthralgia.category).toBe("pain");
    expect(byId.arthralgia.nameDE).toBe("Arthralgie");

    expect(byId.headacheAttributedToTmd.category).toBe("pain");

    expect(byId.discDisplacementWithReduction.category).toBe("joint");
    expect(byId.degenerativeJointDisease.category).toBe("joint");
    expect(byId.subluxation.category).toBe("joint");
    expect(byId.subluxation.nameDE).toBe("Subluxation");
  });

  it("shows pain diagnoses as positive when SQ1+SQ3+SQ4 are positive", () => {
    const results = getPerDiagnosisAnamnesisResults({
      SQ1: "yes",
      SQ3: "intermittent",
      SQ4_A: "yes",
    });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.myalgia.anamnesisStatus).toBe("positive");
    expect(byId.arthralgia.anamnesisStatus).toBe("positive");

    // Myalgia needs e1, e4, e9
    expect(byId.myalgia.examinationSections).toContain("e1");
    expect(byId.myalgia.examinationSections).toContain("e4");
    expect(byId.myalgia.examinationSections).toContain("e9");

    // Arthralgia needs e1, e4, e5, e9
    expect(byId.arthralgia.examinationSections).toContain("e1");
    expect(byId.arthralgia.examinationSections).toContain("e5");
    expect(byId.arthralgia.examinationSections).toContain("e9");
  });

  it("shows headache as positive when SQ5+SQ7 are positive", () => {
    const results = getPerDiagnosisAnamnesisResults({
      SQ5: "yes",
      SQ7_A: "yes",
    });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.headacheAttributedToTmd.anamnesisStatus).toBe("positive");
  });

  it("shows DD with Reduction and DJD as positive when SQ8=yes", () => {
    const results = getPerDiagnosisAnamnesisResults({
      SQ8: "yes",
    });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.discDisplacementWithReduction.anamnesisStatus).toBe("positive");
    expect(byId.degenerativeJointDisease.anamnesisStatus).toBe("positive");

    // Both need e6, e7
    expect(byId.discDisplacementWithReduction.examinationSections).toContain("e6");
    expect(byId.discDisplacementWithReduction.examinationSections).toContain("e7");
    expect(byId.degenerativeJointDisease.examinationSections).toContain("e6");
    expect(byId.degenerativeJointDisease.examinationSections).toContain("e7");
  });

  it("shows DD without Reduction variants as positive when SQ9+SQ10 are positive", () => {
    const results = getPerDiagnosisAnamnesisResults({
      SQ9: "yes",
      SQ10: "yes",
    });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.discDisplacementWithoutReductionLimitedOpening.anamnesisStatus).toBe("positive");
    expect(byId.discDisplacementWithoutReductionWithoutLimitedOpening.anamnesisStatus).toBe("positive");

    // DD without Reduction needs e2, e4
    expect(byId.discDisplacementWithoutReductionLimitedOpening.examinationSections).toContain("e2");
    expect(byId.discDisplacementWithoutReductionLimitedOpening.examinationSections).toContain("e4");
  });

  it("shows Subluxation as positive when SQ13+SQ14 are positive, with empty exam sections", () => {
    const results = getPerDiagnosisAnamnesisResults({
      SQ13: "yes",
      SQ14: "yes",
    });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.subluxation.anamnesisStatus).toBe("positive");
    // Subluxation has no examination sections (diagnosis is anamnesis-only for criteria purposes)
    expect(byId.subluxation.examinationSections).toEqual([]);
  });

  it("shows DD/DJD as pending (not negative) when SQ8=no due to E6/E7 patient noise refs", () => {
    const results = getPerDiagnosisAnamnesisResults({
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
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    // DD with Reduction and DJD have TMJ_NOISE_ANAMNESIS which includes
    // OR(SQ8, e6/e7 patient noise). SQ8=no but E6/E7 absent → pending
    expect(byId.discDisplacementWithReduction.anamnesisStatus).toBe("pending");
    expect(byId.degenerativeJointDisease.anamnesisStatus).toBe("pending");

    // Pain diagnoses should be negative
    expect(byId.myalgia.anamnesisStatus).toBe("negative");
    expect(byId.arthralgia.anamnesisStatus).toBe("negative");
    expect(byId.headacheAttributedToTmd.anamnesisStatus).toBe("negative");

    // Subluxation should be negative (SQ13=no, SQ14=no)
    expect(byId.subluxation.anamnesisStatus).toBe("negative");
  });

  it("orders results: pain disorders first, then joint disorders", () => {
    const results = getPerDiagnosisAnamnesisResults({});
    const categories = results.map((r) => r.category);

    const firstJointIdx = categories.indexOf("joint");
    const lastPainIdx = categories.lastIndexOf("pain");

    // All pain diagnoses should come before all joint diagnoses
    expect(lastPainIdx).toBeLessThan(firstJointIdx);
  });
});

// ============================================================================
// getAnamnesisCriteriaSummary
// ============================================================================

describe("getAnamnesisCriteriaSummary", () => {
  it("returns exactly 10 criteria", () => {
    const results = getAnamnesisCriteriaSummary({});
    expect(results).toHaveLength(10);
  });

  it("returns all expected criteria IDs", () => {
    const results = getAnamnesisCriteriaSummary({});
    const ids = results.map((r) => r.id);
    expect(ids).toEqual([
      "painInMasticatory",
      "painModified",
      "headacheInTemporalRegion",
      "headacheModified",
      "tmjNoiseAnamnesis",
      "jawLocking",
      "lockingAffectsEating",
      "intermittentLocking",
      "jawLockingOpenPosition",
      "unableToCloseWithoutManeuver",
    ]);
  });

  it("all criteria have labels", () => {
    const results = getAnamnesisCriteriaSummary({});
    for (const r of results) {
      expect(r.label).toBeTruthy();
    }
  });

  it("shows pain criteria as positive when SQ1+SQ3+SQ4 are positive", () => {
    const results = getAnamnesisCriteriaSummary({
      SQ1: "yes",
      SQ3: "intermittent",
      SQ4_A: "yes",
    });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.painInMasticatory.status).toBe("positive");
    expect(byId.painModified.status).toBe("positive");
  });

  it("shows pain criteria as negative when SQ1=no", () => {
    const results = getAnamnesisCriteriaSummary({
      SQ1: "no",
      SQ3: "never",
    });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.painInMasticatory.status).toBe("negative");
  });

  it("shows headache criteria correctly", () => {
    const results = getAnamnesisCriteriaSummary({
      SQ5: "yes",
      SQ7_A: "yes",
    });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.headacheInTemporalRegion.status).toBe("positive");
    expect(byId.headacheModified.status).toBe("positive");
  });

  it("shows TMJ noise as positive when SQ8=yes", () => {
    const results = getAnamnesisCriteriaSummary({ SQ8: "yes" });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.tmjNoiseAnamnesis.status).toBe("positive");
  });

  it("shows TMJ noise as pending (not negative) when SQ8=no due to E6/E7 patient noise refs", () => {
    const results = getAnamnesisCriteriaSummary({ SQ8: "no" });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.tmjNoiseAnamnesis.status).toBe("pending");
  });

  it("shows jaw locking (SQ9) as positive when SQ9=yes", () => {
    const results = getAnamnesisCriteriaSummary({ SQ9: "yes" });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.jawLocking.status).toBe("positive");
    expect(byId.lockingAffectsEating.status).toBe("pending");
  });

  it("shows locking affects eating (SQ10) as positive when SQ10=yes", () => {
    const results = getAnamnesisCriteriaSummary({ SQ10: "yes" });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.lockingAffectsEating.status).toBe("positive");
  });

  it("shows intermittent locking (SQ11+SQ12) as positive when SQ11=yes and SQ12=no", () => {
    const results = getAnamnesisCriteriaSummary({ SQ11: "yes", SQ12: "no" });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.intermittentLocking.status).toBe("positive");
  });

  it("shows jaw locking open position (SQ13) as positive when SQ13=yes", () => {
    const results = getAnamnesisCriteriaSummary({ SQ13: "yes" });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.jawLockingOpenPosition.status).toBe("positive");
    expect(byId.unableToCloseWithoutManeuver.status).toBe("pending");
  });

  it("shows unable to close without maneuver (SQ14) as positive when SQ14=yes", () => {
    const results = getAnamnesisCriteriaSummary({ SQ14: "yes" });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId.unableToCloseWithoutManeuver.status).toBe("positive");
  });

  it("shows all criteria as pending or negative with empty data", () => {
    const results = getAnamnesisCriteriaSummary({});
    for (const r of results) {
      expect(["pending", "negative"]).toContain(r.status);
    }
  });
});
