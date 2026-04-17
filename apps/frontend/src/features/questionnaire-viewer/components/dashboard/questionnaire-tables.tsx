/**
 * Shared questionnaire table components
 *
 * Used by both the interactive DashboardView and the PrintableAnamnesis.
 * Each table renders a questionnaire's answers in a clean, plain HTML table.
 */

import type { PainDrawingData } from "@/features/pain-drawing-evaluation";
import { REGION_ORDER, RegionThumbnail } from "@/features/pain-drawing-evaluation";
import type {
  GCPS1MAnswers,
  JFLS20Answers,
  JFLS8Answers,
  OBCAnswers,
} from "@cmdetect/questionnaires";
import {
  formatManualScoreLine,
  GCPS_1M_QUESTION_ORDER,
  GCPS_1M_QUESTIONS,
  isQuestionIdEnabled,
  isQuestionnaireEnabled,
  JFLS20_QUESTION_ORDER,
  JFLS20_QUESTIONS,
  JFLS20_SCALE_LABELS,
  JFLS8_QUESTION_ORDER,
  JFLS8_QUESTIONS,
  JFLS8_SCALE_LABELS,
  OBC_QUESTION_ORDER,
  OBC_QUESTIONS,
  OBC_SLEEP_OPTIONS,
  OBC_WAKING_OPTIONS,
  PHQ4_OPTIONS,
  PHQ4_QUESTION_ORDER,
  PHQ4_QUESTIONS,
  QUESTIONNAIRE_ID,
  SQ_DISPLAY_IDS,
  SQ_ENABLE_WHEN,
  SQ_OFFICE_USE_QUESTIONS,
  SQ_PAIN_FREQUENCY_LABELS,
  SQ_QUESTION_LABELS,
  SQ_QUESTION_ORDER,
  SQ_SCREENS,
  SQ_SECTION_NAMES_ORDER,
  SQ_YES_NO_LABELS,
  type SQQuestionId,
} from "@cmdetect/questionnaires";
import { Fragment } from "react";
import type { ManualScoreRow } from "../../hooks/useManualScores";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";

// ─── Shared styles ─────────────────────────────────────────────────────

export const thClass = "py-1.5 pr-3 font-semibold text-gray-700 text-left";
export const tdClass = "py-1 pr-3 text-sm";
export const tdMuted = "py-1 pr-3 text-sm text-gray-500";
export const headerRowClass = "border-b-2 border-gray-300";
export const bodyRowClass = "border-b border-gray-100";

// ─── Raw answer arithmetic (scoring-algorithm-independent) ────────────

function computeRawSumAndCount(answers: Record<string, unknown> | undefined): {
  sum: number;
  count: number;
} {
  if (!answers) return { sum: 0, count: 0 };
  let sum = 0;
  let count = 0;
  for (const value of Object.values(answers)) {
    if (value === undefined || value === null || value === "") continue;
    const n = parseFloat(String(value));
    if (Number.isNaN(n)) continue;
    sum += n;
    count += 1;
  }
  return { sum, count };
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-start gap-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-center">
      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="font-mono text-xl font-semibold text-gray-900 leading-tight">{value}</span>
      <span className="font-mono text-[11px] text-gray-400 leading-tight">
        {subtitle ?? "\u00A0"}
      </span>
    </div>
  );
}

/**
 * Compact stat row showing the raw sum, mean and missing-answer count for a
 * questionnaire — rendered above the answers table so it's visible without
 * scrolling. Independent of any questionnaire scoring algorithm (no
 * missing-handling, rescaling, or subscale logic).
 */
function AnswerTotalsStats({
  answers,
  expectedCount,
}: {
  answers: Record<string, unknown> | undefined;
  expectedCount: number;
}) {
  const { sum, count } = computeRawSumAndCount(answers);
  if (count === 0) return null;
  const mean = sum / count;
  const missing = Math.max(0, expectedCount - count);
  return (
    <div className="grid grid-cols-3 gap-3 mb-3">
      <StatCard label="Summe" value={formatNumber(sum)} />
      <StatCard
        label="Mittelwert"
        value={formatNumber(mean)}
        subtitle={`${formatNumber(sum)} ÷ ${count}`}
      />
      <StatCard label="Fehlend" value={String(missing)} />
    </div>
  );
}

