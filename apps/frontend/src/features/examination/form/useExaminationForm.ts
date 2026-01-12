import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import type { z } from "zod";
import type { ExaminationAnswers } from "../model/answer";

export function useExaminationForm(schema: z.ZodTypeAny, storedAnswers?: ExaminationAnswers) {
  return useForm({
    resolver: flatZodResolver(schema),
    defaultValues: storedAnswers ?? {},
    mode: "onChange",
  });
}

function flatZodResolver(schema: z.ZodSchema): Resolver {
  return async (values) => {
    const flatValues = flattenObject(values);
    const result = schema.safeParse(flatValues);

    if (result.success) {
      return {
        values,
        errors: {},
      };
    }

    return {
      values: {},
      errors: mapZodErrorsToRHF(result.error),
    };
  };
}

export function flattenObject(value: any, prefix = "", result: Record<string, any> = {}) {
  // Case 1: array of primitives → VALUE ARRAY (keep as-is)
  if (Array.isArray(value) && value.every((v) => v === null || typeof v !== "object")) {
    if (prefix) result[prefix] = value;
    return result;
  }

  // Case 2: array of objects / holes → STRUCTURAL ARRAY
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (item === undefined) return;
      const path = prefix ? `${prefix}.${index}` : String(index);
      flattenObject(item, path, result);
    });
    return result;
  }

  // Case 3: object
  if (value !== null && typeof value === "object") {
    for (const key in value) {
      const path = prefix ? `${prefix}.${key}` : key;
      flattenObject(value[key], path, result);
    }
    return result;
  }

  // Case 4: primitive leaf
  if (prefix) {
    result[prefix] = value;
  }

  return result;
}

function mapZodErrorsToRHF(zodError: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of zodError.issues) {
    const path = issue.path.join("."); // e.g. "3.2"
    setNested(errors, path, {
      type: "validation",
      message: issue.message,
    });
  }

  return errors;
}

function setNested(obj: any, path: string, value: any) {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] ??= {};
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
}
