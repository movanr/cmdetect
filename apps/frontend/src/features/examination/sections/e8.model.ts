/**
 * E8: Joint Locking (Gelenkblockierung)
 *
 * Per side (right/left): closed locking and open locking observations.
 * Each locking type has a yes/no observation, plus two conditional yes/no
 * fields capturing whether the patient or the examiner was able to reduce
 * the locking. The two "reducible by" fields are independent — either,
 * both, or neither may be "yes".
 *
 * Locking events are only documented if observed during the examination.
 */

import { M } from "../model/nodes";
import { Q } from "../model/primitives";

/** Locking group: observed yes/no + two conditional "reducible by" yes/no */
function lockingGroup() {
  return M.group({
    locking: M.question(Q.yesNo({ required: true })),
    reducibleByPatient: M.question(
      Q.yesNo({
        required: true,
        enableWhen: { sibling: "locking", equals: "yes" },
      })
    ),
    reducibleByExaminer: M.question(
      Q.yesNo({
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
