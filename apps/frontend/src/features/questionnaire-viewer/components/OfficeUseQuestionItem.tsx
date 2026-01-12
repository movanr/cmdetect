/**
 * Question item with Office use section for SQ8-SQ14
 * Shows patient response (Yes/No) and office use (R/L/DNK) side by side
 */

import { SQ_YES_NO_LABELS } from "../data/questionLabels";
import { SideCheckboxGroup, type OfficeUseValue } from "./editors/SideCheckboxGroup";

interface OfficeUseQuestionItemProps {
  questionId: string;
  questionText: string;
  patientAnswer: string; // "yes" | "no"
  officeUse: OfficeUseValue;
  onPatientAnswerChange: (questionId: string, newValue: string) => Promise<void>;
  onOfficeUseChange: (questionId: string, newValue: OfficeUseValue) => Promise<void>;
  isSaving?: boolean;
}

export function OfficeUseQuestionItem({
  questionId,
  questionText,
  patientAnswer,
  officeUse,
  onPatientAnswerChange,
  onOfficeUseChange,
  isSaving = false,
}: OfficeUseQuestionItemProps) {
  const isYes = patientAnswer === "yes";

  const handlePatientAnswerChange = async (value: string) => {
    // When changing to "No", also clear office use in the same call
    // This is handled by the parent to avoid race conditions
    await onPatientAnswerChange(questionId, value);
  };

  const handleOfficeUseChange = async (value: OfficeUseValue) => {
    await onOfficeUseChange(questionId, value);
  };

  // Check if side confirmation is complete
  const isConfirmed = officeUse.R || officeUse.L || officeUse.DNK;
  const needsConfirmation = isYes && !isConfirmed;

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Question ID badge */}
        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
          {questionId}
        </span>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Question text */}
          <p className="text-sm text-muted-foreground mb-2">{questionText}</p>

          {/* Layout: No/Yes | Seite: R/L/Unklar | Bitte bestätigen */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Patient response (No/Yes) */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`patient-${questionId}`}
                  checked={patientAnswer === "no"}
                  onChange={() => handlePatientAnswerChange("no")}
                  disabled={isSaving}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm">{SQ_YES_NO_LABELS["no"]}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`patient-${questionId}`}
                  checked={patientAnswer === "yes"}
                  onChange={() => handlePatientAnswerChange("yes")}
                  disabled={isSaving}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm">{SQ_YES_NO_LABELS["yes"]}</span>
              </label>
            </div>

            {/* Office use (R/L/Unklar) - only shown when Yes */}
            {isYes && (
              <>
                <div className="w-px h-5 bg-border" />
                <SideCheckboxGroup
                  value={officeUse}
                  onChange={handleOfficeUseChange}
                  disabled={isSaving}
                />
                {needsConfirmation && (
                  <span className="text-xs text-amber-600 font-medium">← Bitte bestätigen</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
