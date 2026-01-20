/**
 * Test JFLS section - fixing the slash issue
 */

import fs from "fs";

const sampleData = {
  questionnaires: {
    jfls8: {
      globalScore: 1.2,
      maxScore: 10,
      limitationInterpretation: {
        labelDe: "Leichte Einschraenkung",
      },
      isValid: true,
      limitationLevel: "mild",
    },
  },
};

function toTypstValue(value: unknown): string {
  if (value === null || value === undefined) return "none";
  if (typeof value === "string") {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    if (value.length === 0) return "()";
    return `(${value.map(toTypstValue).join(", ")},)`;
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

async function test(name: string, template: string) {
  console.log(`\n=== ${name} ===`);

  const fullTemplate = `#let data = ${toTypstValue(sampleData)}\n\n${template}`;

  fs.writeFileSync(`/tmp/test-${name.replace(/[^a-z0-9]/gi, "_")}.typ`, fullTemplate);

  try {
    const { $typst } = await import("@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs");
    const pdfBytes = await $typst.pdf({ mainContent: fullTemplate });
    console.log(pdfBytes ? `OK: ${pdfBytes.length} bytes` : "FAIL: Empty");
    return !!pdfBytes;
  } catch (error) {
    console.log("FAIL:", error);
    return false;
  }
}

async function main() {
  // Test escape solutions for the slash issue

  // Solution 1: Use escape sequence
  await test("escape_slash", `
#let jfls = data.questionnaires.jfls8
#text([\\/  #jfls.maxScore])
`);

  // Solution 2: Use sym.slash
  await test("sym_slash", `
#let jfls = data.questionnaires.jfls8
#text([#sym.slash #jfls.maxScore])
`);

  // Solution 3: Put something before the slash
  await test("space_before", `
#let jfls = data.questionnaires.jfls8
#text([ #jfls.globalScore \\/ #jfls.maxScore])
`);

  // Solution 4: Inline code style
  await test("inline", `
#let jfls = data.questionnaires.jfls8
#jfls.globalScore #h(0pt) / #h(0pt) #jfls.maxScore
`);

  // Solution 5: No space around slash
  await test("no_space", `
#let jfls = data.questionnaires.jfls8
#str(jfls.globalScore)/#str(jfls.maxScore)
`);

  // Solution 6: Use unicode
  await test("unicode_slash", `
#let jfls = data.questionnaires.jfls8
#text([#jfls.globalScore \u{002F} #jfls.maxScore])
`);

  // Solution 7: Concatenation approach
  await test("concat", `
#let jfls = data.questionnaires.jfls8
#let color-muted = rgb("#6b7280")
#text(weight: "bold", size: 14pt, str(jfls.globalScore))
#text(fill: color-muted, size: 10pt, " / " + str(jfls.maxScore))
`);
}

main();
