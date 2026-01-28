import { getLabel } from "../../labels";
import type { QuestionInstance } from "../../projections/to-instances";
import { QuestionField } from "../QuestionField";

export interface MeasurementStepProps {
  instances: QuestionInstance[];
}

export function MeasurementStep({ instances }: MeasurementStepProps) {
  return (
    <div className="space-y-4">
      {instances.map((instance) => (
        <QuestionField
          key={instance.path}
          instance={instance}
          label={getLabel(instance.labelKey)}
        />
      ))}
    </div>
  );
}
