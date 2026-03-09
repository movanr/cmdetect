import { z } from "zod";

export const evaluationSearchSchema = z.object({
  side: z.enum(["right", "left"]).optional(),
  region: z.enum(["temporalis", "masseter", "tmj", "otherMast", "nonMast"]).optional(),
  site: z.string().optional(),
  showAllRegions: z.boolean().optional(),
});

export type EvaluationSearch = z.output<typeof evaluationSearchSchema>;
