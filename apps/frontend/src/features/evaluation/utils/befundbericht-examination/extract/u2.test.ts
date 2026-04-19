import { describe, it, expect } from "vitest";
import { extractU2 } from "./u2";

describe("extractU2", () => {
  it("captures all three measurements + deviation direction", () => {
    const data = {
      e2: {
        horizontalOverjet: 3,
        verticalOverlap: 2,
        midlineDeviation: { direction: "right", mm: 1 },
      },
    };
    const [f] = extractU2(data);
    expect(f).toEqual({
      kind: "u2",
      horizontalOverjet: 3,
      verticalOverlap: 2,
      midline: { direction: "right", mm: 1 },
      referenceTooth: null,
    });
  });

  it("midline direction='na' stored as 'na' (no mm)", () => {
    const data = {
      e2: { horizontalOverjet: 3, midlineDeviation: { direction: "na" } },
    };
    expect(extractU2(data)[0].midline).toBe("na");
  });

  it("default teeth (11/21) → referenceTooth = null", () => {
    for (const selection of ["tooth11", "tooth21"]) {
      const data = {
        e2: { horizontalOverjet: 3, referenceTooth: { selection } },
      };
      expect(extractU2(data)[0].referenceTooth).toBe(null);
    }
  });

  it("custom tooth via 'other' → 'Zahn X'", () => {
    const data = {
      e2: {
        horizontalOverjet: 3,
        referenceTooth: { selection: "other", otherTooth: "12" },
      },
    };
    expect(extractU2(data)[0].referenceTooth).toBe("Zahn 12");
  });

  it("'other' selection with empty otherTooth → null (unusable)", () => {
    const data = {
      e2: {
        horizontalOverjet: 3,
        referenceTooth: { selection: "other", otherTooth: "" },
      },
    };
    expect(extractU2(data)[0].referenceTooth).toBe(null);
  });

  it("emits nothing when no measurements and no referenceTooth", () => {
    expect(extractU2({})).toEqual([]);
    expect(extractU2({ e2: {} })).toEqual([]);
  });

  it("handles partial measurements (some null)", () => {
    const data = { e2: { horizontalOverjet: 4 } };
    const [f] = extractU2(data);
    expect(f).toMatchObject({
      horizontalOverjet: 4,
      verticalOverlap: null,
      midline: null,
    });
  });

  it("midline with direction but no mm → null midline", () => {
    const data = { e2: { midlineDeviation: { direction: "right" } } };
    expect(extractU2(data)).toEqual([]);
  });
});
