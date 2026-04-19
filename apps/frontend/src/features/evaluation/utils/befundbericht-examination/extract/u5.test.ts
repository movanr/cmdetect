import { describe, it, expect } from "vitest";
import { extractU5 } from "./u5";

describe("extractU5", () => {
  it("captures all three measurements independently", () => {
    const data = {
      e5: {
        lateralRight: { measurement: 11 },
        lateralLeft: { measurement: 9 },
        protrusive: { measurement: 7 },
      },
    };
    const [f] = extractU5(data);
    expect(f).toMatchObject({ lateralRightMm: 11, lateralLeftMm: 9, protrusiveMm: 7 });
  });

  it("unions familiarPain across all three movements", () => {
    const data = {
      e5: {
        lateralRight: {
          measurement: 10,
          left: { masseter: { familiarPain: "yes" } },
        },
        lateralLeft: {
          measurement: 10,
          right: { masseter: { familiarPain: "yes" } },
        },
        protrusive: {
          measurement: 7,
          right: { temporalis: { familiarPain: "yes" } },
        },
      },
    };
    const [f] = extractU5(data);
    expect(f.painStructures).toEqual([
      { region: "temporalis", side: "right" },
      { region: "masseter", side: "both" }, // left side from lateralRight + right side from lateralLeft
    ]);
  });

  it("emits nothing when everything is missing", () => {
    expect(extractU5({})).toEqual([]);
  });

  it("allows partial measurements (some null)", () => {
    const data = { e5: { lateralLeft: { measurement: 9 } } };
    const [f] = extractU5(data);
    expect(f).toMatchObject({
      lateralRightMm: null,
      lateralLeftMm: 9,
      protrusiveMm: null,
    });
  });
});
