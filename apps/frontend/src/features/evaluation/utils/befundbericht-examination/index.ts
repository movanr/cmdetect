import type { SectionId } from "@cmdetect/dc-tmd";
import type { FormValues } from "../../../examination";
import { extractU1a } from "./extract/u1a";
import { extractU1b } from "./extract/u1b";
import { extractU4 } from "./extract/u4";
import { extractU5 } from "./extract/u5";
import { extractU6 } from "./extract/u6";
import { extractU9 } from "./extract/u9";
import { mergeBilateral } from "./merge-bilateral";
import { renderSentence } from "./render";
import type { Finding } from "./types";

/**
 * Generates the examination narrative for the Befundbericht as an array of
 * paragraph strings — one paragraph per non-empty section, in canonical order
 * (U1a → U1b → U2 → U3 → U4 → U5 → U6 → U7 → U8 → U9 → U10).
 *
 * Empty sections (no findings after extract+filter) are omitted entirely
 * per meta-rule 1.5.
 */
export function generateExaminationNarrative(
  data: FormValues,
  completedSections: SectionId[]
): string[] {
  const completed = new Set(completedSections);
  const paragraphs: string[] = [];

  if (completed.has("e1")) {
    const pa = renderSection(extractU1a(data));
    if (pa) paragraphs.push(pa);
    const pb = renderSection(extractU1b(data));
    if (pb) paragraphs.push(pb);
  }

  if (completed.has("e4")) {
    const p = renderSection(extractU4(data));
    if (p) paragraphs.push(p);
  }

  if (completed.has("e5")) {
    const p = renderSection(extractU5(data));
    if (p) paragraphs.push(p);
  }

  if (completed.has("e6")) {
    const p = renderSection(extractU6(data));
    if (p) paragraphs.push(p);
  }

  if (completed.has("e9")) {
    const p = renderSection(extractU9(data));
    if (p) paragraphs.push(p);
  }

  // Additional sections land in subsequent slices.

  return paragraphs;
}

function renderSection(findings: Finding[]): string | null {
  if (findings.length === 0) return null;
  const merged = mergeBilateral(findings);
  const sentences = merged.map(renderSentence);
  return sentences.join(" ");
}
