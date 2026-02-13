/**
 * E11: Examiner Comments
 *
 * One optional text comment per examination section (E1-E10).
 * Used for recording pertinent findings not captured by the standard protocol.
 */

import { M } from "../model/nodes";
import { Q } from "../model/primitives";

export const E11_MODEL = M.group({
  e1: M.question(Q.text(), "e1"),
  e2: M.question(Q.text(), "e2"),
  e3: M.question(Q.text(), "e3"),
  e4: M.question(Q.text(), "e4"),
  e5: M.question(Q.text(), "e5"),
  e6: M.question(Q.text(), "e6"),
  e7: M.question(Q.text(), "e7"),
  e8: M.question(Q.text(), "e8"),
  e9: M.question(Q.text(), "e9"),
  e10: M.question(Q.text(), "e10"),
});

export const E11_STEPS = {
  "e11-all": ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "e10"],
} as const;
