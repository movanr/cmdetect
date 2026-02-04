import { MEASUREMENT_FIELDS, OPENING_TYPES } from "@cmdetect/dc-tmd";
import { bilateralPainInterview, spreadChildren } from "../model/builders";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

/** Field name for patient refusal (RF) */
export const REFUSED_FIELD = "refused" as const;
/** Field name for interview refusal (RF) */
export const INTERVIEW_REFUSED_FIELD = "interviewRefused" as const;

export const E4_MODEL = M.group({
  [OPENING_TYPES.painFree]: M.group({
    [MEASUREMENT_FIELDS.measurement]: M.question(
      Q.measurement({ unit: "mm", required: true }),
      MEASUREMENT_FIELDS.measurement
    ),
    [REFUSED_FIELD]: M.question(Q.boolean(), REFUSED_FIELD),
  }),
  [OPENING_TYPES.maxUnassisted]: M.group({
    [MEASUREMENT_FIELDS.measurement]: M.question(
      Q.measurement({ unit: "mm", required: true }),
      MEASUREMENT_FIELDS.measurement
    ),
    [REFUSED_FIELD]: M.question(Q.boolean(), REFUSED_FIELD),
    [INTERVIEW_REFUSED_FIELD]: M.question(Q.boolean(), INTERVIEW_REFUSED_FIELD),
    ...spreadChildren(bilateralPainInterview()),
  }),
  [OPENING_TYPES.maxAssisted]: M.group({
    [MEASUREMENT_FIELDS.measurement]: M.question(
      Q.measurement({ unit: "mm", required: true }),
      MEASUREMENT_FIELDS.measurement
    ),
    [MEASUREMENT_FIELDS.terminated]: M.question(Q.boolean(), MEASUREMENT_FIELDS.terminated),
    [REFUSED_FIELD]: M.question(Q.boolean(), REFUSED_FIELD),
    [INTERVIEW_REFUSED_FIELD]: M.question(Q.boolean(), INTERVIEW_REFUSED_FIELD),
    ...spreadChildren(bilateralPainInterview()),
  }),
});

// Steps - arrays of paths or wildcard patterns
export const E4_STEPS = {
  e4a: [
    `${OPENING_TYPES.painFree}.${MEASUREMENT_FIELDS.measurement}`,
    `${OPENING_TYPES.painFree}.${REFUSED_FIELD}`,
  ],
  "e4b-measure": [
    `${OPENING_TYPES.maxUnassisted}.${MEASUREMENT_FIELDS.measurement}`,
    `${OPENING_TYPES.maxUnassisted}.${REFUSED_FIELD}`,
  ],
  "e4b-interview": [
    `${OPENING_TYPES.maxUnassisted}.${INTERVIEW_REFUSED_FIELD}`,
    `${OPENING_TYPES.maxUnassisted}.*`,
  ],
  "e4c-measure": [
    `${OPENING_TYPES.maxAssisted}.${MEASUREMENT_FIELDS.measurement}`,
    `${OPENING_TYPES.maxAssisted}.${MEASUREMENT_FIELDS.terminated}`,
    `${OPENING_TYPES.maxAssisted}.${REFUSED_FIELD}`,
  ],
  "e4c-interview": [
    `${OPENING_TYPES.maxAssisted}.${INTERVIEW_REFUSED_FIELD}`,
    `${OPENING_TYPES.maxAssisted}.*`,
  ],
} as const;
