/**
 * GCPS-1M scoring body. Rendered inside Axis2DetailPanel (right sheet).
 * Kept in a single scrollable column pending a dedicated redesign
 * for the multi-step BP + CSI + Grade flow.
 */

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { ClinicalNote } from "./ClinicalNote";
import { StackedField, type TabSummary } from "./Axis2ScoreCard";

const NONE = "__none__";

const GCPS_GRADE_OPTIONS = [
  { value: "grad_0", label: "Grad 0" },
  { value: "grad_1", label: "Grad I" },
  { value: "grad_2", label: "Grad II" },
  { value: "grad_3", label: "Grad III" },
  { value: "grad_4", label: "Grad IV" },
] as const;

const GCPS_DAYS_BANDING = [
  ["0–1", 0],
  ["2", 1],
  ["3–5", 2],
  ["≥ 6", 3],
] as const;

const GCPS_INTERFERENCE_BANDING = [
  ["0–29", 0],
  ["30–49", 1],
  ["50–69", 2],
  ["≥ 70", 3],
] as const;

const GCPS_GRADE_TABLE = [
  { grade: "0", label: "Kein Schmerz", csi: "0", bp: "—" },
  { grade: "I", label: "Geringe Schmerzintensität", csi: "< 50", bp: "< 3" },
  { grade: "II", label: "Hohe Schmerzintensität", csi: "≥ 50", bp: "< 3" },
  { grade: "III", label: "Mäßige Einschränkung", csi: "—", bp: "3–4" },
  { grade: "IV", label: "Hochgradige Einschränkung", csi: "—", bp: "5–6" },
] as const;

function gradeLabel(value: string): string | undefined {
  return GCPS_GRADE_OPTIONS.find((o) => o.value === value)?.label;
}

// ─── Small helpers ──────────────────────────────────────────────────────

function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  width = "w-20",
}: {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
  width?: string;
}) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
      className={`h-8 text-sm ${width}`}
    />
  );
}

function BandingTable({
  headers,
  rows,
}: {
  headers: readonly [string, string];
  rows: ReadonlyArray<readonly [string, number]>;
}) {
  return (
    <table className="text-[11px] border border-border rounded-sm overflow-hidden">
      <thead>
        <tr className="bg-muted/50">
          <th className="px-2 py-0.5 text-left font-medium text-muted-foreground border-r border-border">
            {headers[0]}
          </th>
          <th className="px-2 py-0.5 text-center font-medium text-muted-foreground">{headers[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([range, value]) => (
          <tr key={range} className="border-t border-border">
            <td className="px-2 py-0.5 text-muted-foreground border-r border-border whitespace-nowrap">
              {range}
            </td>
            <td className="px-2 py-0.5 text-center font-mono">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GradeTable() {
  return (
    <table className="text-[11px] border border-border rounded-sm overflow-hidden w-full">
      <thead>
        <tr className="bg-muted/50">
          <th className="px-2 py-0.5 text-left font-medium text-muted-foreground border-r border-border">
            Grad
          </th>
          <th className="px-2 py-0.5 text-left font-medium text-muted-foreground border-r border-border">
            Bezeichnung
          </th>
          <th className="px-2 py-0.5 text-center font-medium text-muted-foreground border-r border-border">
            CSI
          </th>
          <th className="px-2 py-0.5 text-center font-medium text-muted-foreground">BP</th>
        </tr>
      </thead>
      <tbody>
        {GCPS_GRADE_TABLE.map((row) => (
          <tr key={row.grade} className="border-t border-border">
            <td className="px-2 py-0.5 font-mono border-r border-border">{row.grade}</td>
            <td className="px-2 py-0.5 border-r border-border">{row.label}</td>
            <td className="px-2 py-0.5 text-center border-r border-border text-muted-foreground">
              {row.csi}
            </td>
            <td className="px-2 py-0.5 text-center text-muted-foreground">{row.bp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Main content component ─────────────────────────────────────────────

interface GCPSScoringContentProps {
  onSummaryChange?: (summary: TabSummary) => void;
}

export function GCPSScoringContent({ onSummaryChange }: GCPSScoringContentProps) {
  const [daysRaw, setDaysRaw] = useState("");
  const [bpA, setBpA] = useState("");
  const [interferencePunkte, setInterferencePunkte] = useState("");
  const [bpB, setBpB] = useState("");
  const [bpTotal, setBpTotal] = useState("");
  const [csi, setCsi] = useState("");
  const [grade, setGrade] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    onSummaryChange?.({
      mainScore: gradeLabel(grade),
    });
  }, [grade, onSummaryChange]);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* (1) BP */}
        <section className="flex flex-col gap-4">
          <h4 className="text-sm font-medium">(1) Beeinträchtigungspunkte (BP)</h4>

          {/* (a) Days */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              (a) Anzahl der Tage (aus Frage 5)
            </p>
            <StackedField label="Anzahl Tage" hint="0–31">
              <NumberField value={daysRaw} onChange={setDaysRaw} min={0} max={31} />
            </StackedField>
            <BandingTable headers={["Tage", "BP"]} rows={GCPS_DAYS_BANDING} />
            <StackedField label="BP (a)" hint="0–3">
              <NumberField value={bpA} onChange={setBpA} min={0} max={3} />
            </StackedField>
          </div>

          {/* (b) Interference */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              (b) Subjektive Beeinträchtigung (aus F6–F8)
            </p>
            <StackedField
              label="Punkte"
              hint="0–100"
              formula={<>(F6 + F7 + F8) / 3 · 10</>}
            >
              <NumberField
                value={interferencePunkte}
                onChange={setInterferencePunkte}
                min={0}
                max={100}
              />
            </StackedField>
            <BandingTable headers={["Punkte", "BP"]} rows={GCPS_INTERFERENCE_BANDING} />
            <StackedField label="BP (b)" hint="0–3">
              <NumberField value={bpB} onChange={setBpB} min={0} max={3} />
            </StackedField>
          </div>

          <StackedField label="Gesamt BP (a + b)" hint="0–6">
            <NumberField value={bpTotal} onChange={setBpTotal} min={0} max={6} />
          </StackedField>
        </section>

        {/* (2) CSI */}
        <section className="flex flex-col gap-3">
          <h4 className="text-sm font-medium">(2) Charakteristische Schmerzintensität (CSI)</h4>
          <p className="text-[11px] italic text-muted-foreground">
            Nur nötig, wenn Gesamt-BP &lt; 3.
          </p>
          <StackedField label="CSI" hint="0–100" formula={<>(F2 + F3 + F4) / 3 · 10</>}>
            <NumberField value={csi} onChange={setCsi} min={0} max={100} />
          </StackedField>
        </section>

        {/* (3) Grad */}
        <section className="flex flex-col gap-3">
          <h4 className="text-sm font-medium">(3) Grad</h4>
          <StackedField label="Grad">
            <Select value={grade || NONE} onValueChange={(v) => setGrade(v === NONE ? "" : v)}>
              <SelectTrigger size="sm" className="w-full max-w-[260px]">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {GCPS_GRADE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </StackedField>

          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Grad-Bestimmung
            </span>
            <GradeTable />
          </div>
        </section>
      </div>
      <ClinicalNote value={note} onChange={setNote} />
    </>
  );
}
