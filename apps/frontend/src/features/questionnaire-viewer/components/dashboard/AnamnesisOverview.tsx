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
import { ArrowRight, Check, Info, X } from "lucide-react";
import { useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────

interface AnamnesisOverviewProps {
  sqAnswers: Record<string, unknown>;
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
        <h4 className={cn("text-sm font-medium", !active && "text-muted-foreground")}>{label}</h4>
      </div>
      {children}
    </div>
  );
}

/** Single diagnostic pathway indicator with optional exam section badges.
 *  Three states: positive (blue), pending (amber — still possible), negative (gray) */
function PathwayIndicator({ label, status, note, sections }: PathwayInfo) {
  const showSections = status !== "negative" && sections && sections.length > 0;

  const content = (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        status === "positive" && "text-blue-700",
        status === "pending" && "text-amber-700",
        status === "negative" && "text-muted-foreground/60"
      )}
    >
      <ArrowRight className="h-3 w-3 shrink-0" />
      <span className={cn(status !== "negative" && "font-medium")}>{label}</span>
      {status === "pending" && (
        <span className="text-[10px] font-normal text-amber-600">(noch möglich)</span>
      )}
      {showSections && (
        <span className="flex gap-0.5 ml-auto shrink-0">
          {sections.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className={cn(
                "text-[10px] px-1 py-0 h-4 font-normal",
                status === "positive" && "text-blue-600 border-blue-200",
                status === "pending" && "text-amber-600 border-amber-200"
              )}
            >
              {getSectionBadge(s)}
            </Badge>
          ))}
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
}: {
  label: string;
  value: string;
  positive?: boolean;
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
    </div>
  );
}

/** Pathway block — only rendered when at least one pathway is not negative */
function PathwayBlock({
  pathways,
  bordered = true,
}: {
  pathways: PathwayInfo[];
  bordered?: boolean;
}) {
  const actionable = pathways.filter((p) => p.status !== "negative");
  if (actionable.length === 0) return null;
  return (
    <div className={cn("space-y-0.5", bordered && "pt-1.5 border-t border-border/30")}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        Zu untersuchen
      </p>
      {actionable.map((p) => (
        <PathwayIndicator key={p.label} {...p} />
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
          <span className={cn(item.value ? "text-foreground" : "text-muted-foreground/70")}>
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
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
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
    <DomainCard active={active} label="Schmerz">
      {!active ? (
        <p className="text-xs text-muted-foreground">Verneint</p>
      ) : (
        <div className="space-y-1.5">
          <AnswerLine label="Dauer" value={formatDuration(sqAnswers.SQ2)} />
          <AnswerLine
            label="Häufigkeit"
            value={
              SQ_PAIN_FREQUENCY_LABELS[sqAnswers.SQ3 as string] ?? String(sqAnswers.SQ3 ?? "—")
            }
            positive={sqAnswers.SQ3 === "intermittent" || sqAnswers.SQ3 === "continuous"}
          />
          <p className="text-[11px] text-muted-foreground font-medium mt-1">Schmerzmodifikation</p>
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
      <PathwayBlock pathways={pathways} />
    </DomainCard>
  );
}

function KopfschmerzDomain({
  sqAnswers,
  diagLookup,
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
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
    <DomainCard active={active} label="Kopfschmerz">
      {!active ? (
        <p className="text-xs text-muted-foreground">Verneint</p>
      ) : (
        <div className="space-y-1.5">
          <AnswerLine label="Dauer" value={formatDuration(sqAnswers.SQ6)} />
          <p className="text-[11px] text-muted-foreground font-medium mt-1">
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
      <PathwayBlock pathways={[pathway]} />
    </DomainCard>
  );
}

function GelenkgeraeuscheDomain({
  sqAnswers,
  diagLookup,
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
}) {
  const active = sqAnswers.SQ8 === "yes";

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
          <p className="text-xs text-muted-foreground">Verneint</p>
          <p className="text-[10px] text-muted-foreground/70 italic">
            Patient kann Geräusch während U bestätigen
          </p>
        </div>
      ) : (
        <p className="text-xs text-foreground">Berichtet (letzte 30 Tage)</p>
      )}
      <PathwayBlock pathways={pathways} />
    </DomainCard>
  );
}

function KieferklemmeDomain({
  sqAnswers,
  diagLookup,
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
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

  return (
    <DomainCard active={sq9Active} label="Kieferklemme">
      {!sq9Active ? (
        <p className="text-xs text-muted-foreground">Verneint</p>
      ) : (
        <div className="space-y-2">
          {/* Path A — Blockade */}
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground font-medium">
              Blockade (SF9+SF10)
            </p>
            <AnswerLine label="Jemals blockiert" value="Ja" positive />
            <AnswerLine label="Essen beeinträchtigt" value={sq10 ? "Ja" : "Nein"} positive={sq10} />
            <PathwayBlock
              bordered={false}
              pathways={[{
                label: "Diskusverlagerung",
                status: pathAStatus,
                sections: diagLookup.discDisplacementWithoutReductionLimitedOpening?.examinationSections,
              }]}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Path B — Intermittierend */}
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground font-medium">
              Intermittierend (SF11+SF12+SF8)
            </p>
            <AnswerLine
              label="Letzte 30 Tage, dann gelöst"
              value={sq11Active ? "Ja" : "Nein"}
              positive={sq11Active}
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
              pathways={[{
                label: "Diskusverlagerung",
                status: pathBStatus,
                sections: diagLookup.discDisplacementWithReductionIntermittentLocking?.examinationSections,
              }]}
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
}: {
  sqAnswers: Record<string, unknown>;
  diagLookup: Record<string, DiagnosisAnamnesisResult>;
}) {
  const active = sqAnswers.SQ13 === "yes";
  const sq14 = sqAnswers.SQ14 === "yes";

  const pathway: PathwayInfo = {
    label: "Subluxation",
    status: diagStatus(diagLookup, "subluxation"),
    sections: diagLookup.subluxation?.examinationSections,
  };

  return (
    <DomainCard active={active} label="Kiefersperre (offen)">
      {!active ? (
        <p className="text-xs text-muted-foreground">Verneint</p>
      ) : (
        <div className="space-y-1">
          <AnswerLine label="Weit geöffnet arretiert" value="Ja" positive />
          <AnswerLine
            label="Schließen nur mit Manöver"
            value={sq14 ? "Ja" : "Nein"}
            positive={sq14}
          />
        </div>
      )}
      <PathwayBlock pathways={[pathway]} />
    </DomainCard>
  );
}

// ─── Main component ─────────────────────────────────────────────────────

export function AnamnesisOverview({ sqAnswers }: AnamnesisOverviewProps) {
  const diagResults = useMemo(() => getPerDiagnosisAnamnesisResults(sqAnswers), [sqAnswers]);
  const diagLookup = useMemo(() => buildDiagnosisLookup(diagResults), [diagResults]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1: Pain domains (span 2 cols on md+) */}
        <SchmerzDomain sqAnswers={sqAnswers} diagLookup={diagLookup} />
        <KopfschmerzDomain sqAnswers={sqAnswers} diagLookup={diagLookup} />

        {/* Row 2: Joint domains */}
        <GelenkgeraeuscheDomain sqAnswers={sqAnswers} diagLookup={diagLookup} />
        <KieferklemmeDomain sqAnswers={sqAnswers} diagLookup={diagLookup} />
        <KiefersperreDomain sqAnswers={sqAnswers} diagLookup={diagLookup} />
      </div>
    </TooltipProvider>
  );
}
