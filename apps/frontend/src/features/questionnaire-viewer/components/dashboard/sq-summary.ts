/**
 * Derives compact tab-card summary entries from the patient's SQ answers.
 * One function per section — each returns a short list of {label, value}
 * entries displayed on the corresponding SQ tab card.
 */

import { SQ_PAIN_FREQUENCY_LABELS } from "@cmdetect/questionnaires";
import type { TabSummaryEntry } from "./Axis2ScoreCard";

type SQAnswers = Record<string, unknown>;

// ─── Helpers ────────────────────────────────────────────────────────────

/** Format duration from SQ2/SQ6 composite answer ({ years?, months? }). */
function formatDuration(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const d = value as { years?: number; months?: number };
  const parts: string[] = [];
  if (d.years) parts.push(`${d.years} ${d.years === 1 ? "Jahr" : "Jahre"}`);
  if (d.months) parts.push(`${d.months} ${d.months === 1 ? "Monat" : "Monate"}`);
  return parts.length > 0 ? parts.join(", ") : null;
}

/** Format side info from SQ office-use data (e.g. SQ8_office: { R: true, L: false }). */
function formatSide(officeValue: unknown): string | null {
  if (!officeValue || typeof officeValue !== "object") return null;
  const o = officeValue as { R?: boolean; L?: boolean; DNK?: boolean };
  if (o.DNK) return "unklar";
  if (o.R && o.L) return "beidseitig";
  if (o.R) return "rechts";
  if (o.L) return "links";
  return null;
}

function yesNo(v: unknown): "Ja" | "Nein" | null {
  if (v === "yes") return "Ja";
  if (v === "no") return "Nein";
  return null;
}

// ─── Per-section summaries ──────────────────────────────────────────────

export function summarizeSchmerzen(answers: SQAnswers): TabSummaryEntry[] {
  const sq1 = yesNo(answers.SQ1);
  if (sq1 === null) return [];
  if (sq1 === "Nein") return [{ label: "Jemals", value: "Nein" }];

  const entries: TabSummaryEntry[] = [{ label: "Jemals", value: "Ja" }];
  const duration = formatDuration(answers.SQ2);
  if (duration) {
    entries.push({ label: "Seit", value: duration });
  }
  const sq3 = answers.SQ3 as string | undefined;
  if (sq3) {
    entries.push({
      label: "Letzte 30 Tage",
      value: SQ_PAIN_FREQUENCY_LABELS[sq3] ?? sq3,
    });
  }

  // SQ4_A–D: pain modification by jaw activity (chewing, opening, clenching, speaking).
  const modificationKeys = ["SQ4_A", "SQ4_B", "SQ4_C", "SQ4_D"] as const;
  const anyAnswered = modificationKeys.some((k) => answers[k] !== undefined);
  if (anyAnswered) {
    const modified = modificationKeys.some((k) => answers[k] === "yes");
    entries.push({
      label: "Durch Kieferbewegung modifiziert",
      value: modified ? "Ja" : "Nein",
    });
  }
  return entries;
}

export function summarizeKopfschmerzen(answers: SQAnswers): TabSummaryEntry[] {
  const sq5 = yesNo(answers.SQ5);
  if (sq5 === null) return [];
  if (sq5 === "Nein") return [{ label: "Letzte 30 Tage", value: "Nein" }];

  const entries: TabSummaryEntry[] = [{ label: "Letzte 30 Tage", value: "Ja" }];
  const duration = formatDuration(answers.SQ6);
  if (duration) {
    entries.push({ label: "Seit", value: duration });
  }

  const modificationKeys = ["SQ7_A", "SQ7_B", "SQ7_C", "SQ7_D"] as const;
  const anyAnswered = modificationKeys.some((k) => answers[k] !== undefined);
  if (anyAnswered) {
    const modified = modificationKeys.some((k) => answers[k] === "yes");
    entries.push({
      label: "Durch Kieferbewegung modifiziert",
      value: modified ? "Ja" : "Nein",
    });
  }
  return entries;
}

export function summarizeGelenkgeraeusche(answers: SQAnswers): TabSummaryEntry[] {
  const sq8 = yesNo(answers.SQ8);
  if (sq8 === null) return [];
  const entries: TabSummaryEntry[] = [{ label: "Letzte 30 Tage", value: sq8 }];
  if (sq8 === "Ja") {
    const side = formatSide(answers.SQ8_office);
    if (side) entries.push({ label: "Seite", value: side });
  }
  return entries;
}

export function summarizeKieferklemme(answers: SQAnswers): TabSummaryEntry[] {
  const sq9 = yesNo(answers.SQ9);
  if (sq9 === null) return [];
  if (sq9 === "Nein") return [{ label: "Jemals", value: "Nein" }];

  const entries: TabSummaryEntry[] = [{ label: "Jemals", value: "Ja" }];

  const sq10 = yesNo(answers.SQ10);
  if (sq10 !== null) entries.push({ label: "Einschränkung beim Essen", value: sq10 });

  const sq11 = yesNo(answers.SQ11);
  if (sq11 !== null) entries.push({ label: "Letzte 30 Tage", value: sq11 });

  const sq12 = yesNo(answers.SQ12);
  if (sq12 !== null) entries.push({ label: "Gegenwärtig blockiert", value: sq12 });

  const side = formatSide(answers.SQ9_office);
  if (side) entries.push({ label: "Seite", value: side });

  return entries;
}

export function summarizeKiefersperre(answers: SQAnswers): TabSummaryEntry[] {
  const sq13 = yesNo(answers.SQ13);
  if (sq13 === null) return [];
  const entries: TabSummaryEntry[] = [{ label: "Letzte 30 Tage", value: sq13 }];
  if (sq13 === "Ja") {
    const sq14 = yesNo(answers.SQ14);
    if (sq14 !== null) entries.push({ label: "Manöver nötig", value: sq14 });
    const side = formatSide(answers.SQ13_office);
    if (side) entries.push({ label: "Seite", value: side });
  }
  return entries;
}
