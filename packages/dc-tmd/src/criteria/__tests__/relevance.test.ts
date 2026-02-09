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
    it("returns relevant sections when anamnesis is positive", () => {
      const result = getRelevantExaminationItems(positiveAnamnesis);

      // All myalgia diagnoses share the same anamnesis → all possible
      expect(result.possibleDiagnoses).toContain("myalgia");
      expect(result.possibleDiagnoses).toContain("localMyalgia");
      expect(result.possibleDiagnoses).toContain("myofascialPainWithSpreading");
      expect(result.possibleDiagnoses).toContain("myofascialPainWithReferral");
      expect(result.ruledOutDiagnoses).toEqual([]);

      // Myalgia diagnoses reference e1, e4, e9
      expect(result.relevantSections).toContain("e1");
      expect(result.relevantSections).toContain("e4");
      expect(result.relevantSections).toContain("e9");

      // Sections not referenced by any current diagnosis
      expect(result.relevantSections).not.toContain("e2");
      expect(result.relevantSections).not.toContain("e3");
      expect(result.relevantSections).not.toContain("e5");
      expect(result.relevantSections).not.toContain("e6");
      expect(result.relevantSections).not.toContain("e7");
      expect(result.relevantSections).not.toContain("e8");
    });

    it("rules out all diagnoses when anamnesis is negative", () => {
      const result = getRelevantExaminationItems(negativeAnamnesis);

      // All myalgia diagnoses ruled out
      expect(result.ruledOutDiagnoses).toContain("myalgia");
      expect(result.ruledOutDiagnoses).toContain("localMyalgia");
      expect(result.ruledOutDiagnoses).toContain("myofascialPainWithSpreading");
      expect(result.ruledOutDiagnoses).toContain("myofascialPainWithReferral");
      expect(result.possibleDiagnoses).toEqual([]);

      // No relevant sections
      expect(result.relevantSections).toEqual([]);
      expect(result.relevantFieldRefs).toEqual([]);
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
    it("rules out diagnoses when criterion A fails (SQ1=no)", () => {
      const result = getRelevantExaminationItems({
        SQ1: "no",
        SQ3: "intermittent",
        SQ4_A: "yes",
      });

      // SQ1=no → painInMasticatoryStructure=negative → AND=negative
      expect(result.ruledOutDiagnoses.length).toBe(ALL_DIAGNOSES.length);
      expect(result.possibleDiagnoses).toEqual([]);
    });

    it("rules out diagnoses when criterion B fails (all SQ4=no)", () => {
      const result = getRelevantExaminationItems({
        SQ1: "yes",
        SQ3: "intermittent",
        SQ4_A: "no",
        SQ4_B: "no",
        SQ4_C: "no",
        SQ4_D: "no",
      });

      // All SQ4 answered "no" → painModifiedByFunction=negative → AND=negative
      expect(result.ruledOutDiagnoses.length).toBe(ALL_DIAGNOSES.length);
      expect(result.possibleDiagnoses).toEqual([]);
    });

    it("rules out diagnoses when SQ3 is never", () => {
      const result = getRelevantExaminationItems({
        SQ1: "yes",
        SQ3: "never",
        SQ4_A: "yes",
      });

      // SQ3 = "never" → neither "intermittent" nor "continuous" → negative
      expect(result.ruledOutDiagnoses.length).toBe(ALL_DIAGNOSES.length);
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
