import { describe, it, expect } from "vitest";
import { renderSentence } from "./render";
import type { U6Finding, U7Finding, U9MuscleFinding, U9TmjFinding } from "./types";

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

describe("renderSentence — U9 muscle", () => {
  it("Masseter pain-only with referred+spreading qualifiers", () => {
    const f: U9MuscleFinding = {
      kind: "u9.muscle",
      muscle: "masseter",
      side: "right",
      triggeredByPain: true,
      triggeredByHeadache: false,
      referred: true,
      spreading: false,
    };
    expect(renderSentence(f)).toBe(
      "Bekannter Schmerz bei Palpation in Masseter rechts, mit Übertragung, ohne Ausbreitung."
    );
  });

  it("Temporalis pain-only uses 'in Temporalis' preposition", () => {
    const f: U9MuscleFinding = {
      kind: "u9.muscle",
      muscle: "temporalis",
      side: "left",
      triggeredByPain: true,
      triggeredByHeadache: false,
      referred: false,
      spreading: true,
    };
    expect(renderSentence(f)).toBe(
      "Bekannter Schmerz bei Palpation in Temporalis links, ohne Übertragung, mit Ausbreitung."
    );
  });

  it("Temporalis headache-only uses 'des Temporalis' and no qualifier clauses", () => {
    const f: U9MuscleFinding = {
      kind: "u9.muscle",
      muscle: "temporalis",
      side: "right",
      triggeredByPain: false,
      triggeredByHeadache: true,
      referred: null,
      spreading: null,
    };
    expect(renderSentence(f)).toBe("Bekannter Kopfschmerz bei Palpation des Temporalis rechts.");
  });

  it("Temporalis combined pain + headache uses 'des Temporalis' and the combined phrase", () => {
    const f: U9MuscleFinding = {
      kind: "u9.muscle",
      muscle: "temporalis",
      side: "both",
      triggeredByPain: true,
      triggeredByHeadache: true,
      referred: true,
      spreading: true,
    };
    expect(renderSentence(f)).toBe(
      "Bekannter Schmerz und bekannter Kopfschmerz bei Palpation des Temporalis beidseits, mit Übertragung, mit Ausbreitung."
    );
  });

  it("basic-mode muscle pain (null qualifiers) → no qualifier clauses (rule 1.5)", () => {
    const f: U9MuscleFinding = {
      kind: "u9.muscle",
      muscle: "masseter",
      side: "right",
      triggeredByPain: true,
      triggeredByHeadache: false,
      referred: null,
      spreading: null,
    };
    expect(renderSentence(f)).toBe("Bekannter Schmerz bei Palpation in Masseter rechts.");
  });
});

describe("renderSentence — U9 TMJ", () => {
  it("TMJ with referred qualifier, bilateral phrasing uses (beidseitig)", () => {
    const f: U9TmjFinding = { kind: "u9.tmj", side: "both", referred: false };
    expect(renderSentence(f)).toBe(
      "Bekannter Schmerz bei Palpation im Kiefergelenk (beidseitig), ohne Übertragung."
    );
  });

  it("TMJ basic-mode (null referred) → no qualifier clause", () => {
    const f: U9TmjFinding = { kind: "u9.tmj", side: "right", referred: null };
    expect(renderSentence(f)).toBe("Bekannter Schmerz bei Palpation im rechten Kiefergelenk.");
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