// ─── Scale Pips ────────────────────────────────────────────────────────

/**
 * Renders filled/hollow circles for quick visual scanning of scale values.
 * ●●●●○○○○○○○  4/10
 */
export function ScalePips({ value, max }: { value: number; max: number }) {
  return (
    <span className="inline-flex gap-px mr-1.5 align-middle" aria-hidden>
      {Array.from({ length: max + 1 }, (_, i) => (
        <span
          key={i}
          className={`text-[9px] leading-none ${i < value ? "text-gray-700" : "text-gray-300"}`}
        >
          {i < value ? "●" : "○"}
        </span>
      ))}
    </span>
  );
}

// ─── Scores Overview ───────────────────────────────────────────────────

const OVERVIEW_ROWS: ReadonlyArray<{ id: string; label: string }> = [
  { id: QUESTIONNAIRE_ID.PAIN_DRAWING, label: "Schmerzzeichnung" },
  { id: QUESTIONNAIRE_ID.GCPS_1M, label: "GCPS-1M" },
  { id: QUESTIONNAIRE_ID.PHQ4, label: "PHQ-4" },
  { id: QUESTIONNAIRE_ID.JFLS8, label: "JFLS-8" },
  { id: QUESTIONNAIRE_ID.JFLS20, label: "JFLS-20" },
  { id: QUESTIONNAIRE_ID.OBC, label: "OBC" },
];

