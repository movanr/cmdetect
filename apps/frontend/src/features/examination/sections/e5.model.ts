import { MEASUREMENT_FIELDS, MOVEMENT_TYPES } from "@cmdetect/dc-tmd";
import { bilateralPainInterview, spreadChildren } from "../model/builders";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";
import { INTERVIEW_REFUSED_FIELD, REFUSED_FIELD } from "./e4.model";

/** Single movement group: measurement + refused + interviewRefused + bilateral pain interview */
function movementGroup() {
  return M.group({
    [MEASUREMENT_FIELDS.measurement]: M.question(
      Q.measurement({ unit: "mm", required: true }),
      MEASUREMENT_FIELDS.measurement
    ),
    [REFUSED_FIELD]: M.question(Q.boolean(), REFUSED_FIELD),
    [INTERVIEW_REFUSED_FIELD]: M.question(Q.boolean(), INTERVIEW_REFUSED_FIELD),
    ...spreadChildren(bilateralPainInterview()),
  });
}

export const E5_MODEL = M.group({
  [MOVEMENT_TYPES.lateralRight]: movementGroup(),
  [MOVEMENT_TYPES.lateralLeft]: movementGroup(),
  [MOVEMENT_TYPES.protrusive]: movementGroup(),
});

// Steps - arrays of paths or wildcard patterns
export const E5_STEPS = {
  "e5a-measure": [
    `${MOVEMENT_TYPES.lateralRight}.${MEASUREMENT_FIELDS.measurement}`,
    `${MOVEMENT_TYPES.lateralRight}.${REFUSED_FIELD}`,
  ],
  "e5a-interview": [
    `${MOVEMENT_TYPES.lateralRight}.${INTERVIEW_REFUSED_FIELD}`,
    `${MOVEMENT_TYPES.lateralRight}.*`,
  ],
  "e5b-measure": [
    `${MOVEMENT_TYPES.lateralLeft}.${MEASUREMENT_FIELDS.measurement}`,
    `${MOVEMENT_TYPES.lateralLeft}.${REFUSED_FIELD}`,
  ],
  "e5b-interview": [
    `${MOVEMENT_TYPES.lateralLeft}.${INTERVIEW_REFUSED_FIELD}`,
    `${MOVEMENT_TYPES.lateralLeft}.*`,
  ],
  "e5c-measure": [
    `${MOVEMENT_TYPES.protrusive}.${MEASUREMENT_FIELDS.measurement}`,
    `${MOVEMENT_TYPES.protrusive}.${REFUSED_FIELD}`,
  ],
  "e5c-interview": [
    `${MOVEMENT_TYPES.protrusive}.${INTERVIEW_REFUSED_FIELD}`,
    `${MOVEMENT_TYPES.protrusive}.*`,
  ],
} as const;
