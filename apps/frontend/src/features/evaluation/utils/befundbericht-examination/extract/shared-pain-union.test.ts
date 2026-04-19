import { describe, it, expect } from "vitest";
import {
  anyFamiliarHeadacheAtTemporalis,
  unionFamiliarPainStructures,
} from "./shared-pain-union";

describe("unionFamiliarPainStructures", () => {
  it("collapses identical right/left positives to 'both'", () => {
    const data = {
      e5: {
        lateralRight: {
          left: { masseter: { familiarPain: "yes" } },
          right: { masseter: { familiarPain: "yes" } },
        },
      },
    };
    expect(unionFamiliarPainStructures(data, ["e5.lateralRight"])).toEqual([
      { region: "masseter", side: "both" },
    ]);
  });

  it("unions across multiple movement prefixes (OR)", () => {
    // Temporalis positive only during maxAssisted; Masseter positive only during maxUnassisted.
    const data = {
      e4: {
        maxUnassisted: {
          right: { masseter: { familiarPain: "yes" } },
        },
        maxAssisted: {
          left: { temporalis: { familiarPain: "yes" } },
        },
      },
    };
    const out = unionFamiliarPainStructures(data, ["e4.maxUnassisted", "e4.maxAssisted"]);
    expect(out).toEqual([
      { region: "temporalis", side: "left" },
      { region: "masseter", side: "right" },
    ]);
  });

  it("ignores bare pain=yes without familiarPain (rule 1.6)", () => {
    const data = {
      e4: {
        maxUnassisted: {
          right: { temporalis: { pain: "yes", familiarPain: "no" } },
        },
      },
    };
    expect(unionFamiliarPainStructures(data, ["e4.maxUnassisted"])).toEqual([]);
  });

  it("preserves REGION_KEYS order in output", () => {
    const data = {
      e5: {
        lateralRight: {
          right: {
            nonMast: { familiarPain: "yes" },
            temporalis: { familiarPain: "yes" },
            masseter: { familiarPain: "yes" },
          },
        },
      },
    };
    const out = unionFamiliarPainStructures(data, ["e5.lateralRight"]);
    expect(out.map((s) => s.region)).toEqual(["temporalis", "masseter", "nonMast"]);
  });
});

describe("anyFamiliarHeadacheAtTemporalis", () => {
  it("true when any prefix × side has familiarHeadache=yes at temporalis", () => {
    const data = {
      e4: {
        maxAssisted: {
          right: { temporalis: { familiarHeadache: "yes" } },
        },
      },
    };
    expect(anyFamiliarHeadacheAtTemporalis(data, ["e4.maxUnassisted", "e4.maxAssisted"])).toBe(
      true
    );
  });

  it("false when headache is at a non-temporalis region", () => {
    const data = {
      e4: {
        maxAssisted: {
          right: { masseter: { familiarHeadache: "yes" } },
        },
      },
    };
    expect(anyFamiliarHeadacheAtTemporalis(data, ["e4.maxAssisted"])).toBe(false);
  });

  it("false when no familiarHeadache anywhere", () => {
    expect(anyFamiliarHeadacheAtTemporalis({}, ["e4.maxAssisted"])).toBe(false);
  });
});
