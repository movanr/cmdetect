/**
 * Clinical instructions for DC-TMD examination sections.
 * German language for clinical use.
 *
 * These are concise instructions for examiners - not tutorial text.
 * Patient scripts are quotable prompts for communication.
 */

import type {
  PainInterviewFlowStep,
  RichPainInterviewInstruction,
  RichStepInstruction,
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
const PAIN_INTERVIEW_FLOW: PainInterviewFlowStep[] = [
  {
    id: "pain",
    question: "Schmerz bei Bewegung?",
    description: "Hatten Sie bei dieser Bewegung Schmerzen?",
  },
  {
    id: "locate",
    question: "Lokalisation",
    description:
      "Zeigen Sie mit dem Finger auf alle Bereiche, in denen Sie Schmerzen gespürt haben.",
  },
  {
    id: "confirm",
    question: "Bestätigung",
    description:
      "Untersucher berührt den Bereich, identifiziert die Struktur und fragt nach bekanntem Schmerz (bei Temporalis zusätzlich: Kopfschmerz).",
    appAction: "Region im Diagramm wählen, Schmerztypen eingeben",
  },
  {
    id: "done",
    question: "Keine weiteren Schmerzbereiche",
    description:
      "Gibt es noch weitere Bereiche? Falls nein, abschließen.",
    appAction: 'Button „Keine weiteren Schmerzbereiche"',
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
  /** E4A - Pain-free opening (simple, no phases) */
  painFreeOpening: {
    stepId: "U4A",
    title: "Schmerzfreie Mundöffnung",
    patientScript:
      "Öffnen Sie Ihren Mund so weit wie möglich, ohne dadurch Schmerzen auszulösen oder bestehende Schmerzen zu verstärken.",
    examinerAction: "Interinzisale Distanz messen",
    crossReferences: [{ section: "4.5", label: "Öffnungsbewegung" }],
  } satisfies RichStepInstruction,

  /** E4B - Maximum unassisted opening (moderate complexity) */
  maxUnassistedOpening: {
    stepId: "U4B",
    title: "Maximale aktive Mundöffnung",
    patientScript: [
      {
        text: "Öffnen Sie Ihren Mund so weit wie möglich, ",
        style: "verbatim",
      },
      { text: "auch wenn es schmerzhaft ist.", style: "verbatim" },
    ],
    examinerAction: "Interinzisale Distanz messen",
    examinerSteps: [
      "Lineal an Inzisalkante der unteren Schneidezähne anlegen",
      "Distanz zur Inzisalkante der oberen Schneidezähne messen",
      "Vertikalen Überbiss addieren falls nötig",
    ],
    crossReferences: [
      { section: "4.5", label: "Aktive Öffnung" },
      { section: "6.2.1", label: "Schmerzlokalisation" },
    ],
  } satisfies RichStepInstruction,

  /** E4C - Maximum assisted opening */
  maxAssistedOpening: {
    stepId: "U4C",
    title: "Maximale passive Mundöffnung",
    patientScript: [
      { text: "Ich werde jetzt versuchen, ", style: "verbatim" },
      { text: "wenn möglich", style: "optional" },
      { text: ", Ihren Mund mit meinen Fingern noch weiter zu öffnen.", style: "verbatim" },
      { text: " Heben Sie die Hand, wenn Sie möchten, dass ich aufhöre.", style: "verbatim" },
    ],
    examinerAction: "Scherentechnik anwenden, Distanz messen",
    examinerSteps: [
      "Patient maximal öffnen lassen",
      "Daumen auf obere, Zeigefinger auf untere Schneidezähne",
      "Mäßigen Druck anwenden bis Gewebswiderstand",
      "Interinzisale Distanz ablesen",
    ],
    warnings: [E4C_SAFETY_WARNING],
    tips: [
      "Klinisches Urteil anwenden - nicht überdehnen",
      "Messung muss mindestens so groß sein wie bei E4B",
    ],
    crossReferences: [
      { section: "4.5", label: "Passive Öffnung" },
      { section: "6.2.1", label: "Schmerzlokalisation" },
    ],
  } satisfies RichStepInstruction,

  /** Pain interview after movement */
  painInterview: {
    title: "Schmerzbefragung",
    prompt: "Hatten Sie bei dieser Bewegung Schmerzen?",
    flow: PAIN_INTERVIEW_FLOW,
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
    patientScript:
      "Öffnen Sie Ihren Mund so weit wie möglich, auch wenn es schmerzhaft ist.",
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
