import { describe, it, expect } from "vitest";
import { extractClinicalFindings } from "../extract";
import type { ClinicalFindings, SymptomFinding, HistoryFinding, SignFinding } from "../types";

// ============================================================================
// HELPERS
// ============================================================================

/** Build minimal SQ data */
function sqData(fields: Record<string, unknown>) {
  return { sq: fields };
}

/** Find symptoms by domain */
function symptomsByDomain(findings: ClinicalFindings, domain: string): SymptomFinding[] {
  return findings.symptoms.filter((s) => s.domain === domain);
}

/** Find history by field */
function historyByField(findings: ClinicalFindings, field: string): HistoryFinding | undefined {
  return findings.history.find((h) => h.field === field);
}

/** Find signs by section and field pattern */
function signsBySection(findings: ClinicalFindings, section: string): SignFinding[] {
  return findings.signs.filter((s) => s.section === section);
}

// ============================================================================
// SYMPTOM TESTS
// ============================================================================

describe("extractClinicalFindings", () => {
  describe("symptoms", () => {
    it("returns empty when no SQ data provided", () => {
      const findings = extractClinicalFindings({});
      expect(findings.symptoms).toHaveLength(0);
    });

    describe("pain location (SQ1+SQ3 + E1a)", () => {
      it("extracts confirmed pain location in temporalis", () => {
        const data = {
          sq: { SQ1: "yes", SQ3: "intermittent" },
          e1: {
            painLocation: {
              left: ["temporalis"],
              right: [],
            },
          },
        };

        const findings = extractClinicalFindings(data);
        const painSymptoms = symptomsByDomain(findings, "painLocation");

        expect(painSymptoms).toHaveLength(1);
        expect(painSymptoms[0].side).toBe("left");
        expect(painSymptoms[0].region).toBe("temporalis");
        expect(painSymptoms[0].sqSources).toEqual(["SQ1", "SQ3"]);
      });

      it("extracts pain location on both sides and multiple regions", () => {
        const data = {
          sq: { SQ1: "yes", SQ3: "continuous" },
          e1: {
            painLocation: {
              left: ["temporalis", "masseter"],
              right: ["tmj"],
            },
          },
        };

        const findings = extractClinicalFindings(data);
        const painSymptoms = symptomsByDomain(findings, "painLocation");

        expect(painSymptoms).toHaveLength(3);
        expect(painSymptoms.map((s) => `${s.side}-${s.region}`).sort()).toEqual([
          "left-masseter",
          "left-temporalis",
          "right-tmj",
        ]);
      });

      it("does NOT extract pain when SQ1=no", () => {
        const data = {
          sq: { SQ1: "no", SQ3: "intermittent" },
          e1: { painLocation: { left: ["temporalis"], right: [] } },
        };

        const findings = extractClinicalFindings(data);
        expect(symptomsByDomain(findings, "painLocation")).toHaveLength(0);
      });

      it("does NOT extract pain when E1a has no matching region", () => {
        const data = {
          sq: { SQ1: "yes", SQ3: "intermittent" },
          e1: { painLocation: { left: [], right: [] } },
        };

        const findings = extractClinicalFindings(data);
        expect(symptomsByDomain(findings, "painLocation")).toHaveLength(0);
      });
    });

    describe("familiar pain — palpation (SQ1+SQ3+SQ4 + E9)", () => {
      it("extracts familiar pain at palpation when E9 confirms", () => {
        const data = {
          sq: { SQ1: "yes", SQ3: "intermittent", SQ4_A: "yes" },
          e9: {
            left: {
              temporalisPosterior: { pain: "yes", familiarPain: "yes" },
              temporalisMiddle: { pain: "no", familiarPain: "no" },
              temporalisAnterior: { pain: "no", familiarPain: "no" },
            },
          },
        };

        const findings = extractClinicalFindings(data);
        const palpation = symptomsByDomain(findings, "familiarPainPalpation");

        expect(palpation).toHaveLength(1);
        expect(palpation[0].side).toBe("left");
        expect(palpation[0].region).toBe("temporalis");
      });

      it("does NOT extract when SQ4 is all no", () => {
        const data = {
          sq: {
            SQ1: "yes",
            SQ3: "intermittent",
            SQ4_A: "no",
            SQ4_B: "no",
            SQ4_C: "no",
            SQ4_D: "no",
          },
          e9: {
            left: {
              temporalisPosterior: { familiarPain: "yes" },
            },
          },
        };

        const findings = extractClinicalFindings(data);
        expect(symptomsByDomain(findings, "familiarPainPalpation")).toHaveLength(0);
      });
    });

    describe("headache location (SQ5 + E1b)", () => {
      it("extracts confirmed headache in temporalis", () => {
        const data = {
          sq: { SQ5: "yes" },
          e1: {
            headacheLocation: {
              left: [],
              right: ["temporalis"],
            },
          },
        };

        const findings = extractClinicalFindings(data);
        const headache = symptomsByDomain(findings, "headacheLocation");

        expect(headache).toHaveLength(1);
        expect(headache[0].side).toBe("right");
        expect(headache[0].region).toBe("temporalis");
      });

      it("does NOT extract when SQ5=no", () => {
        const data = {
          sq: { SQ5: "no" },
          e1: { headacheLocation: { left: ["temporalis"], right: [] } },
        };

        const findings = extractClinicalFindings(data);
        expect(symptomsByDomain(findings, "headacheLocation")).toHaveLength(0);
      });
    });

    describe("TMJ click (SQ8 + E6/E7)", () => {
      it("extracts TMJ click when SQ8=yes and examiner detects click", () => {
        const data = {
          sq: {
            SQ8: "yes",
            SQ8_side: { left: true, right: false },
          },
          e6: {
            left: {
              click: { examinerOpen: "yes", examinerClose: "no" },
              crepitus: { examinerOpen: "no", examinerClose: "no" },
            },
          },
        };

        const findings = extractClinicalFindings(data);
        const clicks = symptomsByDomain(findings, "tmjClick");

        expect(clicks).toHaveLength(1);
        expect(clicks[0].side).toBe("left");
      });

      it("does NOT extract click when SQ8=no", () => {
        const data = {
          sq: { SQ8: "no" },
          e6: {
            left: {
              click: { examinerOpen: "yes" },
            },
          },
        };

        const findings = extractClinicalFindings(data);
        expect(symptomsByDomain(findings, "tmjClick")).toHaveLength(0);
      });
    });

    describe("TMJ crepitus (SQ8 + E6/E7)", () => {
      it("extracts crepitus when SQ8=yes and examiner detects crepitus", () => {
        const data = {
          sq: {
            SQ8: "yes",
            SQ8_side: { left: false, right: true },
          },
          e6: {
            right: {
              click: { examinerOpen: "no", examinerClose: "no" },
              crepitus: { examinerOpen: "yes", examinerClose: "no" },
            },
          },
        };

        const findings = extractClinicalFindings(data);
        const crepitus = symptomsByDomain(findings, "tmjCrepitus");

        expect(crepitus).toHaveLength(1);
        expect(crepitus[0].side).toBe("right");
      });
    });

    describe("subluxation (SQ13+SQ14)", () => {
      it("extracts subluxation when both SQ13 and SQ14 positive", () => {
        const data = {
          sq: {
            SQ13: "yes",
            SQ14: "yes",
            SQ13_side: { left: true, right: true },
            SQ14_side: { left: true, right: true },
          },
        };

        const findings = extractClinicalFindings(data);
        const sublux = symptomsByDomain(findings, "subluxation");

        expect(sublux).toHaveLength(2); // both sides
        expect(sublux[0].relatedDiagnoses).toContain("subluxation");
      });

      it("does NOT extract when SQ14=no", () => {
        const data = {
          sq: { SQ13: "yes", SQ14: "no" },
        };

        const findings = extractClinicalFindings(data);
        expect(symptomsByDomain(findings, "subluxation")).toHaveLength(0);
      });
    });

    describe("intermittent locking (SQ11+SQ12=no + click pattern)", () => {
      it("extracts when SQ11=yes, SQ12=no, and click pattern present", () => {
        const data = {
          sq: {
            SQ11: "yes",
            SQ12: "no",
            SQ11_side: { left: true, right: false },
          },
          e6: {
            left: {
              click: { examinerOpen: "yes", examinerClose: "yes" },
            },
          },
        };

        const findings = extractClinicalFindings(data);
        const locking = symptomsByDomain(findings, "intermittentLocking");

        expect(locking).toHaveLength(1);
        expect(locking[0].side).toBe("left");
      });

      it("does NOT extract when SQ12=yes (currently locked)", () => {
        const data = {
          sq: { SQ11: "yes", SQ12: "yes" },
          e6: {
            left: { click: { examinerOpen: "yes", examinerClose: "yes" } },
          },
        };

        const findings = extractClinicalFindings(data);
        expect(symptomsByDomain(findings, "intermittentLocking")).toHaveLength(0);
      });
    });

    describe("closed locking (SQ9+SQ10 + passive opening)", () => {
      it("extracts closed locking with limited opening", () => {
        const data = {
          sq: {
            SQ9: "yes",
            SQ10: "yes",
            SQ9_side: { left: true, right: false },
            SQ10_side: { left: true, right: false },
          },
          e4: { maxAssisted: { measurement: 30 } },
          e2: { verticalOverlap: 3 },
        };

        const findings = extractClinicalFindings(data);
        const locking = symptomsByDomain(findings, "closedLocking");

        expect(locking).toHaveLength(1);
        expect(locking[0].side).toBe("left");
        expect(locking[0].relatedDiagnoses).toContain(
          "discDisplacementWithoutReductionLimitedOpening"
        );
      });

      it("extracts closed locking without limited opening", () => {
        const data = {
          sq: {
            SQ9: "yes",
            SQ10: "yes",
            SQ9_side: { left: true, right: true },
            SQ10_side: { left: true, right: true },
          },
          e4: { maxAssisted: { measurement: 40 } },
          e2: { verticalOverlap: 3 },
        };

        const findings = extractClinicalFindings(data);
        const locking = symptomsByDomain(findings, "closedLocking");

        expect(locking).toHaveLength(2); // both sides
        expect(locking[0].relatedDiagnoses).toContain(
          "discDisplacementWithoutReductionWithoutLimitedOpening"
        );
      });
    });
  });

  // ============================================================================
  // HISTORY TESTS
  // ============================================================================

  describe("history", () => {
    describe("always-history fields", () => {
      it("extracts SQ2 (pain onset) as temporal history", () => {
        const data = sqData({ SQ2: "5y" });
        const findings = extractClinicalFindings(data);
        const sq2 = historyByField(findings, "SQ2");

        expect(sq2).toBeDefined();
        expect(sq2!.historyType).toBe("temporal");
        expect(sq2!.value).toBe("5y");
      });

      it("extracts SQ3 (frequency) as frequency history", () => {
        const data = sqData({ SQ3: "intermittent" });
        const findings = extractClinicalFindings(data);
        const sq3 = historyByField(findings, "SQ3");

        expect(sq3).toBeDefined();
        expect(sq3!.historyType).toBe("frequency");
      });

      it("extracts SQ6 (headache onset) as temporal history", () => {
        const data = sqData({ SQ6: "2y" });
        const findings = extractClinicalFindings(data);
        const sq6 = historyByField(findings, "SQ6");

        expect(sq6).toBeDefined();
        expect(sq6!.historyType).toBe("temporal");
      });

      it("extracts SQ4 items as functional modification history", () => {
        const data = sqData({
          SQ4_A: "yes",
          SQ4_B: "no",
          SQ4_C: "yes",
          SQ4_D: "no",
        });
        const findings = extractClinicalFindings(data);

        const sq4a = historyByField(findings, "SQ4_A");
        expect(sq4a).toBeDefined();
        expect(sq4a!.historyType).toBe("functionalModification");
        expect(sq4a!.value).toBe("yes");

        const sq4b = historyByField(findings, "SQ4_B");
        expect(sq4b).toBeDefined();
        expect(sq4b!.value).toBe("no");
      });

      it("extracts SQ7 items as functional modification history", () => {
        const data = sqData({ SQ7_A: "yes", SQ7_B: "no", SQ7_C: "no", SQ7_D: "yes" });
        const findings = extractClinicalFindings(data);

        expect(historyByField(findings, "SQ7_A")).toBeDefined();
        expect(historyByField(findings, "SQ7_D")!.value).toBe("yes");
      });

      it("does NOT extract missing fields", () => {
        const data = sqData({});
        const findings = extractClinicalFindings(data);
        expect(historyByField(findings, "SQ2")).toBeUndefined();
      });
    });

    describe("conditionally-history fields", () => {
      it("SQ1=yes becomes unconfirmed history when E1a has no pain", () => {
        const data = {
          sq: { SQ1: "yes", SQ3: "intermittent" },
          e1: { painLocation: { left: [], right: [] } },
        };

        const findings = extractClinicalFindings(data);
        const sq1 = historyByField(findings, "SQ1");

        expect(sq1).toBeDefined();
        expect(sq1!.historyType).toBe("unconfirmed");
      });

      it("SQ1=yes is NOT history when E1a confirms pain", () => {
        const data = {
          sq: { SQ1: "yes", SQ3: "intermittent" },
          e1: { painLocation: { left: ["temporalis"], right: [] } },
        };

        const findings = extractClinicalFindings(data);
        const sq1 = historyByField(findings, "SQ1");

        expect(sq1).toBeUndefined(); // Confirmed → symptom, not history
      });

      it("SQ5=yes becomes unconfirmed history when E1b has no headache", () => {
        const data = {
          sq: { SQ5: "yes" },
          e1: { headacheLocation: { left: [], right: [] } },
        };

        const findings = extractClinicalFindings(data);
        const sq5 = historyByField(findings, "SQ5");

        expect(sq5).toBeDefined();
        expect(sq5!.historyType).toBe("unconfirmed");
      });

      it("SQ8=yes becomes unconfirmed history when no examiner sounds", () => {
        const data = {
          sq: { SQ8: "yes" },
          e6: {
            left: {
              click: { examinerOpen: "no", examinerClose: "no" },
              crepitus: { examinerOpen: "no", examinerClose: "no" },
            },
            right: {
              click: { examinerOpen: "no", examinerClose: "no" },
              crepitus: { examinerOpen: "no", examinerClose: "no" },
            },
          },
          e7: {
            left: { click: { examiner: "no" }, crepitus: { examiner: "no" } },
            right: { click: { examiner: "no" }, crepitus: { examiner: "no" } },
          },
        };

        const findings = extractClinicalFindings(data);
        expect(historyByField(findings, "SQ8")).toBeDefined();
        expect(historyByField(findings, "SQ8")!.historyType).toBe("unconfirmed");
      });
    });
  });

  // ============================================================================
  // SIGN TESTS
  // ============================================================================

  describe("signs", () => {
    it("extracts E2 measurements", () => {
      const data = {
        e2: {
          referenceTooth: "tooth11",
          horizontalOverjet: 2,
          verticalOverlap: 3,
        },
      };

      const findings = extractClinicalFindings(data);
      const e2Signs = signsBySection(findings, "e2");

      expect(e2Signs.length).toBeGreaterThanOrEqual(3);
      expect(e2Signs.find((s) => s.field === "horizontalOverjet")?.value).toBe(2);
      expect(e2Signs.find((s) => s.field === "verticalOverlap")?.value).toBe(3);
    });

    it("extracts E3 opening pattern", () => {
      const data = {
        e3: { openingPattern: "correctedDeviation" },
      };

      const findings = extractClinicalFindings(data);
      const e3Signs = signsBySection(findings, "e3");

      expect(e3Signs).toHaveLength(1);
      expect(e3Signs[0].value).toBe("correctedDeviation");
    });

    it("extracts E4 opening measurements", () => {
      const data = {
        e4: {
          painFree: { measurement: 35 },
          maxUnassisted: { measurement: 42 },
          maxAssisted: { measurement: 45 },
        },
      };

      const findings = extractClinicalFindings(data);
      const e4Signs = signsBySection(findings, "e4");

      expect(e4Signs).toHaveLength(3);
      expect(e4Signs.find((s) => s.field === "painFree.measurement")?.value).toBe(35);
    });

    it("extracts E5 movement measurements", () => {
      const data = {
        e5: {
          lateralLeft: { measurement: 8 },
          lateralRight: { measurement: 9 },
          protrusive: { measurement: 7 },
        },
      };

      const findings = extractClinicalFindings(data);
      const e5Signs = signsBySection(findings, "e5");

      expect(e5Signs).toHaveLength(3);
      expect(e5Signs.find((s) => s.field === "protrusive.measurement")?.value).toBe(7);
    });

    it("extracts examiner-detected sounds without SQ8 support as signs", () => {
      const data = {
        sq: { SQ8: "no" },
        e6: {
          left: {
            click: { examinerOpen: "yes", examinerClose: "no" },
            crepitus: { examinerOpen: "no", examinerClose: "no" },
          },
          right: {
            click: { examinerOpen: "no", examinerClose: "no" },
            crepitus: { examinerOpen: "no", examinerClose: "no" },
          },
        },
      };

      const findings = extractClinicalFindings(data);
      const soundSigns = signsBySection(findings, "e6");

      expect(soundSigns).toHaveLength(1);
      expect(soundSigns[0].side).toBe("left");
      expect(soundSigns[0].label).toContain("ohne Anamnese");
    });

    it("does NOT extract examiner sounds as signs when SQ8=yes (they become symptoms)", () => {
      const data = {
        sq: { SQ8: "yes" },
        e6: {
          left: {
            click: { examinerOpen: "yes" },
          },
        },
      };

      const findings = extractClinicalFindings(data);
      const soundSigns = signsBySection(findings, "e6");

      // Should not appear as signs — should be in symptoms instead
      expect(soundSigns).toHaveLength(0);
      expect(symptomsByDomain(findings, "tmjClick")).toHaveLength(1);
    });

    it("extracts E9 non-familiar pain as sign", () => {
      const data = {
        e9: {
          left: {
            temporalisPosterior: { pain: "yes", familiarPain: "no" },
          },
        },
      };

      const findings = extractClinicalFindings(data);
      const e9Signs = signsBySection(findings, "e9");

      const nonFamiliar = e9Signs.filter((s) => s.field.includes("pain") && !s.field.includes("spreading") && !s.field.includes("referred"));
      expect(nonFamiliar.length).toBeGreaterThanOrEqual(1);
      expect(nonFamiliar[0].side).toBe("left");
      expect(nonFamiliar[0].label).toContain("nicht bekannt");
    });

    it("extracts E9 spreading pain as sign", () => {
      const data = {
        e9: {
          right: {
            masseterBody: { pain: "yes", familiarPain: "yes", spreadingPain: "yes" },
          },
        },
      };

      const findings = extractClinicalFindings(data);
      const spreading = signsBySection(findings, "e9").filter((s) =>
        s.field.includes("spreadingPain")
      );

      expect(spreading).toHaveLength(1);
      expect(spreading[0].label).toContain("Ausbreitender");
    });

    it("extracts E9 referred pain as sign", () => {
      const data = {
        e9: {
          left: {
            temporalisAnterior: { pain: "yes", familiarPain: "yes", referredPain: "yes" },
          },
        },
      };

      const findings = extractClinicalFindings(data);
      const referred = signsBySection(findings, "e9").filter((s) =>
        s.field.includes("referredPain")
      );

      expect(referred).toHaveLength(1);
      expect(referred[0].label).toContain("Übertragener");
    });

    it("extracts E2 midline deviation as sign", () => {
      const data = {
        e2: {
          midlineDeviation: { direction: "left", mm: 2 },
        },
      };

      const findings = extractClinicalFindings(data);
      const midline = signsBySection(findings, "e2").filter((s) =>
        s.field === "midlineDeviation"
      );

      expect(midline).toHaveLength(1);
      expect(midline[0].label).toContain("links");
      expect(midline[0].label).toContain("2mm");
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("complete patient scenario", () => {
    it("categorizes a full myalgia case into symptoms, history, and signs", () => {
      const data = {
        sq: {
          SQ1: "yes",
          SQ2: "3y",
          SQ3: "intermittent",
          SQ4_A: "yes",
          SQ4_B: "no",
          SQ4_C: "no",
          SQ4_D: "no",
          SQ5: "no",
          SQ8: "no",
        },
        e1: {
          painLocation: {
            left: ["temporalis"],
            right: [],
          },
          headacheLocation: {
            left: [],
            right: [],
          },
        },
        e2: {
          verticalOverlap: 3,
          horizontalOverjet: 2,
        },
        e3: { openingPattern: "straight" },
        e4: {
          painFree: { measurement: 30 },
          maxUnassisted: { measurement: 42 },
          maxAssisted: { measurement: 45 },
        },
        e5: {
          lateralLeft: { measurement: 8 },
          lateralRight: { measurement: 9 },
          protrusive: { measurement: 7 },
        },
        e9: {
          left: {
            temporalisPosterior: { pain: "yes", familiarPain: "yes" },
            temporalisMiddle: { pain: "no", familiarPain: "no" },
            temporalisAnterior: { pain: "no", familiarPain: "no" },
          },
        },
      };

      const findings = extractClinicalFindings(data);

      // Symptoms: confirmed pain + familiar pain at palpation
      expect(findings.symptoms.length).toBeGreaterThanOrEqual(2);
      expect(symptomsByDomain(findings, "painLocation")).toHaveLength(1);
      expect(symptomsByDomain(findings, "familiarPainPalpation")).toHaveLength(1);

      // History: SQ2 (temporal), SQ3 (frequency), SQ4_A-D (functional mod)
      expect(findings.history.length).toBeGreaterThanOrEqual(5);
      expect(historyByField(findings, "SQ2")!.historyType).toBe("temporal");
      expect(historyByField(findings, "SQ3")!.historyType).toBe("frequency");
      expect(historyByField(findings, "SQ4_A")!.historyType).toBe("functionalModification");

      // Signs: E2 measurements, E3 pattern, E4 measurements, E5 measurements
      expect(findings.signs.length).toBeGreaterThanOrEqual(7);
      expect(signsBySection(findings, "e2").length).toBeGreaterThanOrEqual(2);
      expect(signsBySection(findings, "e3")).toHaveLength(1);
      expect(signsBySection(findings, "e4")).toHaveLength(3);
      expect(signsBySection(findings, "e5")).toHaveLength(3);
    });

    it("handles joint disorder case with click + crepitus", () => {
      const data = {
        sq: {
          SQ8: "yes",
          SQ8_side: { left: true, right: true },
        },
        e6: {
          left: {
            click: { examinerOpen: "yes", examinerClose: "yes" },
            crepitus: { examinerOpen: "no", examinerClose: "no" },
          },
          right: {
            click: { examinerOpen: "no", examinerClose: "no" },
            crepitus: { examinerOpen: "yes", examinerClose: "no" },
          },
        },
      };

      const findings = extractClinicalFindings(data);

      // Left: click confirmed → symptom
      const clicks = symptomsByDomain(findings, "tmjClick");
      expect(clicks).toHaveLength(1);
      expect(clicks[0].side).toBe("left");

      // Right: crepitus confirmed → symptom
      const crepitus = symptomsByDomain(findings, "tmjCrepitus");
      expect(crepitus).toHaveLength(1);
      expect(crepitus[0].side).toBe("right");

      // SQ8 should NOT be in history (it's confirmed on both sides)
      expect(historyByField(findings, "SQ8")).toBeUndefined();
    });
  });
});
