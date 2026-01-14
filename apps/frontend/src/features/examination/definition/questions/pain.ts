import { ANSWER_VALUES, YES_NO_OPTIONS } from "../../model/answer";
import { PAIN_TYPES, type PainType } from "../../model/pain";
import type { EnableWhen, Question, QuestionContext } from "../../model/question";
import { buildInstanceId } from "../../model/questionInstance";
import { REGIONS } from "../../model/region";

// note: define QuestionDefinition type for static question definitions and then instantiate them with context

export function painPresent(ctx: QuestionContext, painType: PainType): Question {
  const questionnaireId = "examination";
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

export function painInterviewAfterMovement(ctx: QuestionContext): Question[] {
  const questions: Question[] = [
    painPresent(ctx, PAIN_TYPES.PAIN),
    painPresent(ctx, PAIN_TYPES.FAMILIAR),
  ];

  if (ctx.region === REGIONS.TEMPORALIS) {
    questions.push(painPresent(ctx, PAIN_TYPES.FAMILIAR_HEADACHE));
  }

  return questions;
}

export function painInterviewDuringPalpation(ctx: QuestionContext): Question[] {
  const questions: Question[] = [
    painPresent(ctx, PAIN_TYPES.PAIN),
    painPresent(ctx, PAIN_TYPES.FAMILIAR),
  ];
  if (
    ctx.region === REGIONS.TEMPORALIS_ANT ||
    ctx.region === REGIONS.TEMPORALIS_MEDIA ||
    ctx.region === REGIONS.TEMPORALIS_POST
  ) {
    questions.push(painPresent(ctx, PAIN_TYPES.FAMILIAR_HEADACHE));
  }
  questions.push(painPresent(ctx, PAIN_TYPES.REFERRED));

  return questions;
}
