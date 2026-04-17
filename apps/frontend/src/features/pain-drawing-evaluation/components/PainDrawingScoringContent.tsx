/**
 * Right-sheet scoring body for the pain drawing tab.
 * Reports a summary (Anzahl Körperbereiche + Schweregrad) upward via
 * onSummaryChange for display on the tab card.
 */

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CutoffTable,
  StackedField,
  type TabSummary,
  type TabSummaryEntry,
} from "@/features/questionnaire-viewer/components/dashboard/Axis2ScoreCard";
import { ClinicalNote } from "@/features/questionnaire-viewer/components/dashboard/ClinicalNote";
import { useManualScoreAutoSave } from "@/features/questionnaire-viewer/hooks/useManualScoreAutoSave";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { useEffect } from "react";

const NONE = "__none__";

const PAIN_DRAWING_SEVERITY_OPTIONS = [
  { value: "keine", label: "Keine" },
  { value: "leicht", label: "Leicht" },
  { value: "moderat", label: "Moderat" },
  { value: "schwer", label: "Schwer" },
] as const;

const PAIN_DRAWING_CUTOFFS: ReadonlyArray<readonly [string, string]> = [
  ["0", "Keine"],
  ["1", "Leicht"],
  ["2", "Moderat"],
  ["≥ 3", "Schwer"],
];

interface PainDrawingScoringContentProps {
  onSummaryChange?: (summary: TabSummary) => void;
  patientRecordId: string;
  hasResponse: boolean;
}

export function PainDrawingScoringContent({
  onSummaryChange,
  patientRecordId,
  hasResponse,
}: PainDrawingScoringContentProps) {
  const { scores, setScore, note, setNote } = useManualScoreAutoSave({
    patientRecordId,
    questionnaireId: QUESTIONNAIRE_ID.PAIN_DRAWING,
    defaultValues: { regionCount: "", severity: "" },
    enabled: hasResponse,
  });
  const { regionCount, severity } = scores;
  const setRegionCount = (v: string) => setScore("regionCount", v);
  const setSeverity = (v: string) => setScore("severity", v);

  useEffect(() => {
    const entries: TabSummaryEntry[] = [];
    if (regionCount) entries.push({ label: "Schmerzgebiete", value: regionCount });
    const severityLabel = PAIN_DRAWING_SEVERITY_OPTIONS.find((o) => o.value === severity)?.label;
    if (severityLabel) entries.push({ label: "Schweregrad", value: severityLabel });
    onSummaryChange?.({ entries });
  }, [regionCount, severity, onSummaryChange]);

  return (
    <>
      <div className="flex flex-col gap-5">
        <StackedField
          label="Schmerzgebiete"
          hint="≥ 0"
          formula={<>= Anzahl unterschiedlicher Schmerzgebiete</>}
        >
          <Input
            type="number"
            inputMode="numeric"
            value={regionCount}
            onChange={(e) => setRegionCount(e.target.value)}
            min={0}
            step={1}
            className="h-8 text-sm w-24"
          />
        </StackedField>

        <StackedField label="Schweregrad">
          <Select value={severity || NONE} onValueChange={(v) => setSeverity(v === NONE ? "" : v)}>
            <SelectTrigger size="sm" className="w-full max-w-[220px]">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {PAIN_DRAWING_SEVERITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </StackedField>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Cutoffs (Appendix 3)
          </span>
          <CutoffTable label="Schweregrad" rows={PAIN_DRAWING_CUTOFFS} />
          <p className="text-[11px] text-muted-foreground italic">
            Keine validierten Normwerte — deskriptive Einteilung aus dem DC/TMD Scoring Manual
            (Appendix 3).
          </p>
        </div>

        <ClinicalNote value={note} onChange={setNote} />
      </div>
    </>
  );
}
