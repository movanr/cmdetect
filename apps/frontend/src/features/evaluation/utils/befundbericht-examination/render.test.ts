import { describe, it, expect } from "vitest";
import { renderSentence } from "./render";
import type {
  U10Finding,
  U10RefusedFinding,
  U1aFinding,
  U1bFinding,
  U2Finding,
  U3Finding,
  U4Finding,
  U5Finding,
  U6Finding,
  U7Finding,
  U8Finding,
  U9MuscleFinding,
  U9RefusedFinding,
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

describe("renderSentence — U2", () => {
  it("all three measurements, standard reference tooth (no note)", () => {
    const f: U2Finding = {
      kind: "u2",
      horizontalOverjet: 3,
      verticalOverlap: 2,
      midline: { direction: "right", mm: 1 },
      referenceTooth: null,
    };
    expect(renderSentence(f)).toBe(
      "Horizontaler Überbiss 3 mm, vertikaler Überbiss 2 mm, Mittellinienabweichung 1 mm nach rechts."
    );
  });

  it("non-standard reference tooth appended as trailing sentence", () => {
    const f: U2Finding = {
      kind: "u2",
      horizontalOverjet: 3,
      verticalOverlap: 2,
      midline: null,
      referenceTooth: "Zahn 12",
    };
    expect(renderSentence(f)).toBe(
      "Horizontaler Überbiss 3 mm, vertikaler Überbiss 2 mm. Referenzzahn: Zahn 12."
    );
  });

  it("midline 'na' → no midline clause", () => {
    const f: U2Finding = {
      kind: "u2",
      horizontalOverjet: 3,
      verticalOverlap: 2,
      midline: "na",
      referenceTooth: null,
    };
    expect(renderSentence(f)).toBe("Horizontaler Überbiss 3 mm, vertikaler Überbiss 2 mm.");
  });

  it("midline nach links", () => {
    const f: U2Finding = {
      kind: "u2",
      horizontalOverjet: null,
      verticalOverlap: null,
      midline: { direction: "left", mm: 2 },
      referenceTooth: null,
    };
    expect(renderSentence(f)).toBe("Mittellinienabweichung 2 mm nach links.");
  });
});

describe("renderSentence — U3", () => {
  it("renders each non-straight opening pattern", () => {
    expect(renderSentence({ kind: "u3", pattern: "correctedDeviation" } satisfies U3Finding)).toBe(
      "Öffnungs-/Schließmuster: Korrigierte Deviation."
    );
    expect(renderSentence({ kind: "u3", pattern: "uncorrectedRight" } satisfies U3Finding)).toBe(
      "Öffnungs-/Schließmuster: Unkorrigierte Deviation nach rechts."
    );
    expect(renderSentence({ kind: "u3", pattern: "uncorrectedLeft" } satisfies U3Finding)).toBe(
      "Öffnungs-/Schließmuster: Unkorrigierte Deviation nach links."
    );
  });
});

function u4(overrides: Partial<U4Finding> = {}): U4Finding {
  return {
    kind: "u4",
    painFreeMm: null,
    painFreeRefused: false,
    maxMm: null,
    maxRefused: false,
    painStructures: [],
    withHeadache: false,
    assistedTerminated: false,
    interviewRefused: false,
    ...overrides,
  };
}

function u5(overrides: Partial<U5Finding> = {}): U5Finding {
  return {
    kind: "u5",
    lateralRightMm: null,
    lateralRightRefused: false,
    lateralLeftMm: null,
    lateralLeftRefused: false,
    protrusiveMm: null,
    protrusiveRefused: false,
    painStructures: [],
    interviewRefused: false,
    ...overrides,
  };
}

describe("renderSentence — U4", () => {
  it("both measurements + pain + headache qualifiers", () => {
    expect(
      renderSentence(
        u4({
          painFreeMm: 42,
          maxMm: 54,
          painStructures: [
            { region: "temporalis", side: "left" },
            { region: "masseter", side: "both" },
          ],
          withHeadache: true,
        })
      )
    ).toBe(
      "Schmerzfreie Mundöffnung 42 mm. Maximale Mundöffnung 54 mm, mit bekannten Schmerzen in Temporalis links, Masseter beidseits, mit bekanntem Schläfenkopfschmerz."
    );
  });

  it("only max measurement, no qualifiers", () => {
    expect(renderSentence(u4({ maxMm: 50 }))).toBe("Maximale Mundöffnung 50 mm.");
  });

  it("only painFree measurement (unusual but valid)", () => {
    expect(renderSentence(u4({ painFreeMm: 38 }))).toBe("Schmerzfreie Mundöffnung 38 mm.");
  });

  it("pain/headache but no max measurement → fallback clause", () => {
    expect(
      renderSentence(
        u4({
          painStructures: [{ region: "temporalis", side: "right" }],
          withHeadache: true,
        })
      )
    ).toBe(
      "Bekannte Schmerzen bei Mundöffnung in Temporalis rechts, bekannter Schläfenkopfschmerz bei Mundöffnung."
    );
  });

  it("painFree refused → 'Schmerzfreie Mundöffnung verweigert.'", () => {
    expect(renderSentence(u4({ painFreeRefused: true, maxMm: 50 }))).toBe(
      "Schmerzfreie Mundöffnung verweigert. Maximale Mundöffnung 50 mm."
    );
  });

  it("max refused → 'Maximale Mundöffnung verweigert.'", () => {
    expect(renderSentence(u4({ painFreeMm: 38, maxRefused: true }))).toBe(
      "Schmerzfreie Mundöffnung 38 mm. Maximale Mundöffnung verweigert."
    );
  });

  it("terminated (hand gehoben) appended to max sentence", () => {
    expect(renderSentence(u4({ maxMm: 54, assistedTerminated: true }))).toBe(
      "Maximale Mundöffnung 54 mm, Untersuchung vom Patienten abgebrochen."
    );
  });

  it("interviewRefused appended to max sentence", () => {
    expect(renderSentence(u4({ maxMm: 54, interviewRefused: true }))).toBe(
      "Maximale Mundöffnung 54 mm, Schmerzabfrage verweigert."
    );
  });

  it("all trailing notes chained in canonical order (pain, headache, interview, terminated)", () => {
    expect(
      renderSentence(
        u4({
          maxMm: 54,
          painStructures: [{ region: "masseter", side: "right" }],
          withHeadache: true,
          interviewRefused: true,
          assistedTerminated: true,
        })
      )
    ).toBe(
      "Maximale Mundöffnung 54 mm, mit bekannten Schmerzen in Masseter rechts, mit bekanntem Schläfenkopfschmerz, Schmerzabfrage verweigert, Untersuchung vom Patienten abgebrochen."
    );
  });
});

describe("renderSentence — U5", () => {
  it("all three measurements + pain qualifier", () => {
    expect(
      renderSentence(
        u5({
          lateralRightMm: 11,
          lateralLeftMm: 9,
          protrusiveMm: 7,
          painStructures: [{ region: "tmj", side: "right" }],
        })
      )
    ).toBe(
      "Laterotrusion rechts 11 mm, Laterotrusion links 9 mm, Protrusion 7 mm, mit bekannten Schmerzen in Kiefergelenk rechts."
    );
  });

  it("partial measurements (some null) — null ones silently omitted", () => {
    expect(renderSentence(u5({ lateralRightMm: 10, protrusiveMm: 6 }))).toBe(
      "Laterotrusion rechts 10 mm, Protrusion 6 mm."
    );
  });

  it("per-movement refused rendered in place of mm", () => {
    expect(
      renderSentence(
        u5({ lateralRightRefused: true, lateralLeftMm: 9, protrusiveMm: 7 })
      )
    ).toBe("Laterotrusion rechts verweigert, Laterotrusion links 9 mm, Protrusion 7 mm.");
  });

  it("interviewRefused appended", () => {
    expect(
      renderSentence(
        u5({ lateralRightMm: 10, lateralLeftMm: 9, protrusiveMm: 7, interviewRefused: true })
      )
    ).toBe(
      "Laterotrusion rechts 10 mm, Laterotrusion links 9 mm, Protrusion 7 mm, Schmerzabfrage verweigert."
    );
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

describe("renderSentence — U8", () => {
  it("duringOpening, unilateral, lösbar durch Patient", () => {
    const f: U8Finding = {
      kind: "u8",
      situation: "duringOpening",
      side: "right",
      reducibility: "byPatient",
    };
    expect(renderSentence(f)).toBe(
      "Kieferblockade während der Öffnung im rechten Kiefergelenk, lösbar durch Patient."
    );
  });

  it("wideOpening, bilateral, lösbar durch Untersucher", () => {
    const f: U8Finding = {
      kind: "u8",
      situation: "wideOpening",
      side: "both",
      reducibility: "byExaminer",
    };
    expect(renderSentence(f)).toBe(
      "Kieferblockade bei weiter Mundöffnung im Kiefergelenk (beidseitig), lösbar durch Untersucher."
    );
  });

  it("byBoth → 'lösbar durch Patient und Untersucher'", () => {
    const f: U8Finding = {
      kind: "u8",
      situation: "duringOpening",
      side: "left",
      reducibility: "byBoth",
    };
    expect(renderSentence(f)).toBe(
      "Kieferblockade während der Öffnung im linken Kiefergelenk, lösbar durch Patient und Untersucher."
    );
  });

  it("none → 'nicht lösbar'", () => {
    const f: U8Finding = {
      kind: "u8",
      situation: "wideOpening",
      side: "right",
      reducibility: "none",
    };
    expect(renderSentence(f)).toBe(
      "Kieferblockade bei weiter Mundöffnung im rechten Kiefergelenk, nicht lösbar."
    );
  });

  it("null reducibility → clause omitted", () => {
    const f: U8Finding = {
      kind: "u8",
      situation: "duringOpening",
      side: "right",
      reducibility: null,
    };
    expect(renderSentence(f)).toBe("Kieferblockade während der Öffnung im rechten Kiefergelenk.");
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

describe("renderSentence — refused palpation sides (U9/U10)", () => {
  it("u9.refused unilateral", () => {
    const f: U9RefusedFinding = { kind: "u9.refused", side: "right" };
    expect(renderSentence(f)).toBe("Palpation rechts verweigert.");
  });

  it("u9.refused bilateral (after merge)", () => {
    const f: U9RefusedFinding = { kind: "u9.refused", side: "both" };
    expect(renderSentence(f)).toBe("Palpation beidseits verweigert.");
  });

  it("u10.refused uses 'Ergänzende Palpation' prefix", () => {
    const f: U10RefusedFinding = { kind: "u10.refused", side: "left" };
    expect(renderSentence(f)).toBe("Ergänzende Palpation links verweigert.");
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
