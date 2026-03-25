/**
 * E8: Joint Locking (Gelenkblockierung)
 *
 * Per side (right/left): closed locking and open locking observations.
 * Each locking type has a yes/no observation, plus a conditional reduction
 * field (who reduced it: patient, examiner, or not reduced).
 *
 * Locking events are only documented if observed during the examination.
 */

import { E8_REDUCTION_LABELS } from "@cmdetect/dc-tmd";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

/** Reduction options after locking is observed */
const REDUCTION_OPTIONS = ["patient", "examiner", "notReduced"] as const;

/** Locking group: observed yes/no + conditional reduction */
function lockingGroup() {
  return M.group({
    locking: M.question(Q.yesNo({ required: true })),
    reduction: M.question(
      Q.enum({
        options: REDUCTION_OPTIONS,
        labels: E8_REDUCTION_LABELS,
        required: true,
        enableWhen: { sibling: "locking", equals: "yes" },
      })
    ),
  });
}

/** Side group: closed locking + open locking */
function sideGroup() {
  return M.group({
    closedLocking: lockingGroup(),
    openLocking: lockingGroup(),
  });
}

export const E8_MODEL = M.group({
  right: sideGroup(),
  left: sideGroup(),
});

export const E8_STEPS = {
  "e8-all": ["right.*", "left.*"],
} as const;
