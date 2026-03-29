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
  E3_OPENING_PATTERNS,
  JOINT_SOUND_LABELS,
  MOVEMENT_TYPE_LABELS,
  OPENING_TYPE_LABELS,
  PALPATION_SITES,
  REGIONS,
  extractClinicalFindings,
  generateAnamnesisText,
  getDiagnosisClinicalContext,
  getValueAtPath as get,
  type DiagnosisId,
  type PalpationSite,
  type Region,
  type Side,
  type SignFinding,
  type SymptomDomain,
  type SymptomFinding,
} from "@cmdetect/dc-tmd";

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
}

// ============================================================================
// HELPERS
// ============================================================================

function sideLabel(side: Side): string {
  return side === "left" ? "links" : "rechts";
}

function locationSuffix(region: Region | undefined, side: Side): string {
  if (!region) return `(${sideLabel(side)})`;
  const regionName = region === "tmj" ? "Kiefergelenk" : REGIONS[region];
  return `(${regionName}, ${sideLabel(side)})`;
}

// ============================================================================
// JOINT SOUND DETAIL (with movement context from E6/E7)
// ============================================================================

interface JointSoundFinding {
  type: "click" | "crepitus" | "locking" | "subluxation";
  label: string;
  detail?: string;
  side: Side;
}

function extractJointSoundDetails(
  symptoms: SymptomFinding[],
  criteriaData: unknown
): JointSoundFinding[] {
  const results: JointSoundFinding[] = [];

  for (const s of symptoms) {
    if (s.domain === "tmjClick") {
      // Determine which movements had click
      const movements: string[] = [];
      if (get(criteriaData, `e6.${s.side}.click.examinerOpen`) === "yes") {
        movements.push("Öffnen");
      }
      if (get(criteriaData, `e6.${s.side}.click.examinerClose`) === "yes") {
        movements.push("Schließen");
      }
      if (get(criteriaData, `e7.${s.side}.click.examiner`) === "yes") {
        movements.push("Lateralbewegung/Protrusion");
      }
      results.push({
        type: "click",
        label: JOINT_SOUND_LABELS.click,
        detail: movements.length > 0 ? `beim ${movements.join(", ")}` : undefined,
        side: s.side,
      });
    } else if (s.domain === "tmjCrepitus") {
      const movements: string[] = [];
      if (get(criteriaData, `e6.${s.side}.crepitus.examinerOpen`) === "yes") {
        movements.push("Öffnung");
      }
      if (get(criteriaData, `e6.${s.side}.crepitus.examinerClose`) === "yes") {
        movements.push("Schließung");
      }
      if (get(criteriaData, `e7.${s.side}.crepitus.examiner`) === "yes") {
        movements.push("Lateralbewegung/Protrusion");
      }
      results.push({
        type: "crepitus",
        label: JOINT_SOUND_LABELS.crepitus,
        detail: movements.length > 0 ? `beim ${movements.join(", ")}` : undefined,
        side: s.side,
      });
    } else if (s.domain === "closedLocking") {
      results.push({ type: "locking", label: "Kieferklemme", side: s.side });
    } else if (s.domain === "limitedOpening") {
      results.push({ type: "locking", label: s.label, side: s.side });
    } else if (s.domain === "intermittentLocking") {
      results.push({
        type: "locking",
        label: "Intermittierende Kieferklemme mit Knackmuster",
        side: s.side,
      });
    } else if (s.domain === "subluxation") {
      results.push({ type: "subluxation", label: "Subluxation", side: s.side });
    }
  }

  return results;
}

// ============================================================================
// MEASUREMENT FORMATTING
// ============================================================================

interface FormattedMeasurement {
  label: string;
  value: string;
}

function formatMeasurements(signs: SignFinding[]): FormattedMeasurement[] {
  const measurements: FormattedMeasurement[] = [];

  const openingLabels: Record<string, string> = {
    "painFree.measurement": OPENING_TYPE_LABELS.painFree,
    "maxUnassisted.measurement": OPENING_TYPE_LABELS.maxUnassisted,
    "maxAssisted.measurement": OPENING_TYPE_LABELS.maxAssisted,
  };
  for (const sign of signs.filter((s) => s.section === "e4")) {
    const label = openingLabels[sign.field];
    if (label && typeof sign.value === "number") {
      measurements.push({ label, value: `${sign.value} mm` });
    }
  }

  const movementLabels: Record<string, string> = {
    "lateralLeft.measurement": MOVEMENT_TYPE_LABELS.lateralLeft,
    "lateralRight.measurement": MOVEMENT_TYPE_LABELS.lateralRight,
    "protrusive.measurement": MOVEMENT_TYPE_LABELS.protrusive,
  };
  for (const sign of signs.filter((s) => s.section === "e5")) {
    const label = movementLabels[sign.field];
    if (label && typeof sign.value === "number") {
      measurements.push({ label, value: `${sign.value} mm` });
    }
  }

  const openingPatternLabels: Record<string, string> = { ...E3_OPENING_PATTERNS };
  for (const sign of signs.filter((s) => s.section === "e3")) {
    if (sign.field === "openingPattern" && typeof sign.value === "string") {
      measurements.push({
        label: "Öffnungsmuster",
        value: openingPatternLabels[sign.value] ?? sign.value,
      });
    }
  }

  return measurements;
}

