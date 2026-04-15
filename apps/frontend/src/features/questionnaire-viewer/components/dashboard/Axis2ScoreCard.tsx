/**
 * Axis 2 scoring bodies — documentation-only manual entry.
 * Each exported component renders the right-sheet body (score inputs + clinical note)
 * for one questionnaire. Rendered inside Axis2DetailPanel.
 * Local state, no persistence. Summary (main score + classification) is
 * reported to the parent via onSummaryChange for display on the tab card.
 */

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JFLS20_SUBSCALE_LABELS } from "@cmdetect/questionnaires";
import { useEffect, useState, type ReactNode } from "react";
import { ClinicalNote } from "./ClinicalNote";
import { ScoreInputRow } from "./ScoreInputRow";

const NONE = "__none__";

// ─── Shared types ───────────────────────────────────────────────────────

export interface TabSummary {
  mainScore?: string;
  classification?: string;
}

interface ContentProps {
  onSummaryChange?: (summary: TabSummary) => void;
}

// ─── Option lists ───────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

const PHQ4_SEVERITY_OPTIONS: SelectOption[] = [
  { value: "normal", label: "Normal" },
  { value: "leicht", label: "Leicht" },
  { value: "moderat", label: "Moderat" },
  { value: "schwer", label: "Schwer" },
];

const PHQ4_CUTOFFS: ReadonlyArray<readonly [string, string]> = [
  ["0–2", "Normal"],
  ["3–5", "Leicht"],
  ["6–8", "Moderat"],
  ["9–12", "Schwer"],
];

const OBC_SEVERITY_OPTIONS: SelectOption[] = [
  { value: "keine", label: "Keine" },
  { value: "niedrig", label: "Niedrig" },
  { value: "hoch", label: "Hoch" },
];

const OBC_CUTOFFS: ReadonlyArray<readonly [string, string]> = [
  ["0", "Keine"],
  ["1–24", "Niedrig"],
  ["25–84", "Hoch"],
];

function labelFor(options: SelectOption[], value: string): string | undefined {
  return options.find((o) => o.value === value)?.label;
}

// ─── Input helpers ──────────────────────────────────────────────────────

interface NumberFieldProps {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
  width?: string;
}

function NumberField({ value, onChange, min, max, step = 1, width = "w-20" }: NumberFieldProps) {
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

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  width?: string;
}

