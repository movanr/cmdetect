/**
 * DC/TMD Clinical Findings Extraction
 *
 * Extracts categorized findings (symptoms, history, signs) from
 * criteria data (merged SQ questionnaire + examination data).
 *
 * Implements the DC/TMD Symptoms vs History categorization:
 * - Symptom = SQ report + clinical examination confirmation
 * - History = SQ report only (temporal/descriptive or unconfirmed)
 * - Sign = Examination finding without SQ counterpart
 */

import { SIDE_KEYS, SITES_BY_GROUP, type Region, type Side } from "../ids/anatomy";
import type { DiagnosisId } from "../ids/diagnosis";
import type { SectionId } from "../ids/examination";
import type {
  ClinicalFindings,
  HistoryFinding,
  HistoryType,
  SignFinding,
  SymptomDomain,
  SymptomFinding,
} from "./types";

// ============================================================================
// DATA ACCESS HELPER
// ============================================================================

/**
 * Get value at dot-separated path from a nested data object.
 * Same pattern as the criteria evaluator.
 */
function get(data: unknown, path: string): unknown {
  const parts = path.split(".");
  let current = data;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ============================================================================
// SQ ANAMNESIS GATES
// ============================================================================

/** SQ1=yes AND SQ3 in [intermittent, continuous] */
function hasPainAnamnesis(data: unknown): boolean {
  const sq1 = get(data, "sq.SQ1");
  const sq3 = get(data, "sq.SQ3");
  return sq1 === "yes" && (sq3 === "intermittent" || sq3 === "continuous");
}

/** Any of SQ4_A-D = yes */
function hasPainModification(data: unknown): boolean {
  return (["SQ4_A", "SQ4_B", "SQ4_C", "SQ4_D"] as const).some(
    (q) => get(data, `sq.${q}`) === "yes"
  );
}

/** Pain anamnesis + pain modification */
function hasFullPainAnamnesis(data: unknown): boolean {
  return hasPainAnamnesis(data) && hasPainModification(data);
}

/** SQ5=yes */
function hasHeadacheAnamnesis(data: unknown): boolean {
  return get(data, "sq.SQ5") === "yes";
}

/** Any of SQ7_A-D = yes */
function hasHeadacheModification(data: unknown): boolean {
  return (["SQ7_A", "SQ7_B", "SQ7_C", "SQ7_D"] as const).some(
    (q) => get(data, `sq.${q}`) === "yes"
  );
}

/** Headache anamnesis + headache modification */
function hasFullHeadacheAnamnesis(data: unknown): boolean {
  return hasHeadacheAnamnesis(data) && hasHeadacheModification(data);
}

/** SQ8=yes */
function hasTmjNoiseAnamnesis(data: unknown): boolean {
  return get(data, "sq.SQ8") === "yes";
}

/** SQ9=yes */
function hasClosedLockingAnamnesis(data: unknown): boolean {
  return get(data, "sq.SQ9") === "yes";
}

/** SQ10=yes */
function hasLockingAffectsEating(data: unknown): boolean {
  return get(data, "sq.SQ10") === "yes";
}

/** SQ11=yes AND SQ12=no (intermittent locking, not currently locked) */
function hasIntermittentLocking(data: unknown): boolean {
  return get(data, "sq.SQ11") === "yes" && get(data, "sq.SQ12") === "no";
}

/** SQ13=yes */
function hasOpenLockingAnamnesis(data: unknown): boolean {
  return get(data, "sq.SQ13") === "yes";
}

/** SQ14=yes */
function hasManeuverToClose(data: unknown): boolean {
  return get(data, "sq.SQ14") === "yes";
}

// ============================================================================
// EXAMINATION CHECKS
// ============================================================================

/** Pain regions from E1a: regions marked on a specific side */
function getPainRegions(data: unknown, side: Side): string[] {
  const val = get(data, `e1.painLocation.${side}`);
  return Array.isArray(val) ? val : [];
}

/** Headache regions from E1b */
function getHeadacheRegions(data: unknown, side: Side): string[] {
  const val = get(data, `e1.headacheLocation.${side}`);
  return Array.isArray(val) ? val : [];
}

/** E9: familiar pain at any palpation site in a region for a given side */
function hasFamiliarPainAtPalpation(data: unknown, side: Side, region: Region): boolean {
  const sites = SITES_BY_GROUP[region];
  if (!sites || sites.length === 0) return false;
  return sites.some((site) => get(data, `e9.${side}.${site}.familiarPain`) === "yes");
}

/** E9: familiar headache at any palpation site in a region for a given side */
function hasFamiliarHeadacheAtPalpation(data: unknown, side: Side, region: Region): boolean {
  const sites = SITES_BY_GROUP[region];
  if (!sites || sites.length === 0) return false;
  return sites.some((site) => get(data, `e9.${side}.${site}.familiarHeadache`) === "yes");
}

/** E4: familiar pain during opening (maxUnassisted or maxAssisted) */
function hasFamiliarPainDuringOpening(data: unknown, side: Side, region: Region): boolean {
  return (
    get(data, `e4.maxUnassisted.${side}.${region}.familiarPain`) === "yes" ||
    get(data, `e4.maxAssisted.${side}.${region}.familiarPain`) === "yes"
  );
}

/** E4: familiar headache during opening */
function hasFamiliarHeadacheDuringOpening(data: unknown, side: Side, region: Region): boolean {
  return (
    get(data, `e4.maxUnassisted.${side}.${region}.familiarHeadache`) === "yes" ||
    get(data, `e4.maxAssisted.${side}.${region}.familiarHeadache`) === "yes"
  );
}

/** E5: familiar pain during lateral/protrusive movement */
function hasFamiliarPainDuringMovement(data: unknown, side: Side, region: Region): boolean {
  return (["lateralLeft", "lateralRight", "protrusive"] as const).some(
    (mvt) => get(data, `e5.${mvt}.${side}.${region}.familiarPain`) === "yes"
  );
}

/** E5: familiar headache during lateral/protrusive movement */
function hasFamiliarHeadacheDuringMovement(data: unknown, side: Side, region: Region): boolean {
  return (["lateralLeft", "lateralRight", "protrusive"] as const).some(
    (mvt) => get(data, `e5.${mvt}.${side}.${region}.familiarHeadache`) === "yes"
  );
}

/** E6/E7: examiner detects click on a side */
function hasExaminerClick(data: unknown, side: Side): boolean {
  return (
    get(data, `e6.${side}.click.examinerOpen`) === "yes" ||
    get(data, `e6.${side}.click.examinerClose`) === "yes" ||
    get(data, `e7.${side}.click.examiner`) === "yes"
  );
}

/** E6/E7: examiner detects crepitus on a side */
function hasExaminerCrepitus(data: unknown, side: Side): boolean {
  return (
    get(data, `e6.${side}.crepitus.examinerOpen`) === "yes" ||
    get(data, `e6.${side}.crepitus.examinerClose`) === "yes" ||
    get(data, `e7.${side}.crepitus.examiner`) === "yes"
  );
}

/**
 * E6: click pattern for disc displacement with reduction:
 * click during BOTH opening AND closing, OR click during open/close + E7 click
 */
function hasClickPattern(data: unknown, side: Side): boolean {
  const openClick = get(data, `e6.${side}.click.examinerOpen`) === "yes";
  const closeClick = get(data, `e6.${side}.click.examinerClose`) === "yes";
  const e7Click = get(data, `e7.${side}.click.examiner`) === "yes";
  return (openClick && closeClick) || ((openClick || closeClick) && e7Click);
}

/** Passive opening: E4 maxAssisted measurement + E2 verticalOverlap */
function getPassiveOpening(data: unknown): number | null {
  const maxAssisted = get(data, "e4.maxAssisted.measurement");
  const verticalOverlap = get(data, "e2.verticalOverlap");
  if (typeof maxAssisted !== "number" || typeof verticalOverlap !== "number") return null;
  return maxAssisted + verticalOverlap;
}

// ============================================================================
// SQ SIDE GATE HELPER
// ============================================================================

/**
 * Check if a side is gated by SQ office-use marking.
 * Returns true if the office-use data marks this side.
 */
function isSideGated(data: unknown, sqId: string, side: Side): boolean {
  const sideData = get(data, `sq.${sqId}_side.${side}`);
  // If side data exists, use it; if missing, default to true (no constraint)
  return sideData === undefined || sideData === true;
}

// ============================================================================
// SYMPTOM EXTRACTION
// ============================================================================

/** Pain location regions eligible for symptom extraction */
const PAIN_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj", "otherMast"];

/** Regions with palpation sites for familiar pain */
const PALPATION_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];

