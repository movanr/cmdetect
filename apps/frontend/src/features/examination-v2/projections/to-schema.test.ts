import { describe, it, expect } from "vitest";
import { schemaFromModel, schemaWithRoot } from "./to-schema";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

describe("to-schema projections", () => {
  describe("schemaFromModel", () => {
    describe("question nodes", () => {
      it("creates valid boolean schema", () => {
        const model = M.question(Q.boolean());
        const schema = schemaFromModel(model);

        expect(schema.parse(true)).toBe(true);
        expect(schema.parse(false)).toBe(false);
        expect(() => schema.parse("true")).toThrow();
        expect(() => schema.parse(null)).toThrow();
      });

      it("creates valid yesNo schema (accepts yes/no/null)", () => {
        const model = M.question(Q.yesNo());
        const schema = schemaFromModel(model);

        expect(schema.parse("yes")).toBe("yes");
        expect(schema.parse("no")).toBe("no");
        expect(schema.parse(null)).toBe(null);
        expect(() => schema.parse("maybe")).toThrow();
        expect(() => schema.parse(true)).toThrow();
      });

      it("creates valid measurement schema (accepts number/null)", () => {
        const model = M.question(Q.measurement());
        const schema = schemaFromModel(model);

        expect(schema.parse(42)).toBe(42);
        expect(schema.parse(3.14)).toBe(3.14);
        expect(schema.parse(0)).toBe(0);
        expect(schema.parse(null)).toBe(null);
        expect(() => schema.parse("42")).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });
    });

    describe("group nodes", () => {
      it("creates nested object schema for groups", () => {
        const model = M.group({
          bool: M.question(Q.boolean()),
          yesNo: M.question(Q.yesNo()),
        });
        const schema = schemaFromModel(model);

        const validData = { bool: true, yesNo: "yes" };
        expect(schema.parse(validData)).toEqual(validData);

        const validDataWithNull = { bool: false, yesNo: null };
        expect(schema.parse(validDataWithNull)).toEqual(validDataWithNull);
      });

      it("creates deeply nested object schema", () => {
        const model = M.group({
          level1: M.group({
            level2: M.group({
              leaf: M.question(Q.boolean()),
            }),
          }),
        });
        const schema = schemaFromModel(model);

        const validData = { level1: { level2: { leaf: true } } };
        expect(schema.parse(validData)).toEqual(validData);

        expect(() => schema.parse({ level1: { level2: { leaf: "true" } } })).toThrow();
      });
    });

    describe("validation", () => {
      it("rejects invalid values", () => {
        const model = M.group({
          bool: M.question(Q.boolean()),
          measurement: M.question(Q.measurement()),
        });
        const schema = schemaFromModel(model);

        // Missing field
        expect(() => schema.parse({ bool: true })).toThrow();

        // Wrong type
        expect(() => schema.parse({ bool: "true", measurement: 10 })).toThrow();

        // Extra fields are allowed by default in Zod (strips them)
        const result = schema.parse({ bool: true, measurement: 10, extra: "ignored" });
        expect(result).toEqual({ bool: true, measurement: 10 });
      });
    });
  });

  describe("schemaWithRoot", () => {
    it("wraps schema with root key", () => {
      const model = M.question(Q.boolean());
      const schema = schemaWithRoot("myRoot", model);

      expect(schema.parse({ myRoot: true })).toEqual({ myRoot: true });
      expect(schema.parse({ myRoot: false })).toEqual({ myRoot: false });
      expect(() => schema.parse({ wrongKey: true })).toThrow();
    });

    it("validates complete nested structure", () => {
      const model = M.group({
        intro: M.group({
          checked: M.question(Q.boolean()),
        }),
        data: M.group({
          answer: M.question(Q.yesNo()),
          value: M.question(Q.measurement()),
        }),
      });
      const schema = schemaWithRoot("e4", model);

      const validData = {
        e4: {
          intro: { checked: true },
          data: { answer: "yes", value: 25 },
        },
      };
      expect(schema.parse(validData)).toEqual(validData);

      const validDataWithNulls = {
        e4: {
          intro: { checked: false },
          data: { answer: null, value: null },
        },
      };
      expect(schema.parse(validDataWithNulls)).toEqual(validDataWithNulls);

      // Invalid: missing nested field
      expect(() =>
        schema.parse({
          e4: {
            intro: { checked: true },
            data: { answer: "yes" }, // missing value
          },
        })
      ).toThrow();
    });
  });
});
