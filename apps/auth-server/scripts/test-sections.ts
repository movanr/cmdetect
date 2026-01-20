/**
 * Test Typst template sections individually to find the error
 */

import fs from "fs";
import path from "path";

const sampleData = {
  metadata: {
    exportDate: "2026-01-20T12:00:00Z",
    caseId: "test-123",
    organizationName: "Test Praxis",
  },
  patient: {
    firstName: "Max",
    lastName: "Mustermann",
    dateOfBirth: "1990-05-15",
    clinicInternalId: "PAT-001",
  },
  questionnaires: {
    phq4: {
      total: 6,
      maxTotal: 12,
      anxiety: 3,
      maxAnxiety: 6,
      depression: 3,
      maxDepression: 6,
    },
    jfls8: {
      globalScore: 1.2,
      maxScore: 10,
      answeredCount: 8,
      totalQuestions: 8,
      missingCount: 0,
      isValid: true,
      limitationLevel: "mild",
      limitationInterpretation: {
        label: "Mild Limitation",
        labelDe: "Leichte Einschraenkung",
      },
    },
  },
  painDrawing: {
    score: {
      regionCount: 2,
      affectedRegions: ["head-right", "head-left"],
      elementCounts: {
        "head-right": { shadings: 3, points: 2, arrows: 1, total: 6 },
        "head-left": { shadings: 2, points: 1, arrows: 0, total: 3 },
      },
      totalElements: 9,
      patterns: {
        hasHeadPain: true,
        hasOralPain: false,
        hasBodyPain: false,
        hasWidespreadPain: false,
      },
      riskLevel: "regional",
      interpretation: {
        labelDe: "Regionaler Schmerz",
        descriptionDe: "Schmerzen in mehreren Regionen",
      },
    },
    images: {},
  },
};

function toTypstValue(value: unknown): string {
  if (value === null || value === undefined) return "none";
  if (typeof value === "string") {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `"${escaped}"`;
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    if (value.length === 0) return "()";
    const items = value.map(toTypstValue).join(", ");
    return `(${items},)`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "(:)";
    const pairs = entries.map(([k, v]) => {
      const key = k.includes("-") ? `"${k}"` : k;
      return `${key}: ${toTypstValue(v)}`;
    });
    return `(${pairs.join(", ")})`;
  }
  return "none";
}

async function testSection(name: string, template: string) {
  console.log(`\nTesting: ${name}`);
  console.log("=".repeat(40));

  const typstData = toTypstValue(sampleData);
  const fullTemplate = `#let data = ${typstData}\n\n${template}`;

  // Write debug file
  const debugPath = `/tmp/typst-debug-${name.replace(/[^a-z0-9]/gi, '_')}.typ`;
  fs.writeFileSync(debugPath, fullTemplate);

  try {
    const { $typst } = await import("@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs");
    const pdfBytes = await $typst.pdf({ mainContent: fullTemplate });
    if (pdfBytes) {
      console.log(`SUCCESS: ${pdfBytes.length} bytes`);
      return true;
    }
    console.log("FAIL: Empty PDF");
    console.log("Debug file:", debugPath);
    return false;
  } catch (error) {
    console.log("FAIL:", error);
    console.log("Debug file:", debugPath);
    return false;
  }
}

