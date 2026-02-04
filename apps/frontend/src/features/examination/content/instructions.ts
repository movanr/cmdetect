/**
 * Clinical instructions for DC-TMD examination sections.
 * German language for clinical use.
 *
 * These are concise instructions for examiners - not tutorial text.
 * Patient scripts are quotable prompts for communication.
 */

import type {
  ProcedureFlowStep,
  RichMeasurementInstruction,
  RichPainInterviewInstruction,
  SafetyWarning,
} from "./types";

/** Instruction content for a single examination step (legacy) */
export interface StepInstruction {
  /** Step identifier (e.g., "E4A", "E4B") */
  stepId: string;
  /** Step title */
  title: string;
  /** Patient communication script (quotable) */
  patientScript: string;
  /** Key examiner action */
  examinerAction: string;
}

/** Pain interview guidance content (legacy) */
export interface PainInterviewInstruction {
  /** Title for the pain interview step */
  title: string;
  /** Patient prompt for pointing to pain areas */
  prompt: string;
  /** Abbreviated flow guidance */
  guidance: string;
}

// ============================================================================
// E4C Safety Warning
// ============================================================================

/** Safety warning for assisted opening */
const E4C_SAFETY_WARNING: SafetyWarning = {
  message: "Bei Handheben des Patienten sofort stoppen",
  level: "caution",
};

// ============================================================================
// Pain Interview Flow Definition
// ============================================================================

/**
 * Pain interview for movement-induced pain (E4B/E4C).
 *
 * 4-step procedure:
 * 1. Ask if patient had pain during movement
 * 2. Patient localizes pain by pointing with finger
 * 3. Examiner touches area to confirm location and identify anatomical structure
 * 4. Ask if pain is familiar (+ headache question if temporalis)
 *
 * NOTE: Referred pain inquiry is NOT part of movement-induced pain - only for palpation.
 */
const PAIN_INTERVIEW_FLOW: ProcedureFlowStep[] = [
  {
    id: "pain",
    label: "Schmerz bei Bewegung?",
    description: "Hatten Sie bei dieser Bewegung Schmerzen?",
  },
  {
    id: "locate",
    label: "Lokalisation",
    description:
      "Zeigen Sie mit dem Finger auf alle Bereiche, in denen Sie Schmerzen gespürt haben.",
  },
  {
    id: "confirm",
    label: "Bestätigung",
    description:
      "Untersucher berührt den Bereich, identifiziert die Struktur und fragt nach bekanntem Schmerz (bei Temporalis zusätzlich: Kopfschmerz).",
    appAction: "Region im Diagramm wählen, Schmerztypen eingeben",
  },
  {
    id: "done",
    label: "Keine weiteren Schmerzbereiche",
    description: "Gibt es noch weitere Bereiche? Falls nein, abschließen.",
    appAction: 'Button „Keine weiteren Schmerzbereiche"',
  },
];

// ============================================================================
// E4 Measurement Flows (Step-based procedures)
// ============================================================================

/**
 * E4A - Pain-free opening measurement flow.
 * Simple 3-step procedure based on DC-TMD protocol section 4.5.
 */
const E4A_MEASUREMENT_FLOW: ProcedureFlowStep[] = [
  {
    id: "script",
    label: "Anweisung",
    description:
      "Öffnen Sie Ihren Mund so weit wie möglich, ohne dadurch Schmerzen auszulösen oder bestehende Schmerzen zu verstärken.",
  },
  {
    id: "ruler",
    label: "Lineal anlegen",
    description: "0-Marke an Inzisalkante des unteren Referenzzahns",
  },
  {
    id: "measure",
    label: "Messen",
    description: "Interinzisale Distanz ablesen",
    appAction: "Messwert in mm eingeben",
  },
];

/**
 * E4B - Maximum unassisted opening measurement flow.
 * Same technique as E4A but patient opens maximally despite pain.
 */