/** Regions for E4/E5 familiar pain checks */
const MOVEMENT_PAIN_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];

function extractSymptoms(data: unknown): SymptomFinding[] {
  const symptoms: SymptomFinding[] = [];

  // Helper to push a symptom
  function add(
    domain: SymptomDomain,
    label: string,
    side: Side,
    sqSources: string[],
    examConfirmation: string,
    relatedDiagnoses: DiagnosisId[],
    region?: Region,
  ): void {
    symptoms.push({
      category: "symptom",
      domain,
      label,
      side,
      region,
      sqSources,
      examConfirmation,
      relatedDiagnoses,
    });
  }

  // --- 1. Pain Location (SQ1+SQ3 + E1a) ---
  if (hasPainAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      const painRegions = getPainRegions(data, side);
      for (const region of PAIN_REGIONS) {
        if (painRegions.includes(region)) {
          const diagnoses: DiagnosisId[] =
            region === "tmj"
              ? ["arthralgia"]
              : region === "temporalis" || region === "masseter"
                ? ["myalgia", "localMyalgia", "myofascialPainWithSpreading", "myofascialPainWithReferral"]
                : [];
          add(
            "painLocation",
            `Bestätigte Schmerzlokalisation: ${regionLabel(region)}`,
            side,
            ["SQ1", "SQ3"],
            `E1a Schmerzlokalisation ${regionLabel(region)}`,
            diagnoses,
            region,
          );
        }
      }
    }
  }

  // --- 2. Familiar Pain — Palpation (SQ1+SQ3+SQ4 + E9) ---
  if (hasFullPainAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      for (const region of PALPATION_REGIONS) {
        if (hasFamiliarPainAtPalpation(data, side, region)) {
          const diagnoses: DiagnosisId[] =
            region === "tmj" ? ["arthralgia"] : ["myalgia", "localMyalgia", "myofascialPainWithSpreading", "myofascialPainWithReferral"];
          add(
            "familiarPainPalpation",
            `Bekannter Schmerz bei Palpation: ${regionLabel(region)}`,
            side,
            ["SQ1", "SQ3", "SQ4"],
            `E9 Bekannter Schmerz ${regionLabel(region)}`,
            diagnoses,
            region,
          );
        }
      }
    }
  }

  // --- 3. Familiar Pain — Opening (SQ1+SQ3+SQ4 + E4) ---
  if (hasFullPainAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      for (const region of MOVEMENT_PAIN_REGIONS) {
        if (hasFamiliarPainDuringOpening(data, side, region)) {
          const diagnoses: DiagnosisId[] =
            region === "tmj" ? ["arthralgia"] : ["myalgia"];
          add(
            "familiarPainOpening",
            `Bekannter Schmerz bei Mundöffnung: ${regionLabel(region)}`,
            side,
            ["SQ1", "SQ3", "SQ4"],
            `E4 Bekannter Schmerz bei Öffnung ${regionLabel(region)}`,
            diagnoses,
            region,
          );
        }
      }
    }
  }

  // --- 4. Familiar Pain — Movement (SQ1+SQ3+SQ4 + E5) ---
  if (hasFullPainAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      for (const region of MOVEMENT_PAIN_REGIONS) {
        if (hasFamiliarPainDuringMovement(data, side, region)) {
          const diagnoses: DiagnosisId[] =
            region === "tmj" ? ["arthralgia"] : ["myalgia"];
          add(
            "familiarPainMovement",
            `Bekannter Schmerz bei Kieferbewegung: ${regionLabel(region)}`,
            side,
            ["SQ1", "SQ3", "SQ4"],
            `E5 Bekannter Schmerz bei Lateralbewegung ${regionLabel(region)}`,
            diagnoses,
            region,
          );
        }
      }
    }
  }

  // --- 5. Headache Location (SQ5 + E1b) ---
  if (hasHeadacheAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      const headacheRegions = getHeadacheRegions(data, side);
      if (headacheRegions.includes("temporalis")) {
        add(
          "headacheLocation",
          "Bestätigte Kopfschmerzlokalisation: Temporalis",
          side,
          ["SQ5"],
          "E1b Kopfschmerzlokalisation Temporalis",
          ["headacheAttributedToTmd"],
          "temporalis",
        );
      }
    }
  }

  // --- 6. Familiar Headache — Palpation (SQ5+SQ7 + E9) ---
  if (hasFullHeadacheAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      if (hasFamiliarHeadacheAtPalpation(data, side, "temporalis")) {
        add(
          "familiarHeadachePalpation",
          "Bekannter Kopfschmerz bei Palpation: Temporalis",
          side,
          ["SQ5", "SQ7"],
          "E9 Bekannter Kopfschmerz Temporalis",
          ["headacheAttributedToTmd"],
          "temporalis",
        );
      }
    }
  }

  // --- 7. Familiar Headache — Opening (SQ5+SQ7 + E4) ---
  if (hasFullHeadacheAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      if (hasFamiliarHeadacheDuringOpening(data, side, "temporalis")) {
        add(
          "familiarHeadacheOpening",
          "Bekannter Kopfschmerz bei Mundöffnung: Temporalis",
          side,
          ["SQ5", "SQ7"],
          "E4 Bekannter Kopfschmerz bei Öffnung",
          ["headacheAttributedToTmd"],
          "temporalis",
        );
      }
    }
  }

  // --- 8. Familiar Headache — Movement (SQ5+SQ7 + E5) ---
  if (hasFullHeadacheAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      if (hasFamiliarHeadacheDuringMovement(data, side, "temporalis")) {
        add(
          "familiarHeadacheMovement",
          "Bekannter Kopfschmerz bei Kieferbewegung: Temporalis",
          side,
          ["SQ5", "SQ7"],
          "E5 Bekannter Kopfschmerz bei Lateralbewegung",
          ["headacheAttributedToTmd"],
          "temporalis",
        );
      }
    }
  }

  // --- 9. TMJ Click (SQ8 + E6/E7 click) ---
  if (hasTmjNoiseAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      if (isSideGated(data, "SQ8", side) && hasExaminerClick(data, side)) {
        add(
          "tmjClick",
          "Bestätigtes Kiefergelenkknacken",
          side,
          ["SQ8"],
          "E6/E7 Knacken durch Untersucher bestätigt",
          ["discDisplacementWithReduction", "discDisplacementWithReductionIntermittentLocking"],
          "tmj",
        );
      }
    }
  }

  // --- 10. TMJ Crepitus (SQ8 + E6/E7 crepitus) ---
  if (hasTmjNoiseAnamnesis(data)) {
    for (const side of SIDE_KEYS) {
      if (isSideGated(data, "SQ8", side) && hasExaminerCrepitus(data, side)) {
        add(
          "tmjCrepitus",
          "Bestätigtes Kiefergelenkreiben",
          side,
          ["SQ8"],
          "E6/E7 Reiben durch Untersucher bestätigt",
          ["degenerativeJointDisease"],
          "tmj",
        );
      }
    }
  }

  // --- 11. Closed Locking (SQ9+SQ10 + limited opening) ---
  if (hasClosedLockingAnamnesis(data) && hasLockingAffectsEating(data)) {
    for (const side of SIDE_KEYS) {
      if (isSideGated(data, "SQ9", side) && isSideGated(data, "SQ10", side)) {
        const passiveOpening = getPassiveOpening(data);
        if (passiveOpening !== null) {
          add(
            "closedLocking",
            "Bestätigte Kieferklemme",
            side,
            ["SQ9", "SQ10"],
            `Passive Mundöffnung ${passiveOpening}mm`,
            passiveOpening < 40
              ? ["discDisplacementWithoutReductionLimitedOpening"]
              : ["discDisplacementWithoutReductionWithoutLimitedOpening"],
            "tmj",
          );
        }
      }
    }
  }

  // --- 12. Limited Opening (SQ10 + E4+E2 < 40mm) ---
  if (hasLockingAffectsEating(data)) {
    const passiveOpening = getPassiveOpening(data);
    if (passiveOpening !== null && passiveOpening < 40) {
      // This is bilateral — not per-side
      for (const side of SIDE_KEYS) {
        add(
          "limitedOpening",
          `Mundöffnungseinschränkung (${passiveOpening}mm < 40mm)`,
          side,
          ["SQ10"],
          "E4 max. passive Öffnung + E2 Vertikaler Überbiss < 40mm",
          ["discDisplacementWithoutReductionLimitedOpening"],
        );
      }
    }
  }

  // --- 13. Intermittent Locking (SQ11+SQ12=no + E6/E7 click pattern) ---
  if (hasIntermittentLocking(data)) {
    for (const side of SIDE_KEYS) {
      if (isSideGated(data, "SQ11", side) && hasClickPattern(data, side)) {
        add(
          "intermittentLocking",
          "Bestätigte intermittierende Kieferklemme mit Knackmuster",
          side,
          ["SQ11", "SQ12"],
          "E6/E7 Knackmuster (Öffnung + Schließung oder Lateralbewegung)",
          ["discDisplacementWithReductionIntermittentLocking"],
          "tmj",
        );
      }
    }
  }

  // --- 14. Subluxation (SQ13+SQ14, exam optional) ---
  if (hasOpenLockingAnamnesis(data) && hasManeuverToClose(data)) {
    for (const side of SIDE_KEYS) {
      if (isSideGated(data, "SQ13", side) && isSideGated(data, "SQ14", side)) {
        add(
          "subluxation",
          "Subluxation",
          side,
          ["SQ13", "SQ14"],
          "Untersuchung optional (Sensitivität 0,98, Spezifität 1,0 auf Anamnese-Basis)",
          ["subluxation"],
          "tmj",
        );
      }
    }
  }

  return symptoms;
}

