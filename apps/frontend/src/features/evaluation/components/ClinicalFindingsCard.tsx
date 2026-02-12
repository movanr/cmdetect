/**
 * ClinicalFindingsCard — Displays categorized clinical findings
 * in report-oriented language (Befunde, Messungen, Anamnese).
 *
 * Collapses examination-methodology artifacts (e.g., "familiar pain
 * at palpation" + "familiar pain during opening") into single clinical
 * conclusions (e.g., "Schmerz: Temporalis, links").
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  REGIONS,
  extractClinicalFindings,
  type HistoryFinding,
  type Region,
  type Side,
  type SignFinding,
  type SymptomDomain,
  type SymptomFinding,
} from "@cmdetect/dc-tmd";
import {
  Activity,
  Clock,
  FileQuestion,
  Ruler,
  Stethoscope,
} from "lucide-react";
import { useMemo } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface ClinicalFindingsCardProps {
  /** Merged SQ + examination criteria data */
  criteriaData: unknown;
}

/** A collapsed clinical finding for the Befunde section */
interface CollapsedFinding {
  label: string;
  side: Side;
  region?: Region;
  /** What examination steps confirmed this (for tooltip/detail) */
  confirmations: string[];
}

// ============================================================================
// COLLAPSING LOGIC
// ============================================================================

/** Side label for display (short form) */
function sideLabel(side: Side): string {
  return side === "left" ? "links" : "rechts";
}

/** Region + side label */
function locationLabel(region: Region | undefined, side: Side): string {
  if (!region) return sideLabel(side);
  return `${REGIONS[region]}, ${sideLabel(side)}`;
}

/** Pain-related symptom domains that should collapse into one finding per (region, side) */
const PAIN_DOMAINS: SymptomDomain[] = [
  "painLocation",
  "familiarPainPalpation",
  "familiarPainOpening",
  "familiarPainMovement",
];

/** Headache-related symptom domains that collapse per (region, side) */
const HEADACHE_DOMAINS: SymptomDomain[] = [
  "headacheLocation",
  "familiarHeadachePalpation",
  "familiarHeadacheOpening",
  "familiarHeadacheMovement",
];

/**
 * Collapse multiple symptom findings into one entry per (region, side).
 * E.g., painLocation + familiarPainPalpation + familiarPainOpening for the same
 * (temporalis, left) become a single "Schmerz: Temporalis, links" finding.
 */
function collapseByLocation(
  symptoms: SymptomFinding[],
  domains: SymptomDomain[],
  prefix: string,
): CollapsedFinding[] {
  const domainSet = new Set(domains);
  const matched = symptoms.filter((s) => domainSet.has(s.domain));

  // Group by (region, side)
  const groups = new Map<string, CollapsedFinding>();
  for (const s of matched) {
    const key = `${s.region ?? "none"}-${s.side}`;
    if (!groups.has(key)) {
      groups.set(key, {
        label: `${prefix}: ${locationLabel(s.region, s.side)}`,
        side: s.side,
        region: s.region,
        confirmations: [],
      });
    }
    const group = groups.get(key);
    if (group) group.confirmations.push(s.examConfirmation);
  }

  return [...groups.values()];
}

/** Extract joint sound findings (no collapsing needed) */
function extractJointFindings(symptoms: SymptomFinding[]): CollapsedFinding[] {
  const JOINT_DOMAINS: Record<SymptomDomain, string> = {
    tmjClick: "Knacken",
    tmjCrepitus: "Reiben",
    closedLocking: "Kieferklemme",
    limitedOpening: "Mundöffnungseinschränkung",
    intermittentLocking: "Intermittierende Kieferklemme",
    subluxation: "Subluxation",
    // Non-joint domains — not used here
    painLocation: "",
    familiarPainPalpation: "",
    familiarPainOpening: "",
    familiarPainMovement: "",
    headacheLocation: "",
    familiarHeadachePalpation: "",
    familiarHeadacheOpening: "",
    familiarHeadacheMovement: "",
  };

  return symptoms
    .filter((s) => JOINT_DOMAINS[s.domain] !== undefined && JOINT_DOMAINS[s.domain] !== "")
    .map((s) => ({
      label: `${JOINT_DOMAINS[s.domain]}: ${locationLabel(s.region, s.side)}`,
      side: s.side,
      region: s.region,
      confirmations: [s.examConfirmation],
    }));
}

