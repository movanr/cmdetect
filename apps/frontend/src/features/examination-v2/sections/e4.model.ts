import { bilateralPainInterview, spreadChildren } from "../model/builders";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

export const E4_MODEL = M.group({
  painFree: M.group({
    measurement: M.question(Q.measurement({ unit: "mm", required: true }), "measurement"),
  }),
  maxUnassisted: M.group({
    measurement: M.question(Q.measurement({ unit: "mm", required: true }), "measurement"),
    ...spreadChildren(bilateralPainInterview()),
  }),
  maxAssisted: M.group({
    measurement: M.question(Q.measurement({ unit: "mm", required: true }), "measurement"),
    terminated: M.question(Q.boolean(), "terminated"),
    ...spreadChildren(bilateralPainInterview()),
  }),
});

// Steps - arrays of paths or wildcard patterns
export const E4_STEPS = {
  e4a: ["painFree.measurement"],
  "e4b-measure": ["maxUnassisted.measurement"],
  "e4b-interview": "maxUnassisted.*",
  "e4c-measure": ["maxAssisted.measurement", "maxAssisted.terminated"],
  "e4c-interview": "maxAssisted.*",
} as const;
