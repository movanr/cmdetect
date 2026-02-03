/**
 * Clinical instructions for DC-TMD examination sections.
 * German language for clinical use.
 *
 * These are concise instructions for examiners - not tutorial text.
 * Patient scripts are quotable prompts for communication.
 */

import type {
  PainInterviewFlowStep,
  ProcedurePhase,
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
// E4C Multi-Phase Procedure Definition
// ============================================================================

/** Safety warning for assisted opening */
const E4C_SAFETY_WARNING: SafetyWarning = {
  message: "Bei Handheben des Patienten sofort stoppen",
  level: "caution",
};

/** E4C Procedure Phases */
const E4C_PHASES: ProcedurePhase[] = [
  {
    id: "prep",
    name: "Vorbereitung",
    patientScript: [
      { text: "Gleich werde ich versuchen, ", style: "verbatim" },
      { text: "wenn möglich", style: "optional" },
      {
        text: " Ihren Mund mit meinen Fingern noch weiter zu öffnen. ",
        style: "verbatim",
      },
      {
        text: "Wenn Sie möchten, dass ich aufhöre, heben Sie bitte Ihre Hand. Dann werde ich sofort aufhören.",
        style: "verbatim",
      },
    ],
    examinerSteps: [
      "Lineal bereithalten",
      "Position für Scherentechnik vorbereiten",
      "Patienten auf Signal hinweisen",
    ],
  },
  {
    id: "execute",
    name: "Durchführung",
    patientScript: [
      {
        text: "Bitte öffnen Sie jetzt so weit wie möglich, auch wenn es schmerzhaft ist, so wie Sie es eben schon gemacht haben.",
        style: "verbatim",
      },
      { text: " Pause ", style: "optional" },
      { text: "Sie spüren jetzt gleich meine Finger.", style: "flexible" },
      {
        text: " Bitte entspannen Sie Ihren Kiefer, so dass ich Ihnen helfen kann, noch weiter zu öffnen, wenn möglich.",
        style: "verbatim",
      },
    ],
    examinerSteps: [
      "Lineal wie bei E4A positionieren",
      "Sicherstellen dass Patient maximal geöffnet hat",
      "Daumen auf obere Schneidezähne, Zeigefinger gekreuzt auf untere",
      "Kiefer abstützen BEVOR 'Entspannen' gesagt wird",
      "Mäßigen Druck anwenden bis Gewebswiderstand oder Patient stoppt",
    ],
    tips: ["Klinisches Urteil anwenden - nicht überdehnen"],
  },
  {
    id: "measure",
    name: "Messung",
    examinerSteps: [
      "Interinzisale Distanz ablesen während Druck aufrechterhalten wird",
      "Bei Abbruch durch Patient: 'Abgebrochen' markieren",
    ],
  },
];

// ============================================================================
// Pain Interview Flow Definition
// ============================================================================

/** Pain interview decision flow */
const PAIN_INTERVIEW_FLOW: PainInterviewFlowStep[] = [
  {
    id: "pain",
    question: "Schmerz?",
    nextOnYes: "locate",
    nextOnNo: "end",
  },
  {
    id: "locate",
    question: "Zeigen",
    nextOnYes: "familiar",
  },
  {
    id: "familiar",
    question: "Bekannt?",
    nextOnYes: "end",
    nextOnNo: "end",
    regionSpecific: [
      { region: "Temporalis", question: "Bekannter Kopfschmerz?" },
      { region: "Alle", question: "Zieht es woanders hin?" },
    ],
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

  /** E4C - Maximum assisted opening (complex, multi-phase) */
  maxAssistedOpening: {
    stepId: "U4C",
    title: "Maximale passive Mundöffnung",
    patientScript: [
      { text: "Gleich werde ich versuchen, ", style: "verbatim" },
      { text: "wenn möglich", style: "optional" },
      {
        text: " Ihren Mund mit meinen Fingern noch weiter zu öffnen.",
        style: "verbatim",
      },
    ],
    examinerAction: "Scherentechnik anwenden, Distanz messen",
    phases: E4C_PHASES,
    warnings: [E4C_SAFETY_WARNING],
    crossReferences: [
      { section: "4.5", label: "Passive Öffnung" },
      { section: "6.2.1", label: "Schmerzlokalisation" },
    ],
    tips: [
      "Bei sehr eingeschränkter Öffnung kann passive Dehnung entfallen",
      "Nicht über Schmerztoleranz des Patienten hinaus dehnen",
    ],
  } satisfies RichStepInstruction,

  /** Pain interview after movement */
  painInterview: {
    title: "Schmerzbefragung",
    prompt: "Zeigen Sie mit dem Finger auf alle Stellen, wo Sie Schmerzen gespürt haben.",
    guidance: "Schmerz? → Bekannter Schmerz? → Bei Temporalis: Bekannter Kopfschmerz?",
    flow: PAIN_INTERVIEW_FLOW,
    crossReferences: [
      { section: "6.2.1", label: "Schmerzlokalisation" },
      { section: "6.2.4", label: "Bekannter Schmerz" },
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
    prompt: "Zeigen Sie mit dem Finger auf alle Stellen, wo Sie Schmerzen gespürt haben.",
    guidance: "Schmerz? → Bekannter Schmerz? → Bei Temporalis: Bekannter Kopfschmerz?",
  } satisfies PainInterviewInstruction,
} as const;

// ============================================================================
// Type Guards and Helpers
// ============================================================================

/**
 * Check if an instruction is a rich step instruction with phases
 */
export function isMultiPhaseInstruction(
  instruction: RichStepInstruction
): instruction is RichStepInstruction & { phases: ProcedurePhase[] } {
  return instruction.phases != null && instruction.phases.length > 0;
}

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
