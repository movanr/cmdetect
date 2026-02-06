/**
 * PrintableAnamnesis - Clean print layout for anamnesis export
 *
 * Plain tables and text only. No Card, ScaleBar, or other UI components.
 * Designed for window.print() / browser "Save as PDF" output.
 */

import { Fragment } from "react";
import type { PainDrawingData } from "@/features/pain-drawing-evaluation";
import {
  calculatePainDrawingScore,
  REGION_ORDER,
  RegionThumbnail,
} from "@/features/pain-drawing-evaluation";
import type {
  GCPS1MAnswers,
  JFLS20Answers,
  JFLS8Answers,
  OBCAnswers,
  SQAnswers,
} from "@cmdetect/questionnaires";
import {
  calculateGCPS1MScore,
  calculateJFLS20Score,
  calculateJFLS8Score,
  calculateOBCScore,
  calculatePHQ4Score,
  GCPS_1M_QUESTION_ORDER,
  GCPS_1M_QUESTIONS,
  getPHQ4Interpretation,
  getSubscaleInterpretation,
  isQuestionnaireEnabled,
  isQuestionIdEnabled,
  JFLS20_QUESTION_ORDER,
  JFLS20_QUESTIONS,
  JFLS20_REFERENCE_VALUES,
  JFLS20_SCALE_LABELS,
  JFLS20_SUBSCALE_LABELS,
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
  SQ_SECTION_NAMES_ORDER,
  SQ_QUESTION_ORDER,
  SQ_QUESTION_LABELS,
  SQ_DISPLAY_IDS,
  SQ_SCREENS,
  SQ_ENABLE_WHEN,
  SQ_OFFICE_USE_QUESTIONS,
  SQ_YES_NO_LABELS,
  SQ_PAIN_FREQUENCY_LABELS,
  type SQQuestionId,
} from "@cmdetect/questionnaires";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";

// ─── Shared styles ─────────────────────────────────────────────────────

const thClass = "py-1.5 pr-3 font-semibold text-gray-700 text-left";
const tdClass = "py-1 pr-3 text-sm";
const tdMuted = "py-1 pr-3 text-sm text-gray-500";
const headerRowClass = "border-b-2 border-gray-300";
const bodyRowClass = "border-b border-gray-100";

// ─── Types ─────────────────────────────────────────────────────────────

interface PrintableAnamnesisProps {
  responses: QuestionnaireResponse[];
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
}

// ─── Scores Overview ───────────────────────────────────────────────────