// ============================================================================
// HISTORY EXTRACTION
// ============================================================================

/** German labels for SQ fields */
const SQ_LABELS: Record<string, string> = {
  SQ1: "Schmerzen im Kiefer-/Schläfen-/Ohrbereich",
  SQ2: "Schmerzbeginn",
  SQ3: "Schmerzhäufigkeit (letzte 30 Tage)",
  SQ4_A: "Schmerzbeeinflussung: Kauen harter Nahrung",
  SQ4_B: "Schmerzbeeinflussung: Mundöffnung/Kieferbewegung",
  SQ4_C: "Schmerzbeeinflussung: Pressen/Knirschen/Kaugummi",
  SQ4_D: "Schmerzbeeinflussung: Reden/Küssen/Gähnen",
  SQ5: "Schläfenkopfschmerzen (letzte 30 Tage)",
  SQ6: "Kopfschmerzbeginn",
  SQ7_A: "Kopfschmerzbeeinflussung: Kauen harter Nahrung",
  SQ7_B: "Kopfschmerzbeeinflussung: Mundöffnung/Kieferbewegung",
  SQ7_C: "Kopfschmerzbeeinflussung: Pressen/Knirschen/Kaugummi",
  SQ7_D: "Kopfschmerzbeeinflussung: Reden/Küssen/Gähnen",
  SQ8: "Kiefergelenkgeräusche (letzte 30 Tage)",
  SQ9: "Kieferklemme (jemals)",
  SQ10: "Einschränkung beim Essen durch Kieferklemme",
  SQ11: "Intermittierende Kieferklemme (letzte 30 Tage)",
  SQ12: "Kieferklemme gegenwärtig",
  SQ13: "Kiefersperre offen (letzte 30 Tage)",
  SQ14: "Manöver zum Mundschluss nötig",
};

