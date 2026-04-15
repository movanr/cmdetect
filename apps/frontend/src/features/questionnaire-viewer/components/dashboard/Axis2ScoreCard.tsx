/**
 * Axis 2 Score Cards — documentation only.
 * Each card shows the scoring formulas next to numeric/categorical input fields;
 * the practitioner enters every score manually. Local state, no persistence.
 */

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  GCPS1MAnswers,
  JFLS20Answers,
  JFLS8Answers,
  OBCAnswers,
} from "@cmdetect/questionnaires";
import { JFLS20_SUBSCALE_LABELS, QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { useState, type ReactNode } from "react";
import { SCORING_MANUAL_ANCHORS } from "../../content/dashboard-instructions";
import { GCPSScoreCard } from "./GCPSScoreCard";
import {
  JFLS20AnswersTable,
  JFLS8AnswersTable,
  OBCAnswersTable,
  PHQ4AnswersTable,
} from "./questionnaire-tables";
import { ScoreCardLayout } from "./ScoreCardLayout";
import { ScoreInputRow } from "./ScoreInputRow";

const NONE = "__none__";

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

// ─── Per-questionnaire renderers ────────────────────────────────────────

interface ExpandProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

interface CardCommonProps extends ExpandProps {
  title: string;
  manualAnchor?: string;
}

function PHQ4ScoreCard({
  title,
  manualAnchor,
  answers,
  isExpanded,
  onToggleExpand,
}: CardCommonProps & { answers: Record<string, string> }) {
  const [phq2, setPhq2] = useState("");
  const [gad2, setGad2] = useState("");
  const [total, setTotal] = useState("");
  const [severity, setSeverity] = useState("");
  const [note, setNote] = useState("");

  return (
    <ScoreCardLayout
      title={title}
      manualAnchor={manualAnchor}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      note={note}
      onNoteChange={setNote}
      scoreInputs={
        <>
          <ScoreInputRow label="PHQ-2" rangeHint="0–6" formula={<>= F1 + F2 (Depression)</>}>
            <NumberField value={phq2} onChange={setPhq2} min={0} max={6} />
          </ScoreInputRow>
          <ScoreInputRow label="GAD-2" rangeHint="0–6" formula={<>= F3 + F4 (Angst)</>}>
            <NumberField value={gad2} onChange={setGad2} min={0} max={6} />
          </ScoreInputRow>
          <ScoreInputRow label="Gesamt" rangeHint="0–12" formula={<>= PHQ-2 + GAD-2</>}>
            <NumberField value={total} onChange={setTotal} min={0} max={12} />
          </ScoreInputRow>
          <ScoreInputRow label="Schweregrad" formula={<>kategorial (Manual)</>}>
            <SelectField value={severity} onChange={setSeverity} options={PHQ4_SEVERITY_OPTIONS} />
          </ScoreInputRow>
        </>
      }
      expandedContent={<PHQ4AnswersTable answers={answers} showPips />}
    />
  );
}

function JFLS8ScoreCard({
  title,
  manualAnchor,
  answers,
  isExpanded,
  onToggleExpand,
}: CardCommonProps & { answers: JFLS8Answers }) {
  const [global, setGlobal] = useState("");
  const [classification, setClassification] = useState("");
  const [note, setNote] = useState("");

  return (
    <ScoreCardLayout
      title={title}
      manualAnchor={manualAnchor}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      note={note}
      onNoteChange={setNote}
      scoreInputs={
        <>
          <ScoreInputRow
            label="Globalwert"
            rangeHint="0–10"
            formula={
              <span className="inline-flex items-center gap-1">
                = <Fraction numerator={<>Σ Antworten</>} denominator={<>n</>} /> (max. 2 fehlend)
              </span>
            }
          >
            <NumberField value={global} onChange={setGlobal} min={0} max={10} step={0.01} />
          </ScoreInputRow>
          <ScoreInputRow label="Einordnung" formula={<>frei (keine validierten Normwerte)</>}>
            <FreeTextField value={classification} onChange={setClassification} />
          </ScoreInputRow>
        </>
      }
      expandedContent={<JFLS8AnswersTable answers={answers} showPips />}
    />
  );
}

function JFLS20ScoreCard({
  title,
  manualAnchor,
  answers,
  isExpanded,
  onToggleExpand,
}: CardCommonProps & { answers: JFLS20Answers }) {
  const [global, setGlobal] = useState("");
  const [mastication, setMastication] = useState("");
  const [mobility, setMobility] = useState("");
  const [communication, setCommunication] = useState("");
  const [classification, setClassification] = useState("");
  const [note, setNote] = useState("");

  return (
    <ScoreCardLayout
      title={title}
      manualAnchor={manualAnchor}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      note={note}
      onNoteChange={setNote}
      scoreInputs={
        <>
          <ScoreInputRow
            label="Globalwert"
            rangeHint="0–10"
            formula={
              <span className="inline-flex items-center gap-1">
                = <Fraction numerator={<>Σ aller 20 Items</>} denominator={<>n</>} /> (max. 2
                fehlend)
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
            <NumberField
              value={mastication}
              onChange={setMastication}
              min={0}
              max={10}
              step={0.01}
            />
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
        </>
      }
      expandedContent={<JFLS20AnswersTable answers={answers} showPips />}
    />
  );
}

function OBCScoreCard({
  title,
  manualAnchor,
  answers,
  isExpanded,
  onToggleExpand,
}: CardCommonProps & { answers: OBCAnswers }) {
  const [total, setTotal] = useState("");
  const [classification, setClassification] = useState("");
  const [note, setNote] = useState("");

  return (
    <ScoreCardLayout
      title={title}
      manualAnchor={manualAnchor}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      note={note}
      onNoteChange={setNote}
      scoreInputs={
        <>
          <ScoreInputRow label="Gesamt" rangeHint="0–84" formula={<>= Σ aller 21 Items (je 0–4)</>}>
            <NumberField value={total} onChange={setTotal} min={0} max={84} />
          </ScoreInputRow>
          <ScoreInputRow label="Einordnung" formula={<>frei (keine validierten Normwerte)</>}>
            <FreeTextField value={classification} onChange={setClassification} />
          </ScoreInputRow>
        </>
      }
      expandedContent={<OBCAnswersTable answers={answers} showPips />}
    />
  );
}

// ─── Main entry point ───────────────────────────────────────────────────

interface Axis2ScoreCardProps {
  questionnaireId: string;
  title: string;
  answers: Record<string, string | number> | null;
  isPlaceholder?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function Axis2ScoreCard({
  questionnaireId,
  title,
  answers,
  isPlaceholder = false,
  isExpanded,
  onToggleExpand,
}: Axis2ScoreCardProps) {
  const manualAnchor = SCORING_MANUAL_ANCHORS[questionnaireId];
  const hasData = answers && Object.keys(answers).length > 0;

  if (isPlaceholder || !hasData) {
    return (
      <Card className="bg-muted/30">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">
              {isPlaceholder ? "Demnächst verfügbar" : "Keine Daten"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.PHQ4) {
    return (
      <PHQ4ScoreCard
        title={title}
        manualAnchor={manualAnchor}
        answers={answers as Record<string, string>}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.GCPS_1M) {
    return (
      <GCPSScoreCard
        title={title}
        answers={answers as GCPS1MAnswers}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.JFLS8) {
    return (
      <JFLS8ScoreCard
        title={title}
        manualAnchor={manualAnchor}
        answers={answers as JFLS8Answers}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.JFLS20) {
    return (
      <JFLS20ScoreCard
        title={title}
        manualAnchor={manualAnchor}
        answers={answers as JFLS20Answers}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.OBC) {
    return (
      <OBCScoreCard
        title={title}
        manualAnchor={manualAnchor}
        answers={answers as OBCAnswers}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    );
  }

  return (
    <Card>
      <div className="p-4">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">Bewertung nicht verfügbar</p>
      </div>
    </Card>
  );
}
