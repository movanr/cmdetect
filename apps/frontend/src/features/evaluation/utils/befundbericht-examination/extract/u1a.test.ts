import { describe, it, expect } from "vitest";
import { extractU1a } from "./u1a";

function painLocation(right: string[], left: string[]) {
  return { e1: { painLocation: { right, left } } };
}

describe("extractU1a", () => {
  it("emits nothing when no region positive on either side", () => {
    expect(extractU1a(painLocation([], []))).toEqual([]);
    expect(extractU1a(painLocation(["none"], ["none"]))).toEqual([]);
  });

  it("'none' sentinel is ignored", () => {
    const data = painLocation(["temporalis", "none"], ["none"]);
    const [f] = extractU1a(data);
    expect(f.primary).toEqual([{ region: "temporalis", side: "right" }]);
  });

  it("collapses identical right+left positives into 'both'", () => {
    const data = painLocation(["temporalis", "masseter"], ["temporalis", "masseter"]);
    const [f] = extractU1a(data);
    expect(f.primary).toEqual([
      { region: "temporalis", side: "both" },
      { region: "masseter", side: "both" },
    ]);
  });

  it("separates primary (temporalis/masseter/tmj) from auxiliary (otherMast/nonMast)", () => {
    const data = painLocation(["temporalis", "otherMast"], ["tmj", "nonMast"]);
    const [f] = extractU1a(data);
    expect(f.primary).toEqual([
      { region: "temporalis", side: "right" },
      { region: "tmj", side: "left" },
    ]);
    expect(f.auxiliary).toEqual([
      { region: "otherMast", side: "right" },
      { region: "nonMast", side: "left" },
    ]);
  });

  it("emits when only auxiliary structures are positive", () => {
    const data = painLocation(["nonMast"], ["nonMast"]);
    const [f] = extractU1a(data);
    expect(f.primary).toEqual([]);
    expect(f.auxiliary).toEqual([{ region: "nonMast", side: "both" }]);
  });
});