/** Always-history fields: temporal descriptors, frequency, functional modification */
const ALWAYS_HISTORY: Array<{ field: string; historyType: HistoryType }> = [
  { field: "SQ2", historyType: "temporal" },
  { field: "SQ3", historyType: "frequency" },
  { field: "SQ6", historyType: "temporal" },
  { field: "SQ4_A", historyType: "functionalModification" },
  { field: "SQ4_B", historyType: "functionalModification" },
  { field: "SQ4_C", historyType: "functionalModification" },
  { field: "SQ4_D", historyType: "functionalModification" },
  { field: "SQ7_A", historyType: "functionalModification" },
  { field: "SQ7_B", historyType: "functionalModification" },
  { field: "SQ7_C", historyType: "functionalModification" },
  { field: "SQ7_D", historyType: "functionalModification" },
];

/**
 * Conditionally-history fields: SQ positive but exam doesn't confirm.
 * Each entry defines the SQ field and a checker that returns true if
 * the examination DID confirm on at least one side.
 */
const CONDITIONALLY_HISTORY: Array<{
  field: string;
  positiveValue: unknown;
  isConfirmed: (data: unknown) => boolean;
}> = [
  {
    // SQ1=yes → becomes history if E1a shows no pain in any region
    field: "SQ1",
    positiveValue: "yes",
    isConfirmed: (data) =>
      SIDE_KEYS.some((side) => getPainRegions(data, side).length > 0),
  },
  {
    // SQ5=yes → becomes history if E1b shows no headache in temporalis
    field: "SQ5",
    positiveValue: "yes",
    isConfirmed: (data) =>
      SIDE_KEYS.some((side) => getHeadacheRegions(data, side).includes("temporalis")),
  },
  {
    // SQ8=yes → becomes history if E6/E7 examiner detects no sounds
    field: "SQ8",
    positiveValue: "yes",
    isConfirmed: (data) =>
      SIDE_KEYS.some((side) => hasExaminerClick(data, side) || hasExaminerCrepitus(data, side)),
  },
  {
    // SQ9=yes → becomes history if no locking-related findings
    field: "SQ9",
    positiveValue: "yes",
    isConfirmed: (data) => {
      const passiveOpening = getPassiveOpening(data);
      return passiveOpening !== null; // If we have the measurement, it's confirmed
    },
  },
  {
    // SQ10=yes → becomes history if opening >= 40mm
    field: "SQ10",
    positiveValue: "yes",
    isConfirmed: (data) => {
      const passiveOpening = getPassiveOpening(data);
      return passiveOpening !== null && passiveOpening < 40;
    },
  },
  {
    // SQ11=yes → becomes history if no click pattern in E6/E7
    field: "SQ11",
    positiveValue: "yes",
    isConfirmed: (data) =>
      SIDE_KEYS.some((side) => hasClickPattern(data, side)),
  },
  {
    // SQ12: context field for SQ11 interpretation
    field: "SQ12",
    positiveValue: "yes",
    isConfirmed: () => false, // Always history as a context descriptor
  },
  {
    // SQ13=yes → becomes history if E8 shows no open locking
    field: "SQ13",
    positiveValue: "yes",
    // Subluxation diagnosis can be made on history alone, so SQ13+SQ14 is "confirmed"
    // if both are positive (no exam needed)
    isConfirmed: (data) => hasManeuverToClose(data),
  },
  {
    // SQ14=yes → self-management descriptor, confirmed when SQ13 also present
    field: "SQ14",
    positiveValue: "yes",
    isConfirmed: (data) => hasOpenLockingAnamnesis(data),
  },
];

