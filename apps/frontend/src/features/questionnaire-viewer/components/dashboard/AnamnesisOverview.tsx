/**
 * Anamnesis Overview — Domain-oriented view of SQ questionnaire answers.
 *
 * Groups the 14 SQ questions into 5 clinical symptom domains:
 * 1. Schmerz (SQ1–SQ4)
 * 2. Kopfschmerz (SQ5–SQ7)
 * 3. Gelenkgeräusche (SQ8)
 * 4. Kieferklemme (SQ9–SQ12) — two independent diagnostic paths
 * 5. Kiefersperre (SQ13–SQ14)
 *
 * Each domain card shows active/inactive state, key clinical details,
 * and which diagnostic pathways remain open.
 */

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CriterionStatus } from "@cmdetect/dc-tmd";
import {
  getPerDiagnosisAnamnesisResults,
  getSectionBadge,
  type DiagnosisAnamnesisResult,
  type SectionId,
} from "@cmdetect/dc-tmd";
import { SQ_PAIN_FREQUENCY_LABELS } from "@cmdetect/questionnaires";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Info, X } from "lucide-react";
import { useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────

interface AnamnesisOverviewProps {
  sqAnswers: Record<string, unknown>;
  caseId?: string;
}

interface PathwayInfo {
  label: string;
  /** Diagnosis anamnesis status: positive = confirmed, pending = still possible, negative = ruled out */
  status: CriterionStatus;
  note?: string;
  /** Examination sections needed for this diagnosis pathway */
  sections?: SectionId[];
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Format duration from SQ2/SQ6 composite answer */
function formatDuration(value: unknown): string {
  if (!value || typeof value !== "object") return "—";
  const d = value as { years?: number; months?: number };
  const parts: string[] = [];
  if (d.years) parts.push(`${d.years} ${d.years === 1 ? "Jahr" : "Jahre"}`);
  if (d.months) parts.push(`${d.months} ${d.months === 1 ? "Monat" : "Monate"}`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

/** Build a lookup from diagnosis results by ID */
function buildDiagnosisLookup(
  results: DiagnosisAnamnesisResult[]
): Record<string, DiagnosisAnamnesisResult> {
  const lookup: Record<string, DiagnosisAnamnesisResult> = {};
  for (const r of results) {
    lookup[r.id] = r;
  }
  return lookup;
}

/** Format side info from SQ office-use data (e.g. SQ8_office: { R: true, L: false }) */
function formatSide(officeValue: unknown): string | null {
  if (!officeValue || typeof officeValue !== "object") return null;
  const o = officeValue as { R?: boolean; L?: boolean; DNK?: boolean };
  if (o.DNK) return "Seite unklar";
  if (o.R && o.L) return "beidseitig";
  if (o.R) return "Rechte Seite";
  if (o.L) return "Linke Seite";
  return null;
}

/** Get anamnesisStatus for a diagnosis, defaulting to "negative" if not found */
function diagStatus(
  diagLookup: Record<string, DiagnosisAnamnesisResult>,
  id: string
): CriterionStatus {
  return diagLookup[id]?.anamnesisStatus ?? "negative";
}

// ─── Sub-components (local) ─────────────────────────────────────────────

/** Domain card wrapper with active/inactive state */
function DomainCard({
  active,
  label,
  children,
}: {
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2",
        active ? "border-blue-200 bg-blue-50/50" : "border-border/50 bg-muted/20"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full shrink-0",
            active ? "bg-blue-500" : "bg-gray-300"
          )}
        />
        <h4
          className={cn("text-sm font-medium flex-1 min-w-0", !active && "text-muted-foreground")}
        >
          {label}
        </h4>
      </div>
      {children}
    </div>
  );
}

/** Single diagnostic pathway indicator with optional exam section badges.
 *  Three states: positive (blue), pending (amber — still possible), negative (gray) */
function PathwayIndicator({
  label,
  status,
  note,
  sections,
  caseId,
}: PathwayInfo & { caseId?: string }) {
  const showSections = status !== "negative" && sections && sections.length > 0;

  const content = (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        status === "positive" && "text-blue-700",
        status === "pending" && "text-amber-700",
        status === "negative" && "text-muted-foreground"
      )}
    >
      <ArrowRight className="h-3 w-3 shrink-0" />
      <span className={cn(status !== "negative" && "font-medium")}>{label}</span>
      {status === "pending" && (
        <span className="text-xs font-normal text-amber-600">(noch möglich)</span>
      )}
      {showSections && (
        <span className="flex gap-0.5 ml-auto shrink-0">
          {sections.map((s) => {
            const badge = (
              <Badge
                key={s}
                variant="outline"
                className={cn(
                  "text-[10px] px-1 py-0 h-4 font-normal",
                  status === "positive" && "text-blue-600 border-blue-200",
                  status === "pending" && "text-amber-600 border-amber-200",
                  caseId && "cursor-pointer hover:bg-accent"
                )}
              >
                {getSectionBadge(s)}
              </Badge>
            );
            if (caseId) {
              return (
                <Link
                  key={s}
                  to={`/cases/$id/examination/${s}` as "/cases/$id/examination/e1"}
                  params={{ id: caseId }}
                  search={{ mode: "preview" as const }}
                >
                  {badge}
                </Link>
              );
            }
            return badge;
          })}
        </span>
      )}
      {note && <Info className="h-3 w-3 shrink-0 text-muted-foreground/50" />}
    </div>
  );

  if (note) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {note}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

/** SQ answer display line (label + value with positive/negative indicator) */
function AnswerLine({
  label,
  value,
  positive,
  side,
  sidePending,
}: {
  label: string;
  value: string;
  positive?: boolean;
  /** Formatted side string from formatSide() */
  side?: string | null;
  /** Show amber "Ausstehend" badge when examiner hasn't reviewed side info yet */
  sidePending?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {positive !== undefined &&
        (positive ? (
          <Check className="h-3 w-3 shrink-0 text-blue-600" />
        ) : (
          <X className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        ))}
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn(positive ? "text-foreground" : "text-muted-foreground")}>{value}</span>
      {side ? (
        <Badge
          variant="outline"
          className="text-[10px] px-1 py-0 h-4 font-normal text-muted-foreground"
        >
          {side}
        </Badge>
      ) : sidePending ? (
        <Badge
          variant="outline"
          className="text-[10px] px-1 py-0 h-4 font-normal text-amber-600 border-amber-200"
        >
          Seitenangabe ausstehend
        </Badge>
      ) : null}
    </div>
  );
}

