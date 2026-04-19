import { describe, it, expect } from "vitest";
import { renderSentence } from "./render";
import type {
  U10Finding,
  U1aFinding,
  U1bFinding,
  U4Finding,
  U5Finding,
  U6Finding,
  U7Finding,
  U9MuscleFinding,
  U9TmjFinding,
} from "./types";

describe("renderSentence — U1a", () => {
  it("primary structures only", () => {
    const f: U1aFinding = {
      kind: "u1a",
      primary: [
        { region: "temporalis", side: "right" },
        { region: "masseter", side: "both" },
      ],
      auxiliary: [],
    };
    expect(renderSentence(f)).toBe(
      "Schmerzlokalisation letzte 30 Tage bestätigt in Temporalis rechts, Masseter beidseits."
    );
  });

  it("primary + auxiliary: auxiliary appended in parentheses", () => {
    const f: U1aFinding = {
      kind: "u1a",
      primary: [{ region: "tmj", side: "left" }],
      auxiliary: [
        { region: "otherMast", side: "both" },
        { region: "nonMast", side: "right" },
      ],
    };
    expect(renderSentence(f)).toBe(
      "Schmerzlokalisation letzte 30 Tage bestätigt in Kiefergelenk links (Andere Kaumuskeln beidseits, Nicht-Kaumuskeln rechts)."
    );
  });

  it("auxiliary only (no primary): rendered without parentheses", () => {
    const f: U1aFinding = {
      kind: "u1a",
      primary: [],
      auxiliary: [{ region: "nonMast", side: "both" }],
    };
    expect(renderSentence(f)).toBe(
      "Schmerzlokalisation letzte 30 Tage bestätigt in Nicht-Kaumuskeln beidseits."
    );
  });
});

describe("renderSentence — U1b", () => {
  it("lists headache locations with sides", () => {
    const f: U1bFinding = {
      kind: "u1b",
      locations: [
        { location: "temporalis", side: "both" },
        { location: "other", side: "right" },
      ],
    };
    expect(renderSentence(f)).toBe(
      "Kopfschmerzlokalisation letzte 30 Tage bestätigt in Temporalis beidseits, andere Lokalisation rechts."
    );
  });
});

describe("renderSentence — U4", () => {
  it("both measurements + pain + headache qualifiers", () => {
    const f: U4Finding = {
      kind: "u4",
      painFreeMm: 42,
      maxMm: 54,
      painStructures: [
        { region: "temporalis", side: "left" },
        { region: "masseter", side: "both" },
      ],
      withHeadache: true,
    };
    expect(renderSentence(f)).toBe(
      "Schmerzfreie Mundöffnung 42 mm. Maximale Mundöffnung 54 mm, mit bekannten Schmerzen in Temporalis links, Masseter beidseits, mit bekanntem Schläfenkopfschmerz."
    );
  });

  it("only max measurement, no qualifiers", () => {
    const f: U4Finding = {
      kind: "u4",
      painFreeMm: null,
      maxMm: 50,
      painStructures: [],
      withHeadache: false,
    };
    expect(renderSentence(f)).toBe("Maximale Mundöffnung 50 mm.");
  });

  it("only painFree measurement (unusual but valid)", () => {
    const f: U4Finding = {
      kind: "u4",
      painFreeMm: 38,
      maxMm: null,
      painStructures: [],
      withHeadache: false,
    };
    expect(renderSentence(f)).toBe("Schmerzfreie Mundöffnung 38 mm.");
  });

  it("pain/headache but no max measurement → fallback clause", () => {
    const f: U4Finding = {
      kind: "u4",
      painFreeMm: null,
      maxMm: null,
      painStructures: [{ region: "temporalis", side: "right" }],
      withHeadache: true,
    };
    expect(renderSentence(f)).toBe(
      "Bekannte Schmerzen bei Mundöffnung in Temporalis rechts, bekannter Schläfenkopfschmerz bei Mundöffnung."
    );
  });
});

describe("renderSentence — U5", () => {
  it("all three measurements + pain qualifier", () => {
    const f: U5Finding = {
      kind: "u5",
      lateralRightMm: 11,
      lateralLeftMm: 9,
      protrusiveMm: 7,
      painStructures: [{ region: "tmj", side: "right" }],
    };
    expect(renderSentence(f)).toBe(
      "Laterotrusion rechts 11 mm, Laterotrusion links 9 mm, Protrusion 7 mm, mit bekannten Schmerzen in Kiefergelenk rechts."
    );
  });

  it("partial measurements (some null) — null ones silently omitted", () => {
    const f: U5Finding = {
      kind: "u5",
      lateralRightMm: 10,
      lateralLeftMm: null,
      protrusiveMm: 6,
      painStructures: [],
    };
    expect(renderSentence(f)).toBe("Laterotrusion rechts 10 mm, Protrusion 6 mm.");
  });
});

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

describe("renderSentence — U10", () => {
  it("Regio submandibularis with Übertragung", () => {
    const f: U10Finding = {
      kind: "u10",
      site: "submandibular",
      side: "right",
      referred: true,
    };
    expect(renderSentence(f)).toBe(
      "Bekannter Schmerz bei Palpation in Regio submandibularis rechts, mit Übertragung."
    );
  });

  it("Pterygoideus lateralis without Übertragung", () => {
    const f: U10Finding = {
      kind: "u10",
      site: "lateralPterygoid",
      side: "left",
      referred: false,
    };
    expect(renderSentence(f)).toBe(
      "Bekannter Schmerz bei Palpation in Pterygoideus lateralis links, ohne Übertragung."
    );
  });

  it("Temporalis-Sehne bilateral, null referred → no qualifier clause", () => {
    const f: U10Finding = {
      kind: "u10",
      site: "temporalisTendon",
      side: "both",
      referred: null,
    };
    expect(renderSentence(f)).toBe(
      "Bekannter Schmerz bei Palpation in Temporalis-Sehne beidseits."
    );
  });

  it("Regio retromandibularis unilateral", () => {
    const f: U10Finding = {
      kind: "u10",
      site: "posteriorMandibular",
      side: "right",
      referred: false,
    };
    expect(renderSentence(f)).toBe(
      "Bekannter Schmerz bei Palpation in Regio retromandibularis rechts, ohne Übertragung."
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
