/**
 * E6: TMJ Sounds during Opening and Closing Movements
 *
 * Per side (right/left): examiner detects click/crepitus during open/close,
 * patient reports click/crepitus. If patient reports click, conditional
 * pain questions follow (painWithClick → familiarPain).
 */

import { JOINT_SOUNDS } from "@cmdetect/dc-tmd";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

/** Sound group without conditional pain fields (used for crepitus) */
function soundGroup() {
  return M.group({
    examinerOpen: M.question(Q.yesNo({ required: true })),
    examinerClose: M.question(Q.yesNo({ required: true })),
    patient: M.question(Q.yesNo({ required: true })),
  });
}

/** Side group: click (with conditional pain) + crepitus (no pain) */
function sideGroup() {
  return M.group({
    [JOINT_SOUNDS.click]: M.group({
      examinerOpen: M.question(Q.yesNo({ required: true })),
      examinerClose: M.question(Q.yesNo({ required: true })),
      patient: M.question(Q.yesNo({ required: true })),
      painWithClick: M.question(
        Q.yesNo({
          required: true,
          enableWhen: { sibling: "patient", equals: "yes" },
        })
      ),
      familiarPain: M.question(
        Q.yesNo({
          required: true,
          enableWhen: { sibling: "painWithClick", equals: "yes" },
        })
      ),
    }),
    [JOINT_SOUNDS.crepitus]: soundGroup(),
  });
}

export const E6_MODEL = M.group({
  right: sideGroup(),
  left: sideGroup(),
});

export const E6_STEPS = {
  "e6-all": ["right.*", "left.*"],
} as const;
