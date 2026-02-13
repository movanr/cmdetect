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

import type { DiagnosisId } from "@cmdetect/dc-tmd";
import {
  ALL_DIAGNOSES,
  REGIONS,
  SIDE_KEYS,
  extractClinicalFindings,
  generateAnamnesisText,
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
}

interface PrintableBefundberichtProps {
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
  examinationDate?: string;
  examinerName?: string;
  criteriaData: unknown;
  confirmedDiagnoses: ConfirmedDiagnosis[];
}

// ============================================================================
// HELPERS
// ============================================================================

function sideLabel(side: Side): string {
  return side === "left" ? "links" : "rechts";
}

/** Human-readable region group heading */
function regionGroupHeading(region: Region, side: Side): string {
  if (region === "tmj") return `Kiefergelenk ${sideLabel(side)}`;
  return `${REGIONS[region]} ${sideLabel(side)}`;
}

// ============================================================================
// DATA ACCESS HELPER (for E6/E7 movement detail)
// ============================================================================

function get(data: unknown, path: string): unknown {
  const parts = path.split(".");
  let current = data;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ============================================================================
// COLLAPSING LOGIC
// ============================================================================

interface CollapsedFinding {
  label: string;
  side: Side;
  region?: Region;
}

const PAIN_DOMAINS: SymptomDomain[] = [
  "painLocation",
  "familiarPainPalpation",
  "familiarPainOpening",
  "familiarPainMovement",
];

const HEADACHE_DOMAINS: SymptomDomain[] = [
  "headacheLocation",
  "familiarHeadachePalpation",
  "familiarHeadacheOpening",
  "familiarHeadacheMovement",
];

function collapseByLocation(
  symptoms: SymptomFinding[],
  domains: SymptomDomain[],
  prefix: string
): CollapsedFinding[] {
  const domainSet = new Set(domains);
  const matched = symptoms.filter((s) => domainSet.has(s.domain));

  const groups = new Map<string, CollapsedFinding>();
  for (const s of matched) {
    const key = `${s.region ?? "none"}-${s.side}`;
    if (!groups.has(key)) {
      groups.set(key, {
        label: prefix,
        side: s.side,
        region: s.region,
      });
    }
  }

  return [...groups.values()];
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
        movements.push("Öffnung");
      }
      if (get(criteriaData, `e6.${s.side}.click.examinerClose`) === "yes") {
        movements.push("Schließung");
      }
      if (get(criteriaData, `e7.${s.side}.click.examiner`) === "yes") {
        movements.push("Lateralbewegung/Protrusion");
      }
      results.push({
        type: "click",
        label: "Knacken",
        detail: movements.length > 0 ? `bei ${movements.join(", ")}` : undefined,
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
        label: "Reiben",
        detail: movements.length > 0 ? `bei ${movements.join(", ")}` : undefined,
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
    "painFree.measurement": "Schmerzfreie Mundöffnung",
    "maxUnassisted.measurement": "Maximale aktive Mundöffnung",
    "maxAssisted.measurement": "Maximale passive Mundöffnung",
  };
  for (const sign of signs.filter((s) => s.section === "e4")) {
    const label = openingLabels[sign.field];
    if (label && typeof sign.value === "number") {
      measurements.push({ label, value: `${sign.value} mm` });
    }
  }

  const movementLabels: Record<string, string> = {
    "lateralLeft.measurement": "Laterotrusion nach links",
    "lateralRight.measurement": "Laterotrusion nach rechts",
    "protrusive.measurement": "Protrusion",
  };
  for (const sign of signs.filter((s) => s.section === "e5")) {
    const label = movementLabels[sign.field];
    if (label && typeof sign.value === "number") {
      measurements.push({ label, value: `${sign.value} mm` });
    }
  }

  const openingPatternLabels: Record<string, string> = {
    straight: "Gerade",
    correctedDeviation: "Korrigierte Deviation",
    uncorrectedRight: "Unkorrigierte Deviation nach rechts",
    uncorrectedLeft: "Unkorrigierte Deviation nach links",
  };
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
// REGION-GROUPED FINDINGS
// ============================================================================

/** All findings for a single (region, side) location */
interface LocationGroup {
  region: Region;
  side: Side;
  painFindings: string[];
  headacheFindings: string[];
  examSigns: string[];
}

/** Group pain/headache/exam findings by (region, side) */
function groupFindingsByLocation(
  painFindings: CollapsedFinding[],
  headacheFindings: CollapsedFinding[],
  examSigns: SignFinding[]
): LocationGroup[] {
  const groupMap = new Map<string, LocationGroup>();

  function ensureGroup(region: Region, side: Side): LocationGroup {
    const key = `${region}-${side}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        region,
        side,
        painFindings: [],
        headacheFindings: [],
        examSigns: [],
      });
    }
    return groupMap.get(key)!;
  }

  for (const f of painFindings) {
    if (f.region) {
      ensureGroup(f.region, f.side).painFindings.push(f.label);
    }
  }

  for (const f of headacheFindings) {
    if (f.region) {
      ensureGroup(f.region, f.side).headacheFindings.push(f.label);
    }
  }

  // E9 + E6 exam-only signs grouped by region
  for (const sign of examSigns.filter((s) => s.section === "e9" || s.section === "e6")) {
    if (sign.side && sign.region) {
      ensureGroup(sign.region, sign.side).examSigns.push(sign.label);
    }
  }

  // Sort: tmj first, then temporalis, then masseter — right before left
  const regionOrder: Region[] = ["tmj", "temporalis", "masseter", "otherMast", "nonMast"];
  const sideOrder: Side[] = ["right", "left"];

  return [...groupMap.values()].sort((a, b) => {
    const rA = regionOrder.indexOf(a.region);
    const rB = regionOrder.indexOf(b.region);
    if (rA !== rB) return rA - rB;
    return sideOrder.indexOf(a.side) - sideOrder.indexOf(b.side);
  });
}

// ============================================================================
// GROUPED DIAGNOSES
// ============================================================================

interface DiagnosisWithLabel extends ConfirmedDiagnosis {
  label: string;
}

interface DiagnosisLocationGroup {
  heading: string;
  diagnoses: DiagnosisWithLabel[];
}

function groupDiagnosesByLocation(diagnoses: DiagnosisWithLabel[]): DiagnosisLocationGroup[] {
  const groupMap = new Map<string, DiagnosisLocationGroup>();

  for (const d of diagnoses) {
    const key = `${d.region}-${d.side}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        heading: regionGroupHeading(d.region, d.side),
        diagnoses: [],
      });
    }
    groupMap.get(key)!.diagnoses.push(d);
  }

  // Sort: tmj first, then temporalis, then masseter — right before left
  const regionOrder: Region[] = ["tmj", "temporalis", "masseter", "otherMast", "nonMast"];
  const sideOrder: Side[] = ["right", "left"];

  return [...groupMap.values()].sort((a, b) => {
    const dA = a.diagnoses[0];
    const dB = b.diagnoses[0];
    const rA = regionOrder.indexOf(dA.region);
    const rB = regionOrder.indexOf(dB.region);
    if (rA !== rB) return rA - rB;
    return sideOrder.indexOf(dA.side) - sideOrder.indexOf(dB.side);
  });
}

