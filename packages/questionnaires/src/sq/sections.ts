/**
 * SQ Section Definitions (German)
 */
import type { SQSection, SQSectionId, SQQuestionId } from "../types";

/**
 * SQ sections with German names and associated questions
 */
export const SQ_SECTIONS: SQSection[] = [
  {
    id: "pain",
    name: "Schmerzen",
    questionIds: ["SQ1", "SQ2", "SQ3", "SQ4_A", "SQ4_B", "SQ4_C", "SQ4_D"],
  },
  {
    id: "headache",
    name: "Kopfschmerzen",
    questionIds: ["SQ5", "SQ6", "SQ7_A", "SQ7_B", "SQ7_C", "SQ7_D"],
  },
  {
    id: "joint_noises",
    name: "Kiefergelenkgeräusche",
    questionIds: ["SQ8"],
  },
  {
    id: "closed_locking",
    name: "Kiefersperre (geschlossen)",
    questionIds: ["SQ9", "SQ10", "SQ11", "SQ12"],
  },
  {
    id: "open_locking",
    name: "Kiefersperre (offen)",
    questionIds: ["SQ13", "SQ14"],
  },
];

/**
 * Section IDs in display order
 */
export const SQ_SECTIONS_ORDER: SQSectionId[] = SQ_SECTIONS.map((s) => s.id);

/**
 * Section names (German) in display order
 * Used for grouping and displaying in the UI
 */
export const SQ_SECTION_NAMES_ORDER: string[] = SQ_SECTIONS.map((s) => s.name);

/**
 * Questions that require "Office use" confirmation (R/L/DNK)
 * These are the questions where practitioners need to confirm laterality
 */
export const SQ_OFFICE_USE_QUESTIONS: Set<SQQuestionId> = new Set([
  "SQ8", // Joint noises
  "SQ9", // Closed locking
  "SQ10",
  "SQ11",
  "SQ12",
  "SQ13", // Open locking
  "SQ14",
]);

/**
 * Get section for a question ID
 */
export function getSectionForQuestion(
  questionId: SQQuestionId
): SQSection | undefined {
  return SQ_SECTIONS.find((section) =>
    section.questionIds.includes(questionId)
  );
}
