import { describe, it, expect } from "vitest";
import { extractU8 } from "./u8";

type YN = "yes" | "no";

function e8(
  side: "left" | "right",
  lockingType: "closedLocking" | "openLocking",
  fields: { locking?: YN; reducibleByPatient?: YN; reducibleByExaminer?: YN }
) {
  return { e8: { [side]: { [lockingType]: fields } } };
}

describe("extractU8", () => {
  it("emits nothing when no locking is positive", () => {
    expect(extractU8({})).toEqual([]);
    expect(extractU8(e8("right", "closedLocking", { locking: "no" }))).toEqual([]);
  });

  it("closedLocking maps to situation='duringOpening'", () => {
    const data = e8("right", "closedLocking", {
      locking: "yes",
      reducibleByPatient: "yes",
      reducibleByExaminer: "no",
    });
    expect(extractU8(data)).toEqual([
      { kind: "u8", situation: "duringOpening", side: "right", reducibility: "byPatient" },
    ]);
  });

  it("openLocking maps to situation='wideOpening'", () => {
    const data = e8("left", "openLocking", {
      locking: "yes",
      reducibleByPatient: "no",
      reducibleByExaminer: "yes",
    });
    expect(extractU8(data)).toEqual([
      { kind: "u8", situation: "wideOpening", side: "left", reducibility: "byExaminer" },
    ]);
  });

  it("both patient AND examiner = 'byBoth'", () => {
    const data = e8("right", "closedLocking", {
      locking: "yes",
      reducibleByPatient: "yes",
      reducibleByExaminer: "yes",
    });
    expect(extractU8(data)[0].reducibility).toBe("byBoth");
  });

  it("both patient AND examiner = no → 'none' (nicht lösbar)", () => {
    const data = e8("right", "closedLocking", {
      locking: "yes",
      reducibleByPatient: "no",
      reducibleByExaminer: "no",
    });
    expect(extractU8(data)[0].reducibility).toBe("none");
  });

  it("missing reducibility fields → null (clause omitted by renderer)", () => {
    const data = e8("right", "closedLocking", { locking: "yes" });
    expect(extractU8(data)[0].reducibility).toBe(null);
  });

  it("emits both situations on the same side independently", () => {
    const data = {
      e8: {
        right: {
          closedLocking: {
            locking: "yes",
            reducibleByPatient: "yes",
            reducibleByExaminer: "no",
          },
          openLocking: {
            locking: "yes",
            reducibleByPatient: "no",
            reducibleByExaminer: "no",
          },
        },
      },
    };
    const findings = extractU8(data);
    expect(findings).toHaveLength(2);
    expect(findings.map((f) => ({ situation: f.situation, reducibility: f.reducibility }))).toEqual([
      { situation: "duringOpening", reducibility: "byPatient" },
      { situation: "wideOpening", reducibility: "none" },
    ]);
  });

  it("iterates situations outer, sides inner (pairs adjacent for bilateral merge)", () => {
    const data = {
      e8: {
        right: {
          closedLocking: { locking: "yes", reducibleByPatient: "yes", reducibleByExaminer: "no" },
          openLocking: { locking: "yes", reducibleByPatient: "no", reducibleByExaminer: "yes" },
        },
        left: {
          closedLocking: { locking: "yes", reducibleByPatient: "yes", reducibleByExaminer: "no" },
          openLocking: { locking: "yes", reducibleByPatient: "no", reducibleByExaminer: "yes" },
        },
      },
    };
    const findings = extractU8(data);
    // Expect: closedLocking.right, closedLocking.left, openLocking.right, openLocking.left
    expect(findings.map((f) => `${f.situation}.${f.side}`)).toEqual([
      "duringOpening.right",
      "duringOpening.left",
      "wideOpening.right",
      "wideOpening.left",
    ]);
  });
});