async function runTests() {
  // Test calc.round
  await testSection("calc.round", `
#let score = 1.234
#text(str(calc.round(score, digits: 2)))
`);

  // Test optional field access
  await testSection("Optional nullable field", `
#let jfls = data.questionnaires.jfls8

#if jfls.limitationInterpretation != none {
  text(jfls.limitationInterpretation.labelDe)
}
`);

  // Test array with hyphens in dict
  await testSection("Dict with hyphen keys", `
#let pd = data.painDrawing
#let score = pd.score

Regions: #score.affectedRegions.join(", ")
`);

  // Test dictionary with quoted keys
  await testSection("Quoted dict keys", `
#let region-labels = (
  "mouth": "Mund",
  "head-right": "Kopf rechts"
)

Label: #region-labels.at("mouth")
`);

  // Test dict .at() with hyphen key
  await testSection("Dict at with hyphen key", `
#let pd = data.painDrawing
#let score = pd.score
#let counts = score.elementCounts

#let val = counts.at("head-right")
Count: #val.total
`);

  // Test images dict (empty)
  await testSection("Empty images dict", `
#let pd = data.painDrawing
#let imgs = pd.images

#if imgs != none and imgs.len() > 0 {
  [Has images]
} else {
  [No images]
}
`);

  // Test conditional in grid with patterns
  await testSection("Conditional patterns in grid", `
#let score = data.painDrawing.score

#grid(
  columns: (auto, auto, auto),
  gutter: 12pt,
  if score.patterns.hasHeadPain {
    box(fill: rgb("#fed7aa"), inset: 4pt, text("Kopfschmerz"))
  },
  if score.patterns.hasOralPain {
    box(fill: rgb("#fed7aa"), inset: 4pt, text("Orale Region"))
  },
  if score.patterns.hasBodyPain {
    box(fill: rgb("#fed7aa"), inset: 4pt, text("Koerperbereich"))
  }
)
`);

  // Test JFLS section fully
  await testSection("JFLS full section", `
#let color-green = rgb("#22c55e")
#let color-yellow = rgb("#eab308")
#let color-red = rgb("#ef4444")
#let color-muted = rgb("#6b7280")
#let color-border = rgb("#e5e7eb")

#let severity-box(label, is-active, color) = {
  let bg = if is-active { color } else { rgb("#e5e7eb") }
  let fg = if is-active { white } else { rgb("#9ca3af") }
  box(
    fill: bg,
    radius: 2pt,
    inset: (x: 4pt, y: 2pt),
    text(fill: fg, size: 8pt, weight: if is-active { "bold" } else { "regular" }, label)
  )
}

#let jfls = data.questionnaires.jfls8
#let level = jfls.limitationLevel

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 2pt,
  severity-box("Normal (<0.5)", level == "normal", color-green),
  severity-box("Leicht (0.5-1.5)", level == "mild", color-yellow),
  severity-box("Deutlich (>= 1.5)", level == "significant", color-red),
)

#v(10pt)

#if jfls.isValid and jfls.globalScore != none {
  align(center)[
    #text(weight: "bold", size: 16pt, str(calc.round(jfls.globalScore, digits: 2)))
    #text(fill: color-muted, size: 10pt, [ / #jfls.maxScore])
    #h(8pt)
    #if jfls.limitationInterpretation != none {
      text(size: 10pt, weight: "medium", jfls.limitationInterpretation.labelDe)
    }
  ]
}
`);

  // Test pain drawing section
  await testSection("Pain drawing section", `
#let color-green = rgb("#22c55e")
#let color-yellow = rgb("#eab308")
#let color-orange = rgb("#f97316")
#let color-red = rgb("#ef4444")
#let color-muted = rgb("#6b7280")
#let color-border = rgb("#e5e7eb")

#let severity-box(label, is-active, color) = {
  let bg = if is-active { color } else { rgb("#e5e7eb") }
  let fg = if is-active { white } else { rgb("#9ca3af") }
  box(fill: bg, radius: 2pt, inset: (x: 4pt, y: 2pt),
    text(fill: fg, size: 8pt, weight: if is-active { "bold" } else { "regular" }, label))
}

#let pd = data.painDrawing
#let score = pd.score
#let level = score.riskLevel

#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  gutter: 2pt,
  severity-box("Keine (0)", level == "none", color-green),
  severity-box("Lokal (1)", level == "localized", color-yellow),
  severity-box("Regional (2-3)", level == "regional", color-orange),
  severity-box("Weit (4-5)", level == "widespread", color-red),
)

#v(10pt)

#align(center)[
  #text(weight: "bold", size: 16pt, str(score.regionCount))
  #text(fill: color-muted, size: 10pt, [ von 5 Regionen betroffen])
  #h(8pt)
  #text(size: 10pt, weight: "medium", score.interpretation.labelDe)
]

#if score.regionCount > 0 {
  #v(6pt)

  #text(weight: "medium", size: 9pt, "Schmerzmuster:")
  #v(4pt)

  #grid(
    columns: (auto, auto, auto),
    gutter: 12pt,
    if score.patterns.hasHeadPain {
      box(fill: color-orange.lighten(80%), radius: 2pt, inset: 4pt, text(size: 8pt, "Kopfschmerz"))
    },
    if score.patterns.hasOralPain {
      box(fill: color-orange.lighten(80%), radius: 2pt, inset: 4pt, text(size: 8pt, "Orale Region"))
    },
    if score.patterns.hasBodyPain {
      box(fill: color-orange.lighten(80%), radius: 2pt, inset: 4pt, text(size: 8pt, "Koerperbereich"))
    }
  )

  #v(8pt)

  #text(fill: color-muted, size: 8pt)[
    Betroffene Regionen: #score.affectedRegions.join(", ")
  ]
}
`);

  // Test the images section with map
  await testSection("Images map section", `
#let color-border = rgb("#e5e7eb")

#let pd = data.painDrawing

#if pd.images != none and pd.images.len() > 0 {
  let image-keys = pd.images.keys()
  let region-labels = (
    "mouth": "Mund",
    "head-right": "Kopf rechts",
    "head-left": "Kopf links",
    "body-front": "Koerper vorne",
    "body-back": "Koerper hinten"
  )

  grid(
    columns: (1fr,) * calc.min(3, image-keys.len()),
    gutter: 8pt,
    ..image-keys.map(key => {
      let label = region-labels.at(key, default: key)
      box(inset: 4pt, text(label))
    })
  )
} else {
  [No images available]
}
`);

}

runTests();
