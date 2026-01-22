import { z } from "zod";
import type { EnableWhen } from "./conditions";
import type { PalpationMode, SiteDetailMode } from "./regions";

type Primitive<T, TRender extends string, TConfig = Record<string, unknown>> = {
  renderType: TRender;
  schema: z.ZodType<T>;
  defaultValue: T;
  config: TConfig;
};

type BooleanConfig = { required?: boolean };
type YesNoConfig = { required?: boolean; enableWhen?: EnableWhen };
type MeasurementConfig = { unit?: string; min?: number; max?: number; required?: boolean; allowNegative?: boolean; enableWhen?: EnableWhen };
type EnumConfig<T extends string> = { options: readonly T[]; required?: boolean; labels?: Record<T, string>; enableWhen?: EnableWhen };
type CheckboxGroupConfig<T extends string> = { options: readonly T[]; required?: boolean; labels?: Record<T, string> };

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

  palpationMode: (): Primitive<PalpationMode, "palpationMode", Record<string, never>> => ({
    renderType: "palpationMode",
    schema: z.enum(["basic", "standard", "extended"]),
    defaultValue: "standard",
    config: {},
  }),

  siteDetailMode: (): Primitive<SiteDetailMode, "siteDetailMode", Record<string, never>> => ({
    renderType: "siteDetailMode",
    schema: z.enum(["detailed", "grouped"]),
    defaultValue: "detailed",
    config: {},
  }),

  /**
   * Enum primitive for single selection from a set of options.
   * Renders as radio buttons or select dropdown.
   */
  enum: <T extends string>(
    config: EnumConfig<T>
  ): Primitive<T | null, "enum", EnumConfig<T>> => ({
    renderType: "enum",
    schema: z.enum(config.options as unknown as [T, ...T[]]).nullable(),
    defaultValue: null,
    config,
  }),

  /**
   * Checkbox group primitive for multiple selection.
   * Renders as a group of checkboxes.
   */
  checkboxGroup: <T extends string>(
    config: CheckboxGroupConfig<T>
  ): Primitive<T[], "checkboxGroup", CheckboxGroupConfig<T>> => ({
    renderType: "checkboxGroup",
    schema: z.array(z.enum(config.options as unknown as [T, ...T[]])),
    defaultValue: [],
    config,
  }),
};

export type AnyPrimitive = ReturnType<(typeof Q)[keyof typeof Q]>;
