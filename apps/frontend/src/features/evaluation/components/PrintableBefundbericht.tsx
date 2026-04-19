/**
 * PrintableBefundbericht — Printable DC/TMD clinical findings report.
 *
 * Renders a structured Befundbericht with:
 * 1. Patient data header
 * 2. Anamnesis (auto-generated from SQ questionnaire)
 * 3. Clinical findings (measurements, findings grouped by region, exam signs)
 * 4. Diagnoses (practitioner-confirmed, grouped by location)
 *
 * Follows the same print styling patterns as PrintableExamination.
 */

import {
  ALL_DIAGNOSES,
  PALPATION_SITES,
  REGIONS,
  generateAnamnesisText,
  getDiagnosisClinicalContext,
  type DiagnosisId,
  type PalpationSite,
  type Region,
  type SectionId,
  type Side,
} from "@cmdetect/dc-tmd";
import type { FormValues } from "../../examination";
import { generateExaminationNarrative } from "../utils/befundbericht-examination";

// ============================================================================
// TYPES
// ============================================================================

interface ConfirmedDiagnosis {
  diagnosisId: DiagnosisId;
  side: Side;
  region: Region;
  site: PalpationSite | null;
}

interface QuestionnaireScore {
  instrument: string;
  score: string;
  /** Optional practitioner clinical note (rendered as a muted sub-line). */
  note?: string;
}

interface PrintableBefundberichtProps {
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
  examinationDate?: string;
  examinerName?: string;
  criteriaData: unknown;
  confirmedDiagnoses: ConfirmedDiagnosis[];
  questionnaireScores?: QuestionnaireScore[];
  examinationData?: FormValues;
  completedSections?: SectionId[];
}

interface DiagnosisWithLabel extends ConfirmedDiagnosis {
  label: string;
  siteLabel: string | null;
}

function sideLabel(side: Side): string {
  return side === "left" ? "links" : "rechts";
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PrintableBefundbericht({
  patientName,
  patientDob,
  clinicInternalId,
  examinationDate,
  examinerName,
  criteriaData,
  confirmedDiagnoses,
  questionnaireScores,
  examinationData,
  completedSections,
}: PrintableBefundberichtProps) {
  const exportDate = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Generate anamnesis text
  const anamnesisParagraphs = generateAnamnesisText(criteriaData);

  const narrativeParagraphs = examinationData
    ? generateExaminationNarrative(examinationData, completedSections ?? [])
    : [];

  // Resolve diagnosis German labels (flat, no grouping)
  const diagnosesWithLabels: DiagnosisWithLabel[] = confirmedDiagnoses.map((d) => {
    const def = ALL_DIAGNOSES.find((diag) => diag.id === d.diagnosisId);
    return {
      ...d,
      label: def?.nameDE ?? d.diagnosisId,
      siteLabel: d.site ? PALPATION_SITES[d.site] : null,
    };
  });

  return (
    <div className="max-w-[210mm] mx-auto px-8 py-6 bg-white text-black print:p-0 print:max-w-none">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="border-b-2 border-black pb-3 mb-5">
        <h1 className="text-lg font-bold mb-2">DC/TMD-Befundbericht</h1>
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
            {examinerName && (
              <div>
                <span className="text-gray-500">Untersucher: </span>
                <span className="font-medium">{examinerName}</span>
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
            {examinationDate && (
              <div>
                <span className="text-gray-500">Untersuchungsdatum: </span>
                <span className="font-medium">{examinationDate}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Berichtsdatum: </span>
              <span className="font-medium">{exportDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Diagnosen (first, flat list) ───────────────── */}
      {diagnosesWithLabels.length > 0 && (
        <section className="mb-5 print:break-inside-avoid">
          <h2 className="text-base font-bold mb-2 border-b border-gray-300 pb-1">
            Aktuelle Diagnosen (DC/TMD)
          </h2>
          <div className="text-sm space-y-0.5">
            {diagnosesWithLabels.map((d, i) => (
              <p key={i}>
                {d.label}{" "}
                <span className="text-gray-500 font-mono text-xs">
                  [{getDiagnosisClinicalContext(d.diagnosisId).icd10}]
                </span>{" "}
                <span className="text-gray-500">
                  ({d.siteLabel ? `${d.siteLabel}, ` : ""}
                  {d.region === "tmj" ? "Kiefergelenk" : REGIONS[d.region]}, {sideLabel(d.side)})
                </span>
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── Anamnese (Achse I) ───────────────────────────── */}
      {anamnesisParagraphs.length > 0 && (
        <section className="mb-5 print:break-inside-avoid">
          <h2 className="text-base font-bold mb-2 border-b border-gray-300 pb-1">
            Anamnese (DC/TMD Achse I)
          </h2>
          <div className="space-y-1.5 text-sm leading-relaxed">
            {anamnesisParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* ── Fragebogeninstrumente (Achse II) ──────────────── */}
      {questionnaireScores && questionnaireScores.length > 0 && (
        <section className="mb-5 print:break-inside-avoid">
          <h2 className="text-base font-bold mb-2 border-b border-gray-300 pb-1">
            Fragebogeninstrumente (DC/TMD Achse II)
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 text-sm">
            {questionnaireScores.map((qs, i) => (
              <ScoreRow
                key={i}
                instrument={qs.instrument}
                score={qs.score}
                note={qs.note}
              />
            ))}
          </dl>
        </section>
      )}

      {/* ── DC/TMD-Untersuchung ──── */}
      <section className="mb-5">
        <h2 className="text-base font-bold mb-2 border-b border-gray-300 pb-1">
          DC/TMD-Untersuchung{" "}
          <span className="text-xs font-normal text-gray-500">
            (Vorschau U1a/U1b/U4/U5/U6/U7/U9)
          </span>
        </h2>

        {narrativeParagraphs.length > 0 ? (
          <div className="space-y-2 text-sm leading-relaxed">
            {narrativeParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Keine Untersuchungsdaten vorhanden.</p>
        )}
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-gray-300 pt-2 mt-6 text-xs text-gray-400">
        Dieser Befundbericht wurde auf Grundlage der standardisierten DC/TMD-Untersuchung erstellt.
      </footer>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ScoreRow({
  instrument,
  score,
  note,
}: {
  instrument: string;
  score: string;
  note?: string;
}) {
  return (
    <>
      <dt className="text-gray-600 align-top">{instrument}</dt>
      <dd>
        <div>{score}</div>
        {note && (
          <div className="text-xs text-gray-500 mt-0.5">
            <span className="text-gray-400">Anmerkung: </span>
            {note}
          </div>
        )}
      </dd>
    </>
  );
}