const E4B_MEASUREMENT_FLOW: ProcedureFlowStep[] = [
  {
    id: "script",
    label: "Anweisung",
    description: "Öffnen Sie Ihren Mund so weit wie möglich, auch wenn es schmerzhaft ist.",
  },
  {
    id: "ruler",
    label: "Lineal anlegen",
    description: "0-Marke an Inzisalkante des unteren Referenzzahns",
  },
  {
    id: "measure",
    label: "Messen",
    description: "Interinzisale Distanz ablesen",
    appAction: "Messwert in mm eingeben",
  },
];

/**
 * E4C - Maximum assisted opening measurement flow.
 * Scissor technique with safety warning.
 */
const E4C_MEASUREMENT_FLOW: ProcedureFlowStep[] = [
  {
    id: "announce",
    label: "Ankündigung",
    description:
      "Gleich werde ich versuchen, Ihren Mund mit meinen Fingern noch weiter zu öffnen. Heben Sie die Hand, wenn Sie möchten, dass ich aufhöre.",
  },
  {
    id: "ruler",
    label: "Lineal anlegen",
    description: "0-Marke an Inzisalkante des unteren Referenzzahns",
  },
  {
    id: "open",
    label: "Patient öffnet",
    description:
      "Bitte öffnen Sie jetzt so weit wie möglich, auch wenn es schmerzhaft ist, so wie Sie es eben schon gemacht haben.",
  },
  {
    id: "technique",
    label: "Scherentechnik",
    description:
      "Daumen auf obere, Zeigefinger auf untere Schneidezähne. Mäßigen Druck anwenden bis Gewebswiderstand.",
  },
  {
    id: "measure",
    label: "Messen",
    description: "Interinzisale Distanz ablesen",
    appAction: "Messwert in mm eingeben",
  },
];

// ============================================================================
// E4 Rich Instructions
// ============================================================================

/**
 * E4 Opening Movements - Rich Clinical Instructions
 *
 * Based on DC-TMD Examiner Protocol Section 4
 */
export const E4_RICH_INSTRUCTIONS = {
  /** U4A - Pain-free opening (step-based flow) */
  painFreeOpening: {
    stepId: "U4A",
    title: "Schmerzfreie Mundöffnung",
    flow: E4A_MEASUREMENT_FLOW,
    // Section 4: Quick reference table
    conciseSpec: [
      {
        section: "section4",
        anchor: "e4-offnungsbewegungen",
        label: "4.5 Schmerzfreie Öffnung",
      },
    ],
    // Section 5: Detailed protocol
    completeSpec: [
      {
        section: "e4",
        anchor: "4a-schmerzfreie-offnung",
        label: "5.4 U4A Schmerzfreie Öffnung",
      },
    ],
    // General instructions
    additionalInfo: [
      // 2.5(d): Pain-free opening is the only exception to "move despite pain"
      { section: "section2", anchor: "25", label: "2.5 Messungen und Bewegungen" },
    ],
  } satisfies RichMeasurementInstruction,

  /** U4B - Maximum unassisted opening (step-based flow) */
  maxUnassistedOpening: {
    stepId: "U4B",
    title: "Maximale aktive Mundöffnung",
    flow: E4B_MEASUREMENT_FLOW,
    // Section 4: Quick reference table
    conciseSpec: [
      {
        section: "section4",
        anchor: "e4-offnungsbewegungen",
        label: "4.5 Max. nicht-unterstützte Öffnung",
      },
    ],
    // Section 5: Detailed protocol
    completeSpec: [
      {
        section: "e4",
        anchor: "4b-maximale-nicht-unterstutzte-offnung",
        label: "5.4 U4B Max. nicht-unterstützte Öffnung",
      },
    ],
    // General instructions
    additionalInfo: [
      // 2.5(d): "move even if painful" applies here
      { section: "section2", anchor: "25", label: "2.5 Messungen und Bewegungen" },
    ],
  } satisfies RichMeasurementInstruction,

  /** U4C - Maximum assisted opening (step-based flow with safety warning) */
  maxAssistedOpening: {
    stepId: "U4C",
    title: "Maximale passive Mundöffnung",
    flow: E4C_MEASUREMENT_FLOW,
    warnings: [E4C_SAFETY_WARNING],
    // Section 4: Quick reference table
    conciseSpec: [
      {
        section: "section4",
        anchor: "e4-offnungsbewegungen",
        label: "4.5 Max. unterstützte Öffnung",
      },
    ],
    // Section 5: Detailed protocol
    completeSpec: [
      {
        section: "e4",
        anchor: "4c-maximale-unterstutzte-offnung",
        label: "5.4 U4C Max. unterstützte Öffnung",
      },
    ],
    // General instructions
    additionalInfo: [
      // 2.5(e): E4C is the only examiner-assisted movement (scissor technique)
      { section: "section2", anchor: "25", label: "2.5 Messungen und Bewegungen" },
    ],
  } satisfies RichMeasurementInstruction,

  /** Pain interview after movement */
  painInterview: {
    title: "Schmerzbefragung",
    prompt: "Hatten Sie bei dieser Bewegung Schmerzen?",
    flow: PAIN_INTERVIEW_FLOW,
    // Section 4: Quick reference table
    conciseSpec: [
      {
        section: "section4",
        anchor: "e4-offnungsbewegungen",
        label: "4.5 Schmerz nach Öffnungsbewegung",
      },
    ],
    // Section 5: Detailed protocol
    completeSpec: [
      {
        section: "e4",
        anchor: "e4b--maximale-nicht-unterstutzte-offnung",
        label: "5.4 Schmerzbefragung nach Bewegung",
      },
    ],
    // General instructions
    additionalInfo: [
      // 2.6: How to identify anatomical structures when patient points to pain
      { section: "section2", anchor: "26", label: "2.6 Klassifikation anatomischer Strukturen" },
      // 2.9: Familiar pain concept - replication of chief complaint
      { section: "section2", anchor: "29", label: "2.9 Bekannter Schmerz" },
      // 6.2: Movement-induced pain inquiry, familiar pain inquiry
      { section: "section6", anchor: "62", label: "6.2 Strukturierte Schmerzbefragung" },
    ],
  } satisfies RichPainInterviewInstruction,
} as const;

