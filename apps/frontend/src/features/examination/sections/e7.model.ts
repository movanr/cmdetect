/**
 * E7: TMJ Sounds during Lateral and Protrusive Movements
 *
 * Per side (right/left): single examiner observation (across all 3 movements)
 * and patient report for click/crepitus. If patient reports click, conditional
 * pain questions follow (painWithClick → familiarPain).
 *
 * Simpler than E6: one examiner field per sound (not split by open/close).
 */

import { JOINT_SOUNDS } from "@cmdetect/dc-tmd";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

/** Side group: click (with conditional pain) + crepitus (no pain) */
function sideGroup() {
  return M.group({
    [JOINT_SOUNDS.click]: M.group({
      examiner: M.question(Q.yesNo({ required: true })),
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
    [JOINT_SOUNDS.crepitus]: M.group({
      examiner: M.question(Q.yesNo({ required: true })),
      patient: M.question(Q.yesNo({ required: true })),
    }),
  });
}

export const E7_MODEL = M.group({
  right: sideGroup(),
  left: sideGroup(),
});

export const E7_STEPS = {
  "e7-all": ["right.*", "left.*"],
} as const;
