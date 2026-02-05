import type {
  FieldPath,
  PathValue,
  UseFormClearErrors,
  UseFormSetValue,
} from "react-hook-form";
import type { FormValues } from "./use-examination-form";

/** Type-safe setValue for dynamic instance paths (avoids `as any` casts). */
export function setInstanceValue(
  setValue: UseFormSetValue<FormValues>,
  path: string,
  value: unknown
) {
  setValue(
    path as FieldPath<FormValues>,
    value as PathValue<FormValues, FieldPath<FormValues>>
  );
}

/** Type-safe clearErrors for dynamic instance paths. */
export function clearInstanceErrors(
  clearErrors: UseFormClearErrors<FormValues>,
  path: string
) {
  clearErrors(path as FieldPath<FormValues>);
}