export function ScoresOverviewTable({
  manualScores,
}: {
  manualScores: Record<string, ManualScoreRow>;
}) {
  const rows = OVERVIEW_ROWS.filter((r) => isQuestionnaireEnabled(r.id)).map((row) => {
    const manual = manualScores[row.id];
    const line = formatManualScoreLine(row.id, manual?.scores);
    return {
      instrument: row.label,
      score: line || "Nicht bewertet",
      note: manual?.note?.trim() ?? "",
      hasValue: !!line,
    };
  });

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className={headerRowClass}>
          <th className={thClass}>Instrument</th>
          <th className={thClass}>Ergebnis</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.instrument} className={bodyRowClass}>
            <td className={`${tdClass} whitespace-nowrap font-medium align-top`}>
              {r.instrument}
            </td>
            <td className={tdClass}>
              <div className={r.hasValue ? "" : "text-gray-400 italic"}>{r.score}</div>
              {r.note && (
                <div className="text-xs text-gray-500 mt-0.5">
                  <span className="text-gray-400">Anmerkung: </span>
                  {r.note}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── SQ Answers ─────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function formatSQAnswer(questionId: SQQuestionId, value: unknown): string {
  if (value === undefined || value === null) return "—";

  // Duration questions (SQ2, SQ6)
  if (questionId === "SQ2" || questionId === "SQ6") {
    const duration = value as { years?: number; months?: number };
    const parts: string[] = [];
    if (duration.years) parts.push(`${duration.years} ${duration.years === 1 ? "Jahr" : "Jahre"}`);
    if (duration.months)
      parts.push(`${duration.months} ${duration.months === 1 ? "Monat" : "Monate"}`);
    return parts.length > 0 ? parts.join(", ") : "—";
  }

  // Pain frequency (SQ3)
  if (questionId === "SQ3") return SQ_PAIN_FREQUENCY_LABELS[value as string] ?? String(value);

  // Yes/No
  if (typeof value === "string") return SQ_YES_NO_LABELS[value] ?? value;

  return String(value);
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatOfficeUse(
  questionId: SQQuestionId,
  answers: Record<string, unknown>
): string {
  const officeUse = answers[`${questionId}_office`] as
    | { R?: boolean; L?: boolean; DNK?: boolean }
    | undefined;
  if (!officeUse) return "";
  const sides: string[] = [];
  if (officeUse.R) sides.push("R");
  if (officeUse.L) sides.push("L");
  if (officeUse.DNK) sides.push("?");
  return sides.join(", ");
}

export function SQAnswersTable({
  answers,
  sectionFilter,
}: {
  answers: Record<string, unknown>;
  /** When set, only rows from this section render; the section-header band row is suppressed. */
  sectionFilter?: string;
}) {
  // Build lookup from SQ_SCREENS
  const screenMap = new Map(SQ_SCREENS.map((s) => [s.id, s]));

  // Group questions by section, filtering by conditional logic
  const answersBySection: Record<string, Array<{ id: SQQuestionId; answer: unknown }>> = {};

  for (const questionId of SQ_QUESTION_ORDER) {
    const label = SQ_QUESTION_LABELS[questionId];
    if (!label) continue;
    if (!isQuestionIdEnabled(questionId, SQ_ENABLE_WHEN, answers)) continue;
    if (!answersBySection[label.section]) answersBySection[label.section] = [];
    answersBySection[label.section].push({ id: questionId, answer: answers[questionId] });
  }

  // Track which matrix parent texts we've already rendered
  const renderedParents = new Set<string>();

  const sectionsToRender = sectionFilter
    ? SQ_SECTION_NAMES_ORDER.filter((s) => s === sectionFilter)
    : SQ_SECTION_NAMES_ORDER;

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className={headerRowClass}>
          <th className={thClass}>Nr.</th>
          <th className={thClass}>Frage</th>
          <th className={`${thClass} text-right`}>Antwort</th>
          <th className={thClass}>Seite</th>
        </tr>
      </thead>
      <tbody>
        {sectionsToRender.map((section) => {
          const sectionAnswers = answersBySection[section];
          if (!sectionAnswers || sectionAnswers.length === 0) return null;

          return (
            <Fragment key={section}>
              {!sectionFilter && (
                <tr>
                  <td
                    colSpan={4}
                    className="pt-3 pb-2 px-3 text-sm font-semibold text-gray-900 bg-gray-100 border-t-2 border-gray-300"
                  >
                    {section}
                  </td>
                </tr>
              )}
              {sectionAnswers.map(({ id, answer }) => {
                const screen = screenMap.get(id);
                const isOfficeUse = SQ_OFFICE_USE_QUESTIONS.has(id);
                const officeStr = isOfficeUse ? formatOfficeUse(id, answers) : "";
                const needsConfirm = isOfficeUse && answer === "yes" && !officeStr;

                // For matrix rows, show parent question text as a sub-header
                let parentHeader: React.ReactNode = null;
                if (screen?.type === "matrix_row" && screen.parentId) {
                  if (!renderedParents.has(screen.parentId)) {
                    renderedParents.add(screen.parentId);
                    parentHeader = (
                      <tr key={`${screen.parentId}-header`}>
                        <td />
                        <td colSpan={3} className="pt-2 pb-1 text-sm text-gray-600 italic">
                          {screen.text}
                        </td>
                      </tr>
                    );
                  }
                }

                const questionText =
                  screen?.type === "matrix_row" ? screen.rowText : (screen?.text ?? id);

                return (
                  <Fragment key={id}>
                    {parentHeader}
                    <tr className={bodyRowClass}>
                      <td className={tdMuted}>{SQ_DISPLAY_IDS[id]}</td>
                      <td className={tdClass}>{questionText}</td>
                      <td className={`${tdClass} text-right font-medium`}>
                        {formatSQAnswer(id, answer)}
                      </td>
                      <td className={tdMuted}>
                        {officeStr}
                        {needsConfirm && <span className="text-gray-400 italic">offen</span>}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── GCPS-1M Answers ───────────────────────────────────────────────────

export function GCPSAnswersTable({
  answers,
  showPips = false,
}: {
  answers: GCPS1MAnswers;
  showPips?: boolean;
}) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className={headerRowClass}>
          <th className={thClass}>Nr.</th>
          <th className={thClass}>Frage</th>
          <th className={`${thClass} text-right whitespace-nowrap`}>Antwort</th>
        </tr>
      </thead>
      <tbody>
        {GCPS_1M_QUESTION_ORDER.map((qId, idx) => {
          const question = GCPS_1M_QUESTIONS[qId];
          const answer = answers[qId];
          const isScale = question.type === "scale_0_10";
          const suffix = isScale ? " / 10" : question.type === "numeric" ? ` ${question.unit}` : "";
          return (
            <tr key={qId} className={bodyRowClass}>
              <td className={tdMuted}>{idx + 1}</td>
              <td className={tdClass}>{question.text}</td>
              <td className={`${tdClass} text-right font-medium whitespace-nowrap`}>
                {showPips && isScale && answer != null && (
                  <ScalePips value={Number(answer)} max={10} />
                )}
                {answer ?? "—"}
                <span className="text-gray-400 font-normal">{suffix}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── PHQ-4 Answers ─────────────────────────────────────────────────────

export function PHQ4AnswersTable({
  answers,
  showPips = false,
  showTotals = false,
}: {
  answers: Record<string, string>;
  showPips?: boolean;
  showTotals?: boolean;
}) {
  return (
    <>
      {showTotals && (
        <AnswerTotalsStats answers={answers} expectedCount={PHQ4_QUESTION_ORDER.length} />
      )}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className={headerRowClass}>
            <th className={thClass}>Nr.</th>
            <th className={thClass}>Frage</th>
            <th className={`${thClass} text-right whitespace-nowrap`}>Wert</th>
            <th className={`${thClass} whitespace-nowrap`}>Antwort</th>
          </tr>
        </thead>
        <tbody>
          {PHQ4_QUESTION_ORDER.map((qId, idx) => {
            const question = PHQ4_QUESTIONS[qId];
            const selected = answers[qId];
            const option = PHQ4_OPTIONS.find((o) => o.value === selected);
            return (
              <tr key={qId} className={bodyRowClass}>
                <td className={tdMuted}>{String.fromCharCode(97 + idx)}</td>
                <td className={tdClass}>{question.text}</td>
                <td className={`${tdClass} text-right font-medium whitespace-nowrap`}>
                  {showPips && selected != null && <ScalePips value={Number(selected)} max={3} />}
                  {selected ?? "—"}
                </td>
                <td className={`${tdMuted} whitespace-nowrap`}>{option?.label ?? ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

// ─── JFLS-8 Answers ────────────────────────────────────────────────────

export function JFLS8AnswersTable({
  answers,
  showPips = false,
  showTotals = false,
}: {
  answers: JFLS8Answers;
  showPips?: boolean;
  showTotals?: boolean;
}) {
  return (
    <>
      {showTotals && (
        <AnswerTotalsStats answers={answers} expectedCount={JFLS8_QUESTION_ORDER.length} />
      )}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className={headerRowClass}>
            <th className={thClass}>Nr.</th>
            <th className={thClass}>
              Aktivität{" "}
              <span className="font-normal text-gray-400">
                (0 = {JFLS8_SCALE_LABELS.min}, 10 = {JFLS8_SCALE_LABELS.max})
              </span>
            </th>
            <th className={`${thClass} text-right whitespace-nowrap`}>Wert</th>
          </tr>
        </thead>
        <tbody>
          {JFLS8_QUESTION_ORDER.map((qId, idx) => {
            const selected = answers[qId];
            return (
              <tr key={qId} className={bodyRowClass}>
                <td className={tdMuted}>{idx + 1}</td>
                <td className={tdClass}>{JFLS8_QUESTIONS[qId].text}</td>
                <td className={`${tdClass} text-right font-medium whitespace-nowrap`}>
                  {showPips && selected != null && <ScalePips value={Number(selected)} max={10} />}
                  {selected ?? "—"}
                  <span className="text-gray-400 font-normal"> / 10</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

// ─── JFLS-20 Answers ───────────────────────────────────────────────────

export function JFLS20AnswersTable({
  answers,
  showPips = false,
  showTotals = false,
}: {
  answers: JFLS20Answers;
  showPips?: boolean;
  showTotals?: boolean;
}) {
  return (
    <>
      {showTotals && (
        <AnswerTotalsStats answers={answers} expectedCount={JFLS20_QUESTION_ORDER.length} />
      )}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className={headerRowClass}>
            <th className={thClass}>Nr.</th>
            <th className={thClass}>
              Aktivität{" "}
              <span className="font-normal text-gray-400">
                (0 = {JFLS20_SCALE_LABELS.min}, 10 = {JFLS20_SCALE_LABELS.max})
              </span>
            </th>
            <th className={`${thClass} text-right whitespace-nowrap`}>Wert</th>
          </tr>
        </thead>
        <tbody>
          {JFLS20_QUESTION_ORDER.map((qId, idx) => {
            const selected = answers[qId];
            return (
              <tr key={qId} className={bodyRowClass}>
                <td className={tdMuted}>{idx + 1}</td>
                <td className={tdClass}>{JFLS20_QUESTIONS[qId].text}</td>
                <td className={`${tdClass} text-right font-medium whitespace-nowrap`}>
                  {showPips && selected != null && <ScalePips value={Number(selected)} max={10} />}
                  {selected ?? "—"}
                  <span className="text-gray-400 font-normal"> / 10</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

// ─── OBC Answers ───────────────────────────────────────────────────────

export function OBCAnswersTable({
  answers,
  showPips = false,
  showTotals = false,
}: {
  answers: OBCAnswers;
  showPips?: boolean;
  showTotals?: boolean;
}) {
  const sleepQuestions = OBC_QUESTION_ORDER.filter((id) => OBC_QUESTIONS[id].section === "sleep");
  const wakingQuestions = OBC_QUESTION_ORDER.filter((id) => OBC_QUESTIONS[id].section === "waking");

  const optionLabel = (qId: string, val: string | undefined) => {
    if (val === undefined) return "";
    const isSleep = OBC_QUESTIONS[qId as keyof typeof OBC_QUESTIONS].section === "sleep";
    const opts = isSleep ? OBC_SLEEP_OPTIONS : OBC_WAKING_OPTIONS;
    return opts.find((o) => o.value === val)?.label ?? "";
  };

  const renderSection = (title: string, questions: typeof OBC_QUESTION_ORDER) => (
    <>
      <tr>
        <td
          colSpan={4}
          className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          {title}
        </td>
      </tr>
      {questions.map((qId) => {
        const selected = answers[qId];
        const num = OBC_QUESTION_ORDER.indexOf(qId) + 1;
        const numericVal = selected !== undefined ? parseInt(selected, 10) : 0;
        return (
          <tr key={qId} className={bodyRowClass}>
            <td className={tdMuted}>{num}</td>
            <td className={tdClass}>{OBC_QUESTIONS[qId].text}</td>
            <td className={`${tdClass} text-right font-medium whitespace-nowrap`}>
              {showPips && selected != null && <ScalePips value={numericVal} max={4} />}
              {selected ?? "—"}
            </td>
            <td className={`${tdMuted} whitespace-nowrap`}>{optionLabel(qId, selected)}</td>
          </tr>
        );
      })}
    </>
  );

  return (
    <>
      {showTotals && (
        <AnswerTotalsStats answers={answers} expectedCount={OBC_QUESTION_ORDER.length} />
      )}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className={headerRowClass}>
            <th className={thClass}>Nr.</th>
            <th className={thClass}>Aktivität</th>
            <th className={`${thClass} text-right whitespace-nowrap`}>Wert</th>
            <th className={`${thClass} whitespace-nowrap`}>Häufigkeit</th>
          </tr>
        </thead>
        <tbody>
          {renderSection("Schlaf-Aktivitäten", sleepQuestions)}
          {renderSection("Wach-Aktivitäten", wakingQuestions)}
        </tbody>
      </table>
    </>
  );
}

// ─── Pain Drawing ──────────────────────────────────────────────────────

export function PainDrawingDetail({
  data,
  onRegionClick,
}: {
  data: PainDrawingData;
  onRegionClick?: (regionId: string) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {REGION_ORDER.map((regionId) => (
          <RegionThumbnail
            key={regionId}
            imageId={regionId}
            elements={data.drawings[regionId]?.elements ?? []}
            onClick={onRegionClick ? () => onRegionClick(regionId) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Re-exports for convenience ────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export { isQuestionnaireEnabled, QUESTIONNAIRE_ID };
export type { QuestionnaireResponse };