function extractHistory(data: unknown): HistoryFinding[] {
  const history: HistoryFinding[] = [];

  // Always-history fields (temporal, frequency, functional modification)
  for (const { field, historyType } of ALWAYS_HISTORY) {
    const value = get(data, `sq.${field}`);
    if (value !== undefined && value !== null) {
      history.push({
        category: "history",
        field,
        label: SQ_LABELS[field] ?? field,
        value,
        historyType,
      });
    }
  }

  // Conditionally-history: SQ positive but exam didn't confirm
  for (const { field, positiveValue, isConfirmed } of CONDITIONALLY_HISTORY) {
    const value = get(data, `sq.${field}`);
    if (value === positiveValue && !isConfirmed(data)) {
      history.push({
        category: "history",
        field,
        label: SQ_LABELS[field] ?? field,
        value,
        historyType: "unconfirmed",
      });
    }
  }

  return history;
}

// ============================================================================
// SIGN EXTRACTION
// ============================================================================

function extractSigns(data: unknown): SignFinding[] {
  const signs: SignFinding[] = [];

  function addSign(
    section: SectionId,
    field: string,
    label: string,
    value: unknown,
    side?: Side,
    region?: Region,
  ): void {
    if (value === undefined || value === null) return;
    signs.push({ category: "sign", section, field, label, value, side, region });
  }

  // --- E2: Incisal relationships ---
  addSign("e2", "referenceTooth", "Referenzzahn", get(data, "e2.referenceTooth"));
  addSign("e2", "horizontalOverjet", "Horizontaler Overjet (mm)", get(data, "e2.horizontalOverjet"));
  addSign("e2", "verticalOverlap", "Vertikaler Überbiss (mm)", get(data, "e2.verticalOverlap"));

  const midlineDeviation = get(data, "e2.midlineDeviation");
  if (midlineDeviation != null && typeof midlineDeviation === "object") {
    const md = midlineDeviation as { direction?: string; mm?: number };
    if (md.direction && md.direction !== "na") {
      addSign(
        "e2",
        "midlineDeviation",
        `Mittellinienabweichung (${md.direction === "right" ? "rechts" : "links"}, ${md.mm ?? 0}mm)`,
        midlineDeviation,
      );
    }
  }

  // --- E3: Opening pattern ---
  addSign("e3", "openingPattern", "Öffnungsmuster", get(data, "e3.openingPattern"));

  // --- E4: Opening range measurements ---
  for (const openingType of ["painFree", "maxUnassisted", "maxAssisted"] as const) {
    const labels: Record<string, string> = {
      painFree: "Schmerzfreie Mundöffnung",
      maxUnassisted: "Maximale aktive Mundöffnung",
      maxAssisted: "Maximale passive Mundöffnung",
    };
    const measurement = get(data, `e4.${openingType}.measurement`);
    addSign("e4", `${openingType}.measurement`, `${labels[openingType]} (mm)`, measurement);
  }

  // --- E5: Movement range measurements ---
  for (const movementType of ["lateralLeft", "lateralRight", "protrusive"] as const) {
    const labels: Record<string, string> = {
      lateralLeft: "Laterotrusion nach links",
      lateralRight: "Laterotrusion nach rechts",
      protrusive: "Protrusion",
    };
    const measurement = get(data, `e5.${movementType}.measurement`);
    addSign("e5", `${movementType}.measurement`, `${labels[movementType]} (mm)`, measurement);
  }

  // --- E6/E7: Examiner-detected sounds without SQ8 support ---
  const hasSQ8 = hasTmjNoiseAnamnesis(data);
  for (const side of SIDE_KEYS) {
    if (!hasSQ8) {
      // Examiner finds sounds but patient didn't report in SQ8 → sign only
      if (hasExaminerClick(data, side)) {
        addSign(
          "e6",
          `${side}.click`,
          "Knacken (nur klinisch festgestellt, ohne Anamnese)",
          "yes",
          side,
          "tmj",
        );
      }
      if (hasExaminerCrepitus(data, side)) {
        addSign(
          "e6",
          `${side}.crepitus`,
          "Reiben (nur klinisch festgestellt, ohne Anamnese)",
          "yes",
          side,
          "tmj",
        );
      }
    }
  }

  // --- E9: Non-familiar pain, spreading pain, referred pain ---
  for (const side of SIDE_KEYS) {
    for (const region of PALPATION_REGIONS) {
      const sites = SITES_BY_GROUP[region];
      for (const site of sites) {
        // Non-familiar pain: pain=yes but familiarPain is not "yes"
        const pain = get(data, `e9.${side}.${site}.pain`);
        const familiarPain = get(data, `e9.${side}.${site}.familiarPain`);
        if (pain === "yes" && familiarPain !== "yes") {
          addSign(
            "e9",
            `${side}.${site}.pain`,
            `Schmerz bei Palpation (nicht bekannt): ${siteLabel(site)}`,
            "yes",
            side,
            region,
          );
        }

        // Spreading pain (subtype differentiator, sign without SQ counterpart)
        const spreading = get(data, `e9.${side}.${site}.spreadingPain`);
        if (spreading === "yes") {
          addSign(
            "e9",
            `${side}.${site}.spreadingPain`,
            `Ausbreitender Schmerz: ${siteLabel(site)}`,
            "yes",
            side,
            region,
          );
        }

        // Referred pain (subtype differentiator, sign without SQ counterpart)
        const referred = get(data, `e9.${side}.${site}.referredPain`);
        if (referred === "yes") {
          addSign(
            "e9",
            `${side}.${site}.referredPain`,
            `Übertragener Schmerz: ${siteLabel(site)}`,
            "yes",
            side,
            region,
          );
        }
      }
    }
  }

  return signs;
}

