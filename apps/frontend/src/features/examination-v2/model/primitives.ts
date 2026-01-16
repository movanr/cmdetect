import { z } from "zod";

type Primitive<T, TRender extends string> = {
  renderType: TRender;
  schema: z.ZodType<T>;
  defaultValue: T;
};

export const Q = {
  boolean: (): Primitive<boolean, "checkbox"> => ({
    renderType: "checkbox",
    schema: z.boolean(),
    defaultValue: false,
  }),

  yesNo: (): Primitive<"yes" | "no" | null, "yesNo"> => ({
    renderType: "yesNo",
    schema: z.enum(["yes", "no"]).nullable(),
    defaultValue: null,
  }),

  measurement: (
    config: { unit?: string; min?: number; max?: number } = {}
  ): Primitive<number | null, "measurement"> => ({
    renderType: "measurement",
    schema: z
      .number()
      .min(config.min ?? 0)
      .max(config.max ?? 100)
      .nullable(),
    defaultValue: null,
  }),
};

export type AnyPrimitive = ReturnType<(typeof Q)[keyof typeof Q]>;
