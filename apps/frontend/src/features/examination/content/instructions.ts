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
 * Pain interview for movement-induced pain (E4B - unassisted opening).
 *
 * 4-step procedure from DC-TMD protocol section 6:
 * 1. Ask if patient had pain during movement
 * 2. Patient localizes pain by pointing with finger
 * 3. Examiner touches area to confirm location and identify anatomical structure
 * 4. Ask if pain is familiar (+ headache question if temporalis)
 *
 * NOTE: Referred pain inquiry is NOT part of movement-induced pain - only for palpation.
 */
const E4B_PAIN_INTERVIEW_FLOW: ProcedureFlowStep[] = [
  {
    id: "pain",
    label: "Schmerz bei Bewegung?",
    patientScript: "Hatten Sie bei dieser Bewegung Schmerzen?",
    figureRef: "13",
  },
  {
    id: "locate",
    label: "Lokalisation",
    patientScript:
      "Können Sie mit Ihrem Finger auf alle Bereiche zeigen, in denen Sie bei dieser Bewegung Schmerzen gespürt haben?",
    figureRef: "2",
  },
  {
    id: "confirm",
    label: "Bestätigung",
    examinerInstruction:
      "Untersucher berührt den Bereich, identifiziert die Struktur und fragt nach bekanntem Schmerz (bei Temporalis zusätzlich: Kopfschmerz).",
    figureRef: "3",
    appAction: "Region im Diagramm wählen, Schmerztypen eingeben",
  },
  {
    id: "done",
    label: "Weitere Bereiche?",
    patientScript:
      "Gibt es noch weitere Bereiche, in denen Sie bei dieser Bewegung Schmerzen gespürt haben?",
    appAction: 'Button „Keine weiteren Schmerzbereiche"',
  },
];

/**
 * Pain interview for examiner-assisted opening (E4C).
 *
 * Uses a different pain question that specifically asks about pain from
 * the examiner's manipulation, not from the patient's movement.
 *
 * This distinction is important for differential diagnosis per DC-TMD protocol.
 */
const E4C_PAIN_INTERVIEW_FLOW: ProcedureFlowStep[] = [
  {
    id: "pain",
    label: "Schmerz bei Manipulation?",
    patientScript:
      "Hatten Sie Schmerzen, als ich versucht habe, Ihren Mund mit meinen Fingern weiter zu öffnen?",
    figureRef: "16",
  },
  {
    id: "locate",
    label: "Lokalisation",
    patientScript:
      "Können Sie mit Ihrem Finger auf alle Bereiche zeigen, in denen Sie Schmerzen gespürt haben?",
    figureRef: "2",
  },
  {
    id: "confirm",
    label: "Bestätigung",
    examinerInstruction:
      "Untersucher berührt den Bereich, identifiziert die Struktur und fragt nach bekanntem Schmerz (bei Temporalis zusätzlich: Kopfschmerz).",
    figureRef: "3",
    appAction: "Region im Diagramm wählen, Schmerztypen eingeben",
  },
  {
    id: "done",
    label: "Weitere Bereiche?",
    patientScript:
      "Gibt es noch weitere Bereiche, in denen Sie Schmerzen gespürt haben, als ich Ihren Mund weiter geöffnet habe?",
    appAction: 'Button „Keine weiteren Schmerzbereiche"',
  },
];

// ============================================================================
// E4 Measurement Flows (Step-based procedures)
// ============================================================================

/**
 * E4A - Pain-free opening measurement flow.
 * Based on DC-TMD protocol section 5 (detailed) and section 4.5 (quick reference).
 */
const E4A_MEASUREMENT_FLOW: ProcedureFlowStep[] = [
  {
    id: "script",
    label: "Anweisung",
    patientScript:
      "Ich möchte, dass Sie Ihren Mund so weit wie möglich öffnen, ohne Schmerzen zu verspüren oder bestehende Schmerzen zu verstärken. Ich werde Ihnen sagen, wann Sie schließen können.",
  },
  {
    id: "ruler",
    label: "Lineal anlegen",
    examinerInstruction: "0-Marke an Inzisalkante des unteren Referenzzahns anlegen.",
  },
  {
    id: "measure",
    label: "Messen",
    examinerInstruction: "Interinzisale Distanz ablesen.",
    figureRef: "11",
    appAction: "Messwert in mm eingeben",
  },
];

/**
 * E4B - Maximum unassisted opening measurement flow.
 * Same technique as E4A but patient opens maximally despite pain.
 * Based on DC-TMD protocol section 7.
 */
