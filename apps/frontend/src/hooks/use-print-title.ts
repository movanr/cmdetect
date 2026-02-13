import { useEffect } from "react";

/**
 * Sets document.title for PDF export and restores original on unmount.
 * Browsers use document.title as the default PDF filename when saving as PDF.
 *
 * @param title - The desired PDF filename (without .pdf extension)
 *
 * @example
 * ```tsx
 * const pdfTitle = formatFilename("Untersuchung", patientName, formatDate(new Date()));
 * usePrintTitle(pdfTitle);
 * ```
 */
export function usePrintTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;

    const originalTitle = document.title;
    document.title = title;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}

/**
 * Formats a filename-safe string by joining parts with underscores
 * and removing unsafe characters.
 *
 * @param parts - String parts to join (undefined/null values are filtered out)
 * @returns Filename-safe string with underscores instead of spaces
 *
 * @example
 * ```tsx
 * formatFilename("Untersuchung", "Max Mustermann", "13.02.2026")
 * // => "Untersuchung_Max_Mustermann_13.02.2026"
 * ```
 */
export function formatFilename(...parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join("_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_.-]/g, "");
}
