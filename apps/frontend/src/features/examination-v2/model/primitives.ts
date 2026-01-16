import { z } from "zod";
import type { EnableWhen } from "./conditions";

type Primitive<T, TRender extends string, TConfig = Record<string, unknown>> = {
  renderType: TRender;
  schema: z.ZodType<T>;
  defaultValue: T;
  config: TConfig;
};

type BooleanConfig = { required?: boolean };
type YesNoConfig = { required?: boolean; enableWhen?: EnableWhen };
type MeasurementConfig = { unit?: string; min?: number; max?: number; required?: boolean };

export const Q = {
  boolean: (config: BooleanConfig = {}): Primitive<boolean, "checkbox", BooleanConfig> => ({
    renderType: "checkbox",
    schema: z.boolean(),
    defaultValue: false,
    config,
  }),

  yesNo: (config: YesNoConfig = {}): Primitive<"yes" | "no" | null, "yesNo", YesNoConfig> => ({
    renderType: "yesNo",
    // Fields with enableWhen use nullable schema; refinement handles conditional required
    schema:
      config.required && !config.enableWhen
        ? z.enum(["yes", "no"], {
            required_error: "Selection required",
            invalid_type_error: "Selection required",
          })
        : z.enum(["yes", "no"]).nullable(),
    defaultValue: null,
    config,
  }),

  measurement: (
    config: MeasurementConfig = {}
  ): Primitive<number | null, "measurement", MeasurementConfig> => ({
    renderType: "measurement",
    schema: config.required
      ? z
          .number()
          .min(config.min ?? 0, { message: `Minimum: ${config.min ?? 0}` })
          .max(config.max ?? 100, { message: `Maximum: ${config.max ?? 100}` })
          .nullable()
          .refine((v): v is number => v !== null && !Number.isNaN(v), {
            message: "Wert erforderlich",
          })
      : z
          .number()
          .min(config.min ?? 0)
          .max(config.max ?? 100)
          .nullable(),
    defaultValue: null,
    config,
  }),
};

export type AnyPrimitive = ReturnType<(typeof Q)[keyof typeof Q]>;