// ============================================================================
// JOINT SOUNDS GROUPED BY SIDE
// ============================================================================

interface JointSoundSideGroup {
  heading: string;
  findings: JointSoundFinding[];
}

function groupJointSoundsBySide(sounds: JointSoundFinding[]): JointSoundSideGroup[] {
  const groups: JointSoundSideGroup[] = [];

  for (const side of SIDE_KEYS) {
    const sideSounds = sounds.filter((s) => s.side === side);
    if (sideSounds.length > 0) {
      groups.push({
        heading: `Kiefergelenk ${sideLabel(side)}`,
        findings: sideSounds,
      });
    }
  }

  return groups;
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
  const painFindings = collapseByLocation(findings.symptoms, PAIN_DOMAINS, "Schmerz");
  const headacheFindings = collapseByLocation(findings.symptoms, HEADACHE_DOMAINS, "Kopfschmerz");
  const jointSounds = extractJointSoundDetails(findings.symptoms, criteriaData);
  const jointSoundGroups = groupJointSoundsBySide(jointSounds);
  const measurements = formatMeasurements(findings.signs);
  const locationGroups = groupFindingsByLocation(painFindings, headacheFindings, findings.signs);

  // Resolve diagnosis German labels and group
  const diagnosesWithLabels: DiagnosisWithLabel[] = confirmedDiagnoses.map((d) => {
    const def = ALL_DIAGNOSES.find((diag) => diag.id === d.diagnosisId);
    return { ...d, label: def?.nameDE ?? d.diagnosisId };
  });
  const diagnosisGroups = groupDiagnosesByLocation(diagnosesWithLabels);

  const hasLocationFindings = locationGroups.length > 0;

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

      {/* ── Anamnese ──────────────────────────────────────── */}
      {anamnesisParagraphs.length > 0 && (
        <section className="mb-5 print:break-inside-avoid">
          <h2 className="text-base font-bold mb-2 border-b border-gray-300 pb-1">Anamnese</h2>
          <div className="space-y-1.5 text-sm leading-relaxed">
            {anamnesisParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* ── Klinischer Befund ─────────────────────────────── */}
      <section className="mb-5">
        <h2 className="text-base font-bold mb-2 border-b border-gray-300 pb-1">
          Klinischer Befund
        </h2>

        {/* Mundöffnung und Kieferbewegungen */}
        {measurements.length > 0 && (
          <div className="mb-3 print:break-inside-avoid">
            <h3 className="text-sm font-semibold mb-1">Mundöffnung und Kieferbewegungen</h3>
            <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 text-sm">
              {measurements.map((m, i) => (
                <MeasurementRow key={i} label={m.label} value={m.value} />
              ))}
            </dl>
          </div>
        )}

        {/* Gelenkgeräusche — grouped by side with movement detail */}
        {jointSoundGroups.length > 0 && (
          <div className="mb-3 print:break-inside-avoid">
            <h3 className="text-sm font-semibold mb-1">Gelenkgeräusche und Gelenkbefunde</h3>
            <div className="space-y-1.5">
              {jointSoundGroups.map((group, gi) => (
                <div key={gi}>
                  <h4 className="text-xs font-medium text-gray-500">{group.heading}</h4>
                  <ul className="text-sm space-y-0.5">
                    {group.findings.map((f, fi) => (
                      <li key={fi} className="ml-4 list-disc">
                        {f.label}
                        {f.detail && <span className="text-gray-500"> ({f.detail})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schmerzlokalisation und Palpationsbefunde — grouped by region */}
        {hasLocationFindings && (
          <div className="mb-3 print:break-inside-avoid">
            <h3 className="text-sm font-semibold mb-1">
              Schmerzlokalisation und Palpationsbefunde
            </h3>
            <div className="space-y-1.5">
              {locationGroups.map((group, gi) => (
                <div key={gi}>
                  <h4 className="text-xs font-medium text-gray-500">
                    {regionGroupHeading(group.region, group.side)}
                  </h4>
                  <ul className="text-sm space-y-0.5">
                    {group.painFindings.map((f, fi) => (
                      <li key={`p-${fi}`} className="ml-4 list-disc">
                        {f}
                      </li>
                    ))}
                    {group.headacheFindings.map((f, fi) => (
                      <li key={`h-${fi}`} className="ml-4 list-disc">
                        {f}
                      </li>
                    ))}
                    {group.examSigns.map((s, si) => (
                      <li key={`s-${si}`} className="ml-4 list-disc text-gray-600">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasLocationFindings && measurements.length === 0 && jointSoundGroups.length === 0 && (
          <p className="text-sm text-gray-500 italic">Keine klinischen Befunde vorhanden.</p>
        )}
      </section>

      {/* ── Diagnosen — grouped by location ───────────────── */}
      {diagnosisGroups.length > 0 && (
        <section className="mb-5 print:break-inside-avoid">
          <h2 className="text-base font-bold mb-2 border-b border-gray-300 pb-1">Diagnosen</h2>
          <div className="space-y-2">
            {diagnosisGroups.map((group, gi) => (
              <div key={gi}>
                <h3 className="text-xs font-medium text-gray-500">{group.heading}</h3>
                <ul className="text-sm space-y-0.5">
                  {group.diagnoses.map((d, di) => (
                    <li key={di} className="ml-4 list-disc">
                      <span className="font-medium">{d.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

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
