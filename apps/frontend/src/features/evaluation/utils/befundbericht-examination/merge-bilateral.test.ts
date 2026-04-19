import { describe, it, expect } from "vitest";
import { mergeBilateral } from "./merge-bilateral";
import type { U6Finding } from "./types";

function u6(side: "left" | "right" | "both", overrides: Partial<U6Finding> = {}): U6Finding {
  return {
    kind: "u6",
    sound: "click",
    side,
    movements: ["open"],
    patient: true,
    familiarPain: true,
    ...overrides,
  };
}

describe("mergeBilateral — rule 1.7", () => {
  it("collapses right+left with identical qualifiers into 'both'", () => {
    const out = mergeBilateral([u6("right"), u6("left")]);
    expect(out).toHaveLength(1);
    expect(out[0].side).toBe("both");
  });

  it("does NOT merge when movements differ", () => {
    const out = mergeBilateral([
      u6("right", { movements: ["open", "close"] }),
      u6("left", { movements: ["open"] }),
    ]);
    expect(out).toHaveLength(2);
    expect(out.map((f) => f.side)).toEqual(["right", "left"]);
  });

  it("does NOT merge when a qualifier differs (familiarPain)", () => {
    const out = mergeBilateral([
      u6("right", { familiarPain: true }),
      u6("left", { familiarPain: false }),
    ]);
    expect(out).toHaveLength(2);
  });

  it("does NOT merge when the patient source differs", () => {
    const out = mergeBilateral([u6("right", { patient: true }), u6("left", { patient: false })]);
    expect(out).toHaveLength(2);
  });

  it("does NOT merge across different sounds (click vs crepitus)", () => {
    const out = mergeBilateral([u6("right", { sound: "click" }), u6("left", { sound: "crepitus" })]);
    expect(out).toHaveLength(2);
  });

  it("merges pair-by-pair within a mixed list, preserving unmatched singles", () => {
    // right-click matches left-click; right-crepitus has no left partner → passes through.
    const out = mergeBilateral([
      u6("right", { sound: "click" }),
      u6("right", { sound: "crepitus", familiarPain: null }),
      u6("left", { sound: "click" }),
    ]);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ sound: "click", side: "both" });
    expect(out[1]).toMatchObject({ sound: "crepitus", side: "right" });
  });

  it("leaves already-'both' findings untouched", () => {
    const out = mergeBilateral([u6("both")]);
    expect(out).toEqual([u6("both")]);
  });
});
