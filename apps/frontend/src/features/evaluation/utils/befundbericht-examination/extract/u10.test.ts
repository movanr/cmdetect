import { describe, it, expect } from "vitest";
import { extractU10 } from "./u10";

function site(fields: Record<string, "yes" | "no">) {
  return fields;
}

describe("extractU10", () => {
  it("emits nothing when no site is familiarPain-positive", () => {
    const data = {
      e10: {
        right: {
          submandibular: site({ pain: "yes", familiarPain: "no" }),
          lateralPterygoid: site({ pain: "no" }),
        },
      },
    };
    expect(extractU10(data)).toEqual([]);
  });

  it("emits one finding per positive site × side", () => {
    const data = {
      e10: {
        right: {
          submandibular: site({ pain: "yes", familiarPain: "yes", referredPain: "no" }),
          lateralPterygoid: site({ pain: "yes", familiarPain: "yes", referredPain: "yes" }),
        },
        left: {
          temporalisTendon: site({ pain: "yes", familiarPain: "yes", referredPain: "no" }),
        },
      },
    };
    const findings = extractU10(data);
    expect(findings).toHaveLength(3);
    expect(findings.map((f) => ({ site: f.site, side: f.side, referred: f.referred }))).toEqual([
      { site: "submandibular", side: "right", referred: false },
      { site: "lateralPterygoid", side: "right", referred: true },
      { site: "temporalisTendon", side: "left", referred: false },
    ]);
  });

  it("refused side is skipped entirely", () => {
    const data = {
      e10: {
        right: { refused: true, submandibular: site({ pain: "yes", familiarPain: "yes" }) },
        left: {
          submandibular: site({ pain: "yes", familiarPain: "yes", referredPain: "no" }),
        },
      },
    };
    const findings = extractU10(data);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ site: "submandibular", side: "left" });
  });

  it("ignores bare pain=yes without familiarPain (rule 1.6)", () => {
    const data = {
      e10: {
        right: { submandibular: site({ pain: "yes", familiarPain: "no" }) },
      },
    };
    expect(extractU10(data)).toEqual([]);
  });

  it("iterates sites in E10_SITE_KEYS order", () => {
    // Positive in all four sites on the right side — order should follow E10_SITE_KEYS.
    const data = {
      e10: {
        right: {
          posteriorMandibular: site({ pain: "yes", familiarPain: "yes", referredPain: "no" }),
          submandibular: site({ pain: "yes", familiarPain: "yes", referredPain: "no" }),
          lateralPterygoid: site({ pain: "yes", familiarPain: "yes", referredPain: "no" }),
          temporalisTendon: site({ pain: "yes", familiarPain: "yes", referredPain: "no" }),
        },
      },
    };
    const findings = extractU10(data);
    expect(findings.map((f) => f.site)).toEqual([
      "posteriorMandibular",
      "submandibular",
      "lateralPterygoid",
      "temporalisTendon",
    ]);
  });
});
