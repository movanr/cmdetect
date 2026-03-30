/**
 * FsYesNo with enableWhen condition — shown but dimmed when the sibling
 * condition is not met (paper-form style: all boxes visible, disabled ones greyed out).
 *
 * Clears the field value to null when it becomes disabled, matching the
 * wizard mode's QuestionField behavior.
 *
 * Values are received via props (from the section-level useWatch) instead of
 * individual useWatch hooks — keeps per-section subscription count at 1.
 */

import { memo, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FsYesNo } from "./FsYesNo";

interface FsConditionalYesNoProps {
  name: string;
  value: "yes" | "no" | null;
  /** Current value of the sibling field that controls enablement */
  siblingValue: unknown;
  /** Value the sibling must equal for this field to be enabled */
  equals: unknown;
}

export const FsConditionalYesNo = memo(function FsConditionalYesNo({
  name,
  value,
  siblingValue,
  equals,
}: FsConditionalYesNoProps) {
  const enabled = siblingValue === equals;
  const { setValue, getValues } = useFormContext();
  const wasEnabled = useRef(enabled);

  useEffect(() => {
    if (wasEnabled.current && !enabled && getValues(name) != null) {
      setValue(name, null, { shouldDirty: true });
    }
    wasEnabled.current = enabled;
  }, [enabled, name, setValue, getValues]);

  return <FsYesNo name={name} value={value} disabled={!enabled} />;
});
