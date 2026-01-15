/**
 * TerminatedCheckbox - Checkbox for indicating if examination was terminated
 *
 * Used for boolean "terminated" indicators in the examination form.
 */

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { EXAMINATION_LABELS } from "../../content/labels";

interface TerminatedCheckboxProps {
  /** The field name (instanceId from the question) */
  name: string;
  /** Custom label (default: from EXAMINATION_LABELS) */
  label?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Optional className for the container */
  className?: string;
}

export function TerminatedCheckbox({
  name,
  label,
  disabled = false,
  className,
}: TerminatedCheckboxProps) {
  const { control } = useFormContext();
  const displayLabel = label ?? EXAMINATION_LABELS.terminated?.text ?? "Abgebrochen";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`flex items-center gap-2 space-y-0 ${className ?? ""}`}>
          <FormControl>
            <Checkbox
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              disabled={disabled}
              id={name}
            />
          </FormControl>
          <FormLabel htmlFor={name} className="cursor-pointer font-normal">
            {displayLabel}
          </FormLabel>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