// ============================================================================
// MEASUREMENT FORMATTING
// ============================================================================

interface FormattedMeasurement {
  label: string;
  value: string;
}

/** Format sign findings into readable measurement rows */
function formatMeasurements(signs: SignFinding[]): FormattedMeasurement[] {
  const measurements: FormattedMeasurement[] = [];

  // E4: Opening measurements
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

  // E5: Movement measurements
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

  // E2: Incisal measurements
  const e2Signs = signs.filter((s) => s.section === "e2");
  for (const sign of e2Signs) {
    if (sign.field === "verticalOverlap" && typeof sign.value === "number") {
      measurements.push({ label: "Vertikaler Überbiss", value: `${sign.value} mm` });
    }
    if (sign.field === "horizontalOverjet" && typeof sign.value === "number") {
      measurements.push({ label: "Horizontaler Overjet", value: `${sign.value} mm` });
    }
    if (sign.field === "midlineDeviation") {
      measurements.push({ label: "Mittellinienabweichung", value: sign.label });
    }
  }

  // E3: Opening pattern
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
// HISTORY FORMATTING
// ============================================================================

interface FormattedHistory {
  label: string;
  value: string;
  type: "temporal" | "frequency" | "functionalModification" | "unconfirmed";
}

/** Format SQ answer values for display */
function formatSqValue(value: unknown): string {
  if (value === "yes") return "Ja";
  if (value === "no") return "Nein";
  if (value === "intermittent") return "Schmerzen kommen und gehen";
  if (value === "continuous") return "Schmerzen sind immer vorhanden";
  if (value === "no_pain") return "Keine Schmerzen";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    // Composite values like onset { years, months }
    const obj = value as Record<string, unknown>;
    if ("years" in obj || "months" in obj) {
      const parts: string[] = [];
      if (obj.years) parts.push(`${obj.years} Jahre`);
      if (obj.months) parts.push(`${obj.months} Monate`);
      return parts.join(", ") || "–";
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function formatHistory(findings: HistoryFinding[]): FormattedHistory[] {
  return findings.map((h) => ({
    label: h.label,
    value: formatSqValue(h.value),
    type: h.historyType,
  }));
}

// ============================================================================
// SIGN SUBSECTION: PALPATION / EXAM SIGNS
// ============================================================================

interface FormattedSign {
  label: string;
  side: Side;
}

function formatExamSigns(signs: SignFinding[]): FormattedSign[] {
  const result: FormattedSign[] = [];

  // E9 non-familiar pain, spreading, referred
  for (const sign of signs.filter((s) => s.section === "e9")) {
    if (sign.side) {
      result.push({
        label: `${sign.label}, ${sideLabel(sign.side)}`,
        side: sign.side,
      });
    }
  }

  // E6 examiner-detected sounds without SQ8 support
  for (const sign of signs.filter((s) => s.section === "e6")) {
    if (sign.side) {
      result.push({
        label: `${sign.label}, ${sideLabel(sign.side)}`,
        side: sign.side,
      });
    }
  }

  return result;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ClinicalFindingsCard({ criteriaData }: ClinicalFindingsCardProps) {
  const findings = useMemo(
    () => extractClinicalFindings(criteriaData),
    [criteriaData],
  );

  // Collapse symptoms into clinical findings
  const painFindings = useMemo(
    () => collapseByLocation(findings.symptoms, PAIN_DOMAINS, "Schmerz"),
    [findings.symptoms],
  );

  const headacheFindings = useMemo(
    () => collapseByLocation(findings.symptoms, HEADACHE_DOMAINS, "Kopfschmerz"),
    [findings.symptoms],
  );

  const jointFindings = useMemo(
    () => extractJointFindings(findings.symptoms),
    [findings.symptoms],
  );

  const measurements = useMemo(
    () => formatMeasurements(findings.signs),
    [findings.signs],
  );

  const examSigns = useMemo(
    () => formatExamSigns(findings.signs),
    [findings.signs],
  );

  const historyItems = useMemo(
    () => formatHistory(findings.history),
    [findings.history],
  );

  const hasFindings = painFindings.length > 0 || headacheFindings.length > 0 || jointFindings.length > 0;
  const hasExamSigns = examSigns.length > 0;
  const hasMeasurements = measurements.length > 0;
  const hasHistory = historyItems.length > 0;

  if (!hasFindings && !hasMeasurements && !hasHistory && !hasExamSigns) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Klinische Befundübersicht</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* ── Befunde (Confirmed Findings) ─────────────────────── */}
        {hasFindings && (
          <section>
            <SectionHeading icon={Stethoscope} label="Befunde" />
            <div className="space-y-2 mt-2">
              {painFindings.length > 0 && (
                <FindingGroup heading="Schmerz">
                  {painFindings.map((f, i) => (
                    <FindingRow
                      key={`pain-${i}`}
                      label={f.label}
                      detail={`Bestätigt durch: ${f.confirmations.length} Untersuchungsschritt${f.confirmations.length > 1 ? "e" : ""}`}
                    />
                  ))}
                </FindingGroup>
              )}

              {headacheFindings.length > 0 && (
                <FindingGroup heading="Kopfschmerz">
                  {headacheFindings.map((f, i) => (
                    <FindingRow
                      key={`ha-${i}`}
                      label={f.label}
                      detail={`Bestätigt durch: ${f.confirmations.length} Untersuchungsschritt${f.confirmations.length > 1 ? "e" : ""}`}
                    />
                  ))}
                </FindingGroup>
              )}

              {jointFindings.length > 0 && (
                <FindingGroup heading="Kiefergelenk">
                  {jointFindings.map((f, i) => (
                    <FindingRow key={`jt-${i}`} label={f.label} />
                  ))}
                </FindingGroup>
              )}
            </div>
          </section>
        )}

        {/* ── Klinische Zeichen (Exam-only signs) ─────────────── */}
        {hasExamSigns && (
          <>
            {hasFindings && <Separator />}
            <section>
              <SectionHeading icon={Activity} label="Klinische Zeichen" />
              <ul className="mt-2 space-y-1">
                {examSigns.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground ml-4 list-disc">
                    {s.label}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {/* ── Messungen ───────────────────────────────────────── */}
        {hasMeasurements && (
          <>
            {(hasFindings || hasExamSigns) && <Separator />}
            <section>
              <SectionHeading icon={Ruler} label="Messungen" />
              <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
                {measurements.map((m, i) => (
                  <MeasurementRow key={i} label={m.label} value={m.value} />
                ))}
              </dl>
            </section>
          </>
        )}

        {/* ── Anamnese ────────────────────────────────────────── */}
        {hasHistory && (
          <>
            {(hasFindings || hasExamSigns || hasMeasurements) && <Separator />}
            <section>
              <SectionHeading icon={Clock} label="Anamnese" />
              <div className="mt-2 space-y-2">
                {/* Unconfirmed findings first (they're notable) */}
                {historyItems.filter((h) => h.type === "unconfirmed").length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-amber-700 flex items-center gap-1.5 mb-1">
                      <FileQuestion className="size-3.5" />
                      Nicht bestätigte Angaben
                    </h4>
                    <ul className="space-y-0.5">
                      {historyItems
                        .filter((h) => h.type === "unconfirmed")
                        .map((h, i) => (
                          <li
                            key={`uc-${i}`}
                            className="text-sm text-amber-700/80 ml-4 list-disc"
                          >
                            {h.label}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Temporal and frequency */}
                {historyItems.filter((h) => h.type === "temporal" || h.type === "frequency").length > 0 && (
                  <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
                    {historyItems
                      .filter((h) => h.type === "temporal" || h.type === "frequency")
                      .map((h, i) => (
                        <MeasurementRow key={`tf-${i}`} label={h.label} value={h.value} />
                      ))}
                  </dl>
                )}

                {/* Functional modification */}
                {historyItems.filter((h) => h.type === "functionalModification").length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Schmerz-/Kopfschmerzbeeinflussung
                    </h4>
                    <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
                      {historyItems
                        .filter((h) => h.type === "functionalModification")
                        .map((h, i) => (
                          <MeasurementRow key={`fm-${i}`} label={h.label} value={h.value} />
                        ))}
                    </dl>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <h3 className="text-sm font-semibold flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      {label}
    </h3>
  );
}

function FindingGroup({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-0.5">
        {heading}
      </h4>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function FindingRow({
  label,
  detail,
}: {
  label: string;
  detail?: string;
}) {
  return (
    <li className="flex items-baseline gap-2 ml-4 list-disc">
      <span className="text-sm">{label}</span>
      {detail && (
        <span className="text-xs text-muted-foreground shrink-0">{detail}</span>
      )}
    </li>
  );
}

function MeasurementRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </>
  );
}
