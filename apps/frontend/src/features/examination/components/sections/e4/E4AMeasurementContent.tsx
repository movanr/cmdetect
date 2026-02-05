import { useCallback } from "react";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import {
  clearInstanceErrors,
  setInstanceValue,
} from "../../../form/form-helpers";
import type { FormValues } from "../../../form/use-examination-form";
import { COMMON, getLabel } from "../../../labels";
import type { QuestionInstance } from "../../../projections/to-instances";
import { RefusalCheckbox } from "../../inputs/RefusalCheckbox";
import { QuestionField } from "../../QuestionField";

export interface E4AMeasurementContentProps {
  stepInstances: QuestionInstance[];
}

export function E4AMeasurementContent({ stepInstances }: E4AMeasurementContentProps) {
  const { setValue, watch, clearErrors } = useFormContext<FormValues>();

  // Find measurement and refused instances
  const measurementInstance = stepInstances.find((i) => i.renderType === "measurement");
  const refusedInstance = stepInstances.find((i) => i.path.endsWith(".refused"));

  const watchedRefused = refusedInstance ? watch(refusedInstance.path as FieldPath<FormValues>) : undefined;
  const isRefused = (watchedRefused as unknown as boolean) === true;

  // Handle refused toggle - clear measurement value when refusing
  const handleRefuseChange = useCallback(
    (refused: boolean) => {
      if (refused && measurementInstance) {
        setInstanceValue(setValue, measurementInstance.path, null);
        clearInstanceErrors(clearErrors, measurementInstance.path);
      }
    },
    [measurementInstance, setValue, clearErrors]
  );

  return (
    <div className="space-y-4">
      {/* Measurement input - disabled when refused */}
      {measurementInstance && (
        <div className={isRefused ? "opacity-50 pointer-events-none" : ""}>
          <QuestionField
            instance={measurementInstance}
            label={getLabel(measurementInstance.labelKey)}
          />
          {isRefused && (
            <p className="text-sm text-muted-foreground mt-1">{COMMON.refused}</p>
          )}
        </div>
      )}

      {/* Refusal checkbox */}
      {refusedInstance && (
        <RefusalCheckbox<FormValues>
          name={refusedInstance.path as FieldPath<FormValues>}
          onRefuseChange={handleRefuseChange}
        />
      )}
    </div>
  );
}