// ============================================================================
// Legacy E4 Instructions (for backwards compatibility)
// ============================================================================

/**
 * E4 Opening Movements - Clinical Instructions (Legacy format)
 *
 * Based on DC-TMD Examiner Protocol Section 4
 */
export const E4_INSTRUCTIONS = {
  /** E4A - Pain-free opening */
  painFreeOpening: {
    stepId: "U4A",
    title: "Schmerzfreie Mundöffnung",
    patientScript:
      "Öffnen Sie Ihren Mund so weit wie möglich, ohne dadurch Schmerzen auszulösen oder bestehende Schmerzen zu verstärken.",
    examinerAction: "Interinzisale Distanz messen",
  } satisfies StepInstruction,

  /** E4B - Maximum unassisted opening */
  maxUnassistedOpening: {
    stepId: "U4B",
    title: "Maximale aktive Mundöffnung",
    patientScript: "Öffnen Sie Ihren Mund so weit wie möglich, auch wenn es schmerzhaft ist.",
    examinerAction: "Interinzisale Distanz messen",
  } satisfies StepInstruction,

  /** E4C - Maximum assisted opening */
  maxAssistedOpening: {
    stepId: "U4C",
    title: "Maximale passive Mundöffnung",
    patientScript:
      "Ich werde jetzt versuchen, Ihren Mund weiter zu öffnen. Heben Sie die Hand, wenn Sie möchten, dass ich aufhöre.",
    examinerAction: "Scherentechnik anwenden, Distanz messen",
  } satisfies StepInstruction,

  /** Pain interview after movement */
  painInterview: {
    title: "Schmerzbefragung",
    prompt: "Hatten Sie bei dieser Bewegung Schmerzen?",
    guidance: "Schmerz → Lokalisation → Bestätigung → Keine weiteren Schmerzbereiche",
  } satisfies PainInterviewInstruction,
} as const;

// ============================================================================
// Type Guards and Helpers
// ============================================================================

/**
 * Check if an instruction is a pain interview instruction
 */
export function isPainInterviewInstruction(
  instruction: unknown
): instruction is RichPainInterviewInstruction {
  return (
    typeof instruction === "object" &&
    instruction !== null &&
    "prompt" in instruction &&
    "flow" in instruction
  );
}