// ============================================================================
// LABEL HELPERS
// ============================================================================

const REGION_LABELS: Record<string, string> = {
  temporalis: "Temporalis",
  masseter: "Masseter",
  tmj: "Kiefergelenk",
  otherMast: "Andere Kaumuskulatur",
  nonMast: "Nicht-Kaumuskulatur",
};

function regionLabel(region: string): string {
  return REGION_LABELS[region] ?? region;
}

const SITE_LABELS: Record<string, string> = {
  temporalisPosterior: "Temporalis (posterior)",
  temporalisMiddle: "Temporalis (media)",
  temporalisAnterior: "Temporalis (anterior)",
  masseterOrigin: "Masseter (Ursprung)",
  masseterBody: "Masseter (Körper)",
  masseterInsertion: "Masseter (Ansatz)",
  tmjLateralPole: "Kiefergelenk (lateraler Pol)",
  tmjAroundLateralPole: "Kiefergelenk (um den lateralen Pol)",
};

function siteLabel(site: string): string {
  return SITE_LABELS[site] ?? site;
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

/**
 * Extract categorized clinical findings from DC/TMD criteria data.
 *
 * Takes the merged SQ questionnaire + examination data object
 * (output of mapToCriteriaData) and categorizes all findings into
 * symptoms (SQ + E confirmed), history (SQ only), and signs (E only).
 *
 * @param data - Criteria data object with `sq.*` and `e1.*` through `e9.*` paths
 * @returns Clinical findings organized by category
 */
export function extractClinicalFindings(data: unknown): ClinicalFindings {
  return {
    symptoms: extractSymptoms(data),
    history: extractHistory(data),
    signs: extractSigns(data),
  };
}
