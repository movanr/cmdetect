/**
 * PrintableAnamnesis - Clean print layout for anamnesis export
 *
 * Plain tables and text only. No Card, ScaleBar, or other UI components.
 * Designed for window.print() / browser "Save as PDF" output.
 */

import type { PainDrawingData } from "@/features/pain-drawing-evaluation";
import type {
  GCPS1MAnswers,
  JFLS20Answers,
  JFLS8Answers,
  OBCAnswers,
  SQAnswers,
} from "@cmdetect/questionnaires";
import {
  isQuestionnaireEnabled,
  QUESTIONNAIRE_ID,
} from "@cmdetect/questionnaires";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import {
  ScoresOverviewTable,
  SQAnswersTable,
  GCPSAnswersTable,
  PHQ4AnswersTable,
  JFLS8AnswersTable,
  JFLS20AnswersTable,
  OBCAnswersTable,
  PainDrawingDetail,
} from "./questionnaire-tables";

// ─── Types ─────────────────────────────────────────────────────────────

interface PrintableAnamnesisProps {
  responses: QuestionnaireResponse[];
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
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
          <GCPSAnswersTable answers={gcps1mResponse?.answers as GCPS1MAnswers} />
        </section>
      )}

      {/* ── PHQ-4 ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PHQ4) && hasAnswers(phq4Response) && (
        <section className="mb-6 print:break-inside-avoid">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            PHQ-4 — Depression &amp; Angst
          </h2>
          <PHQ4AnswersTable answers={phq4Response?.answers as Record<string, string>} />
        </section>
      )}

      {/* ── JFLS-8 ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS8) && hasAnswers(jfls8Response) && (
        <section className="mb-6 print:break-inside-avoid">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            JFLS-8 — Kieferfunktions-Einschränkungsskala
          </h2>
          <JFLS8AnswersTable answers={jfls8Response?.answers as JFLS8Answers} />
        </section>
      )}

      {/* ── OBC ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.OBC) && hasAnswers(obcResponse) && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            OBC — Oral Behaviors Checklist
          </h2>
          <OBCAnswersTable answers={obcResponse?.answers as OBCAnswers} />
        </section>
      )}

      {/* ── JFLS-20 ── */}
      {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS20) && hasAnswers(jfls20Response) && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            JFLS-20 — Kieferfunktions-Einschränkungsskala (erweitert)
          </h2>
          <JFLS20AnswersTable answers={jfls20Response?.answers as JFLS20Answers} />
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
