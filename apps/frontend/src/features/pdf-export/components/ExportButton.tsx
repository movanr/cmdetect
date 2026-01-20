/**
 * PDF Export Button Component
 *
 * Button with loading state for exporting anamnesis data to PDF.
 */

import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import type { QuestionnaireResponse } from "@/features/questionnaire-viewer/hooks/useQuestionnaireResponses";
import { usePDFExport } from "../hooks/usePDFExport";
import type { DecryptedPatientData } from "../services/dataCollector";

interface ExportButtonProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "onClick"> {
  /** Patient record / case ID */
  caseId: string;
  /** Organization name for the PDF header */
  organizationName?: string;
  /** Decrypted patient data */
  patientData: DecryptedPatientData | null;
  /** Questionnaire responses */
  responses: QuestionnaireResponse[];
  /** Optional: custom button text */
  label?: string;
  /** Optional: show icon */
  showIcon?: boolean;
}

/**
 * A button component that handles PDF export with loading state.
 *
 * @example
 * ```tsx
 * <ExportButton
 *   caseId={patientRecordId}
 *   patientData={decryptedPatient}
 *   responses={responses}
 * />
 * ```
 */
export function ExportButton({
  caseId,
  organizationName,
  patientData,
  responses,
  label = "Als PDF exportieren",
  showIcon = true,
  disabled,
  ...buttonProps
}: ExportButtonProps) {
  const { exportPdf, isExporting } = usePDFExport({
    caseId,
    organizationName,
    patientData,
    responses,
  });

  // Disable button if no patient data or no responses
  const isDisabled = disabled || !patientData || responses.length === 0;

  return (
    <Button
      variant="outline"
      onClick={exportPdf}
      disabled={isDisabled || isExporting}
      {...buttonProps}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportiere...
        </>
      ) : (
        <>
          {showIcon && <Download className="mr-2 h-4 w-4" />}
          {label}
        </>
      )}
    </Button>
  );
}