const E4B_MEASUREMENT_FLOW: ProcedureFlowStep[] = [
  {
    id: "script",
    label: "Anweisung",
    patientScript:
      "Ich möchte, dass Sie Ihren Mund so weit wie möglich öffnen, auch wenn es schmerzhaft ist. Ich werde Ihnen sagen, wann Sie schließen können.",
  },
  {
    id: "ruler",
    label: "Lineal anlegen",
    examinerInstruction: "0-Marke an Inzisalkante des unteren Referenzzahns anlegen.",
  },
  {
    id: "measure",
    label: "Messen",
    examinerInstruction: "Interinzisale Distanz ablesen.",
    figureRef: "12",
    appAction: "Messwert in mm eingeben",
  },
];

/**
 * E4C - Maximum assisted opening measurement flow.
 * Scissor technique with safety warning.
 *
 * Based on DC-TMD protocol section 8 with exact quotations:
 * 1. Announcement with hand-raise instruction
 * 2. Ruler placement
 * 3. Patient opens maximally
 * 4. Tactile warning before finger contact
 * 5. Relaxation prompt (critical for scissor technique)
 * 6. Scissor technique application
 * 7. Measurement
 */
const E4C_MEASUREMENT_FLOW: ProcedureFlowStep[] = [
  {
    id: "announce",
    label: "Ankündigung",
    patientScript:
      "Gleich werde ich versuchen, Ihren Mund mit meinen Fingern weiter zu öffnen. Wenn Sie möchten, dass ich aufhöre, heben Sie Ihre Hand und ich werde sofort aufhören.",
  },
  {
    id: "ruler",
    label: "Lineal platzieren",
    patientScript: "Ich werde mein Lineal platzieren.",
    examinerInstruction: "0-Marke an Inzisalkante des unteren Referenzzahns anlegen.",
    pause: true,
  },
  {
    id: "open",
    label: "Patient öffnet",
    patientScript:
      "Jetzt öffnen Sie Ihren Mund so weit wie möglich, auch wenn schmerzhaft, genau wie zuvor.",
    pause: true,
  },
  {
    id: "tactile-warning",
    label: "Berührungsankündigung",
    patientScript: "Sie werden meine Finger spüren.",
  },
  {
    id: "relax",
    label: "Entspannung",
    patientScript:
      "Bitte entspannen Sie Ihren Kiefer, damit ich Ihnen helfen kann, weiter zu öffnen, wenn möglich.",
    pause: true,
  },
  {
    id: "technique",
    label: "Scherentechnik",
    examinerInstruction:
      "Daumen auf obere, Zeigefinger auf untere Schneidezähne. Mäßigen Druck anwenden bis Gewebswiderstand.",
    figureRef: "15",
  },
  {
    id: "measure",
    label: "Messen",
    examinerInstruction: "Interinzisale Distanz ablesen.",
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
        anchor: "u4-offnungsbewegungen",
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
        anchor: "u4-offnungsbewegungen",
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
        anchor: "u4-offnungsbewegungen",
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

  /** Pain interview after E4B (unassisted opening) */
  painInterview: {
    title: "Schmerzbefragung",
    prompt: "Hatten Sie bei dieser Bewegung Schmerzen?",
    flow: E4B_PAIN_INTERVIEW_FLOW,
    // Section 4: Quick reference table
    conciseSpec: [
      {
        section: "section4",
        anchor: "u4-offnungsbewegungen",
        label: "4.5 Schmerz nach Öffnungsbewegung",
      },
    ],
    // Section 5: Detailed protocol
    completeSpec: [
      {
        section: "e4",
        anchor: "u4b-schmerz-nach-maximaler-nicht-unterstutzter-offnung",
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

  /** Pain interview after E4C (assisted opening) - uses examiner manipulation wording */
  painInterviewAssistedOpening: {
    title: "Schmerzbefragung",
    prompt:
      "Hatten Sie Schmerzen, als ich versucht habe, Ihren Mund mit meinen Fingern weiter zu öffnen?",
    flow: E4C_PAIN_INTERVIEW_FLOW,
    // Section 4: Quick reference table
    conciseSpec: [
      {
        section: "section4",
        anchor: "u4-offnungsbewegungen",
        label: "4.5 Schmerz nach unterstützter Öffnung",
      },
    ],
    // Section 5: Detailed protocol
    completeSpec: [
      {
        section: "e4",
        anchor: "u4c-schmerz-nach-maximaler-unterstutzter-offnung",
        label: "5.4 Schmerzbefragung nach unterstützter Öffnung",
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
