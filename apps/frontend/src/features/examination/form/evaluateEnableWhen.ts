/**
 * evaluateEnableWhen - Utility for evaluating conditional visibility.
 *
 * Evaluates EnableWhen conditions against form values to determine
 * if a question should be enabled. Supports scope resolution:
 * - "local" (default): Same context (movement, side, region), different semanticId
 * - "global": Any question with matching semanticId
 * - "ancestor": (future) Parent context resolution
 */

import type { Question, EnableWhen, QuestionContext } from "../model/question";

export type FormValues = Record<string, unknown>;

/**
 * Function type for getting a form value by instanceId.
 * Can be React Hook Form's getValues() or a custom implementation.
 */
export type FormValueGetter = (instanceId: string) => unknown;

/**
 * Checks if two contexts are equal for local scope resolution.
 * Compares movement, side, and region properties.
 */
function contextsMatch(a: QuestionContext, b: QuestionContext): boolean {
  return a.movement === b.movement && a.side === b.side && a.region === b.region;
}

/**
 * Resolves a dependency reference to find the target question.
 *
 * Scope resolution:
 * - "local" (default): Same context (movement, side, region), different semanticId
 * - "global": Any question with matching semanticId (first match)
 * - "ancestor": (future) Parent context
 */
export function resolveDependency(
  enableWhen: EnableWhen,
  sourceQuestion: Question,
  allQuestions: Question[]
): Question | undefined {
  const { dependsOn } = enableWhen;
  const scope = dependsOn.scope ?? "local";

  switch (scope) {
    case "local":
      // Same context, different semanticId
      return allQuestions.find(
        (q) =>
          q.semanticId === dependsOn.semanticId &&
          contextsMatch(q.context, sourceQuestion.context)
      );

    case "global":
      // Any question with matching semanticId (first match)
      return allQuestions.find((q) => q.semanticId === dependsOn.semanticId);

    case "ancestor":
      // Future: implement parent context resolution
      console.warn("Ancestor scope not yet implemented");
      return undefined;

    default:
      return undefined;
  }
}

/**
 * Evaluates whether a question should be enabled based on its enableWhen condition.
 *
 * @param question - The question to evaluate
 * @param getValue - Function to get form value by instanceId (e.g., RHF's getValues)
 * @param allQuestions - All questions in the questionnaire (for resolving dependencies)
 * @returns true if the question should be enabled, false otherwise
 */
export function evaluateEnableWhen(
  question: Question,
  getValue: FormValueGetter,
  allQuestions: Question[]
): boolean {
  // No enableWhen = always enabled
  if (!question.enableWhen) {
    return true;
  }

  const dependency = resolveDependency(question.enableWhen, question, allQuestions);
  if (!dependency) {
    // Dependency not found - disable by default (safer)
    console.warn(`EnableWhen dependency not found for ${question.instanceId}`);
    return false;
  }

  // Use the getter function to access form value (handles RHF's nested structure)
  const dependencyValue = getValue(dependency.instanceId);
  const { operator, value } = question.enableWhen;

  switch (operator) {
    case "equals":
      return dependencyValue === value;
    case "notEquals":
      return dependencyValue !== value;
    default:
      return true;
  }
}