/** Pathway block — only rendered when at least one pathway is not negative */
function PathwayBlock({
  pathways,
  bordered = true,
  caseId,
}: {
  pathways: PathwayInfo[];
  bordered?: boolean;
  caseId?: string;
}) {
  const actionable = pathways.filter((p) => p.status !== "negative");
  if (actionable.length === 0) return null;
  return (
    <div className={cn("space-y-0.5", bordered && "pt-1.5 border-t border-border/30")}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Zu untersuchen
      </p>
      {actionable.map((p) => (
        <PathwayIndicator key={p.label} {...p} caseId={caseId} />
      ))}
    </div>
  );
}

/** Modification checklist (SQ4_A-D / SQ7_A-D) */
function ModificationChecklist({ items }: { items: { label: string; value: boolean }[] }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs">
          {item.value ? (
            <Check className="h-3 w-3 shrink-0 text-blue-600" />
          ) : (
            <X className="h-3 w-3 shrink-0 text-muted-foreground/50" />
          )}
          <span className={cn(item.value ? "text-foreground" : "text-muted-foreground")}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Domain renderers ───────────────────────────────────────────────────

function SchmerzDomain({
  sqAnswers,
  diagLookup,
  caseId,
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
  caseId?: string;
}) {
  const active = sqAnswers.SQ1 === "yes";

  const pathways: PathwayInfo[] = [
    {
      label: "Myalgie",
      status: diagStatus(diagLookup, "myalgia"),
      sections: diagLookup.myalgia?.examinationSections,
    },
    {
      label: "Arthralgie",
      status: diagStatus(diagLookup, "arthralgia"),
      sections: diagLookup.arthralgia?.examinationSections,
    },
  ];

  return (
    <DomainCard active={active} label="Schmerz in einer mastikatorischen Struktur">
      {!active ? (
        <AnswerLine label="Jemals" value="Nein" positive={false} />
      ) : (
        <div className="space-y-1.5">
          <AnswerLine label="Jemals" value="Ja" positive />
          <AnswerLine label="Erstmaliges Auftreten" value={formatDuration(sqAnswers.SQ2)} />
          <AnswerLine
            label="Letzte 30 Tage"
            value={
              SQ_PAIN_FREQUENCY_LABELS[sqAnswers.SQ3 as string] ?? String(sqAnswers.SQ3 ?? "—")
            }
            positive={sqAnswers.SQ3 === "intermittent" || sqAnswers.SQ3 === "continuous"}
          />
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mt-1">
            Schmerzmodifikation
          </p>
          <ModificationChecklist
            items={[
              { label: "Kauen harter Nahrung", value: sqAnswers.SQ4_A === "yes" },
              { label: "Mundöffnung/Kieferbewegung", value: sqAnswers.SQ4_B === "yes" },
              { label: "Pressen/Knirschen/Kaugummi", value: sqAnswers.SQ4_C === "yes" },
              { label: "Reden/Küssen/Gähnen", value: sqAnswers.SQ4_D === "yes" },
            ]}
          />
        </div>
      )}
      <PathwayBlock pathways={pathways} caseId={caseId} />
    </DomainCard>
  );
}

function KopfschmerzDomain({
  sqAnswers,
  diagLookup,
  caseId,
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
  caseId?: string;
}) {
  const active = sqAnswers.SQ5 === "yes";

  // Headache attr. TMD is a secondary diagnosis — requires Myalgia or Arthralgia.
  // Only show exam sections when at least one primary diagnosis is still possible.
  const primaryPossible =
    diagStatus(diagLookup, "myalgia") !== "negative" ||
    diagStatus(diagLookup, "arthralgia") !== "negative";

  const pathway: PathwayInfo = {
    label: "Kopfschmerz attr. TMD",
    status: primaryPossible ? diagStatus(diagLookup, "headacheAttributedToTmd") : "negative",
    sections: primaryPossible ? diagLookup.headacheAttributedToTmd?.examinationSections : undefined,
  };

  return (
    <DomainCard active={active} label="Kopfschmerzen in Temporalregion">
      {!active ? (
        <AnswerLine label="Letzte 30 Tage" value="Nein" positive={false} />
      ) : (
        <div className="space-y-1.5">
          <AnswerLine label="Letzte 30 Tage" value="Ja" positive />
          <AnswerLine label="Erstmaliges Auftreten" value={formatDuration(sqAnswers.SQ6)} />
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mt-1">
            Kopfschmerzmodifikation
          </p>
          <ModificationChecklist
            items={[
              { label: "Kauen harter Nahrung", value: sqAnswers.SQ7_A === "yes" },
              { label: "Mundöffnung/Kieferbewegung", value: sqAnswers.SQ7_B === "yes" },
              { label: "Pressen/Knirschen/Kaugummi", value: sqAnswers.SQ7_C === "yes" },
              { label: "Reden/Küssen/Gähnen", value: sqAnswers.SQ7_D === "yes" },
            ]}
          />
        </div>
      )}
      <PathwayBlock pathways={[pathway]} caseId={caseId} />
    </DomainCard>
  );
}

function GelenkgeraeuscheDomain({
  sqAnswers,
  diagLookup,
  caseId,
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
  caseId?: string;
}) {
  const active = sqAnswers.SQ8 === "yes";
  const sq8Side = formatSide(sqAnswers.SQ8_office);

  // Merge all disc displacement variants into one entry (all share e6/e7 sections)
  const dvStatuses = [
    diagStatus(diagLookup, "discDisplacementWithReduction"),
    diagStatus(diagLookup, "discDisplacementWithReductionIntermittentLocking"),
  ];
  const dvStatus: CriterionStatus = dvStatuses.includes("positive")
    ? "positive"
    : dvStatuses.includes("pending")
      ? "pending"
      : "negative";

  const pathways: PathwayInfo[] = [
    {
      label: "Diskusverlagerung",
      status: dvStatus,
      sections: diagLookup.discDisplacementWithReduction?.examinationSections,
    },
    {
      label: "Degenerative Gelenkerkrankung",
      status: diagStatus(diagLookup, "degenerativeJointDisease"),
      sections: diagLookup.degenerativeJointDisease?.examinationSections,
    },
  ];

  return (
    <DomainCard active={active} label="Gelenkgeräusche">
      {!active ? (
        <div className="space-y-1">
          <AnswerLine label="Letzte 30 Tage" value="Nein" positive={false} />
          <p className="text-xs text-muted-foreground italic">
            Patient kann Geräusch während Untersuchung bestätigen
          </p>
        </div>
      ) : (
        <AnswerLine
          label="Letzte 30 Tage"
          value="Ja"
          positive
          side={sq8Side}
          sidePending={sq8Side == null}
        />
      )}
      <PathwayBlock pathways={pathways} caseId={caseId} />
    </DomainCard>
  );
}

function KieferklemmeDomain({
  sqAnswers,
  diagLookup,
  caseId,
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
  caseId?: string;
}) {
  const sq9Active = sqAnswers.SQ9 === "yes";

  // Path A: DV ohne Reposition (SQ9 + SQ10)
  const sq10 = sqAnswers.SQ10 === "yes";
  // Both DD-without-reduction variants share the same anamnesis; pick the more severe for status
  const pathAStatus: CriterionStatus =
    diagStatus(diagLookup, "discDisplacementWithoutReductionLimitedOpening") === "positive" ||
    diagStatus(diagLookup, "discDisplacementWithoutReductionWithoutLimitedOpening") === "positive"
      ? "positive"
      : diagStatus(diagLookup, "discDisplacementWithoutReductionLimitedOpening");

  // Path B: DV mit Rep.+int. Klemme (SQ11 + SQ12 + SQ8)
  const sq11Active = sqAnswers.SQ11 === "yes";
  const sq12 = sqAnswers.SQ12;
  const sq8 = sqAnswers.SQ8 === "yes";
  const pathBStatus = diagStatus(diagLookup, "discDisplacementWithReductionIntermittentLocking");

  const domainActive = sq9Active || sq11Active;

  return (
    <DomainCard active={domainActive} label="Kieferklemme">
      {!domainActive ? (
        <AnswerLine label="Jemals" value="Nein" positive={false} />
      ) : (
        <div className="space-y-2">
          {/* Path A — Blockade */}
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Blockade
            </p>
            <AnswerLine label="Jemals" value={sq9Active ? "Ja" : "Nein"} positive={sq9Active} />
            {sq9Active && (
              <AnswerLine
                label="Essen beeinträchtigt"
                value={sq10 ? "Ja" : "Nein"}
                positive={sq10}
                side={formatSide(sqAnswers.SQ10_office)}
                sidePending={!formatSide(sqAnswers.SQ10_office)}
              />
            )}
            <PathwayBlock
              bordered={false}
              caseId={caseId}
              pathways={[
                {
                  label: "Diskusverlagerung",
                  status: pathAStatus,
                  sections:
                    diagLookup.discDisplacementWithoutReductionLimitedOpening?.examinationSections,
                },
              ]}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Path B — Intermittierend */}
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Intermittierend
            </p>
            <AnswerLine
              label="Letzte 30 Tage, dann gelöst"
              value={sq11Active ? "Ja" : "Nein"}
              positive={sq11Active}
              side={formatSide(sqAnswers.SQ11_office)}
              sidePending={!formatSide(sqAnswers.SQ11_office)}
            />
            {sq11Active && (
              <AnswerLine
                label="Gegenwärtig blockiert"
                value={sq12 === "yes" ? "Ja" : sq12 === "no" ? "Nein" : "—"}
                positive={sq12 === "no"}
              />
            )}
            <AnswerLine
              label="Gelenkgeräusch"
              value={sq8 ? "Ja" : "Nein — kann in U bestätigt werden"}
              positive={sq8}
            />
            <PathwayBlock
              bordered={false}
              caseId={caseId}
              pathways={[
                {
                  label: "Diskusverlagerung",
                  status: pathBStatus,
                  sections:
                    diagLookup.discDisplacementWithReductionIntermittentLocking
                      ?.examinationSections,
                },
              ]}
            />
          </div>
        </div>
      )}
    </DomainCard>
  );
}

