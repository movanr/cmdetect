/**
 * FsYesNo with enableWhen condition — shown but dimmed when the sibling
 * condition is not met (paper-form style: all boxes visible, disabled ones greyed out).
 *
 * Clears the field value to null when it becomes disabled, matching the
 * wizard mode's QuestionField behavior.
 */

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useSiblingEnabled } from "../use-sibling-enabled";
import { FsYesNo } from "./FsYesNo";

interface FsConditionalYesNoProps {
  name: string;
  /** Sibling field key that controls enablement */
  sibling: string;
  /** Value the sibling must equal for this field to be enabled */
  equals: unknown;
}

export function FsConditionalYesNo({ name, sibling, equals }: FsConditionalYesNoProps) {
  const enabled = useSiblingEnabled(name, sibling, equals);
  const { setValue, getValues } = useFormContext();
  const wasEnabled = useRef(enabled);

  useEffect(() => {
    if (wasEnabled.current && !enabled && getValues(name) != null) {
      setValue(name, null, { shouldDirty: true });
    }
    wasEnabled.current = enabled;
  }, [enabled, name, setValue, getValues]);

  return <FsYesNo name={name} disabled={!enabled} />;
}
