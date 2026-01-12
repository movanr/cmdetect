/**
 * Question type definitions for PHQ-4
 * Simple structure: all questions have the same answer options
 */

export type PHQ4Option = {
  value: string;
  label: string;
  score: number;
};

export type PHQ4Question = {
  id: string;
  text: string;
};

export type PHQ4Questionnaire = {
  id: string;
  title: string;
  instruction: string;
  questions: PHQ4Question[];
  options: PHQ4Option[];
};