function SelectField({
  value,
  onChange,
  options,
  placeholder = "—",
  width = "w-[140px]",
}: SelectFieldProps) {
  return (
    <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
      <SelectTrigger size="sm" className={width}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>—</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface FreeTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  width?: string;
  placeholder?: string;
}

function FreeTextField({
  value,
  onChange,
  width = "w-[200px]",
  placeholder = "Einordnung eingeben",
}: FreeTextFieldProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-8 text-sm ${width}`}
    />
  );
}

// ─── Formula helpers ────────────────────────────────────────────────────

function Fraction({ numerator, denominator }: { numerator: ReactNode; denominator: ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center leading-[1.1] align-middle">
      <span>{numerator}</span>
      <span className="border-t border-current w-full text-center px-1">{denominator}</span>
    </span>
  );
}

function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

// ─── PHQ-4 ──────────────────────────────────────────────────────────────

export function StackedField({
  label,
  hint,
  formula,
  children,
}: {
  label: string;
  hint?: string;
  formula?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground">({hint})</span>}
      </div>
      {children}
      {formula && <div className="text-[11px] text-muted-foreground">{formula}</div>}
    </div>
  );
}

function CutoffTable({
  label,
  rows,
}: {
  label: string;
  rows: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <table className="text-[11px] border border-border rounded-sm overflow-hidden w-full">
      <thead>
        <tr className="bg-muted/50">
          <th className="px-2 py-0.5 text-left font-medium text-muted-foreground border-r border-border">
            Score
          </th>
          <th className="px-2 py-0.5 text-left font-medium text-muted-foreground">{label}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([range, value]) => (
          <tr key={range} className="border-t border-border">
            <td className="px-2 py-0.5 font-mono border-r border-border whitespace-nowrap">
              {range}
            </td>
            <td className="px-2 py-0.5 text-muted-foreground">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PHQ4Content({ onSummaryChange }: ContentProps) {
  const [total, setTotal] = useState("");
  const [severity, setSeverity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    onSummaryChange?.({
      mainScore: total || undefined,
      classification: labelFor(PHQ4_SEVERITY_OPTIONS, severity),
    });
  }, [total, severity, onSummaryChange]);

  return (
    <>
      <div className="flex flex-col gap-5">
        <StackedField label="Gesamtscore" hint="0–12">
          <NumberField value={total} onChange={setTotal} min={0} max={12} />
        </StackedField>

        <StackedField label="Schweregrad der Belastung">
          <SelectField
            value={severity}
            onChange={setSeverity}
            options={PHQ4_SEVERITY_OPTIONS}
            width="w-full max-w-[260px]"
          />
        </StackedField>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Cutoffs
          </span>
          <CutoffTable label="Schweregrad der Belastung" rows={PHQ4_CUTOFFS} />
        </div>
      </div>
      <ClinicalNote value={note} onChange={setNote} />
    </>
  );
}

// ─── JFLS-8 ─────────────────────────────────────────────────────────────

function JFLS8ReferenceTable() {
  return (
    <table className="text-[11px] border border-border rounded-sm overflow-hidden w-full">
      <thead>
        <tr className="bg-muted/50">
          <th className="px-2 py-0.5 text-left font-medium text-muted-foreground border-r border-border">
            Gruppe
          </th>
          <th className="px-2 py-0.5 text-left font-medium text-muted-foreground">
            Globalwert (Mittel ± SE)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-border">
          <td className="px-2 py-0.5 border-r border-border">Ohne lebenslange CMD</td>
          <td className="px-2 py-0.5 font-mono text-muted-foreground">0,16 ± 0,02</td>
        </tr>
        <tr className="border-t border-border">
          <td className="px-2 py-0.5 border-r border-border">Chronische CMD</td>
          <td className="px-2 py-0.5 font-mono text-muted-foreground">1,74 ± 0,11</td>
        </tr>
      </tbody>
    </table>
  );
}

export function JFLS8Content({ onSummaryChange }: ContentProps) {
  const [global, setGlobal] = useState("");
  const [classification, setClassification] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    onSummaryChange?.({
      mainScore: global || undefined,
      classification: classification || undefined,
    });
  }, [global, classification, onSummaryChange]);

  return (
    <>
      <div className="flex flex-col gap-5">
        <StackedField label="Globalwert" hint="0–10">
          <NumberField value={global} onChange={setGlobal} min={0} max={10} step={0.01} />
        </StackedField>

        <StackedField label="Einordnung">
          <FreeTextField
            value={classification}
            onChange={setClassification}
            width="w-full max-w-[260px]"
          />
        </StackedField>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Referenzwerte (Studie)
          </span>
          <JFLS8ReferenceTable />
          <p className="text-[11px] text-muted-foreground italic">
            Keine Normwerte etabliert — nur deskriptive Studienwerte.
          </p>
        </div>
      </div>
      <ClinicalNote value={note} onChange={setNote} />
    </>
  );
}

// ─── JFLS-20 ────────────────────────────────────────────────────────────

export function JFLS20Content({ onSummaryChange }: ContentProps) {
  const [global, setGlobal] = useState("");
  const [mastication, setMastication] = useState("");
  const [mobility, setMobility] = useState("");
  const [communication, setCommunication] = useState("");
  const [classification, setClassification] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    onSummaryChange?.({
      mainScore: global || undefined,
      classification: classification || undefined,
    });
  }, [global, classification, onSummaryChange]);

  return (
    <>
      <Stack>
        <ScoreInputRow
          label="Globalwert"
          rangeHint="0–10"
          formula={
            <span className="inline-flex items-center gap-1">
              = <Fraction numerator={<>Σ aller 20 Items</>} denominator={<>n</>} /> (max. 2 fehlend)
            </span>
          }
        >
          <NumberField value={global} onChange={setGlobal} min={0} max={10} step={0.01} />
        </ScoreInputRow>
        <ScoreInputRow
          label={JFLS20_SUBSCALE_LABELS.mastication.label}
          rangeHint="0–10"
          formula={
            <span className="inline-flex items-center gap-1">
              = <Fraction numerator={<>Σ Items 1–6</>} denominator={<>n</>} /> (max. 2 fehlend)
            </span>
          }
        >
          <NumberField value={mastication} onChange={setMastication} min={0} max={10} step={0.01} />
        </ScoreInputRow>
        <ScoreInputRow
          label={JFLS20_SUBSCALE_LABELS.mobility.label}
          rangeHint="0–10"
          formula={
            <span className="inline-flex items-center gap-1">
              = <Fraction numerator={<>Σ Items 7–10</>} denominator={<>n</>} /> (max. 1 fehlend)
            </span>
          }
        >
          <NumberField value={mobility} onChange={setMobility} min={0} max={10} step={0.01} />
        </ScoreInputRow>
        <ScoreInputRow
          label={JFLS20_SUBSCALE_LABELS.communication.label}
          rangeHint="0–10"
          formula={
            <span className="inline-flex items-center gap-1">
              = <Fraction numerator={<>Σ Items 13–20</>} denominator={<>n</>} /> (max. 2 fehlend)
            </span>
          }
        >
          <NumberField
            value={communication}
            onChange={setCommunication}
            min={0}
            max={10}
            step={0.01}
          />
        </ScoreInputRow>
        <ScoreInputRow label="Einordnung" formula={<>frei (keine validierten Normwerte)</>}>
          <FreeTextField value={classification} onChange={setClassification} />
        </ScoreInputRow>
      </Stack>
      <ClinicalNote value={note} onChange={setNote} />
    </>
  );
}

// ─── OBC ────────────────────────────────────────────────────────────────

export function OBCContent({ onSummaryChange }: ContentProps) {
  const [total, setTotal] = useState("");
  const [severity, setSeverity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    onSummaryChange?.({
      mainScore: total || undefined,
      classification: labelFor(OBC_SEVERITY_OPTIONS, severity),
    });
  }, [total, severity, onSummaryChange]);

  return (
    <>
      <div className="flex flex-col gap-5">
        <StackedField label="Gesamtscore" hint="0–84">
          <NumberField value={total} onChange={setTotal} min={0} max={84} />
        </StackedField>

        <StackedField label="Risiko-Einstufung">
          <SelectField
            value={severity}
            onChange={setSeverity}
            options={OBC_SEVERITY_OPTIONS}
            width="w-full max-w-[260px]"
          />
        </StackedField>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Cutoffs
          </span>
          <CutoffTable label="Risiko-Einstufung" rows={OBC_CUTOFFS} />
          <p className="text-[11px] text-muted-foreground italic">
            Keine validierten Normwerte — deskriptive Einteilung aus der DC/TMD Scoring-Anleitung
          </p>
        </div>
      </div>
      <ClinicalNote value={note} onChange={setNote} />
    </>
  );
}
