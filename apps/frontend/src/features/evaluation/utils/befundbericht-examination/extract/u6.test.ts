import { describe, it, expect } from "vitest";
import { extractU6 } from "./u6";

function e6(
  side: "left" | "right",
  sound: "click" | "crepitus",
  fields: Record<string, "yes" | "no">
) {
  return { e6: { [side]: { [sound]: fields } } };
}

describe("extractU6 — rule 1.5 dimensions vs. qualifiers", () => {
  it("emits nothing when every field is 'no'", () => {
    const data = {
      e6: {
        right: {
          click: { examinerOpen: "no", examinerClose: "no", patient: "no" },
          crepitus: { examinerOpen: "no", examinerClose: "no", patient: "no" },
        },
        left: {
          click: { examinerOpen: "no", examinerClose: "no", patient: "no" },
          crepitus: { examinerOpen: "no", examinerClose: "no", patient: "no" },
        },
      },
    };
    expect(extractU6(data)).toEqual([]);
  });

  it("emits only positive movements in the dimension slot (omits negatives)", () => {
    const data = e6("right", "click", {
      examinerOpen: "yes",
      examinerClose: "no",
      patient: "no",
    });
    const findings = extractU6(data);
    expect(findings).toHaveLength(1);
    expect(findings[0].movements).toEqual(["open"]);
    expect(findings[0].patient).toBe(false);
    expect(findings[0].familiarPain).toBe(null); // not asked because patient=no
  });

  it("renders familiarPain=true when painWithClick=yes and familiarPain=yes", () => {
    const data = e6("right", "click", {
      examinerOpen: "yes",
      examinerClose: "yes",
      patient: "yes",
      painWithClick: "yes",
      familiarPain: "yes",
    });
    const [finding] = extractU6(data);
    expect(finding.familiarPain).toBe(true);
    expect(finding.patient).toBe(true);
    expect(finding.movements).toEqual(["open", "close"]);
  });

  it("familiarPain=false when explicitly recorded as 'no'", () => {
    const data = e6("right", "click", {
      examinerOpen: "yes",
      examinerClose: "no",
      patient: "yes",
      painWithClick: "yes",
      familiarPain: "no",
    });
    expect(extractU6(data)[0].familiarPain).toBe(false);
  });

  it("familiarPain=null when painWithClick=no (not asked) — per §U6 note", () => {
    const data = e6("right", "click", {
      examinerOpen: "yes",
      examinerClose: "no",
      patient: "yes",
      painWithClick: "no",
    });
    expect(extractU6(data)[0].familiarPain).toBe(null);
  });

  it("crepitus: familiarPain is always null (field does not exist)", () => {
    const data = e6("left", "crepitus", {
      examinerOpen: "yes",
      examinerClose: "yes",
      patient: "yes",
    });
    const [finding] = extractU6(data);
    expect(finding.sound).toBe("crepitus");
    expect(finding.familiarPain).toBe(null);
  });

  it("patient-only click (no examiner detection): movements empty, patient=true", () => {
    const data = e6("left", "click", {
      examinerOpen: "no",
      examinerClose: "no",
      patient: "yes",
      painWithClick: "no",
    });
    const [finding] = extractU6(data);
    expect(finding.movements).toEqual([]);
    expect(finding.patient).toBe(true);
  });
});
