import { MEASUREMENT_FIELDS, OPENING_TYPES } from "@cmdetect/dc-tmd";
import { bilateralPainInterview, spreadChildren } from "../model/builders";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

export const E4_MODEL = M.group({
  [OPENING_TYPES.painFree]: M.group({
    [MEASUREMENT_FIELDS.measurement]: M.question(
      Q.measurement({ unit: "mm", required: true }),
      MEASUREMENT_FIELDS.measurement
    ),
  }),
  [OPENING_TYPES.maxUnassisted]: M.group({
    [MEASUREMENT_FIELDS.measurement]: M.question(
      Q.measurement({ unit: "mm", required: true }),
      MEASUREMENT_FIELDS.measurement
    ),
    ...spreadChildren(bilateralPainInterview()),
  }),
  [OPENING_TYPES.maxAssisted]: M.group({
    [MEASUREMENT_FIELDS.measurement]: M.question(
      Q.measurement({ unit: "mm", required: true }),
      MEASUREMENT_FIELDS.measurement
    ),
    [MEASUREMENT_FIELDS.terminated]: M.question(Q.boolean(), MEASUREMENT_FIELDS.terminated),
    ...spreadChildren(bilateralPainInterview()),
  }),
});

// Steps - arrays of paths or wildcard patterns
export const E4_STEPS = {
  e4a: [`${OPENING_TYPES.painFree}.${MEASUREMENT_FIELDS.measurement}`],
  "e4b-measure": [`${OPENING_TYPES.maxUnassisted}.${MEASUREMENT_FIELDS.measurement}`],
  "e4b-interview": `${OPENING_TYPES.maxUnassisted}.*`,
  "e4c-measure": [
    `${OPENING_TYPES.maxAssisted}.${MEASUREMENT_FIELDS.measurement}`,
    `${OPENING_TYPES.maxAssisted}.${MEASUREMENT_FIELDS.terminated}`,
  ],
  "e4c-interview": `${OPENING_TYPES.maxAssisted}.*`,
} as const;
