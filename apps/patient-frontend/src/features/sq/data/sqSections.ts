/**
 * Section definitions for the DC/TMD Symptom Questionnaire
 * Used for section-based progress tracking
 */

import type { SQAnswers } from "../model/answer";
import { SQ_SCREENS } from "./sqQuestions";
import { isQuestionEnabled } from "../hooks/evaluateEnableWhen";

export type SQSection = {
  id: string;
  name: string;
  questionIds: string[];
};

export const SQ_SECTIONS: SQSection[] = [
  {
    id: "pain",
    name: "Pain",
    questionIds: ["SQ1", "SQ2", "SQ3", "SQ4_A", "SQ4_B", "SQ4_C", "SQ4_D"],
  },
  {
    id: "headache",
    name: "Headache",
    questionIds: ["SQ5", "SQ6", "SQ7_A", "SQ7_B", "SQ7_C", "SQ7_D"],
  },
  {
    id: "joint_noises",
    name: "Jaw Joint Noises",
    questionIds: ["SQ8"],
  },
  {
    id: "closed_locking",
    name: "Closed Locking",
    questionIds: ["SQ9", "SQ10", "SQ11", "SQ12"],
  },
  {
    id: "open_locking",
    name: "Open Locking",
    questionIds: ["SQ13", "SQ14"],
  },
];

/**
 * Find which section a question belongs to
 */
export function getSectionForQuestion(
  questionId: string
): { section: SQSection; sectionIndex: number } | undefined {
  for (let i = 0; i < SQ_SECTIONS.length; i++) {
    if (SQ_SECTIONS[i].questionIds.includes(questionId)) {
      return { section: SQ_SECTIONS[i], sectionIndex: i };
    }
  }
  return undefined;
}

/**
 * Get the position of a question within its section (among enabled questions only)
 */
export function getQuestionPositionInSection(
  questionId: string,
  answers: SQAnswers
): { current: number; total: number } {
  const sectionInfo = getSectionForQuestion(questionId);
  if (!sectionInfo) {
    return { current: 1, total: 1 };
  }

  const { section } = sectionInfo;

  // Get all questions in this section from SQ_SCREENS (to access enableWhen)
  const sectionQuestions = SQ_SCREENS.filter((q) =>
    section.questionIds.includes(q.id)
  );

  // Filter to only enabled questions
  const enabledQuestions = sectionQuestions.filter((q) =>
    isQuestionEnabled(q, answers)
  );

  // Find current question's position among enabled questions
  const currentIndex = enabledQuestions.findIndex((q) => q.id === questionId);

  return {
    current: currentIndex + 1,
    total: enabledQuestions.length,
  };
}

/**
 * Total number of sections
 */
export const TOTAL_SECTIONS = SQ_SECTIONS.length;
