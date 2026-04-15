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
import { useEffect, useState, type ReactNode } from "react";
import { ClinicalNote } from "./ClinicalNote";
import type { TabSummary } from "./Axis2ScoreCard";

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

function Fraction({ numerator, denominator }: { numerator: ReactNode; denominator: ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center leading-[1.1] align-middle">
      <span>{numerator}</span>
      <span className="border-t border-current w-full text-center px-1">{denominator}</span>
    </span>
  );
}

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
      <div className="space-y-6">
        {/* Grad selector (final result) */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium w-32 shrink-0">Grad</span>
          <Select value={grade || NONE} onValueChange={(v) => setGrade(v === NONE ? "" : v)}>
            <SelectTrigger size="sm" className="w-[160px]">
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
        </div>

        {/* (1) BP */}
        <div className="space-y-3">
          <p className="text-sm font-medium">(1) Beeinträchtigungspunkte (BP)</p>

          <div className="border border-border rounded-md p-3 space-y-2 bg-background">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-medium">(a) Anzahl der Tage</p>
              <span className="text-[11px] text-muted-foreground">aus Frage 5</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="text-muted-foreground">Anzahl:</span>
              <NumberField value={daysRaw} onChange={setDaysRaw} min={0} max={31} />
              <span className="text-muted-foreground">Tage</span>
            </div>
            <BandingTable headers={["Tage", "BP"]} rows={GCPS_DAYS_BANDING} />
            <div className="flex items-baseline justify-end gap-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">(a) =</span>
              <NumberField value={bpA} onChange={setBpA} min={0} max={3} />
              <span className="text-xs">BP</span>
            </div>
          </div>

          <div className="border border-border rounded-md p-3 space-y-2 bg-background">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-medium">(b) Subjektive Beeinträchtigung</p>
              <span className="text-[11px] text-muted-foreground">aus Fragen 6–8</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span>
                <Fraction numerator={<>F6 + F7 + F8</>} denominator={<>3</>} /> · 10 =
              </span>
              <NumberField
                value={interferencePunkte}
                onChange={setInterferencePunkte}
                min={0}
                max={100}
              />
              <span className="text-muted-foreground">Punkte</span>
            </div>
            <BandingTable headers={["Punkte", "BP"]} rows={GCPS_INTERFERENCE_BANDING} />
            <div className="flex items-baseline justify-end gap-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">(b) =</span>
              <NumberField value={bpB} onChange={setBpB} min={0} max={3} />
              <span className="text-xs">BP</span>
            </div>
          </div>

          <div className="flex items-baseline justify-end gap-2">
            <span className="text-sm font-medium">Gesamt: (a + b) =</span>
            <NumberField value={bpTotal} onChange={setBpTotal} min={0} max={6} />
            <span className="text-sm">BP</span>
          </div>
        </div>

        {/* (2) CSI */}
        <div className="space-y-2">
          <p className="text-sm font-medium">(2) Charakteristische Schmerzintensität</p>
          <p className="text-xs italic text-muted-foreground">Nur nötig, wenn Gesamt-BP &lt; 3.</p>
          <div className="flex items-center gap-2 flex-wrap text-sm pl-3">
            <span>
              CSI = <Fraction numerator={<>F2 + F3 + F4</>} denominator={<>3</>} /> · 10 =
            </span>
            <NumberField value={csi} onChange={setCsi} min={0} max={100} />
            <span className="text-muted-foreground">(0–100)</span>
          </div>
        </div>

        {/* (3) Grad-Bestimmung */}
        <div className="space-y-2">
          <p className="text-sm font-medium">(3) Grad-Bestimmung</p>
          <GradeTable />
        </div>
      </div>
      <ClinicalNote value={note} onChange={setNote} />
    </>
  );
}
