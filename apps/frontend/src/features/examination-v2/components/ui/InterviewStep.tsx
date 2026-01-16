import { getSideLabel } from "../../labels";
import type { QuestionInstance } from "../../projections/to-instances";
import { InterviewColumn } from "./InterviewColumn";

export interface InterviewStepProps {
  instances: QuestionInstance[];
}

export function InterviewStep({ instances }: InterviewStepProps) {
  const leftQuestions = instances.filter((i) => i.context.side === "left");
  const rightQuestions = instances.filter((i) => i.context.side === "right");

  return (
    <div className="grid grid-cols-2 gap-6">
      <InterviewColumn title={getSideLabel("left")} questions={leftQuestions} />
      <InterviewColumn title={getSideLabel("right")} questions={rightQuestions} />
    </div>
  );
}
