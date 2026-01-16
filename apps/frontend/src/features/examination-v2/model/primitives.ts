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
    schema: z.enum(["yes", "no"]).nullable(),
    defaultValue: null,
    config,
  }),

  measurement: (
    config: MeasurementConfig = {}
  ): Primitive<number | null, "measurement", MeasurementConfig> => ({
    renderType: "measurement",
    schema: z.number().nullable(),
    defaultValue: null,
    config,
  }),
};

export type AnyPrimitive = ReturnType<(typeof Q)[keyof typeof Q]>;
