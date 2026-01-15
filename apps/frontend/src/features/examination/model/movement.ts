export const MOVEMENTS = {
  MAX_UNASSISTED_OPENING: "maxUnassistedOpening",
  MAX_ASSISTED_OPENING: "maxAssistedOpening",
  RIGHT_LATERAL: "rightLateral",
  LEFT_LATERAL: "leftLateral",
  PROTRUSION: "protrusion",
} as const;

export type Movement = (typeof MOVEMENTS)[keyof typeof MOVEMENTS];
