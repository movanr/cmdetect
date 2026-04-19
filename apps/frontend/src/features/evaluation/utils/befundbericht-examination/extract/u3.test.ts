import { describe, it, expect } from "vitest";
import { extractU3 } from "./u3";

describe("extractU3", () => {
  it("pattern='straight' → no finding (rule: nur berichten wenn nicht Gerade)", () => {
    expect(extractU3({ e3: { openingPattern: "straight" } })).toEqual([]);
  });

  it("emits nothing for missing openingPattern", () => {
    expect(extractU3({})).toEqual([]);
    expect(extractU3({ e3: {} })).toEqual([]);
  });

  it("captures each non-straight pattern", () => {
    for (const pattern of ["correctedDeviation", "uncorrectedRight", "uncorrectedLeft"] as const) {
      const data = { e3: { openingPattern: pattern } };
      expect(extractU3(data)).toEqual([{ kind: "u3", pattern }]);
    }
  });
});
