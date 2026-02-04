/**
 * Map section numbers to route sections.
 * e.g., "1.4" -> "section1", "5.3" -> "e1", "6.2.1" -> "section6"
 */
export function getSectionRoute(sectionNum: string): string | null {
  const parts = sectionNum.split(".");
  const major = parseInt(parts[0], 10);
  const minor = parts[1] ? parseInt(parts[1], 10) : undefined;

  // Section 5 subsections map to E1-E9 routes (displayed as U1-U9 in German UI)
  if (major === 5) {
    if (minor === undefined || minor <= 2) return "overview";
    if (minor === 3) return "e1";
    if (minor === 4) return "e2";
    if (minor === 5) return "e3";
    if (minor === 6) return "e4";
    if (minor === 7) return "e5";
    if (minor === 8) return "e6";
    if (minor === 9) return "e7";
    if (minor === 10) return "e8";
    if (minor === 11) return "e9";
    return "overview";
  }

  // Section 6 subsections stay in section6
  if (major === 6) return "section6";

  // Other sections
  if (major >= 1 && major <= 8) return `section${major}`;

  return null;
}

/**
 * Create anchor ID from section number.
 * Returns the numeric anchor (e.g., "14" for section 1.4) for sections with headings.
 * Returns undefined for section 6 subsections (they're in tables, not headings).
 */
export function getSectionAnchor(sectionNum: string): string | undefined {
  const parts = sectionNum.split(".");
  const major = parseInt(parts[0], 10);

  // Section 6 subsections are in tables, not headings - go to top of page
  if (major === 6 && parts.length > 1) {
    return undefined;
  }

  // For sections with actual headings, use numeric anchor (e.g., "14" for 1.4)
  // This matches the IDs we add to heading elements
  if (parts.length > 1) {
    return parts.join(""); // "1.4" -> "14", "2.3.1" -> "231"
  }

  // Major section only (e.g., "1", "2") - go to top
  return undefined;
}
