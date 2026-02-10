import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluate";
import { evaluateDiagnosis } from "../evaluate-diagnosis";
import { DEGENERATIVE_JOINT_DISEASE } from "../diagnoses/degenerative-joint-disease";

describe("Degenerative Joint Disease diagnosis", () => {
  describe("anamnesis (TMJ noise — shared with DD)", () => {
    it("positive: SQ8=yes", () => {
      const data = { sq: { SQ8: "yes" } };
      expect(evaluate(DEGENERATIVE_JOINT_DISEASE.anamnesis, data).status).toBe("positive");
    });

    it("positive: patient reports crepitus during E6", () => {
      const data = {
        sq: { SQ8: "no" },
        e6: { right: { crepitus: { patient: "yes" } } },
      };
      expect(evaluate(DEGENERATIVE_JOINT_DISEASE.anamnesis, data).status).toBe("positive");
    });
  });

  describe("examination criteria", () => {
    it("positive: crepitus on opening (E6)", () => {
      const data = {
        e6: { left: { crepitus: { examinerOpen: "yes" } } },
      };
      const result = evaluate(
        DEGENERATIVE_JOINT_DISEASE.examination.criterion,
        data,
        { side: "left", region: "tmj" }
      );
      expect(result.status).toBe("positive");
    });

    it("positive: crepitus on closing (E6)", () => {
      const data = {
        e6: { right: { crepitus: { examinerClose: "yes" } } },
      };
      const result = evaluate(
        DEGENERATIVE_JOINT_DISEASE.examination.criterion,
        data,
        { side: "right", region: "tmj" }
      );
      expect(result.status).toBe("positive");
    });

    it("positive: crepitus during lateral/protrusive (E7)", () => {
      const data = {
        e7: { left: { crepitus: { examiner: "yes" } } },
      };
      const result = evaluate(
        DEGENERATIVE_JOINT_DISEASE.examination.criterion,
        data,
        { side: "left", region: "tmj" }
      );
      expect(result.status).toBe("positive");
    });

    it("negative: no crepitus (click only)", () => {
      const data = {
        e6: {
          left: { crepitus: { examinerOpen: "no", examinerClose: "no" }, click: { examinerOpen: "yes" } },
        },
        e7: { left: { crepitus: { examiner: "no" } } },
      };
      const result = evaluate(
        DEGENERATIVE_JOINT_DISEASE.examination.criterion,
        data,
        { side: "left", region: "tmj" }
      );
      expect(result.status).toBe("negative");
    });

    it("targets TMJ region", () => {
      expect(DEGENERATIVE_JOINT_DISEASE.examination.regions).toEqual(["tmj"]);
    });
  });

  describe("full diagnosis", () => {
    it("positive: SQ8 + crepitus on E6", () => {
      const data = {
        sq: { SQ8: "yes", SQ8_side: { left: true, right: true } },
        e6: { right: { crepitus: { examinerOpen: "yes" } } },
      };
      const result = evaluateDiagnosis(DEGENERATIVE_JOINT_DISEASE, data);
      expect(result.isPositive).toBe(true);
      expect(result.positiveLocations).toContainEqual({ side: "right", region: "tmj" });
    });

    it("negative: SQ8=yes but no crepitus found", () => {
      const data = {
        sq: { SQ8: "yes", SQ8_side: { left: true, right: true } },
        e6: {
          left: { crepitus: { examinerOpen: "no", examinerClose: "no" } },
          right: { crepitus: { examinerOpen: "no", examinerClose: "no" } },
        },
        e7: {
          left: { crepitus: { examiner: "no" } },
          right: { crepitus: { examiner: "no" } },
        },
      };
      const result = evaluateDiagnosis(DEGENERATIVE_JOINT_DISEASE, data);
      expect(result.isPositive).toBe(false);
      expect(result.anamnesisMet).toBe(true);
    });
  });

  describe("diagnosis definition structure", () => {
    it("has correct metadata", () => {
      expect(DEGENERATIVE_JOINT_DISEASE.id).toBe("degenerativeJointDisease");
      expect(DEGENERATIVE_JOINT_DISEASE.nameDE).toBe("Degenerative Gelenkerkrankung");
      expect(DEGENERATIVE_JOINT_DISEASE.category).toBe("joint");
    });
  });
});
