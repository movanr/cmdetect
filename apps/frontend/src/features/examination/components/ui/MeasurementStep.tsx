import { useCallback } from "react";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { COMMON, getLabel } from "../../labels";
import type { QuestionInstance } from "../../projections/to-instances";
import { RefusalCheckbox } from "../inputs/RefusalCheckbox";
import { QuestionField } from "../QuestionField";

export interface MeasurementStepProps {
  instances: QuestionInstance[];
}

export function MeasurementStep({ instances }: MeasurementStepProps) {
  const { setValue, watch, clearErrors } = useFormContext<FormValues>();

  // Find measurement and refused instances
  const measurementInstance = instances.find((i) => i.renderType === "measurement");
  const refusedInstance = instances.find((i) => i.path.endsWith(".refused"));
  const otherInstances = instances.filter(
    (i) => i.renderType !== "measurement" && !i.path.endsWith(".refused")
  );

  const watchedRefused = refusedInstance ? watch(refusedInstance.path as FieldPath<FormValues>) : undefined;
  const isRefused = (watchedRefused as unknown as boolean) === true;

  // Handle refused toggle - clear measurement value when refusing
  const handleRefuseChange = useCallback(
    (refused: boolean) => {
      if (refused && measurementInstance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(measurementInstance.path as FieldPath<FormValues>, null as any);
        clearErrors(measurementInstance.path as FieldPath<FormValues>);
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

      {/* Other fields (like terminated checkbox) */}
      {otherInstances.map((instance) => (
        <QuestionField
          key={instance.path}
          instance={instance}
          label={getLabel(instance.labelKey)}
        />
      ))}

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
