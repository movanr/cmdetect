/**
 * Shared questionnaire table components
 *
 * Used by both the interactive DashboardView and the PrintableAnamnesis.
 * Each table renders a questionnaire's answers in a clean, plain HTML table.
 */

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
  isQuestionIdEnabled,
  isQuestionnaireEnabled,
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
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";

// ─── Shared styles ─────────────────────────────────────────────────────

export const thClass = "py-1.5 pr-3 font-semibold text-gray-700 text-left";
export const tdClass = "py-1 pr-3 text-sm";
export const tdMuted = "py-1 pr-3 text-sm text-gray-500";
export const headerRowClass = "border-b-2 border-gray-300";
export const bodyRowClass = "border-b border-gray-100";

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

// Severity levels for color-coding the interpretation column
type Severity = "ok" | "mild" | "moderate" | "severe";

const severityClasses: Record<Severity, string> = {
  ok: "text-green-700 bg-green-50",
  mild: "text-yellow-700 bg-yellow-50",
  moderate: "text-orange-700 bg-orange-50",
  severe: "text-red-700 bg-red-50",
};

export function ScoresOverviewTable({
  responses,
  showSeverityColors = false,
}: {
  responses: QuestionnaireResponse[];
  showSeverityColors?: boolean;
}) {
  const phq4 = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.PHQ4);
  const gcps = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.GCPS_1M);
  const jfls8 = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS8);
  const jfls20 = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS20);
  const obc = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.OBC);
  const painDrawing = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.PAIN_DRAWING);

  const rows: Array<{
    instrument: string;
    score: string;
    interpretation: string;
    severity: Severity;
  }> = [];

  if (painDrawing) {
    const data = painDrawing.answers as unknown as PainDrawingData | undefined;
    if (data?.drawings && Object.keys(data.drawings).length > 0) {
      const pd = calculatePainDrawingScore(data);
      const widespread = pd.patterns.hasWidespreadPain;
      rows.push({
        instrument: "Schmerzzeichnung",
        score:
          pd.regionCount === 0
            ? "Keine Schmerzgebiete"
            : `mindestens ${pd.regionCount} Schmerzgebiet${pd.regionCount !== 1 ? "e" : ""}, ${pd.totalElements} Markierung${pd.totalElements !== 1 ? "en" : ""}`,
        interpretation: widespread
          ? "Schmerz in mehreren Körperbereichen"
          : pd.regionCount === 0
            ? "Keine Schmerzgebiete"
            : `mindestens ${pd.regionCount} Schmerzgebiet${pd.regionCount !== 1 ? "e" : ""}`,
        severity: widespread
          ? "severe"
          : pd.regionCount >= 3
            ? "moderate"
            : pd.regionCount >= 1
              ? "mild"
              : "ok",
      });
    }
  }

  if (gcps && Object.keys(gcps.answers).length > 0) {
    const s = calculateGCPS1MScore(gcps.answers as GCPS1MAnswers);
    const roman = s.grade === 0 ? "0" : ["I", "II", "III", "IV"][s.grade - 1];
    // Grade 0 = ok, I-II = mild, III = moderate, IV = severe
    const gcpsSeverity: Severity =
      s.grade === 0 ? "ok" : s.grade <= 2 ? "mild" : s.grade === 3 ? "moderate" : "severe";
    rows.push({
      instrument: "GCPS-1M",
      score: `Grad ${roman} (CPI ${s.cpi}, ${s.totalDisabilityPoints} BP)`,
      interpretation: s.gradeInterpretation.label,
      severity: gcpsSeverity,
    });
  }

  if (jfls8 && Object.keys(jfls8.answers).length > 0) {
    const s = calculateJFLS8Score(jfls8.answers as JFLS8Answers);
    // normal = ok, mild = mild, significant = severe
    const jflsSeverity: Severity =
      s.limitationLevel === "normal" ? "ok" : s.limitationLevel === "mild" ? "mild" : "severe";
    rows.push({
      instrument: "JFLS-8",
      score:
        s.isValid && s.globalScore !== null
          ? `${s.globalScore.toFixed(2)} / ${s.maxScore}`
          : `Ungültig (${s.missingCount} fehlend)`,
      interpretation: s.limitationInterpretation?.label ?? "",
      severity: s.isValid ? jflsSeverity : "ok",
    });
  }

  if (phq4 && Object.keys(phq4.answers).length > 0) {
    const s = calculatePHQ4Score(phq4.answers as Record<string, string>);
    const interp = getPHQ4Interpretation(s);
    const ax = getSubscaleInterpretation(s.anxiety);
    const dep = getSubscaleInterpretation(s.depression);
    // none = ok, mild = mild, moderate = moderate, severe = severe
    const phqSeverity: Severity =
      interp.severity === "none"
        ? "ok"
        : interp.severity === "mild"
          ? "mild"
          : interp.severity === "moderate"
            ? "moderate"
            : "severe";
    rows.push({
      instrument: "PHQ-4",
      score: `${s.total} / ${s.maxTotal} (Angst ${s.anxiety}/${s.maxAnxiety}, Depr. ${s.depression}/${s.maxDepression})`,
      interpretation: `${interp.label}${ax.positive ? " · Angst +" : ""}${dep.positive ? " · Depression +" : ""}`,
      severity: phqSeverity,
    });
  }

  if (obc && Object.keys(obc.answers).length > 0) {
    const s = calculateOBCScore(obc.answers as OBCAnswers);
    // normal = ok, elevated = moderate, high = severe
    const obcSeverity: Severity =
      s.riskLevel === "normal" ? "ok" : s.riskLevel === "elevated" ? "moderate" : "severe";
    rows.push({
      instrument: "OBC",
      score: `${s.totalScore} / ${s.maxScore}`,
      interpretation: s.riskInterpretation.label,
      severity: obcSeverity,
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
    const jfls20Severity: Severity =
      s.limitationLevel === "normal" ? "ok" : s.limitationLevel === "mild" ? "mild" : "severe";
    rows.push({
      instrument: "JFLS-20",
      score:
        s.isValid && s.globalScore !== null
          ? `${s.globalScore.toFixed(2)} / ${s.maxScore}${subscaleStr}`
          : `Ungültig (${s.missingCount} fehlend)`,
      interpretation: s.limitationInterpretation?.label ?? "",
      severity: s.isValid ? jfls20Severity : "ok",
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
            <td className={tdClass}>
              {r.interpretation &&
                (showSeverityColors ? (
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${severityClasses[r.severity]}`}
                  >
                    {r.interpretation}
                  </span>
                ) : (
                  <span className="text-gray-600">{r.interpretation}</span>
                ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── SQ Answers ─────────────────────────────────────────────────────────

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

export function SQAnswersTable({ answers }: { answers: Record<string, unknown> }) {
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

export function GCPSAnswersTable({
  answers,
  showPips = false,
}: {
  answers: GCPS1MAnswers;
  showPips?: boolean;
}) {
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
          const isScale = question.type === "scale_0_10";
          const suffix = isScale ? " / 10" : question.type === "numeric" ? ` ${question.unit}` : "";
          return (
            <tr key={qId} className={bodyRowClass}>
              <td className={tdMuted}>{idx + 1}</td>
              <td className={tdClass}>{question.text}</td>
              <td className={`${tdClass} text-right font-medium`}>
                {showPips && isScale && answer != null && (
                  <ScalePips value={Number(answer)} max={10} />
                )}
                {answer ?? "—"}
                <span className="text-gray-400 font-normal">{suffix}</span>
              </td>
            </tr>
          );
        })}
        {/* Score summary row */}
        <tr className="border-t-2 border-gray-300">
          <td colSpan={2} className={`${tdClass} font-semibold`}>
            Grad {roman} — {s.gradeInterpretation.label}
          </td>
          <td className={`${tdClass} text-right font-semibold whitespace-nowrap`}>
            CPI {s.cpi}, {s.totalDisabilityPoints} BP
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── PHQ-4 Answers ─────────────────────────────────────────────────────

export function PHQ4AnswersTable({
  answers,
  showPips = false,
}: {
  answers: Record<string, string>;
  showPips?: boolean;
}) {
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
              <td className={`${tdClass} text-right font-medium`}>
                {showPips && selected != null && <ScalePips value={Number(selected)} max={3} />}
                {selected ?? "—"}
              </td>
              <td className={tdMuted}>{option?.label ?? ""}</td>
            </tr>
          );
        })}
        <tr className="border-t-2 border-gray-300">
          <td colSpan={2} className={`${tdClass} font-semibold`}>{interp.label}</td>
          <td className={`${tdClass} text-right font-semibold whitespace-nowrap`}>
            {s.total} / {s.maxTotal}
          </td>
          <td className={`${tdMuted} whitespace-nowrap`}>
            Angst {s.anxiety}/{s.maxAnxiety}, Depr. {s.depression}/{s.maxDepression}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── JFLS-8 Answers ────────────────────────────────────────────────────

export function JFLS8AnswersTable({
  answers,
  showPips = false,
}: {
  answers: JFLS8Answers;
  showPips?: boolean;
}) {
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
                {showPips && selected != null && <ScalePips value={Number(selected)} max={10} />}
                {selected ?? "—"}
                <span className="text-gray-400 font-normal"> / 10</span>
              </td>
            </tr>
          );
        })}
        {s.isValid && s.globalScore !== null && (
          <tr className="border-t-2 border-gray-300">
            <td colSpan={2} className={`${tdClass} font-semibold`}>
              {s.limitationInterpretation?.label ?? ""}
            </td>
            <td className={`${tdClass} text-right font-semibold whitespace-nowrap`}>
              &#x2300; {s.globalScore.toFixed(2)}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// ─── JFLS-20 Answers ───────────────────────────────────────────────────

export function JFLS20AnswersTable({
  answers,
  showPips = false,
}: {
  answers: JFLS20Answers;
  showPips?: boolean;
}) {
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
                {showPips && selected != null && <ScalePips value={Number(selected)} max={10} />}
                {selected ?? "—"}
                <span className="text-gray-400 font-normal"> / 10</span>
              </td>
            </tr>
          );
        })}
        {s.isValid && s.globalScore !== null && (
          <>
            <tr className="border-t-2 border-gray-300">
              <td colSpan={2} className={`${tdClass} font-semibold`}>
                {s.limitationInterpretation?.label ?? ""}
              </td>
              <td className={`${tdClass} text-right font-semibold whitespace-nowrap`}>
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
                  <td colSpan={2} className={tdMuted}>
                    {JFLS20_SUBSCALE_LABELS[key].label}
                    {elevated && (
                      <span className="text-gray-700 ml-1">
                        (≥ {ref.chronicTMD.mean.toFixed(1)} Ref. TMD)
                      </span>
                    )}
                  </td>
                  <td className={`${tdClass} text-right ${elevated ? "font-semibold" : ""}`}>
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

export function OBCAnswersTable({
  answers,
  showPips = false,
}: {
  answers: OBCAnswers;
  showPips?: boolean;
}) {
  const s = calculateOBCScore(answers);
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
        const isHigh = selected !== undefined && numericVal >= 3;
        const isSleep = OBC_QUESTIONS[qId].section === "sleep";
        const maxVal = isSleep ? 4 : 4;
        return (
          <tr key={qId} className={`${bodyRowClass} ${isHigh ? "bg-gray-50" : ""}`}>
            <td className={tdMuted}>{num}</td>
            <td className={tdClass}>{OBC_QUESTIONS[qId].text}</td>
            <td className={`${tdClass} text-right ${isHigh ? "font-semibold" : "font-medium"}`}>
              {showPips && selected != null && <ScalePips value={numericVal} max={maxVal} />}
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
          <td colSpan={2} className={`${tdClass} font-semibold`}>{s.riskInterpretation.label}</td>
          <td className={`${tdClass} text-right font-semibold whitespace-nowrap`}>
            {s.totalScore} / {s.maxScore}
          </td>
          <td />
        </tr>
      </tbody>
    </table>
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
  const score = calculatePainDrawingScore(data);
  return (
    <div>
      <p className="text-sm mb-2">
        <span className="text-gray-500">Schmerzgebiete: </span>
        <span className="font-medium">
          {score.regionCount === 0 ? "keine" : `mindestens ${score.regionCount}`}
        </span>
        <span className="text-gray-500 ml-3">Markierungen: </span>
        <span className="font-medium">{score.totalElements}</span>
        {score.patterns.hasWidespreadPain && (
          <span className="ml-3 text-gray-600">— Schmerz in mehreren Körperbereichen</span>
        )}
      </p>
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

export { isQuestionnaireEnabled, QUESTIONNAIRE_ID };
export type { QuestionnaireResponse };
