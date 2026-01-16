/**
 * Clinical instructions for DC-TMD examination sections.
 * German language for clinical use.
 *
 * These are concise instructions for examiners - not tutorial text.
 * Patient scripts are quotable prompts for communication.
 */

/** Instruction content for a single examination step */
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

/** Pain interview guidance content */
export interface PainInterviewInstruction {
  /** Title for the pain interview step */
  title: string;
  /** Patient prompt for pointing to pain areas */
  prompt: string;
  /** Abbreviated flow guidance */
  guidance: string;
}

/**
 * E4 Opening Movements - Clinical Instructions
 *
 * Based on DC-TMD Examiner Protocol Section 4
 */
export const E4_INSTRUCTIONS = {
  /** E4A - Pain-free opening */
  painFreeOpening: {
    stepId: "U4A",
    title: "Schmerzfreie Mundöffnung",
    patientScript: "Öffnen Sie Ihren Mund so weit wie möglich, ohne dass Schmerzen auftreten.",
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
      "Darf ich Ihren Mund weiter öffnen? Heben Sie die Hand, wenn Sie möchten, dass ich aufhöre.",
    examinerAction: "Scherentechnik anwenden, Distanz messen",
  } satisfies StepInstruction,

  /** Pain interview after movement */
  painInterview: {
    title: "Schmerzbefragung",
    prompt: "Zeigen Sie mit dem Finger auf alle Stellen, wo Sie Schmerzen gespürt haben.",
    guidance: "Schmerz? → Bekannter Schmerz? → Bei Temporalis: Bekannter Kopfschmerz?",
  } satisfies PainInterviewInstruction,
} as const;