// ============================================================================
// TYPES
// ============================================================================

interface DiagnosisWithLabel extends ConfirmedDiagnosis {
  label: string;
  siteLabel: string | null;
}

// ============================================================================
// FLAT FINDING FORMATTERS
// ============================================================================

const PAIN_EXAM_DOMAINS: SymptomDomain[] = [
  "familiarPainPalpation",
  "familiarPainOpening",
  "familiarPainMovement",
];

const HEADACHE_EXAM_DOMAINS: SymptomDomain[] = [
  "familiarHeadachePalpation",
  "familiarHeadacheOpening",
  "familiarHeadacheMovement",
];

function formatSymptomLines(symptoms: SymptomFinding[]): string[] {
  const painDomains = new Set<SymptomDomain>(PAIN_EXAM_DOMAINS);
  const headacheDomains = new Set<SymptomDomain>(HEADACHE_EXAM_DOMAINS);

  const seen = new Set<string>();
  const lines: string[] = [];

  for (const s of symptoms) {
    let prefix: string | null = null;
    if (painDomains.has(s.domain)) prefix = "Bekannter Schmerz";
    else if (headacheDomains.has(s.domain)) prefix = "Bekannter Kopfschmerz";
    if (!prefix) continue;

    const key = `${prefix}-${s.region ?? "none"}-${s.side}`;
    if (seen.has(key)) continue;
    seen.add(key);

    lines.push(`${prefix} ${locationSuffix(s.region, s.side)}`);
  }
  return lines;
}

function formatJointSoundLines(sounds: JointSoundFinding[]): string[] {
  return sounds.map((f) => {
    const detail = f.detail ? ` ${f.detail}` : "";
    return `${f.label} (${sideLabel(f.side)})${detail}`;
  });
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
}: PrintableBefundberichtProps) {
  const exportDate = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Generate anamnesis text
  const anamnesisParagraphs = generateAnamnesisText(criteriaData);

  // Extract clinical findings
  const findings = extractClinicalFindings(criteriaData);
  const jointSounds = extractJointSoundDetails(findings.symptoms, criteriaData);
  const measurements = formatMeasurements(findings.signs);

  // Flat finding lines with location suffix (same as DOCX)
  const symptomLines = formatSymptomLines(findings.symptoms);
  const jointSoundLines = formatJointSoundLines(jointSounds);

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
              <ScoreRow key={i} instrument={qs.instrument} score={qs.score} />
            ))}
          </dl>
        </section>
      )}

      {/* ── DC/TMD-Untersuchung (flat) ────────────────── */}
      <section className="mb-5">
        <h2 className="text-base font-bold mb-2 border-b border-gray-300 pb-1">
          DC/TMD-Untersuchung
        </h2>

        {/* Measurements */}
        {measurements.length > 0 && (
          <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 text-sm mb-3">
            {measurements.map((m, i) => (
              <MeasurementRow key={i} label={m.label} value={m.value} />
            ))}
          </dl>
        )}

        {/* Findings as flat text lines with location suffix */}
        {(symptomLines.length > 0 || jointSoundLines.length > 0) && (
          <div className="text-sm space-y-0.5">
            {symptomLines.map((line, i) => (
              <p key={`s-${i}`}>{line}</p>
            ))}
            {jointSoundLines.map((line, i) => (
              <p key={`j-${i}`}>{line}</p>
            ))}
          </div>
        )}

        {measurements.length === 0 && symptomLines.length === 0 && jointSoundLines.length === 0 && (
          <p className="text-sm text-gray-500 italic">Keine klinischen Befunde vorhanden.</p>
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

function MeasurementRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-gray-600">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </>
  );
}

function ScoreRow({ instrument, score }: { instrument: string; score: string }) {
  return (
    <>
      <dt className="text-gray-600">{instrument}</dt>
      <dd>{score}</dd>
    </>
  );
}
