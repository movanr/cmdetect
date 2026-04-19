import { describe, it, expect } from "vitest";
import { extractU9 } from "./u9";

type YesNo = "yes" | "no";

function pain(familiar: YesNo, qualifiers: Record<string, YesNo> = {}): Record<string, YesNo> {
  return { pain: "yes", familiarPain: familiar, ...qualifiers };
}

function e9(side: "left" | "right", sites: Record<string, Record<string, YesNo | boolean>>) {
  return { e9: { [side]: sites } };
}

describe("extractU9 — rule 1.8 muscle-level OR aggregation", () => {
  it("emits nothing when every sub-site is negative", () => {
    const data = e9("right", {
      temporalisPosterior: { pain: "no" },
      temporalisMiddle: { pain: "no" },
      temporalisAnterior: { pain: "no" },
      masseterOrigin: { pain: "no" },
      masseterBody: { pain: "no" },
      masseterInsertion: { pain: "no" },
      tmjLateralPole: { pain: "no" },
      tmjAroundLateralPole: { pain: "no" },
    });
    expect(extractU9(data)).toEqual([]);
  });

  it("OR-aggregates Masseter: single positive sub-site triggers muscle finding", () => {
    const data = e9("right", {
      masseterOrigin: pain("yes", { referredPain: "yes", spreadingPain: "no" }),
      masseterBody: { pain: "no" },
      masseterInsertion: { pain: "no" },
    });
    const findings = extractU9(data);
    const masseter = findings.find((f) => f.kind === "u9.muscle" && f.muscle === "masseter");
    expect(masseter).toMatchObject({
      kind: "u9.muscle",
      muscle: "masseter",
      side: "right",
      triggeredByPain: true,
      triggeredByHeadache: false,
      referred: true,
      spreading: false,
    });
  });

  it("qualifier OR: gathered from pain-positive sub-sites only, not from pain-negative ones", () => {
    // sub1 has familiarPain=yes with referredPain=no; sub2 has pain=no (so its referredPain is ignored)
    const data = e9("right", {
      masseterOrigin: pain("yes", { referredPain: "no", spreadingPain: "no" }),
      masseterBody: { pain: "no", referredPain: "yes", spreadingPain: "yes" }, // must be ignored
      masseterInsertion: { pain: "no" },
    });
    const finding = extractU9(data).find((f) => f.kind === "u9.muscle");
    expect(finding).toMatchObject({ referred: false, spreading: false });
  });

  it("qualifier null when palpation-basic mode (fields never asked)", () => {
    // Basic mode: only pain, familiarPain, familiarHeadache present. referredPain/spreadingPain absent.
    const data = e9("right", {
      masseterOrigin: { pain: "yes", familiarPain: "yes" },
      masseterBody: { pain: "no" },
      masseterInsertion: { pain: "no" },
    });
    const finding = extractU9(data).find((f) => f.kind === "u9.muscle");
    expect(finding?.referred).toBe(null);
    expect(finding?.spreading).toBe(null);
  });
});

describe("extractU9 — Temporalis headache (rule 1.6)", () => {
  it("reiner Kopfschmerz-Fall: familiarHeadache=yes but no familiarPain anywhere", () => {
    const data = e9("right", {
      temporalisPosterior: { pain: "yes", familiarPain: "no", familiarHeadache: "yes" },
      temporalisMiddle: { pain: "no" },
      temporalisAnterior: { pain: "no" },
    });
    const finding = extractU9(data).find(
      (f) => f.kind === "u9.muscle" && f.muscle === "temporalis"
    );
    expect(finding).toMatchObject({
      triggeredByPain: false,
      triggeredByHeadache: true,
      referred: null, // bound to bekannter_schmerz; undefined here
      spreading: null,
    });
  });

  it("combined: both pain and headache positive, qualifiers from pain-positive sub-sites", () => {
    const data = e9("right", {
      temporalisPosterior: {
        pain: "yes",
        familiarPain: "yes",
        familiarHeadache: "yes",
        referredPain: "yes",
        spreadingPain: "no",
      },
      temporalisMiddle: { pain: "no" },
      temporalisAnterior: { pain: "no" },
    });
    const finding = extractU9(data).find(
      (f) => f.kind === "u9.muscle" && f.muscle === "temporalis"
    );
    expect(finding).toMatchObject({
      triggeredByPain: true,
      triggeredByHeadache: true,
      referred: true,
      spreading: false,
    });
  });

  it("Masseter never sets triggeredByHeadache (field does not exist)", () => {
    const data = e9("right", {
      masseterOrigin: { pain: "yes", familiarPain: "yes" },
      masseterBody: { pain: "no" },
      masseterInsertion: { pain: "no" },
    });
    const finding = extractU9(data).find((f) => f.kind === "u9.muscle" && f.muscle === "masseter");
    expect(finding?.kind).toBe("u9.muscle");
    if (finding?.kind === "u9.muscle") {
      expect(finding.triggeredByHeadache).toBe(false);
    }
  });
});

describe("extractU9 — TMJ (rule 1.9: no spreading)", () => {
  it("emits u9.tmj with referred only", () => {
    const data = e9("left", {
      tmjLateralPole: pain("yes", { referredPain: "yes" }),
      tmjAroundLateralPole: { pain: "no" },
    });
    const finding = extractU9(data).find((f) => f.kind === "u9.tmj");
    expect(finding).toEqual({
      kind: "u9.tmj",
      side: "left",
      referred: true,
    });
  });

  it("referred=null in basic mode (field not asked)", () => {
    const data = e9("left", {
      tmjLateralPole: { pain: "yes", familiarPain: "yes" },
      tmjAroundLateralPole: { pain: "no" },
    });
    const finding = extractU9(data).find((f) => f.kind === "u9.tmj");
    expect(finding?.referred).toBe(null);
  });
});

describe("extractU9 — refused", () => {
  it("skips a refused side entirely", () => {
    const data = {
      e9: {
        right: { refused: true, masseterOrigin: pain("yes") },
        left: { masseterOrigin: pain("yes", { referredPain: "no", spreadingPain: "no" }) },
      },
    };
    const findings = extractU9(data);
    // Only the left side should produce findings.
    expect(findings.every((f) => f.side === "left")).toBe(true);
    expect(findings.length).toBeGreaterThan(0);
  });
});
