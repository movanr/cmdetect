import { ANSWER_VALUES, YES_NO_OPTIONS } from "../../model/answer";
import { QUESTIONNAIRE_ID } from "../../model/constants";
import { PAIN_TYPES, type PainType } from "../../model/pain";
import type { EnableWhen, Question, QuestionContext } from "../../model/question";
import { buildInstanceId } from "../../model/questionInstance";
import { getE4PainTypes } from "../sections/e4-opening";
import { getE9PainTypes } from "../sections/e9-palpation";

export function painPresent(ctx: QuestionContext, painType: PainType): Question {
  const questionnaireId = QUESTIONNAIRE_ID;
  const semanticId = painType;
  const instanceId = buildInstanceId(questionnaireId, semanticId, ctx);
  const enableWhen: EnableWhen = {
    dependsOn: {
      semanticId: PAIN_TYPES.PAIN,
    },
    operator: "equals",
    value: ANSWER_VALUES.YES,
  };
  return {
    questionnaireId,
    semanticId,
    instanceId,
    type: "choice",
    context: ctx,
    multiple: false,
    answerOptions: YES_NO_OPTIONS,
    enableWhen: painType === PAIN_TYPES.PAIN ? undefined : enableWhen,
  };
}

/**
 * Creates pain interview questions for E4 movement assessments.
 * Uses getE4PainTypes() as the source of truth for which pain types apply.
 */
export function painInterviewAfterMovement(ctx: QuestionContext): Question[] {
  if (!ctx.region) {
    return [painPresent(ctx, PAIN_TYPES.PAIN), painPresent(ctx, PAIN_TYPES.FAMILIAR)];
  }
  const painTypes = getE4PainTypes(ctx.region);
  return painTypes.map((painType) => painPresent(ctx, painType));
}

/**
 * Creates pain interview questions for E9 palpation assessments.
 * Uses getE9PainTypes() as the source of truth for which pain types apply.
 */
export function painInterviewDuringPalpation(ctx: QuestionContext): Question[] {
  if (!ctx.region) {
    return [painPresent(ctx, PAIN_TYPES.PAIN), painPresent(ctx, PAIN_TYPES.FAMILIAR)];
  }
  const painTypes = getE9PainTypes(ctx.region);
  return painTypes.map((painType) => painPresent(ctx, painType));
}