function KiefersperreDomain({
  sqAnswers,
  diagLookup,
  caseId,
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
  caseId?: string;
}) {
  const active = sqAnswers.SQ13 === "yes";
  const sq14 = sqAnswers.SQ14 === "yes";

  const pathway: PathwayInfo = {
    label: "Subluxation",
    status: diagStatus(diagLookup, "subluxation"),
    sections: diagLookup.subluxation?.examinationSections,
  };

  return (
    <DomainCard active={active} label="Kiefersperre">
      {!active ? (
        <AnswerLine label="Letzte 30 Tage" value="Nein" positive={false} />
      ) : (
        <div className="space-y-1">
          <AnswerLine
            label="Letzte 30 Tage"
            value="Ja"
            positive
            side={formatSide(sqAnswers.SQ13_office)}
            sidePending={!formatSide(sqAnswers.SQ13_office)}
          />
          <AnswerLine
            label="Schließen nur mit Manöver"
            value={sq14 ? "Ja" : "Nein"}
            positive={sq14}
            side={formatSide(sqAnswers.SQ14_office)}
            sidePending={!formatSide(sqAnswers.SQ14_office)}
          />
        </div>
      )}
      <PathwayBlock pathways={[pathway]} caseId={caseId} />
    </DomainCard>
  );
}

// ─── Main component ─────────────────────────────────────────────────────

export function AnamnesisOverview({ sqAnswers, caseId }: AnamnesisOverviewProps) {
  const diagResults = useMemo(() => getPerDiagnosisAnamnesisResults(sqAnswers), [sqAnswers]);
  const diagLookup = useMemo(() => buildDiagnosisLookup(diagResults), [diagResults]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1: Pain domains (span 2 cols on md+) */}
        <SchmerzDomain sqAnswers={sqAnswers} diagLookup={diagLookup} caseId={caseId} />
        <KopfschmerzDomain sqAnswers={sqAnswers} diagLookup={diagLookup} caseId={caseId} />

        {/* Row 2: Joint domains */}
        <GelenkgeraeuscheDomain sqAnswers={sqAnswers} diagLookup={diagLookup} caseId={caseId} />
        <KieferklemmeDomain sqAnswers={sqAnswers} diagLookup={diagLookup} caseId={caseId} />
        <KiefersperreDomain sqAnswers={sqAnswers} diagLookup={diagLookup} caseId={caseId} />
      </div>
    </TooltipProvider>
  );
}
