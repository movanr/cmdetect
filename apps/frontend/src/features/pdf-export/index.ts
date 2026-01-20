/**
 * PDF Export Feature
 *
 * Exports anamnesis questionnaire data to PDF using Typst templates.
 */

// Components
export { ExportButton } from "./components/ExportButton";

// Hooks
export { usePDFExport } from "./hooks/usePDFExport";
export type {
  UsePDFExportOptions,
  UsePDFExportReturn,
} from "./hooks/usePDFExport";

// Services
export { assembleExportData } from "./services/dataCollector";
export type {
  DecryptedPatientData,
  AssembleExportDataOptions,
} from "./services/dataCollector";

export {
  generateAndDownloadPdf,
  isPdfExportAvailable,
  PDFGenerationError,
} from "./services/pdfApi";

export {
  exportPainDrawingToImages,
  exportSingleRegion,
} from "./services/painDrawingExporter";
