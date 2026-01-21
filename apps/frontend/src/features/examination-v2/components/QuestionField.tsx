import { useEffect } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { QuestionInstance } from "../projections/to-instances";
import { YesNoField } from "./inputs/YesNoField";
import { MeasurementField } from "./inputs/MeasurementField";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext, Controller } from "react-hook-form";
import { useFieldEnabled } from "../hooks/use-field-enabled";

interface QuestionFieldProps {
  instance: QuestionInstance;
  label?: string;
}

export function QuestionField({ instance, label }: QuestionFieldProps) {
  const { renderType, path, config } = instance;
  const { watch, setValue } = useFormContext();

  const enabled = useFieldEnabled(instance);
  const value = watch(path);

  // Clear value when field becomes disabled
  useEffect(() => {
    if (!enabled && value != null) {
      setValue(path, null);
    }
  }, [enabled, value, path, setValue]);

  if (!enabled) return null;

  switch (renderType) {
    case "yesNo":
      return <YesNoField name={path as FieldPath<FieldValues>} label={label} />;

    case "measurement":
      return (
        <MeasurementField
          name={path as FieldPath<FieldValues>}
          label={label}
          unit={config.unit as string | undefined}
          min={config.min as number | undefined}
          max={config.max as number | undefined}
        />
      );

    case "checkbox":
      return <CheckboxField name={path as FieldPath<FieldValues>} label={label} />;

    default:
      return null;
  }
}

// Simple checkbox field component
function CheckboxField<T extends FieldValues>({
  name,
  label,
}: {
  name: FieldPath<T>;
  label?: string;
}) {
  const { control, clearErrors } = useFormContext<T>();

  // Check if this is a "terminated" checkbox that should clear sibling measurement error
  const isTerminatedCheckbox = name.endsWith(".terminated");
  const siblingMeasurementPath = isTerminatedCheckbox
    ? (name.replace(/\.terminated$/, ".measurement") as FieldPath<T>)
    : null;

  const handleCheckedChange = (checked: boolean, onChange: (value: boolean) => void) => {
    onChange(checked);
    // When terminated is checked, clear the error on the sibling measurement field
    if (checked && siblingMeasurementPath) {
      clearErrors(siblingMeasurementPath);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex items-center gap-2">
          <Checkbox
            id={name}
            checked={field.value}
            onCheckedChange={(checked) =>
              handleCheckedChange(checked === true, field.onChange)
            }
          />
          {label && (
            <label htmlFor={name} className="text-sm text-muted-foreground">
              {label}
            </label>
          )}
        </div>
      )}
    />
  );
}
