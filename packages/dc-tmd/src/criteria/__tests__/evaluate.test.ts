import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluate";
import { field, threshold, computed, and, or, not, any, all } from "../builders";
import { sq } from "../field-refs";

describe("evaluate", () => {
  describe("field criterion", () => {
    it("returns positive when value equals expected", () => {
      const criterion = field(sq("SQ1"), { equals: "yes" });
      const data = { sq: { SQ1: "yes" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("returns negative when value differs from expected", () => {
      const criterion = field(sq("SQ1"), { equals: "yes" });
      const data = { sq: { SQ1: "no" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });

    it("returns pending when value is missing", () => {
      const criterion = field(sq("SQ1"), { equals: "yes" });
      const data = { sq: {} };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("pending");
    });

    it("returns pending when parent path is missing", () => {
      const criterion = field(sq("SQ1"), { equals: "yes" });
      const data = {};

      const result = evaluate(criterion, data);

      expect(result.status).toBe("pending");
    });

    it("handles notEquals condition", () => {
      const criterion = field(sq("SQ1"), { notEquals: "no" });
      const data = { sq: { SQ1: "yes" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("handles includes condition for arrays", () => {
      const criterion = field("e1.painLocation.left", { includes: "temporalis" });
      const data = { e1: { painLocation: { left: ["temporalis", "masseter"] } } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("returns negative when array does not include value", () => {
      const criterion = field("e1.painLocation.left", { includes: "neck" });
      const data = { e1: { painLocation: { left: ["temporalis", "masseter"] } } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });

    it("handles notIncludes condition for arrays", () => {
      const criterion = field("e1.painLocation.left", { notIncludes: "neck" });
      const data = { e1: { painLocation: { left: ["temporalis", "masseter"] } } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });
  });

  describe("threshold criterion", () => {
    it("returns positive when value >= threshold", () => {
      const criterion = threshold("e4.maxUnassisted.measurement", ">=", 40);
      const data = { e4: { maxUnassisted: { measurement: 45 } } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("returns negative when value < threshold for >=", () => {
      const criterion = threshold("e4.maxUnassisted.measurement", ">=", 40);
      const data = { e4: { maxUnassisted: { measurement: 35 } } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });

    it("returns positive when value at boundary for >=", () => {
      const criterion = threshold("e4.maxUnassisted.measurement", ">=", 40);
      const data = { e4: { maxUnassisted: { measurement: 40 } } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("returns pending when value is missing", () => {
      const criterion = threshold("e4.maxUnassisted.measurement", ">=", 40);
      const data = { e4: {} };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("pending");
    });

    it("handles < operator", () => {
      const criterion = threshold("e2.verticalOverlap", "<", 5);
      const data = { e2: { verticalOverlap: 3 } };

      expect(evaluate(criterion, data).status).toBe("positive");
    });

    it("handles > operator", () => {
      const criterion = threshold("e4.maxUnassisted.measurement", ">", 40);
      const data = { e4: { maxUnassisted: { measurement: 45 } } };

      expect(evaluate(criterion, data).status).toBe("positive");
    });

    it("handles <= operator", () => {
      const criterion = threshold("e2.verticalOverlap", "<=", 5);
      const data = { e2: { verticalOverlap: 5 } };

      expect(evaluate(criterion, data).status).toBe("positive");
    });
  });

  describe("computed criterion", () => {
    it("computes value from multiple fields", () => {
      const criterion = computed(
        ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
        (values) =>
          ((values["e4.maxAssisted.measurement"] as number) ?? 0) +
          ((values["e2.verticalOverlap"] as number) ?? 0),
        ">=",
        40
      );
      const data = {
        e4: { maxAssisted: { measurement: 35 } },
        e2: { verticalOverlap: 8 },
      };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
      if ("computedValue" in result) {
        expect(result.computedValue).toBe(43);
      }
    });

    it("returns pending when any input is missing", () => {
      const criterion = computed(
        ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
        (values) =>
          ((values["e4.maxAssisted.measurement"] as number) ?? 0) +
          ((values["e2.verticalOverlap"] as number) ?? 0),
        ">=",
        40
      );
      const data = { e4: { maxAssisted: { measurement: 35 } } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("pending");
    });
  });

  describe("and criterion", () => {
    it("returns positive when all children are positive", () => {
      const criterion = and([
        field(sq("SQ1"), { equals: "yes" }),
        field(sq("SQ2"), { equals: "yes" }),
      ]);
      const data = { sq: { SQ1: "yes", SQ2: "yes" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("returns negative when any child is negative", () => {
      const criterion = and([
        field(sq("SQ1"), { equals: "yes" }),
        field(sq("SQ2"), { equals: "yes" }),
      ]);
      const data = { sq: { SQ1: "yes", SQ2: "no" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });

    it("returns pending when child is pending and none negative", () => {
      const criterion = and([
        field(sq("SQ1"), { equals: "yes" }),
        field(sq("SQ2"), { equals: "yes" }),
      ]);
      const data = { sq: { SQ1: "yes" } }; // SQ2 missing

      const result = evaluate(criterion, data);

      expect(result.status).toBe("pending");
    });

    it("returns negative over pending (short-circuit)", () => {
      const criterion = and([
        field(sq("SQ1"), { equals: "yes" }),
        field(sq("SQ2"), { equals: "yes" }),
        field(sq("SQ3"), { equals: "yes" }),
      ]);
      const data = { sq: { SQ1: "yes", SQ2: "no" } }; // SQ3 missing, SQ2 negative

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });
  });

  describe("or criterion", () => {
    it("returns positive when any child is positive", () => {
      const criterion = or([
        field(sq("SQ1"), { equals: "yes" }),
        field(sq("SQ2"), { equals: "yes" }),
      ]);
      const data = { sq: { SQ1: "no", SQ2: "yes" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("returns negative when all children are negative", () => {
      const criterion = or([
        field(sq("SQ1"), { equals: "yes" }),
        field(sq("SQ2"), { equals: "yes" }),
      ]);
      const data = { sq: { SQ1: "no", SQ2: "no" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });

    it("returns pending when no positive and some pending", () => {
      const criterion = or([
        field(sq("SQ1"), { equals: "yes" }),
        field(sq("SQ2"), { equals: "yes" }),
      ]);
      const data = { sq: { SQ1: "no" } }; // SQ2 missing

      const result = evaluate(criterion, data);

      expect(result.status).toBe("pending");
    });

    it("returns positive over pending (short-circuit)", () => {
      const criterion = or([
        field(sq("SQ1"), { equals: "yes" }),
        field(sq("SQ2"), { equals: "yes" }),
      ]);
      const data = { sq: { SQ1: "yes" } }; // SQ2 missing but SQ1 positive

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });
  });

  describe("not criterion", () => {
    it("negates positive to negative", () => {
      const criterion = not(field(sq("SQ1"), { equals: "yes" }));
      const data = { sq: { SQ1: "yes" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });

    it("negates negative to positive", () => {
      const criterion = not(field(sq("SQ1"), { equals: "yes" }));
      const data = { sq: { SQ1: "no" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("keeps pending as pending", () => {
      const criterion = not(field(sq("SQ1"), { equals: "yes" }));
      const data = { sq: {} };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("pending");
    });
  });

  describe("any criterion", () => {
    it("returns positive when any ref matches", () => {
      const criterion = any([sq("SQ4_A"), sq("SQ4_B"), sq("SQ4_C"), sq("SQ4_D")], {
        equals: "yes",
      });
      const data = { sq: { SQ4_A: "no", SQ4_B: "yes", SQ4_C: "no", SQ4_D: "no" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("returns negative when no ref matches", () => {
      const criterion = any([sq("SQ4_A"), sq("SQ4_B"), sq("SQ4_C"), sq("SQ4_D")], {
        equals: "yes",
      });
      const data = { sq: { SQ4_A: "no", SQ4_B: "no", SQ4_C: "no", SQ4_D: "no" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });

    it("returns pending when no matches but some refs pending", () => {
      const criterion = any([sq("SQ4_A"), sq("SQ4_B"), sq("SQ4_C"), sq("SQ4_D")], {
        equals: "yes",
      });
      const data = { sq: { SQ4_A: "no", SQ4_B: "no" } }; // SQ4_C, SQ4_D missing

      const result = evaluate(criterion, data);

      expect(result.status).toBe("pending");
    });

    it("returns positive immediately if match found even with pending refs", () => {
      const criterion = any([sq("SQ4_A"), sq("SQ4_B"), sq("SQ4_C"), sq("SQ4_D")], {
        equals: "yes",
      });
      const data = { sq: { SQ4_A: "no", SQ4_B: "yes" } }; // SQ4_C, SQ4_D missing but SQ4_B matches

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("respects minCount option", () => {
      const criterion = any([sq("SQ4_A"), sq("SQ4_B"), sq("SQ4_C"), sq("SQ4_D")], { equals: "yes" }, { minCount: 2 });
      const data = { sq: { SQ4_A: "yes", SQ4_B: "no", SQ4_C: "no", SQ4_D: "no" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative"); // Only 1 match, need 2
    });

    it("returns positive when minCount reached", () => {
      const criterion = any([sq("SQ4_A"), sq("SQ4_B"), sq("SQ4_C"), sq("SQ4_D")], { equals: "yes" }, { minCount: 2 });
      const data = { sq: { SQ4_A: "yes", SQ4_B: "yes", SQ4_C: "no", SQ4_D: "no" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });
  });

  describe("all criterion", () => {
    it("returns positive when all refs match", () => {
      const criterion = all([sq("SQ1"), sq("SQ2")], { equals: "yes" });
      const data = { sq: { SQ1: "yes", SQ2: "yes" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });

    it("returns negative when any ref fails", () => {
      const criterion = all([sq("SQ1"), sq("SQ2")], { equals: "yes" });
      const data = { sq: { SQ1: "yes", SQ2: "no" } };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });

    it("returns pending when some refs missing and none failed", () => {
      const criterion = all([sq("SQ1"), sq("SQ2")], { equals: "yes" });
      const data = { sq: { SQ1: "yes" } }; // SQ2 missing

      const result = evaluate(criterion, data);

      expect(result.status).toBe("pending");
    });

    it("returns negative over pending when any fails", () => {
      const criterion = all([sq("SQ1"), sq("SQ2"), sq("SQ3")], { equals: "yes" });
      const data = { sq: { SQ1: "yes", SQ2: "no" } }; // SQ3 missing but SQ2 failed

      const result = evaluate(criterion, data);

      expect(result.status).toBe("negative");
    });
  });

  describe("template variables", () => {
    it("resolves ${side} from context", () => {
      const criterion = field("e1.painLocation.${side}", { includes: "temporalis" });
      const data = { e1: { painLocation: { left: ["temporalis", "masseter"], right: [] } } };

      const result = evaluate(criterion, data, { side: "left" });

      expect(result.status).toBe("positive");
    });

    it("resolves ${region} from context", () => {
      const criterion = field("e1.painLocation.${side}", { includes: "${region}" });
      const data = { e1: { painLocation: { left: ["temporalis", "masseter"] } } };

      const result = evaluate(criterion, data, { side: "left", region: "temporalis" });

      expect(result.status).toBe("positive");
    });

    it("handles nested path with multiple template variables", () => {
      const criterion = field("e9.${side}.${site}.familiarPain", { equals: "yes" });
      const data = {
        e9: {
          left: {
            temporalisPosterior: { familiarPain: "yes" },
          },
        },
      };

      const result = evaluate(criterion, data, { side: "left", site: "temporalisPosterior" });

      expect(result.status).toBe("positive");
    });
  });

  describe("complex nested criteria", () => {
    it("evaluates nested and/or combinations", () => {
      // (SQ1=yes AND SQ3∈[intermittent,continuous]) AND (SQ4_A=yes OR SQ4_B=yes)
      const criterion = and([
        and([
          field(sq("SQ1"), { equals: "yes" }),
          or([
            field(sq("SQ3"), { equals: "intermittent" }),
            field(sq("SQ3"), { equals: "continuous" }),
          ]),
        ]),
        or([
          field(sq("SQ4_A"), { equals: "yes" }),
          field(sq("SQ4_B"), { equals: "yes" }),
        ]),
      ]);

      const data = {
        sq: {
          SQ1: "yes",
          SQ3: "continuous",
          SQ4_A: "no",
          SQ4_B: "yes",
        },
      };

      const result = evaluate(criterion, data);

      expect(result.status).toBe("positive");
    });
  });

  describe("traceability", () => {
    it("includes resolved ref in field result", () => {
      const criterion = field("e1.painLocation.${side}", { includes: "temporalis" });
      const data = { e1: { painLocation: { left: ["temporalis"] } } };

      const result = evaluate(criterion, data, { side: "left" });

      if ("ref" in result) {
        expect(result.ref).toBe("e1.painLocation.left");
      }
    });

    it("includes actual value in field result", () => {
      const criterion = field(sq("SQ1"), { equals: "yes" });
      const data = { sq: { SQ1: "no" } };

      const result = evaluate(criterion, data);

      if ("value" in result) {
        expect(result.value).toBe("no");
      }
    });

    it("includes child results in composite criterion result", () => {
      const criterion = and([
        field(sq("SQ1"), { equals: "yes" }),
        field(sq("SQ2"), { equals: "yes" }),
      ]);
      const data = { sq: { SQ1: "yes", SQ2: "no" } };

      const result = evaluate(criterion, data);

      if ("children" in result) {
        expect(result.children).toHaveLength(2);
        expect(result.children[0].status).toBe("positive");
        expect(result.children[1].status).toBe("negative");
      }
    });

    it("includes matched refs in quantifier result", () => {
      const criterion = any([sq("SQ4_A"), sq("SQ4_B"), sq("SQ4_C")], { equals: "yes" });
      const data = { sq: { SQ4_A: "no", SQ4_B: "yes", SQ4_C: "yes" } };

      const result = evaluate(criterion, data);

      if ("matchedRefs" in result) {
        expect(result.matchedRefs).toContain("sq.SQ4_B");
        expect(result.matchedRefs).toContain("sq.SQ4_C");
        expect(result.matchedRefs).not.toContain("sq.SQ4_A");
      }
    });
  });
});
