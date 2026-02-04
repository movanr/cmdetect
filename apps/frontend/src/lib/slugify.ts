/**
 * Converts a heading text to a URL-safe anchor ID.
 * Handles German characters and common markdown patterns.
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      // Normalize Unicode characters (e.g., ä → a)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Replace ß with ss
      .replace(/ß/g, "ss")
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, "-")
      // Remove non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, "")
      // Remove consecutive hyphens
      .replace(/-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, "")
  );
}

/**
 * Extract section number prefix from heading text (e.g., "1.4" from "1.4 Wie dieses...")
 */
export function extractSectionNumber(text: string): string | null {
  const match = text.match(/^(\d+(?:\.\d+)*)\s/);
  return match ? match[1] : null;
}

/**
 * Generate heading ID - uses numeric prefix if available, otherwise slugifies the whole text.
 * This allows cross-references like "Abschnitt 1.4" to link to heading "## 1.4 Title" via #14
 */
export function getHeadingId(text: string): string {
  const sectionNum = extractSectionNumber(text);
  if (sectionNum) {
    // Use just the numeric part as ID (e.g., "14" for "1.4 Wie dieses...")
    return sectionNum.replace(/\./g, "");
  }
  // Fallback to full slugified text for headings without section numbers
  return slugify(text);
}
