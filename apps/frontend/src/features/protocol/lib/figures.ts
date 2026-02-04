// Import figure index
import figureIndex from "@docs/dc-tmd/examiner-protocol/images/figure_index.json";

// Import all images eagerly
const imageModules = import.meta.glob<string>(
  "@docs/dc-tmd/examiner-protocol/images/*.{jpeg,png}",
  { eager: true, import: "default" }
);

// Create a map from filename to URL
export const imageMap: Record<string, string> = {};
for (const [path, url] of Object.entries(imageModules)) {
  const filename = path.split("/").pop();
  if (filename) {
    imageMap[filename] = url;
  }
}

export interface FigureData {
  description: string;
  page: number;
  images: string[];
}

type FigureIndex = Record<string, FigureData | { source: string; description: string; note: string }>;

export const typedFigureIndex = figureIndex as FigureIndex;

/**
 * Parse figure references from text.
 * Returns figure IDs if found, null otherwise.
 * Matches patterns like "Abbildung 1", "Abbildung 5a", "Abbildungen 2 & 3"
 */
export function parseFigureReference(text: string): string[] | null {
  // Single figure: "Abbildung 1" or "Abbildung 5a"
  const singleMatch = text.match(/^Abbildung\s+(\d+[a-z]?)$/i);
  if (singleMatch) {
    return [singleMatch[1]];
  }

  // Multiple figures: "Abbildungen 2 & 3" or "Abbildungen 9 & 10"
  const multiMatch = text.match(/^Abbildungen?\s+([\d\w]+(?:\s*[&,]\s*[\d\w]+)+)$/i);
  if (multiMatch) {
    const ids = multiMatch[1].split(/\s*[&,]\s*/).map(id => id.trim());
    return ids;
  }

  return null;
}
