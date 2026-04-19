import { describe, it, expect } from "vitest";
import { extractU1b } from "./u1b";

function headacheLocation(right: string[], left: string[]) {
  return { e1: { headacheLocation: { right, left } } };
}

describe("extractU1b", () => {
  it("emits nothing when all empty or only 'none'", () => {
    expect(extractU1b(headacheLocation([], []))).toEqual([]);
    expect(extractU1b(headacheLocation(["none"], ["none"]))).toEqual([]);
  });

  it("temporalis on one side only", () => {
    const data = headacheLocation(["temporalis"], []);
    expect(extractU1b(data)).toEqual([
      { kind: "u1b", locations: [{ location: "temporalis", side: "right" }] },
    ]);
  });

  it("collapses bilateral identical selections into 'both'", () => {
    const data = headacheLocation(["temporalis", "other"], ["temporalis", "other"]);
    const [f] = extractU1b(data);
    expect(f.locations).toEqual([
      { location: "temporalis", side: "both" },
      { location: "other", side: "both" },
    ]);
  });

  it("preserves HEADACHE_LOCATIONS declaration order", () => {
    const data = headacheLocation(["other", "temporalis"], []);
    const [f] = extractU1b(data);
    expect(f.locations.map((l) => l.location)).toEqual(["temporalis", "other"]);
  });
});
