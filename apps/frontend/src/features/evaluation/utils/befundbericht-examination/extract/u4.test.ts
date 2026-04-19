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

  it("painFree refused captured as flag", () => {
    const data = { e4: { painFree: { refused: true } } };
    const [f] = extractU4(data);
    expect(f).toMatchObject({ painFreeRefused: true, painFreeMm: null });
  });

  it("maxRefused = true only when BOTH unassisted and assisted are refused", () => {
    const bothRefused = {
      e4: {
        maxUnassisted: { refused: true },
        maxAssisted: { refused: true },
      },
    };
    expect(extractU4(bothRefused)[0]).toMatchObject({ maxRefused: true, maxMm: null });

    // Only one refused → maxRefused=false, fallback to the measured one.
    const onlyUnassistedRefused = {
      e4: {
        maxUnassisted: { refused: true },
        maxAssisted: { measurement: 52 },
      },
    };
    expect(extractU4(onlyUnassistedRefused)[0]).toMatchObject({ maxRefused: false, maxMm: 52 });
  });

  it("assistedTerminated captured (hand gehoben bei U4c)", () => {
    const data = {
      e4: { maxAssisted: { measurement: 50, terminated: true } },
    };
    expect(extractU4(data)[0].assistedTerminated).toBe(true);
  });

  it("interviewRefused = true when any pain interview (un- or assisted) refused", () => {
    const unassistedOnly = {
      e4: { maxUnassisted: { measurement: 48, interviewRefused: true } },
    };
    expect(extractU4(unassistedOnly)[0].interviewRefused).toBe(true);

    const assistedOnly = {
      e4: { maxAssisted: { measurement: 52, interviewRefused: true } },
    };
    expect(extractU4(assistedOnly)[0].interviewRefused).toBe(true);
  });
});
