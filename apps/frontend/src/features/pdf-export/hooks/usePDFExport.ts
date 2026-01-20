/**
 * usePDFExport Hook
 *
 * Orchestrates the PDF export flow:
 * 1. Collects questionnaire data
 * 2. Calculates scores
 * 3. Exports pain drawing images
 * 4. Sends to auth-server for PDF generation
 * 5. Triggers browser download
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { QuestionnaireResponse } from "@/features/questionnaire-viewer/hooks/useQuestionnaireResponses";
import { assembleExportData } from "../services/dataCollector";
import type { DecryptedPatientData } from "../services/dataCollector";
import { generateAndDownloadPdf, PDFGenerationError } from "../services/pdfApi";

// Re-export for convenience
export type { DecryptedPatientData };

export interface UsePDFExportOptions {
  /** Patient record / case ID */
  caseId: string;
  /** Organization name for the PDF header */
  organizationName?: string;
  /** Decrypted patient data */
  patientData: DecryptedPatientData | null;
  /** Questionnaire responses */
  responses: QuestionnaireResponse[];
}

export interface UsePDFExportReturn {
  /** Triggers the PDF export */
  exportPdf: () => Promise<void>;
  /** Whether export is currently in progress */
  isExporting: boolean;
  /** Last error message, if any */
  error: string | null;
}

/**
 * Hook for exporting anamnesis data to PDF.
 *
 * @example
 * ```tsx
 * const { exportPdf, isExporting, error } = usePDFExport({
 *   caseId: patientRecordId,
 *   organizationName: "Praxis Dr. Mueller",
 *   patientData: decryptedPatient,
 *   responses: questionnaireResponses,
 * });
 *
 * return (
 *   <Button onClick={exportPdf} disabled={isExporting}>
 *     {isExporting ? "Exportiere..." : "Als PDF exportieren"}
 *   </Button>
 * );
 * ```
 */
export function usePDFExport(options: UsePDFExportOptions): UsePDFExportReturn {
  const { caseId, organizationName, patientData, responses } = options;

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPdf = useCallback(async () => {
    // Validate that we have patient data
    if (!patientData) {
      const errorMsg = "Patientendaten nicht verfügbar";
      setError(errorMsg);
      toast.error("Export fehlgeschlagen", {
        description: errorMsg,
      });
      return;
    }

    // Validate that we have responses
    if (responses.length === 0) {
      const errorMsg = "Keine Fragebögen zum Exportieren vorhanden";
      setError(errorMsg);
      toast.error("Export fehlgeschlagen", {
        description: errorMsg,
      });
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Show progress toast
      const toastId = toast.loading("PDF wird erstellt...", {
        description: "Fragebögen werden zusammengestellt",
      });

      // Assemble export data
      const exportData = await assembleExportData({
        caseId,
        organizationName,
        patientData,
        responses,
        includePainDrawingImages: true,
      });

      // Update progress
      toast.loading("PDF wird erstellt...", {
        id: toastId,
        description: "PDF wird generiert",
      });

      // Generate and download PDF
      await generateAndDownloadPdf(exportData);

      // Success
      toast.success("PDF erfolgreich erstellt", {
        id: toastId,
        description: "Download wurde gestartet",
      });
    } catch (err) {
      // Handle error
      let errorMsg = "Unbekannter Fehler beim PDF-Export";

      if (err instanceof PDFGenerationError) {
        errorMsg = err.message;
        if (err.statusCode === 401) {
          errorMsg = "Sitzung abgelaufen. Bitte melden Sie sich erneut an.";
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      toast.error("PDF-Export fehlgeschlagen", {
        description: errorMsg,
      });

      console.error("PDF export error:", err);
    } finally {
      setIsExporting(false);
    }
  }, [caseId, organizationName, patientData, responses]);

  return {
    exportPdf,
    isExporting,
    error,
  };
}
