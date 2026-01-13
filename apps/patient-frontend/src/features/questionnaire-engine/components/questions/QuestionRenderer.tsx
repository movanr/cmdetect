/**
 * Question Renderer - Routes to the appropriate question component based on type
 */

import type { ScoredOption, GenericSection } from "@cmdetect/questionnaires";
import type { GenericQuestion } from "../../types";
import { ScaleQuestion } from "./ScaleQuestion";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { NumericQuestion } from "./NumericQuestion";

type QuestionRendererProps = {
  question: GenericQuestion;
  options?: readonly ScoredOption[];
  sections?: readonly GenericSection[];
  instruction?: string;
  onNavigateNext: () => void;
};

/**
 * Find section for a question
 */
function findSection(
  question: GenericQuestion,
  sections?: readonly GenericSection[]
): GenericSection | undefined {
  if (question.section && sections) {
    return sections.find((s) => s.id === question.section);
  }
  return undefined;
}

/**
 * Resolve options for a question - checks section-specific options first,
 * then falls back to questionnaire-level options
 */
function resolveOptions(
  question: GenericQuestion,
  options?: readonly ScoredOption[],
  sections?: readonly GenericSection[]
): readonly ScoredOption[] | undefined {
  // If question has a section, look up section-specific options
  const section = findSection(question, sections);
  if (section?.options) {
    return section.options;
  }
  // Fall back to questionnaire-level options
  return options;
}

/**
 * Resolve instruction for a question - uses section title if available,
 * otherwise falls back to questionnaire-level instruction
 */
function resolveInstruction(
  question: GenericQuestion,
  instruction?: string,
  sections?: readonly GenericSection[]
): string | undefined {
  // If question has a section with a title, use that
  const section = findSection(question, sections);
  if (section?.title) {
    return section.title;
  }
  // Fall back to questionnaire-level instruction
  return instruction;
}

export function QuestionRenderer({
  question,
  options,
  sections,
  instruction,
  onNavigateNext,
}: QuestionRendererProps) {
  switch (question.type) {
    case "scale_0_10":
      return (
        <ScaleQuestion question={question} onNavigateNext={onNavigateNext} />
      );

    case "choice": {
      const resolvedOptions = resolveOptions(question, options, sections);
      const resolvedInstruction = resolveInstruction(question, instruction, sections);
      if (!resolvedOptions) {
        console.error("ChoiceQuestion requires options");
        return null;
      }
      return (
        <ChoiceQuestion
          question={question}
          options={resolvedOptions}
          instruction={resolvedInstruction}
          onNavigateNext={onNavigateNext}
        />
      );
    }

    case "numeric":
      return (
        <NumericQuestion question={question} onNavigateNext={onNavigateNext} />
      );

    default:
      console.error(`Unknown question type: ${(question as GenericQuestion).type}`);
      return null;
  }
}
