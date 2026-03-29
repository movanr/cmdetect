/**
 * E11: Examiner Comments
 *
 * Single free-text comment field for the entire examination.
 * Used for recording pertinent findings not captured by the standard protocol.
 */

import { M } from "../model/nodes";
import { Q } from "../model/primitives";

export const E11_MODEL = M.group({
  comment: M.question(Q.text(), "comment"),
});

export const E11_STEPS = {
  "e11-all": ["comment"],
} as const;
