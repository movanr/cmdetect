import { PAIN_BLUEPRINTS } from "../definition/questions/pain";
import { instantiateQuestions } from "../instantiate/instantiateQuestion";
import type { QuestionInstance } from "../model/instance/questionInstance";
import type { Question } from "../model/question";
import { REGIONS, type Region } from "../model/region";
import { SIDES, type Side } from "../model/side";

export const testQuestions: Question[] = [
  {
    id: "1",
    type: "numeric",
    label: {
      en: "What is your age?",
      de: "Was ist Ihr Alter?",
    },
    min: 0,
    max: 120,
  },
  {
    id: "2",
    type: "numeric",
    label: {
      en: "What is your age?",
      de: "Was ist Ihr Alter?",
    },
    min: 0,
    max: 120,
  },
  {
    id: "3",
    type: "group",
    label: {
      en: "Test Group Question",
      de: "Teste Gruppenfrage",
    },
    questions: [
      {
        id: "3.1",
        type: "choice",
        label: { en: "Choose any", de: "Wähle aus" },
        multiple: true,
        answerOptions: [{ id: "3.1.1", label: { en: "option 1", de: "Option 1" } }],
      },
      {
        id: "3.2",
        type: "numeric",
        label: {
          en: "Input some number between -10 and 10",
          de: "Gib eine Zahl zwischen -10 und 10 an",
        },
        min: -10,
        max: 10,
      },
      {
        id: "3.3",
        type: "numeric",
        unit: "mm",
        label: {
          en: "Input a measurement in mm from 0 to 100",
          de: "Gib eine Messung in mm von 0 bis 100 ein",
        },
        min: 0,
        max: 100,
      },
    ],
  },
];

function instantiateFullPainInterview(
  sides: readonly Side[],
  regions: readonly Region[]
): QuestionInstance[] {
  return sides.flatMap((side) =>
    regions.flatMap((region) => instantiateQuestions(PAIN_BLUEPRINTS, { side, region }))
  );
}

const sides = Object.values(SIDES);
const regions = Object.values(REGIONS);

export const PAIN_INTERVIEW_INSTANCES = instantiateFullPainInterview(sides, regions);
