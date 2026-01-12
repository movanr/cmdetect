/**
 * Section utilities for the DC/TMD Symptom Questionnaire
 * Uses shared section definitions, adds patient-frontend specific utilities
 */

import {
  SQ_SCREENS,
  SQ_SECTIONS,
  isQuestionEnabled,
  type SQAnswers,
  type SQSection,
  type SQQuestionId,
} from "@cmdetect/questionnaires";

// Re-export from shared package
export { SQ_SECTIONS, type SQSection };

/**
 * Find which section a question belongs to
 */
export function getSectionForQuestion(
  questionId: SQQuestionId
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
 * Used for showing progress like "Question 2 of 4 in Pain section"
 */
export function getQuestionPositionInSection(
  questionId: SQQuestionId,
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
    isQuestionEnabled(q.enableWhen, answers)
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
