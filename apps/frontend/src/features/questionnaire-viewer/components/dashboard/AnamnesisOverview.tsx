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
import { cn } from "@/lib/utils";
import { SQ_PAIN_FREQUENCY_LABELS } from "@cmdetect/questionnaires";
import { Check, X } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────

interface AnamnesisOverviewProps {
  sqAnswers: Record<string, unknown>;
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

/** Format side info from SQ office-use data (e.g. SQ8_office: { R: true, L: false }) */
function formatSide(officeValue: unknown): string | null {
  if (!officeValue || typeof officeValue !== "object") return null;
  const o = officeValue as { R?: boolean; L?: boolean; DNK?: boolean };
  if (o.DNK) return "Lokalisation unklar";
  if (o.R && o.L) return "beidseitig";
  if (o.R) return "Rechte Seite";
  if (o.L) return "Linke Seite";
  return null;
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
          Lokalisation ausstehend
        </Badge>
      ) : null}
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

function SchmerzDomain({ sqAnswers }: { sqAnswers: Record<string, unknown> }) {
  const active = sqAnswers.SQ1 === "yes";

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
    </DomainCard>
  );
}

function KopfschmerzDomain({ sqAnswers }: { sqAnswers: Record<string, unknown> }) {
  const active = sqAnswers.SQ5 === "yes";

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
    </DomainCard>
  );
}

function GelenkgeraeuscheDomain({ sqAnswers }: { sqAnswers: Record<string, unknown> }) {
  const active = sqAnswers.SQ8 === "yes";
  const sq8Side = formatSide(sqAnswers.SQ8_office);

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
    </DomainCard>
  );
}

function KieferklemmeDomain({ sqAnswers }: { sqAnswers: Record<string, unknown> }) {
  const sq9Active = sqAnswers.SQ9 === "yes";

  // Path A: DV ohne Reposition (SQ9 + SQ10)
  const sq10 = sqAnswers.SQ10 === "yes";

  // Path B: DV mit Rep.+int. Klemme (SQ11 + SQ12 + SQ8)
  const sq11Active = sqAnswers.SQ11 === "yes";
  const sq12 = sqAnswers.SQ12;
  const sq8 = sqAnswers.SQ8 === "yes";

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
          </div>
        </div>
      )}
    </DomainCard>
  );
}

function KiefersperreDomain({ sqAnswers }: { sqAnswers: Record<string, unknown> }) {
  const active = sqAnswers.SQ13 === "yes";
  const sq14 = sqAnswers.SQ14 === "yes";

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
    </DomainCard>
  );
}

// ─── Main component ─────────────────────────────────────────────────────

export function AnamnesisOverview({ sqAnswers }: AnamnesisOverviewProps) {
  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Row 1: Pain domains (span 2 cols on md+) */}
      <SchmerzDomain sqAnswers={sqAnswers} />
      <KopfschmerzDomain sqAnswers={sqAnswers} />

      {/* Row 2: Joint domains */}
      <GelenkgeraeuscheDomain sqAnswers={sqAnswers} />
      <KieferklemmeDomain sqAnswers={sqAnswers} />
      <KiefersperreDomain sqAnswers={sqAnswers} />
    </div>
  );
}
