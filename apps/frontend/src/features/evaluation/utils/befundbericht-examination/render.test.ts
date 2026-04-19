import { describe, it, expect } from "vitest";
import { renderSentence } from "./render";
import type { U6Finding, U7Finding } from "./types";

describe("renderSentence — U6", () => {
  it("textbook positive: click, both movements, both sources, familiar pain", () => {
    const f: U6Finding = {
      kind: "u6",
      sound: "click",
      side: "right",
      movements: ["open", "close"],
      patient: true,
      familiarPain: true,
    };
    expect(renderSentence(f)).toBe(
      "Knacken im rechten Kiefergelenk beim Öffnen und Schließen, vom Untersucher und Patient festgestellt, mit bekanntem Schmerz."
    );
  });

  it("click, only opening, examiner-only, patient-negative, pain not asked → negated patient clause, no pain clause", () => {
    const f: U6Finding = {
      kind: "u6",
      sound: "click",
      side: "right",
      movements: ["open"],
      patient: false,
      familiarPain: null,
    };
    expect(renderSentence(f)).toBe(
      "Knacken im rechten Kiefergelenk beim Öffnen, vom Untersucher festgestellt, vom Patient nicht bemerkt."
    );
  });

  it("click, patient-only (no examiner detection): no movement phrase, negated examiner clause", () => {
    const f: U6Finding = {
      kind: "u6",
      sound: "click",
      side: "left",
      movements: [],
      patient: true,
      familiarPain: false,
    };
    expect(renderSentence(f)).toBe(
      "Knacken im linken Kiefergelenk, vom Patient bemerkt, vom Untersucher nicht festgestellt, ohne bekanntem Schmerz."
    );
  });

  it("crepitus: no pain clause even when fields present, no familiarPain slot", () => {
    const f: U6Finding = {
      kind: "u6",
      sound: "crepitus",
      side: "both",
      movements: ["close"],
      patient: true,
      familiarPain: null,
    };
    expect(renderSentence(f)).toBe(
      "Reiben im Kiefergelenk (beidseitig) beim Schließen, vom Untersucher und Patient festgestellt."
    );
  });

  it("bilateral TMJ uses postfixed '(beidseitig)' form", () => {
    const f: U6Finding = {
      kind: "u6",
      sound: "click",
      side: "both",
      movements: ["open", "close"],
      patient: true,
      familiarPain: true,
    };
    expect(renderSentence(f)).toBe(
      "Knacken im Kiefergelenk (beidseitig) beim Öffnen und Schließen, vom Untersucher und Patient festgestellt, mit bekanntem Schmerz."
    );
  });
});

describe("renderSentence — U7", () => {
  it("click, both sources, familiar pain", () => {
    const f: U7Finding = {
      kind: "u7",
      sound: "click",
      side: "right",
      examiner: true,
      patient: true,
      familiarPain: true,
    };
    expect(renderSentence(f)).toBe(
      "Knacken im rechten Kiefergelenk bei Laterotrusion und Protrusion, vom Untersucher und Patient festgestellt, mit bekanntem Schmerz."
    );
  });

  it("crepitus, examiner-only, patient-negative", () => {
    const f: U7Finding = {
      kind: "u7",
      sound: "crepitus",
      side: "left",
      examiner: true,
      patient: false,
      familiarPain: null,
    };
    expect(renderSentence(f)).toBe(
      "Reiben im linken Kiefergelenk bei Laterotrusion und Protrusion, vom Untersucher festgestellt, vom Patient nicht bemerkt."
    );
  });
});