function ScoresOverviewTable({ responses }: { responses: QuestionnaireResponse[] }) {
  const phq4 = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.PHQ4);
  const gcps = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.GCPS_1M);
  const jfls8 = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS8);
  const jfls20 = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS20);
  const obc = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.OBC);
  const painDrawing = responses.find(
    (r) => r.questionnaireId === QUESTIONNAIRE_ID.PAIN_DRAWING
  );

  const rows: Array<{ instrument: string; score: string; interpretation: string }> = [];

  if (painDrawing) {
    const data = painDrawing.answers as unknown as PainDrawingData | undefined;
    if (data?.drawings && Object.keys(data.drawings).length > 0) {
      const pd = calculatePainDrawingScore(data);
      rows.push({
        instrument: "Schmerzzeichnung",
        score: `${pd.regionCount} Areal${pd.regionCount !== 1 ? "e" : ""}, ${pd.totalElements} Markierung${pd.totalElements !== 1 ? "en" : ""}`,
        interpretation: pd.patterns.hasWidespreadPain
          ? "Schmerz in mehreren Körperbereichen"
          : "",
      });
    }
  }

  if (gcps && Object.keys(gcps.answers).length > 0) {
    const s = calculateGCPS1MScore(gcps.answers as GCPS1MAnswers);
    const roman = s.grade === 0 ? "0" : ["I", "II", "III", "IV"][s.grade - 1];
    rows.push({
      instrument: "GCPS-1M",
      score: `Grad ${roman} (CPI ${s.cpi}, ${s.totalDisabilityPoints} BP)`,
      interpretation: s.gradeInterpretation.label,
    });
  }

  if (jfls8 && Object.keys(jfls8.answers).length > 0) {
    const s = calculateJFLS8Score(jfls8.answers as JFLS8Answers);
    rows.push({
      instrument: "JFLS-8",
      score:
        s.isValid && s.globalScore !== null
          ? `${s.globalScore.toFixed(2)} / ${s.maxScore}`
          : `Ungültig (${s.missingCount} fehlend)`,
      interpretation: s.limitationInterpretation?.label ?? "",
    });
  }

  if (phq4 && Object.keys(phq4.answers).length > 0) {
    const s = calculatePHQ4Score(phq4.answers as Record<string, string>);
    const interp = getPHQ4Interpretation(s);
    const ax = getSubscaleInterpretation(s.anxiety);
    const dep = getSubscaleInterpretation(s.depression);
    rows.push({
      instrument: "PHQ-4",
      score: `${s.total} / ${s.maxTotal} (Angst ${s.anxiety}/${s.maxAnxiety}, Depr. ${s.depression}/${s.maxDepression})`,
      interpretation: `${interp.label}${ax.positive ? " · Angst +" : ""}${dep.positive ? " · Depression +" : ""}`,
    });
  }

  if (obc && Object.keys(obc.answers).length > 0) {
    const s = calculateOBCScore(obc.answers as OBCAnswers);
    rows.push({
      instrument: "OBC",
      score: `${s.totalScore} / ${s.maxScore}`,
      interpretation: s.riskInterpretation.label,
    });
  }

  if (jfls20 && Object.keys(jfls20.answers).length > 0) {
    const s = calculateJFLS20Score(jfls20.answers as JFLS20Answers);
    let subscaleStr = "";
    if (s.isValid) {
      const parts = (["mastication", "mobility", "communication"] as const)
        .map((k) => {
          const sub = s.subscales[k];
          return sub.isValid && sub.score !== null
            ? `${JFLS20_SUBSCALE_LABELS[k].label} ${sub.score.toFixed(1)}`
            : null;
        })
        .filter(Boolean);
      subscaleStr = parts.length > 0 ? ` (${parts.join(", ")})` : "";
    }
    rows.push({
      instrument: "JFLS-20",
      score:
        s.isValid && s.globalScore !== null
          ? `${s.globalScore.toFixed(2)} / ${s.maxScore}${subscaleStr}`
          : `Ungültig (${s.missingCount} fehlend)`,
      interpretation: s.limitationInterpretation?.label ?? "",
    });
  }

  if (rows.length === 0) return null;

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className={headerRowClass}>
          <th className={thClass}>Instrument</th>
          <th className={thClass}>Ergebnis</th>
          <th className={thClass}>Bewertung</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.instrument} className={bodyRowClass}>
            <td className={`${tdClass} whitespace-nowrap font-medium`}>{r.instrument}</td>
            <td className={tdClass}>{r.score}</td>
            <td className={`${tdClass} text-gray-600`}>{r.interpretation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── SQ Answers ─────────────────────────────────────────────────────────

function formatSQAnswer(questionId: SQQuestionId, value: unknown): string {
  if (value === undefined || value === null) return "—";

  // Duration questions (SQ2, SQ6)
  if (questionId === "SQ2" || questionId === "SQ6") {
    const duration = value as { years?: number; months?: number };
    const parts: string[] = [];
    if (duration.years) parts.push(`${duration.years} ${duration.years === 1 ? "Jahr" : "Jahre"}`);
    if (duration.months) parts.push(`${duration.months} ${duration.months === 1 ? "Monat" : "Monate"}`);
    return parts.length > 0 ? parts.join(", ") : "—";
  }

  // Pain frequency (SQ3)
  if (questionId === "SQ3") return SQ_PAIN_FREQUENCY_LABELS[value as string] ?? String(value);

  // Yes/No
  if (typeof value === "string") return SQ_YES_NO_LABELS[value] ?? value;

  return String(value);
}

function formatOfficeUse(questionId: SQQuestionId, answers: Record<string, unknown>): string {
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

function SQAnswersTable({ answers }: { answers: Record<string, unknown> }) {
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
        {SQ_SECTION_NAMES_ORDER.map((section) => {
          const sectionAnswers = answersBySection[section];
          if (!sectionAnswers || sectionAnswers.length === 0) return null;

          return (
            <Fragment key={section}>
              <tr>
                <td
                  colSpan={4}
                  className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {section}
                </td>
              </tr>
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

function GCPSAnswersTable({ answers }: { answers: GCPS1MAnswers }) {
  const s = calculateGCPS1MScore(answers);
  const roman = s.grade === 0 ? "0" : ["I", "II", "III", "IV"][s.grade - 1];

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className={headerRowClass}>
          <th className={thClass}>Nr.</th>
          <th className={thClass}>Frage</th>
          <th className={`${thClass} text-right`}>Antwort</th>
        </tr>
      </thead>
      <tbody>
        {GCPS_1M_QUESTION_ORDER.map((qId, idx) => {
          const question = GCPS_1M_QUESTIONS[qId];
          const answer = answers[qId];
          const suffix =
            question.type === "numeric"
              ? ` ${question.unit}`
              : question.type === "scale_0_10"
                ? " / 10"
                : "";
          return (
            <tr key={qId} className={bodyRowClass}>
              <td className={tdMuted}>{idx + 1}</td>
              <td className={tdClass}>{question.text}</td>
              <td className={`${tdClass} text-right font-medium`}>
                {answer ?? "—"}
                <span className="text-gray-400 font-normal">{suffix}</span>
              </td>
            </tr>
          );
        })}
        {/* Score summary row */}
        <tr className="border-t-2 border-gray-300">
          <td />
          <td className={`${tdClass} font-semibold`}>
            Grad {roman} — {s.gradeInterpretation.label}
          </td>
          <td className={`${tdClass} text-right font-semibold`}>
            CPI {s.cpi}, {s.totalDisabilityPoints} BP
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── PHQ-4 Answers ─────────────────────────────────────────────────────

function PHQ4AnswersTable({ answers }: { answers: Record<string, string> }) {
  const s = calculatePHQ4Score(answers);
  const interp = getPHQ4Interpretation(s);

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className={headerRowClass}>
          <th className={thClass}>Nr.</th>
          <th className={thClass}>Frage</th>
          <th className={`${thClass} text-right`}>Wert</th>
          <th className={thClass}>Antwort</th>
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
              <td className={`${tdClass} text-right font-medium`}>{selected ?? "—"}</td>
              <td className={tdMuted}>{option?.label ?? ""}</td>
            </tr>
          );
        })}
        <tr className="border-t-2 border-gray-300">
          <td />
          <td className={`${tdClass} font-semibold`}>{interp.label}</td>
          <td className={`${tdClass} text-right font-semibold`}>
            {s.total} / {s.maxTotal}
          </td>
          <td className={tdMuted}>
            Angst {s.anxiety}/{s.maxAnxiety}, Depr. {s.depression}/{s.maxDepression}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── JFLS-8 Answers ────────────────────────────────────────────────────

function JFLS8AnswersTable({ answers }: { answers: JFLS8Answers }) {
  const s = calculateJFLS8Score(answers);

  return (
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
          <th className={`${thClass} text-right`}>Wert</th>
        </tr>
      </thead>
      <tbody>
        {JFLS8_QUESTION_ORDER.map((qId, idx) => {
          const selected = answers[qId];
          return (
            <tr key={qId} className={bodyRowClass}>
              <td className={tdMuted}>{idx + 1}</td>
              <td className={tdClass}>{JFLS8_QUESTIONS[qId].text}</td>
              <td className={`${tdClass} text-right font-medium`}>
                {selected ?? "—"}
                <span className="text-gray-400 font-normal"> / 10</span>
              </td>
            </tr>
          );
        })}
        {s.isValid && s.globalScore !== null && (
          <tr className="border-t-2 border-gray-300">
            <td />
            <td className={`${tdClass} font-semibold`}>
              {s.limitationInterpretation?.label ?? ""}
            </td>
            <td className={`${tdClass} text-right font-semibold`}>
              &#x2300; {s.globalScore.toFixed(2)}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// ─── JFLS-20 Answers ───────────────────────────────────────────────────

function JFLS20AnswersTable({ answers }: { answers: JFLS20Answers }) {
  const s = calculateJFLS20Score(answers);

  return (
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
          <th className={`${thClass} text-right`}>Wert</th>
        </tr>
      </thead>
      <tbody>
        {JFLS20_QUESTION_ORDER.map((qId, idx) => {
          const selected = answers[qId];
          return (
            <tr key={qId} className={bodyRowClass}>
              <td className={tdMuted}>{idx + 1}</td>
              <td className={tdClass}>{JFLS20_QUESTIONS[qId].text}</td>
              <td className={`${tdClass} text-right font-medium`}>
                {selected ?? "—"}
                <span className="text-gray-400 font-normal"> / 10</span>
              </td>
            </tr>
          );
        })}
        {s.isValid && s.globalScore !== null && (
          <>
            <tr className="border-t-2 border-gray-300">
              <td />
              <td className={`${tdClass} font-semibold`}>
                {s.limitationInterpretation?.label ?? ""}
              </td>
              <td className={`${tdClass} text-right font-semibold`}>
                &#x2300; {s.globalScore.toFixed(2)}
              </td>
            </tr>
            {(["mastication", "mobility", "communication"] as const).map((key) => {
              const sub = s.subscales[key];
              const ref = JFLS20_REFERENCE_VALUES[key];
              if (!sub.isValid || sub.score === null) return null;
              const elevated = sub.score >= ref.chronicTMD.mean;
              return (
                <tr key={key} className={bodyRowClass}>
                  <td />
                  <td className={tdMuted}>
                    {JFLS20_SUBSCALE_LABELS[key].label}
                    {elevated && (
                      <span className="text-gray-700 ml-1">
                        (≥ {ref.chronicTMD.mean.toFixed(1)} Ref. TMD)
                      </span>
                    )}
                  </td>
                  <td
                    className={`${tdClass} text-right ${elevated ? "font-semibold" : ""}`}
                  >
                    {sub.score.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </>
        )}
      </tbody>
    </table>
  );
}

// ─── OBC Answers ───────────────────────────────────────────────────────

function OBCAnswersTable({ answers }: { answers: OBCAnswers }) {
  const s = calculateOBCScore(answers);
  const sleepQuestions = OBC_QUESTION_ORDER.filter(
    (id) => OBC_QUESTIONS[id].section === "sleep"
  );
  const wakingQuestions = OBC_QUESTION_ORDER.filter(
    (id) => OBC_QUESTIONS[id].section === "waking"
  );

  const optionLabel = (qId: string, val: string | undefined) => {
    if (val === undefined) return "";
    const isSleep = OBC_QUESTIONS[qId as keyof typeof OBC_QUESTIONS].section === "sleep";
    const opts = isSleep ? OBC_SLEEP_OPTIONS : OBC_WAKING_OPTIONS;
    return opts.find((o) => o.value === val)?.label ?? "";
  };

  const renderSection = (title: string, questions: typeof OBC_QUESTION_ORDER) => (
    <>
      <tr>
        <td colSpan={4} className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </td>
      </tr>
      {questions.map((qId) => {
        const selected = answers[qId];
        const num = OBC_QUESTION_ORDER.indexOf(qId) + 1;
        const isHigh = selected !== undefined && parseInt(selected, 10) >= 3;
        return (
          <tr key={qId} className={`${bodyRowClass} ${isHigh ? "bg-gray-50" : ""}`}>
            <td className={tdMuted}>{num}</td>
            <td className={tdClass}>{OBC_QUESTIONS[qId].text}</td>
            <td className={`${tdClass} text-right ${isHigh ? "font-semibold" : "font-medium"}`}>
              {selected ?? "—"}
            </td>
            <td className={tdMuted}>{optionLabel(qId, selected)}</td>
          </tr>
        );
      })}
    </>
  );

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className={headerRowClass}>
          <th className={thClass}>Nr.</th>
          <th className={thClass}>Aktivität</th>
          <th className={`${thClass} text-right`}>Wert</th>
          <th className={thClass}>Häufigkeit</th>
        </tr>
      </thead>
      <tbody>
        {renderSection("Schlaf-Aktivitäten", sleepQuestions)}
        {renderSection("Wach-Aktivitäten", wakingQuestions)}
        <tr className="border-t-2 border-gray-300">
          <td />
          <td className={`${tdClass} font-semibold`}>{s.riskInterpretation.label}</td>
          <td className={`${tdClass} text-right font-semibold`}>
            {s.totalScore} / {s.maxScore}
          </td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}

// ─── Pain Drawing ──────────────────────────────────────────────────────

function PainDrawingDetail({ data }: { data: PainDrawingData }) {
  const score = calculatePainDrawingScore(data);
  return (
    <div>
      <p className="text-sm mb-2">
        <span className="text-gray-500">Areale: </span>
        <span className="font-medium">{score.regionCount}</span>
        <span className="text-gray-500 ml-3">Markierungen: </span>
        <span className="font-medium">{score.totalElements}</span>
        {score.patterns.hasWidespreadPain && (
          <span className="ml-3 text-gray-600">
            — Schmerz in mehreren Körperbereichen
          </span>
        )}
      </p>
      <div className="grid grid-cols-5 gap-2">
        {REGION_ORDER.map((regionId) => (
          <RegionThumbnail
            key={regionId}
            imageId={regionId}
            elements={data.drawings[regionId]?.elements ?? []}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export function PrintableAnamnesis({
  responses,
  patientName,
  patientDob,
  clinicInternalId,
}: PrintableAnamnesisProps) {
  const sqResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);
  const painDrawingResponse = responses.find(
    (r) => r.questionnaireId === QUESTIONNAIRE_ID.PAIN_DRAWING
  );
  const phq4Response = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.PHQ4);
  const gcps1mResponse = responses.find(
    (r) => r.questionnaireId === QUESTIONNAIRE_ID.GCPS_1M
  );
  const jfls8Response = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS8);
  const jfls20Response = responses.find(
    (r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS20
  );
  const obcResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.OBC);

  const painDrawingData = painDrawingResponse?.answers as PainDrawingData | undefined;
  const hasPainDrawing =
    painDrawingData?.drawings && Object.keys(painDrawingData.drawings).length > 0;

  const sqAnswers = sqResponse?.answers as SQAnswers | undefined;
  const isScreeningNegative = sqAnswers
    ? sqAnswers.SQ1 === "no" &&
      sqAnswers.SQ5 === "no" &&
      sqAnswers.SQ8 === "no" &&
      sqAnswers.SQ9 === "no" &&
      sqAnswers.SQ13 === "no"
    : false;

  const exportDate = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const hasAnswers = (r: QuestionnaireResponse | undefined) =>
    r && Object.keys(r.answers).length > 0;

  return (
    <div className="max-w-[210mm] mx-auto px-8 py-6 bg-white text-black print:p-0 print:max-w-none">
      {/* ── Header ── */}
      <div className="border-b-2 border-black pb-3 mb-5">
        <h1 className="text-lg font-bold mb-2">Anamnese-Übersicht</h1>
        <div className="flex justify-between text-sm">
          <div className="space-y-0.5">
            {patientName && (
              <div>
                <span className="text-gray-500">Patient: </span>
                <span className="font-medium">{patientName}</span>
              </div>
            )}
            {clinicInternalId && (
              <div>
                <span className="text-gray-500">Patienten-ID: </span>
                <span className="font-medium">{clinicInternalId}</span>
              </div>
            )}
          </div>
          <div className="space-y-0.5 text-right">
            {patientDob && (
              <div>
                <span className="text-gray-500">Geb.-Datum: </span>
                <span className="font-medium">{patientDob}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Datum: </span>
              <span className="font-medium">{exportDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scores Overview ── */}
      <section className="mb-6 print:break-inside-avoid">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Ergebnisübersicht
        </h2>
        <ScoresOverviewTable responses={responses} />
      </section>

      {/* ── SQ Detail ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.SQ) && sqResponse && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Symptomfragebogen (SF)
            {isScreeningNegative && " — Screening negativ"}
            {!isScreeningNegative && sqResponse.reviewedAt && " — Überprüft"}
          </h2>
          <SQAnswersTable answers={sqResponse.answers} />
        </section>
      )}

      {/* ── Pain Drawing ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PAIN_DRAWING) &&
        hasPainDrawing &&
        painDrawingData && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Schmerzzeichnung
            </h2>
            <PainDrawingDetail data={painDrawingData} />
          </section>
        )}

      {/* ── GCPS-1M ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.GCPS_1M) && hasAnswers(gcps1mResponse) && (
        <section className="mb-6 print:break-inside-avoid">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            GCPS-1M — Graduierung chronischer Schmerzen
          </h2>
          <GCPSAnswersTable answers={gcps1mResponse!.answers as GCPS1MAnswers} />
        </section>
      )}

      {/* ── PHQ-4 ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PHQ4) && hasAnswers(phq4Response) && (
        <section className="mb-6 print:break-inside-avoid">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            PHQ-4 — Depression &amp; Angst
          </h2>
          <PHQ4AnswersTable answers={phq4Response!.answers as Record<string, string>} />
        </section>
      )}

      {/* ── JFLS-8 ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS8) && hasAnswers(jfls8Response) && (
        <section className="mb-6 print:break-inside-avoid">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            JFLS-8 — Kieferfunktions-Einschränkungsskala
          </h2>
          <JFLS8AnswersTable answers={jfls8Response!.answers as JFLS8Answers} />
        </section>
      )}

      {/* ── OBC ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.OBC) && hasAnswers(obcResponse) && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            OBC — Oral Behaviors Checklist
          </h2>
          <OBCAnswersTable answers={obcResponse!.answers as OBCAnswers} />
        </section>
      )}

      {/* ── JFLS-20 ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS20) && hasAnswers(jfls20Response) && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            JFLS-20 — Kieferfunktions-Einschränkungsskala (erweitert)
          </h2>
          <JFLS20AnswersTable answers={jfls20Response!.answers as JFLS20Answers} />
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-gray-300 pt-2 mt-6 text-xs text-gray-400">
        Dieser Ausdruck dient der klinischen Dokumentation. Alle Angaben basieren auf den
        Selbstauskünften des Patienten.
      </footer>
    </div>
  );
}
