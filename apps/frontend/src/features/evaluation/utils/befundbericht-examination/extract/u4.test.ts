import { describe, it, expect } from "vitest";
import { extractU4 } from "./u4";

describe("extractU4", () => {
  it("maxMm is MAX(unassisted, assisted) when both present", () => {
    const data = {
      e4: {
        painFree: { measurement: 42 },
        maxUnassisted: { measurement: 48 },
        maxAssisted: { measurement: 54 },
      },
    };
    const [f] = extractU4(data);
    expect(f).toMatchObject({ painFreeMm: 42, maxMm: 54 });
  });

  it("maxMm falls back to whichever is present when only one is recorded", () => {
    const data = { e4: { maxUnassisted: { measurement: 48 } } };
    expect(extractU4(data)[0].maxMm).toBe(48);
  });

  it("unions familiarPain across maxUnassisted and maxAssisted", () => {
    const data = {
      e4: {
        maxUnassisted: {
          measurement: 50,
          right: { masseter: { familiarPain: "yes" } },
        },
        maxAssisted: {
          measurement: 52,
          left: { temporalis: { familiarPain: "yes" } },
        },
      },
    };
    const [f] = extractU4(data);
    expect(f.painStructures).toEqual([
      { region: "temporalis", side: "left" },
      { region: "masseter", side: "right" },
    ]);
  });

  it("sets withHeadache=true when familiarHeadache at temporalis (maxAssisted)", () => {
    const data = {
      e4: {
        maxAssisted: {
          measurement: 50,
          right: { temporalis: { familiarHeadache: "yes" } },
        },
      },
    };
    expect(extractU4(data)[0].withHeadache).toBe(true);
  });

  it("emits nothing when no measurements, no pain, no headache", () => {
    expect(extractU4({})).toEqual([]);
    expect(extractU4({ e4: { painFree: {} } })).toEqual([]);
  });

  it("still emits when only pain exists (no measurement recorded)", () => {
    const data = {
      e4: {
        maxUnassisted: { right: { masseter: { familiarPain: "yes" } } },
      },
    };
    const out = extractU4(data);
    expect(out).toHaveLength(1);
    expect(out[0].painStructures).toHaveLength(1);
    expect(out[0].maxMm).toBe(null);
  });
});
