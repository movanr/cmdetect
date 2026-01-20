/**
 * PDF API Service
 *
 * Client for the auth-server PDF export endpoint.
 * Handles authentication and file download.
 */

import type { AnamnesisExportData } from "@cmdetect/questionnaires";

/**
 * Auth server base URL from environment
 */
const AUTH_SERVER_URL = import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:3001";

/**
 * Error thrown when PDF generation fails
 */
export class PDFGenerationError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "PDFGenerationError";
  }
}

/**
 * Generates a PDF from anamnesis export data.
 *
 * Sends data to auth-server, receives PDF blob, and triggers browser download.
 *
 * @param data - Complete anamnesis export data
 * @returns Promise resolving when download is triggered
 * @throws PDFGenerationError if generation fails
 */
export async function generateAndDownloadPdf(
  data: AnamnesisExportData
): Promise<void> {
  const response = await fetch(`${AUTH_SERVER_URL}/api/pdf/anamnesis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include auth cookies
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Try to extract error message from response
    let errorMessage = "Failed to generate PDF";
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore JSON parse errors
    }

    throw new PDFGenerationError(errorMessage, response.status);
  }

  // Get the PDF blob
  const pdfBlob = await response.blob();

  // Extract filename from Content-Disposition header if present
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `anamnesis-${data.metadata.caseId}.pdf`;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  // Trigger browser download
  downloadBlob(pdfBlob, filename);
}

/**
 * Triggers a browser download for a blob.
 *
 * @param blob - The blob to download
 * @param filename - Suggested filename for download
 */
function downloadBlob(blob: Blob, filename: string): void {
  // Create object URL for the blob
  const url = URL.createObjectURL(blob);

  // Create temporary link element
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Checks if PDF export is available.
 *
 * This can be used to conditionally show the export button
 * based on feature flags or server availability.
 */
export async function isPdfExportAvailable(): Promise<boolean> {
  try {
    // Simple health check - could be expanded to check specific capabilities
    const response = await fetch(`${AUTH_SERVER_URL}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}
